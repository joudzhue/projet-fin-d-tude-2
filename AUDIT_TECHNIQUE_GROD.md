# Audit technique de la plateforme G-ROD

**Date de l'audit :** 13 septembre 2026  
**Périmètre :** code source backend et frontend, configuration, migration de base de données, tests, fichiers de déploiement, sauvegarde et version de travail du rapport.  
**Principe appliqué :** le code et les résultats d'exécution constituent la source de vérité. Une fonctionnalité déclarée mais non exploitable sans configuration externe est signalée comme partielle ou optionnelle.

## 1. Synthèse exécutive

G-ROD est une plateforme web B2B composée d'une application React et d'une API REST Spring Boot. Elle couvre un site public, un catalogue de huit produits, des formulaires de demande, des ressources techniques et un espace d'administration. Le backend persiste les données métier dans MySQL en fonctionnement normal. Les tests utilisent H2 en mode de compatibilité MySQL.

Le projet présente un socle fonctionnel réel et vérifiable. Les demandes de devis, les demandes documentaires, les produits, les clients consolidés, les notifications, les ressources techniques, les fichiers privés et la pagination sont reliés au backend. La sécurité administrative repose sur Spring Security, des jetons JWT signés en HS256 et des mots de passe hachés avec BCrypt. Une authentification Passkey/WebAuthn existe également, avec des limites exposées plus loin.

L'état contrôlé pendant cet audit est le suivant :

- 44 tests backend sur 44 réussis ;
- ESLint réussi sans erreur ;
- build Vite réussi ;
- 37 scénarios Playwright sur 38 réussis ;
- un scénario Playwright échoue à cause de huit images de démonstration chargées depuis un domaine externe non résolu dans l'environnement de recette ;
- les fichiers de déploiement Linux sont préparés, mais aucun déploiement de production n'a été démontré pendant cet audit ;
- aucun workflow CI/CD GitHub Actions n'est présent ;
- le frontend est fonctionnel mais très concentré dans `App.jsx` et `App.css`.

**Verdict :** la solution peut être présentée comme une Release Candidate techniquement avancée et testée. Elle ne doit pas encore être décrite comme une mise en production achevée ni comme une recette E2E totalement verte.

## 2. Architecture réelle

```text
Navigateur
  |
  | HTTP/JSON et fichiers contrôlés
  v
Application React 19 + React Router + Vite
  |
  | /api/* et /uploads/products/*
  v
API Spring Boot 3.5.14
  |-- Spring Security + JWT + BCrypt
  |-- Contrôleurs REST
  |-- Services métier et transactions
  |-- Repositories Spring Data JPA
  |-- Génération PDF OpenPDF
  |-- Stockage local des uploads
  |
  |-- MySQL en exécution normale
  `-- H2 en mémoire pour les tests
