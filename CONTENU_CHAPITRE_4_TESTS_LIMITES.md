# Contenu prêt à intégrer — Tests, validation, limites et perspectives

> Les numéros de sections proposés supposent que ce contenu clôt le chapitre 4. Ils pourront être ajustés automatiquement dans Word sans modifier le fond.

## 4.6 Tests et validation

### 4.6.1 Démarche de validation

La validation de G-ROD a été organisée en plusieurs niveaux afin de ne pas réduire la qualité du projet à une seule vérification visuelle. Le backend a d'abord été contrôlé par les tests Maven. Le frontend a ensuite fait l'objet d'une analyse statique avec ESLint et d'une compilation de production avec Vite. Enfin, des scénarios Playwright ont exécuté les principaux parcours dans Chromium, avec un backend de test isolé et une base H2 configurée en mode de compatibilité MySQL.

Les résultats présentés dans cette section correspondent aux commandes réellement exécutées le 13 septembre 2026. Ils doivent être repris sans arrondir ni masquer l'échec résiduel : le résultat global de Playwright est de 37 scénarios réussis sur 38. Les autres contrôles automatisés retenus sont réussis.

| Niveau | Commande | Résultat observé | Interprétation |
|---|---|---:|---|
| Backend | `cd grod-platform-backend` puis `.\mvnw.cmd test` | **44/44 réussis** | Aucun échec, aucune erreur et aucun test ignoré |
| Qualité frontend | `cd grod-platform-frontend` puis `npm.cmd run lint` | **Réussi** | Aucune erreur ESLint bloquante dans la configuration actuelle |
| Build frontend | `npm.cmd run build` | **Réussi** | Les fichiers de production Vite ont été générés |
| Parcours E2E | campagne Playwright configurée dans le projet | **37/38 réussis** | Un échec lié aux images produits externes reste à corriger |

### 4.6.2 Validation du backend

L'exécution de la commande Maven a lancé onze suites et produit un bilan de 44 tests réussis, sans échec, sans erreur et sans test ignoré. Ces tests couvrent le démarrage du contexte Spring, la migration Flyway, l'initialisation idempotente des données, le pipeline des demandes, les notifications externes dans leur périmètre simulé, la limitation de fréquence, la sécurité, plusieurs règles métier et le cycle de vie des fichiers.

Ce résultat vérifie que les composants testés restent cohérents entre eux et que le schéma de référence peut être appliqué dans l'environnement H2 de test. Il ne constitue toutefois pas une validation complète d'un serveur MySQL de production. H2 est lancé avec un mode de compatibilité MySQL et réutilise le script Flyway, mais certaines différences de moteur peuvent seulement apparaître lors d'une recette sur la version MySQL réellement visée.

La séquence de gestion des pièces jointes mérite également une précision. Lors de la création d'une demande de devis, le fichier temporaire est promu vers le stockage définitif au début de la méthode transactionnelle, avant les écritures en base. Une transaction Spring peut annuler les opérations en base, mais pas le déplacement déjà effectué sur le disque. Si une erreur survient ensuite, un fichier final orphelin peut donc subsister. L'audit de stockage permet de le repérer ; le nettoyage planifié actuel vise les fichiers temporaires expirés et ne corrige pas automatiquement ce cas.

### 4.6.3 Analyse statique et construction du frontend

La commande ESLint s'est terminée avec succès. Elle contrôle les règles déclarées par le projet et constitue une protection contre plusieurs erreurs de syntaxe ou d'usage dans le code React. Ce résultat ne signifie pas que le frontend ne contient plus de dette structurelle. Le composant principal `App.jsx` et la feuille `App.css` restent volumineux, ce qui augmente le coût de maintenance et le risque de régression lors d'une future évolution.

La construction Vite a également réussi. Les artefacts principaux mesurés avant compression représentent environ 272 Ko de CSS, 475 Ko pour le JavaScript principal et 614,5 Ko pour le module 3D. Vite signale que ce dernier dépasse le seuil de 500 Ko. Dans l'application actuelle, le chargement différé évite de télécharger le module Three.js avant la demande d'un aperçu 3D. Cette mesure limite l'impact sur la première vue, mais elle ne supprime pas le besoin d'optimiser le poids du module et des modèles.

Le succès du build confirme donc que la version frontend peut être produite avec la configuration courante. Il ne prouve pas, à lui seul, le fonctionnement de chaque parcours dans un navigateur ; c'est la raison pour laquelle la campagne Playwright complète ce contrôle.

### 4.6.4 Recette automatisée Playwright

La configuration Playwright comporte 38 scénarios répartis dans quatre fichiers. Pour limiter l'influence de l'environnement de développement courant, elle démarre un backend de test sur le port 18080 et un frontend Vite sur le port 15173, puis exécute les scénarios avec un seul worker. Cette organisation rend les résultats plus reproductibles qu'une recette effectuée manuellement sur des données non contrôlées.