```

L'organisation backend suit des couches explicites :

| Paquet | Nombre de fichiers Java | Rôle observé |
|---|---:|---|
| `config` | 5 | sécurité, initialisation et configuration |
| `controller` | 14 | endpoints REST |
| `dto` | 27 | contrats d'entrée et de sortie |
| `entity` | 14 | 10 entités JPA et 4 énumérations |
| `event` | 3 | événements de création de demandes |
| `exception` | 3 | erreurs API et gestion globale |
| `repository` | 10 | accès JPA, agrégations et recherches |
| `security` | 7 | JWT, WebAuthn et limitation de requêtes |
| `service` | 22 | logique métier, PDF, fichiers et notifications |

Le frontend possède trois fichiers applicatifs principaux : `main.jsx`, `App.jsx` et `Copper3DScenes.jsx`. La séparation fonctionnelle existe dans le code au moyen de fonctions et de composants, mais elle n'est pas encore reflétée dans une arborescence de pages, composants, hooks et services.

## 3. Technologies et versions vérifiées

Les versions « installées » proviennent de `package-lock.json`. Les versions « déclarées » proviennent de `package.json` ou de `pom.xml`.

| Technologie | Version vérifiée | Usage réel |
|---|---|---|
| Java | 21 | backend |
| Spring Boot | 3.5.14 | API et configuration |
| Spring Security | gérée par Spring Boot 3.5.14 | authentification et autorisation |
| OpenPDF | 3.0.5 | génération des PDF de devis |
| Springdoc OpenAPI | 2.8.17 | documentation API, désactivée par défaut |
| MySQL Connector/J | gérée par Spring Boot | accès MySQL en exécution normale |
| Flyway | gérée par Spring Boot | migration du schéma |
| H2 | gérée par Spring Boot, portée test | tests et recette E2E isolée |
| React | 19.2.6 | interface publique et administration |
| React DOM | 19.2.6 | rendu frontend |
| React Router DOM | 7.18.2 installée, `^7.15.1` déclarée | routage côté client |
| Three.js | 0.185.1 | visualisation des modèles GLB |
| Vite | 8.2.1 installée, `^8.0.12` déclarée | développement et build |
| Playwright | 1.62.1 | tests E2E Chromium |
| ESLint | 10.4.0 installée, `^10.3.0` déclarée | contrôle statique frontend |
| Mécanisme HTTP frontend | `fetch` natif | appels REST ; Axios n'est pas utilisé |

La version exacte du serveur MySQL installé sur la machine n'a pas été relevée. La documentation de sauvegarde cible MySQL 8.4, mais cela ne prouve pas que cet exact serveur est utilisé par l'environnement local ou futur.

## 4. Backend

### 4.1 Modèle métier persistant

Dix classes portent l'annotation `@Entity` :

| Entité | Fonction | Relations explicites |
|---|---|---|
| `Utilisateur` | compte administratif et rôle | référencé par les lectures de notifications |
| `AdminPasskeyCredential` | clé publique Passkey | lien logique par email, sans association JPA vers `Utilisateur` |
| `AppSetting` | préférence applicative clé/valeur | aucune association |
| `Produit` | catalogue et caractéristiques | les demandes stockent un identifiant et un libellé, sans association JPA directe |
| `Client` | fiche client consolidée | référencée par `DemandeDevis` |
| `DemandeDevis` | demande commerciale et pièce jointe | `ManyToOne` optionnel vers `Client` |
| `DemandeDocument` | demande de ressource technique | produit conservé comme texte |
| `DocumentTechnique` | ressource PDF publique ou privée | produit conservé comme texte |
| `Notification` | événement métier persistant | référence métier par type et identifiant |
| `NotificationLecture` | état lu par utilisateur | `ManyToOne` vers `Notification` et `Utilisateur` |

Les quatre énumérations sont `Role`, `StatutDemande`, `NotificationType` et `NotificationReferenceType`. La migration `V1__baseline_schema.sql` crée les dix tables, les clés uniques, les index et les deux clés étrangères réellement modélisées.

### 4.2 API réellement exposée

| Groupe d'API | Fonctions constatées |
|---|---|
| `/api/auth` | connexion administrateur et changement de mot de passe |
| `/api/passkeys` | options et finalisation d'inscription/connexion WebAuthn |
| `/api/produits` | CRUD produits et liste publique des produits actifs |
| `/api/demandes-devis` | création, consultation, PDF, pièce jointe, statut, fidélité et suppression |
| `/api/demandes-documents` | création, liste et changement de statut |
| `/api/documents-techniques` | liste publique, téléchargement contrôlé et CRUD Admin |
| `/api/admin` | résumé dashboard, pipeline et listes paginées |
| `/api/admin/clients` | clients consolidés et historique |
| `/api/admin/notifications` | liste, compteur non lu et actions de lecture |
| `/api/admin/settings/notifications` | lecture et enregistrement des destinataires |
| `/api/admin/ressources/{id}/download` | téléchargement authentifié d'une ressource privée |
| `/api/uploads` | images produits, plans de devis et PDF techniques |
| `/api/assistant/chat` | appel optionnel à l'API OpenAI |
| `/api/test` | diagnostic présent uniquement hors profil `prod` |

### 4.3 Validation, erreurs et transactions

Les DTO et entités utilisent Jakarta Validation pour les champs obligatoires, les emails et certaines contraintes numériques. Le `GlobalExceptionHandler` transforme les erreurs de validation, de ressource, d'authentification, d'état et les erreurs génériques en réponses JSON structurées. Le profil de production masque messages internes, erreurs de liaison et stacktraces.

La création d'un devis associe ou crée un client à partir de l'email normalisé. La pièce jointe passe d'abord par un espace temporaire. Dans l'implémentation actuelle, elle est promue vers le stockage définitif au début de la méthode transactionnelle, avant les écritures en base. Une erreur ultérieure peut donc laisser un fichier définitif orphelin ; l'audit en lecture seule permet de le repérer, mais ne le supprime pas. Le nettoyage planifié ne vise que les fichiers temporaires expirés.

### 4.4 Recherche, filtres, pagination et pipeline

`AdminPaginationService` construit des `Specification` JPA pour les demandes, clients, produits, documents et ressources. La taille de page est bornée entre 1 et 100. Les tris sont limités à des propriétés autorisées. Les filtres couvrent notamment les statuts, produits, types, dates et textes recherchés.

Le pipeline commercial charge au maximum quatre demandes prioritaires par statut, mais fournit aussi le total réel de chaque colonne. Le frontend affiche un accès vers la liste filtrée lorsque d'autres demandes existent. Cette logique répond bien au besoin de gérer un volume plus élevé sans rendre le dashboard illisible.

### 4.5 PDF et fichiers

OpenPDF est effectivement utilisé pour produire le document récapitulatif d'une demande de devis. Les images produits acceptent JPEG, PNG, WebP et GIF jusqu'à 5 Mo. Les pièces de devis acceptent PDF, images, DWG et DXF jusqu'à 10 Mo. Les ressources techniques sont limitées au PDF et à 10 Mo. Les contrôles portent sur le type MIME, l'extension lorsque nécessaire et plusieurs signatures binaires.

Les images produits sont publiques. Les plans de devis et ressources privées passent par des contrôleurs authentifiés. La configuration Nginx fournie refuse l'accès direct aux autres sous-répertoires d'uploads.

## 5. Frontend

### 5.1 Routes publiques

Les routes publiques observées sont : accueil, catalogue, fiche produit, ressources, processus de production, présentation « Pourquoi G-ROD », demande de document et demande de devis. Une route inconnue redirige vers l'accueil.

Le catalogue charge les produits actifs depuis l'API. Il propose recherche, filtres, tri, affichage cartes/liste, favoris, produits récemment consultés et recommandation locale. La recherche rapide interroge les produits et les documents publics ; l'entrée Admin a été retirée des résultats publics.

### 5.2 Routes d'administration

L'espace Admin couvre : connexion, dashboard, produits, modification d'un produit, demandes, demandes de documents, ressources techniques, clients, historique client, notifications et compte. Le token JWT et le profil courant sont conservés dans `sessionStorage`. Une session invalide est supprimée et renvoie vers l'écran de connexion.

Le dashboard comprend des indicateurs, des demandes récentes et un pipeline. Les écrans de gestion combinent recherche, filtres et pagination côté serveur. Les notifications lues sont persistées par utilisateur. Le compte regroupe profil, sécurité et préférences.

### 5.3 Responsive, thème et PWA

Des règles responsive et des scénarios Playwright couvrent les pages publiques et Admin sur six dimensions : grand écran, écran standard, tablette paysage, tablette portrait, mobile et mobile compact. La sidebar devient un drawer mobile. Le thème clair/sombre est conservé dans `localStorage`.

La plateforme possède un manifeste en mode `standalone`, une invite d'installation et un service worker enregistré en production. Elle est donc installable comme PWA lorsque le navigateur remplit ses critères. En revanche, le mode hors ligne est incomplet : la racine `/` n'est pas préchargée et `copper-flat-bars.glb` manque dans la liste initiale du cache. Il faut présenter G-ROD comme une application web installable, pas comme une application mobile native ni comme une PWA entièrement hors ligne.

### 5.4 Visualisation 3D

Huit fichiers GLB locaux correspondent aux huit produits. Ils sont générés par un script Three.js à partir de géométries simples et chargés à la demande. Les tests confirment que le module Three.js et le GLB ne sont pas chargés avant le clic, qu'un aperçu de secours est affiché en cas d'échec et que chaque produit possède son modèle.

Ces modèles sont des représentations visuelles génériques, pas des fichiers CAO industriels certifiés. L'administration ne permet pas de téléverser un nouveau modèle GLB : l'association des modèles est codée dans le frontend.

### 5.5 Assistant et notifications externes

L'assistant conversationnel appelle réellement l'API OpenAI Responses et construit son contexte à partir des produits actifs. Sans `OPENAI_API_KEY`, il renvoie volontairement une erreur de service indisponible. Il doit donc être décrit comme une intégration optionnelle nécessitant une configuration externe, et non comme une fonction autonome toujours disponible.

Les notifications internes sont pleinement persistées. L'email SMTP et le SMS Twilio existent dans le code, mais sont désactivés par défaut et dépendent de secrets et de destinataires externes. Ils ne doivent pas être présentés comme activés dans l'environnement audité.

## 6. Sécurité

### 6.1 Mécanismes vérifiés

- sessions backend sans état ;
- JWT HS256 avec sujet, rôle, dates d'émission et d'expiration ;
- secret JWT externe obligatoire, d'au moins 32 caractères ;
- hachage BCrypt des mots de passe ;
- séparation entre routes publiques et routes exigeant le rôle Admin ;
- CORS limité aux origines configurées ;
- limitation de fréquence des endpoints publics sensibles ;
- validation des noms, formats, tailles et contenus des fichiers ;
- blocage de l'accès direct aux plans et documents privés ;
- Swagger, logs SQL détaillés et endpoint de diagnostic désactivés en production ;
- bootstrap Admin optionnel et idempotent par email ;
- masquage des détails d'erreur en production.

### 6.2 Limites et risques

1. **WebAuthn simplifié.** Les challenges sont stockés en mémoire. Le code valide le challenge, l'origine, le hash RP ID et la signature ES256, mais le compteur de signature enregistré n'est pas mis à jour lors de la connexion et les indicateurs complets de présence/vérification utilisateur ne font pas l'objet d'un contrôle explicite. Une revue spécialisée est recommandée avant un usage de production.
2. **Rate limiting local.** Les compteurs sont en mémoire ; plusieurs instances backend ne partageraient pas les limites.
3. **Cycle de vie JWT.** Aucun mécanisme de refresh token, de révocation centralisée ou de liste de blocage n'est présent. Le token reste valide jusqu'à son expiration, sauf changement de secret.
4. **CSP absente.** Le modèle Nginx l'indique explicitement. Une politique CSP nécessite d'abord un inventaire des images, modèles et services tiers.
5. **Images externes.** Les produits initiaux pointent vers un domaine externe. Cela crée un risque de disponibilité, de confidentialité réseau, de contenu mixte et de dépendance à un tiers.
6. **Stockage local.** Les uploads reposent sur le disque de l'instance. Une architecture distribuée demanderait un stockage partagé ou objet.
7. **Contenu métier de démonstration.** Les puretés, dimensions, normes et descriptions initiales existent dans le code mais doivent être validées par l'entreprise avant publication commerciale.

## 7. Base de données et migrations

Le profil normal vise MySQL, avec `ddl-auto: validate`. Flyway est activé, la validation au démarrage est demandée et le nettoyage est désactivé. Le dépôt contient une seule migration, `V1__baseline_schema.sql`, qui représente le schéma courant complet. Cette base est acceptable pour une première version, mais les évolutions futures devront être ajoutées dans de nouvelles migrations immuables (`V2`, `V3`, etc.).

Les tests utilisent H2 en mémoire avec `MODE=MySQL` et le même script Flyway. Cette stratégie contrôle la cohérence de la migration sans accéder à la base MySQL métier. Elle ne remplace cependant pas une recette finale sur la version exacte de MySQL visée en production.

## 8. Tests exécutés le 13 septembre 2026

### 8.1 Backend

Commande :

```powershell
cd grod-platform-backend
.\mvnw.cmd test
```

Résultat : **44 tests, 0 échec, 0 erreur, 0 ignoré**. Les onze suites couvrent le démarrage Spring, la migration Flyway, l'initialisation idempotente, le pipeline, les notifications externes, la limitation de requêtes, la sécurité, les règles métier et les cycles de vie des fichiers.

### 8.2 Frontend statique et build

Commandes :

```powershell
cd grod-platform-frontend
npm.cmd run lint
npm.cmd run build
```

Résultats : ESLint réussi ; build Vite réussi. Les principaux artefacts mesurés sont environ 272 Ko de CSS, 475 Ko pour le JavaScript principal et 614,5 Ko pour le chunk 3D avant compression. Vite signale que le chunk 3D dépasse le seuil de 500 Ko. Le chargement différé réduit son impact initial, mais une optimisation reste souhaitable.

### 8.3 Playwright

La configuration déclare **38 scénarios** dans quatre fichiers. Elle démarre un backend H2 isolé sur le port 18080 et un frontend Vite sur le port 15173, avec un seul worker.

Résultat consolidé de la recette ciblée :

- 5/5 scénarios critiques restants réussis ;
- 32/32 scénarios Release Candidate, responsive et 3D réussis ;
- 1 scénario public échoué ;
- total actuel : **37 réussis, 1 échoué**.

Le scénario en échec vérifie que la console du catalogue ne contient aucune erreur. Les appels API produits répondent, le catalogue et la fiche produit s'affichent, mais le navigateur journalise `net::ERR_NAME_NOT_RESOLVED` pour les images initiales externes définies dans `DataInitializer`. L'échec ne doit pas être masqué : il révèle une dépendance réelle à remplacer par des images locales ou administrées.

Le lancement global initial a aussi dépassé le temps d'attente de l'outil d'audit. Les exécutions ciblées ont ensuite permis d'obtenir le résultat consolidé ci-dessus.

### 8.4 Tests non réalisés dans cet audit

- test de charge ou de performance serveur ;
- scan automatisé de vulnérabilités et test d'intrusion ;
- test réel SMTP, Twilio et OpenAI avec des secrets de production ;
- test sur un domaine HTTPS réel de Passkey/WebAuthn ;
- test de sauvegarde/restauration Docker MySQL 8.4 ;
- recette de déploiement sur un serveur Linux réel ;
- compatibilité multi-navigateurs au-delà de Chromium.

## 9. Déploiement et exploitation

Le dépôt contient :

- un profil Spring `prod` ;
- un exemple complet de variables d'environnement ;
- un modèle Nginx avec HTTPS, reverse proxy, compression, cache et règles d'uploads ;
- une unité systemd pour le backend ;
- des scripts Bash de sauvegarde et restauration ;
- des exemples systemd pour un backup quotidien ;
- une procédure d'adoption Flyway d'une base historique ;
- une procédure post-déploiement.

Ces éléments démontrent une **préparation au déploiement**. Ils ne démontrent pas qu'un domaine, un certificat, un serveur MySQL dédié, un stockage persistant et une supervision sont déjà en service.

L'historique Git visible commence le 28 juillet 2026. Le commit courant est `2ef845f` et la branche locale `main` correspond à la référence locale `origin/main`. Les tags `v1.0.0-rc.1` et `v1.0.0-rc.2` existent localement. La publication distante du tag `v1.0.0-rc.2` n'a pas été vérifiée sur GitHub pendant cet audit.

## 10. Fonctionnalités réellement implémentées, partielles et absentes

### Implémentées

- catalogue public dynamique et fiches produits ;
- huit aperçus 3D locaux chargés à la demande ;
- formulaires devis et demande de document ;
- upload contrôlé des images, plans et PDF ;
- génération PDF de devis ;
- authentification Admin JWT ;
- dashboard, pipeline, clients, produits, demandes, documents, ressources et notifications ;
- recherche, filtres, tri et pagination serveur sur les listes Admin ;
- thème clair/sombre et responsive ;
- PWA installable ;
- notifications internes persistantes ;
- migration Flyway et tests H2 ;
- scripts de sauvegarde/restauration et modèles de déploiement.

### Partielles ou dépendantes d'une configuration externe

- Passkey/WebAuthn : fonctionnelle dans le périmètre codé, mais mono-instance et à durcir ;
- assistant OpenAI : inactif sans clé API ;
- email SMTP et SMS Twilio : désactivés par défaut ;
- PWA : installable, mais expérience hors ligne incomplète ;
- déploiement : documenté, pas exécuté ni validé sur serveur réel ;
- sauvegarde : scripts présents, test complet non exécuté pendant cet audit ;
- modèles 3D : aperçus génériques, non importables depuis l'Admin et non équivalents à des plans CAO.

### Absentes ou à présenter uniquement comme perspectives

- application mobile native ;
- paiement, commande et facturation en ligne ;
- gestion de stock industriel ;
- intégration ERP/Odoo ;
- workflow CI/CD ;
- stockage objet/cloud ;
- déploiement multi-instance ;
- tableaux d'analyse historique avancée ;
- supervision centralisée et tests de charge.

## 11. Dette technique et anomalies prioritaires

| Priorité | Constat | Conséquence | Action recommandée |
|---|---|---|---|
| Haute | images initiales hébergées sur un domaine externe non résolu | 1 test E2E en échec et catalogue dégradé hors réseau | remplacer par des images locales/administrées puis relancer 38/38 |
| Haute avant production | implémentation WebAuthn personnalisée et partielle | risque de validation incomplète | utiliser une bibliothèque éprouvée ou effectuer une revue sécurité dédiée |
| Moyenne | `App.jsx` = 6 542 lignes, `App.css` = 14 343 lignes | maintenance et régression plus difficiles | découper progressivement pages, composants, hooks, services et feuilles de style |
| Moyenne | chunk 3D = 614,5 Ko | coût réseau et décodage | compression Draco/Meshopt, import Three.js ciblé et contrôle du cache |
| Moyenne | service worker incomplet pour le hors-ligne | l'application installée ne garantit pas le démarrage hors connexion | ajouter un shell hors ligne cohérent et des tests PWA |
| Moyenne | rate limiting et challenges WebAuthn en mémoire | incompatibilité multi-instance | stockage partagé, par exemple Redis, ou passerelle d'API |
| Moyenne | uploads sur disque local | réplication et reprise plus complexes | volume persistant puis stockage objet si nécessaire |
| Faible à moyenne | une seule migration Flyway de référence | évolution à discipliner | créer une migration versionnée pour chaque changement futur |
| Faible | versions du rapport tirées des contraintes déclarées au lieu du lock | tableau technique inexact | utiliser les versions installées indiquées dans cet audit |

## 12. Incohérences avec le rapport actuel

1. Le rapport annonce « 38 scénarios Playwright réussis ». Le résultat actuel est 37 réussis et 1 échoué.
2. Le rapport indique React Router 7.15.1 et Vite 8.0.12. Ce sont les bornes déclarées ; les versions installées sont respectivement 7.18.2 et 8.2.1.
3. Le rapport indique que la recette finale confirme le bon fonctionnement de tous les parcours. Cette formulation est trop forte tant que l'erreur des images externes subsiste.
4. Le rapport parle d'une Release Candidate « publiée » après validation des tests. La présence locale du commit et des tags est prouvée, ainsi que l'alignement local de `origin/main`, mais la publication distante du tag n'a pas été contrôlée pendant cet audit.
5. Les notifications email/SMS, l'assistant OpenAI et Passkey doivent rester qualifiés d'options dépendantes de la configuration et des conditions d'exploitation.
6. La PWA doit être décrite comme installable, sans promettre un fonctionnement hors ligne complet.
7. Les modèles 3D doivent être présentés comme des aperçus graphiques génériques, non comme des jumeaux numériques ou des modèles CAO certifiés.
8. Le rapport ne doit pas présenter de CI/CD, d'intégration Odoo, de cloud ou de mise en production réelle comme des acquis.

## 13. Sources techniques auditées

- `grod-platform-backend/pom.xml` ;
- `grod-platform-backend/src/main/java/com/grod/platform/**` ;
- `grod-platform-backend/src/main/resources/application.yaml` ;
- `grod-platform-backend/src/main/resources/application-prod.yaml` ;
- `grod-platform-backend/src/main/resources/db/migration/V1__baseline_schema.sql` ;
- `grod-platform-backend/src/test/**` et `target/surefire-reports/**` ;
- `grod-platform-frontend/package.json` et `package-lock.json` ;
- `grod-platform-frontend/src/App.jsx`, `main.jsx`, `Copper3DScenes.jsx` et `App.css` ;
- `grod-platform-frontend/public/manifest.webmanifest`, `sw.js` et `models/*.glb` ;
- `grod-platform-frontend/e2e/*.spec.js` et `playwright.config.js` ;
- `deploy/**`, `.env.production.example` et l'historique Git local.