La campagne consolidée donne le résultat suivant : cinq scénarios critiques restants réussis, trente-deux scénarios Release Candidate, responsive et 3D réussis, et un scénario public échoué. Le bilan exact est donc de **37 réussites et 1 échec sur 38 scénarios**.

Les scénarios réussis couvrent notamment les parcours principaux publics et administratifs, plusieurs tailles d'écran et le comportement de l'aperçu 3D. Ils vérifient aussi que le code Three.js et le fichier GLB ne sont chargés qu'après l'action de l'utilisateur, qu'un état de secours existe lorsque l'aperçu échoue et que chacun des huit produits dispose d'un modèle local.

L'échec résiduel concerne la console de la page Catalogue. Les requêtes de l'API produits répondent et le contenu fonctionnel s'affiche, mais les images initiales référencées dans `DataInitializer` utilisent un domaine externe qui ne peut pas être résolu dans l'environnement de test. Chromium enregistre alors `net::ERR_NAME_NOT_RESOLVED`, ce qui fait échouer le scénario qui attend une console sans erreur. Ce résultat révèle une dépendance réelle au réseau et à un domaine tiers. La correction recommandée consiste à utiliser des images locales ou des images administrées par G-ROD, puis à relancer la campagne afin de vérifier le passage éventuel à 38/38. Cette correction n'a pas été développée uniquement pour les besoins du rapport.

### 4.6.5 Périmètre non validé

Les résultats précédents doivent être interprétés à l'intérieur de leur périmètre. L'audit n'a pas inclus de test de charge, de scan automatique de vulnérabilités ni de test d'intrusion. Les services SMTP, Twilio et OpenAI n'ont pas été exercés avec des secrets de production. La Passkey n'a pas été testée sur un domaine HTTPS réel. Les scripts de sauvegarde et de restauration n'ont pas fait l'objet d'une répétition complète sur Docker MySQL 8.4, et aucun déploiement Linux réel n'a été recetté. La compatibilité navigateur a été contrôlée avec Chromium via Playwright, sans campagne équivalente sur Firefox et WebKit.

Pour cette raison, le rapport peut conclure que la version auditée est techniquement construisible et largement couverte par les tests disponibles. Il ne doit pas affirmer que tous les scénarios réussissent, que la plateforme est déjà déployée en production ou qu'elle a fait l'objet d'une qualification de sécurité complète.

### 4.6.6 Bilan de la validation

Les contrôles montrent un socle backend stable dans le périmètre automatisé et un frontend capable de passer l'analyse statique et la construction de production. La recette de bout en bout valide 37 scénarios sur 38 et isole une anomalie reproductible liée à l'hébergement externe des images. Ce résultat est suffisamment précis pour distinguer les éléments validés des points restant à traiter avant une mise en production.

## 4.7 Limites observées

Les limites ci-dessous proviennent exclusivement de l'audit du code, des configurations, des tests et des éléments d'exploitation présents dans le dépôt. Elles ne supposent aucune fonctionnalité absente.

### 4.7.1 Dépendances externes et données métier

Les huit produits initiaux utilisent des images hébergées sur un domaine externe. Cette dépendance est la cause du seul échec Playwright et peut dégrader le catalogue lorsque le domaine ou le réseau n'est pas disponible. Les valeurs de pureté, dimensions, normes et descriptions de démonstration doivent en outre être vérifiées par l'entreprise avant toute publication commerciale, car leur présence dans le code ne garantit pas leur validité contractuelle.

L'assistant conversationnel nécessite une clé OpenAI. Les notifications email et SMS exigent respectivement une configuration SMTP et Twilio ; elles sont désactivées par défaut. Les notifications internes persistées ne dépendent pas de ces services et restent la fonction de notification pleinement vérifiée.

### 4.7.2 Sécurité et montée en charge

L'authentification Admin principale repose sur JWT et BCrypt avec des routes protégées par rôle. L'option Passkey utilise cependant une mise en œuvre WebAuthn personnalisée qui demande un durcissement avant la production : les challenges sont conservés en mémoire, le compteur de signature n'est pas mis à jour lors de la connexion et tous les indicateurs de présence ou de vérification utilisateur ne sont pas explicitement contrôlés.

La limitation de fréquence est également conservée en mémoire. Elle convient à l'instance actuelle mais ne serait pas partagée si plusieurs backends étaient déployés. Le cycle JWT ne comporte ni refresh token, ni révocation centralisée, ni liste de blocage. Enfin, la configuration Nginx fournie ne définit pas encore de Content Security Policy, car les sources de contenus internes et externes doivent d'abord être inventoriées.

### 4.7.3 Architecture frontend et performances

Le frontend concentre une grande partie de l'interface dans `App.jsx`, qui compte 6 542 lignes, et dans `App.css`, qui en compte 14 343. Cette organisation a permis de faire évoluer rapidement une interface cohérente, mais elle rend les responsabilités moins lisibles et augmente le risque de conflit lors des modifications.

Le chunk 3D atteint environ 614,5 Ko avant compression. Son chargement différé protège le chargement initial, mais l'expérience sur un réseau lent reste à mesurer. Les huit modèles GLB sont des géométries locales simples destinées à l'aperçu. Ils ne sont ni des plans CAO certifiés ni des fichiers pouvant être téléversés depuis l'administration.

### 4.7.4 PWA et exploitation

Le manifeste et le service worker rendent G-ROD installable comme Progressive Web App lorsque le navigateur satisfait les critères. Le démarrage hors connexion n'est toutefois pas garanti : la racine `/` n'est pas préchargée et le modèle `copper-flat-bars.glb` manque dans la liste initiale du cache. La plateforme ne doit donc pas être présentée comme une application mobile native ou une PWA totalement hors ligne.

Les uploads sont stockés sur le disque de l'instance. Ce choix reste simple pour un déploiement unique, mais nécessite un volume persistant et une stratégie différente dans une architecture multi-instance. Les scripts et modèles Nginx, systemd, sauvegarde et restauration démontrent une préparation au déploiement. Aucun déploiement serveur réel ni restauration complète n'a été validé pendant l'audit.

### 4.7.5 Base de données et outillage de livraison

Flyway contient une migration de référence correspondant au schéma courant. Toute évolution devra être ajoutée dans une nouvelle migration immuable plutôt que de modifier ce fichier après sa mise en service. La recette automatisée repose sur H2 en mode MySQL et doit être complétée par une vérification sur la version MySQL cible.

Le dépôt ne contient pas de workflow CI/CD. Les contrôles ont été exécutés localement ; ils ne sont pas encore déclenchés automatiquement à chaque modification ou avant un déploiement.

## 4.8 Perspectives proposées

Les perspectives sont classées selon leur proximité avec les limites constatées. Elles représentent des travaux futurs et ne doivent pas être décrites comme réalisés.

| Horizon | Perspective | Justification issue de l'audit | Critère de validation futur |
|---|---|---|---|
| Court terme | Remplacer les images initiales externes par des fichiers locaux ou administrés | Supprimer la dépendance DNS et traiter l'échec Playwright | Campagne Playwright réellement portée à 38/38 |
| Court terme | Faire valider les données techniques par l'entreprise | Éviter de publier des valeurs de démonstration comme données contractuelles | Validation métier écrite des puretés, dimensions et normes |
| Court terme | Tester MySQL cible, sauvegarde et restauration | H2 et les scripts ne suffisent pas comme preuve d'exploitation | Procès-verbal de recette MySQL et restauration réussie |
| Court terme | Compléter le cache PWA | La racine et un modèle GLB ne sont pas entièrement pris en charge hors ligne | Test automatisé du démarrage sans réseau |
| Moyen terme | Durcir ou remplacer l'implémentation WebAuthn | Challenges et compteur de signature présentent des limites | Revue sécurité spécialisée et tests sur HTTPS réel |
| Moyen terme | Découper progressivement `App.jsx` et `App.css` | Réduire la dette de maintenance sans réécrire l'application | Pages, composants, hooks, services et styles séparés avec tests inchangés |
| Moyen terme | Optimiser le module et les modèles 3D | Chunk de 614,5 Ko signalé par Vite | Budget de taille défini et mesure sur réseau limité |
| Moyen terme | Ajouter une CI/CD | Les tests sont aujourd'hui locaux | Lint, build et tests exécutés automatiquement sur chaque changement |
| Moyen terme | Centraliser le rate limiting et les challenges | Les données en mémoire ne sont pas partagées entre instances | Stockage partagé ou passerelle testée en multi-instance |
| Long terme | Utiliser un stockage partagé ou objet | Les uploads locaux compliquent la réplication et la reprise | Tests de persistance, sauvegarde et reprise documentés |
| Long terme | Mettre en place supervision et tests de charge | Aucune mesure de charge ou supervision centralisée n'a été réalisée | Seuils mesurés, tableaux de bord et alertes validés |

Les fonctions telles que paiement en ligne, facturation, gestion de stock, connexion ERP ou compte client ne découlent pas directement d'un défaut de la version auditée. Elles ne sont pas retenues comme perspectives prioritaires sans étude de besoin complémentaire. Cette distinction évite de transformer la conclusion du rapport en liste de fonctions hypothétiques sans lien avec les résultats obtenus.

## 4.9 Conclusion du chapitre

La réalisation a permis de relier le catalogue public, les formulaires de contact technique et le suivi administratif dans une même application. Les tests backend, l'analyse ESLint et la construction Vite ont abouti sans échec. La recette Playwright valide 37 parcours sur 38 et met en évidence un problème précis d'images externes. Le chapitre peut donc conclure à une version cohérente et démontrable dans son environnement contrôlé, tout en conservant une distinction nette entre ce qui a été validé, ce qui dépend d'une configuration externe et ce qui reste nécessaire avant un déploiement de production.

