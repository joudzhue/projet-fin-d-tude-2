# Plan final détaillé du rapport PFE G-ROD

## 1. Objectif et règles de rédaction

Ce plan prépare un rapport d'environ **78 pages hors annexes**, conforme au guide transmis et fidèle au dépôt audité. Le volume sera obtenu par l'analyse, les diagrammes, les tableaux, les captures commentées et la justification des choix. Il ne repose ni sur du remplissage ni sur l'ajout de fonctionnalités au projet.

Les règles suivantes s'appliquent à toute la rédaction :

- relier chaque affirmation technique au code, à une configuration, à un test ou à une capture réelle ;
- distinguer systématiquement « implémenté », « dépendant d'une configuration », « préparé mais non déployé » et « perspective » ;
- conserver les résultats exacts : backend 44/44, ESLint réussi, build Vite réussi, Playwright 37/38 ;
- présenter les modèles 3D comme des représentations géométriques locales, non comme des fichiers CAO certifiés ;
- présenter G-ROD comme une application web responsive et installable, non comme une application mobile native ou une PWA entièrement hors ligne ;
- ne pas annoncer l'email, le SMS ou l'assistant conversationnel comme toujours disponibles ;
- utiliser `[À PERSONNALISER PAR L'ÉTUDIANT]` lorsqu'une information personnelle ou une expérience ne peut pas être vérifiée ;
- employer un français académique simple, avec des paragraphes concrets et des transitions variées ;
- limiter les listes aux comparaisons, exigences et résultats qui gagnent réellement en lisibilité.

## 2. Budget global des pages

La pagination finale dépendra des styles Word, de la taille des captures et des sauts automatiques. Le tableau ci-dessous constitue une cible de composition avec une tolérance d'environ deux pages.

| Partie | Pages visées | Pagination indicative |
|---|---:|---:|
| Éléments préliminaires | 13 | i–xiii ou 1–13 selon le guide |
| Introduction générale | 4 | 1–4 du corps |
| Chapitre 1 — Contexte général du projet | 8 | 5–12 |
| Chapitre 2 — Analyse des besoins et planification | 11 | 13–23 |
| Chapitre 3 — Conception fonctionnelle et technique | 16 | 24–39 |
| Chapitre 4 — Réalisation, tests et validation | 21 | 40–60 |
| Conclusion générale | 3 | 61–63 |
| Références bibliographiques et webographiques | 2 | 64–65 |
| **Corps hors éléments préliminaires et annexes** | **65** | — |
| **Total hors annexes** | **78** | — |
| Annexes techniques | 15 à 25, non comptées | A–O environ |

## 3. Éléments préliminaires — 13 pages

### Page de garde — 1 page

Reprendre la page de garde EMSI fournie sans modifier sa hiérarchie. Les champs inconnus restent visibles sous la forme `[À COMPLÉTER]` : nom complet, filière, année universitaire, organisme d'accueil, encadrant pédagogique, encadrant professionnel et date de soutenance.

### Dédicace — 1 page

Texte personnel à rédiger par l'étudiant : `[À PERSONNALISER PAR L'ÉTUDIANT]`.

### Remerciements — 1 page

Nommer uniquement les personnes confirmées par l'étudiant. Prévoir un texte sobre d'une demi-page à une page.

### Résumé, Abstract et résumé en arabe — 3 pages

Une page par langue, avec quatre éléments : besoin, solution développée, architecture générale et résultats de validation. Le résumé français servira de version de référence. Les résultats seront écrits exactement : 44/44 tests backend, lint et build réussis, 37/38 scénarios Playwright.

### Tables automatiques — 5 pages

- table des matières : environ 3 pages ;
- liste des figures : environ 1 page ;
- liste des tableaux : environ 1 page.

### Liste des acronymes — 1 page

Inclure au minimum API, B2B, CAO, CORS, CSS, DTO, E2E, ERP, GLB, HTTP, JPA, JWT, PFE, PWA, REST, SMS, SMTP, SQL, UML et WebAuthn. Chaque terme devra être utilisé dans le rapport ; aucun acronyme décoratif ne sera ajouté.

## 4. Introduction générale — 4 pages

### 4.1 Contexte du stage et du secteur — 1 page

Présenter G-ROD/MCF à partir des informations confirmées, puis expliquer le besoin concret d'une présence numérique capable d'exposer des produits cuivre et de structurer la première étape du suivi commercial. Éviter les généralités sur la transformation numérique.

### 4.2 Problématique — 1 page

Formuler une question centrale proche de : « Comment concevoir une plateforme web B2B qui présente clairement une offre industrielle, recueille des demandes techniques et donne à l'équipe interne une vue exploitable, tout en restant sécurisée, responsive et administrable ? » Cette formulation pourra être ajustée après validation de l'entreprise.

### 4.3 Objectifs et démarche — 1,5 page

Décrire les objectifs réellement couverts : catalogue, fiches produits, ressources, devis, aperçu 3D, administration, clients, documents, notifications, responsive, sécurité et préparation au déploiement. Présenter ensuite les phases analyse, conception, développement, stabilisation et recette. Les périodes antérieures aux premières traces Git devront porter la mention `[À CONFIRMER PAR L'ÉTUDIANT]`.

### 4.4 Organisation du mémoire — 0,5 page

Annoncer le rôle précis de chacun des quatre chapitres, sans résumer leurs conclusions à l'avance.

## 5. Chapitre 1 — Contexte général du projet — 8 pages

### Introduction du chapitre — 0,5 page

Expliquer pourquoi le contexte de l'entreprise et le processus commercial sont nécessaires avant l'analyse du système.

### 1.1 Présentation de l'organisme d'accueil — 1,5 page

- identité complète : `[À COMPLÉTER]` ;
- activité autour de la transformation et des produits cuivre ;
- implantation, historique et organisation uniquement si ces informations sont confirmées ;
- insérer une photographie ou un logo avec source et autorisation.

### 1.2 Activité industrielle et offre produit — 1,5 page

Présenter les familles visibles dans le catalogue et le schéma de production fourni par l'entreprise. Ne pas convertir les descriptions de démonstration en caractéristiques contractuelles. Prévoir une figure du schéma MCF et un tableau concis des huit produits gérés dans la version auditée.

### 1.3 Processus commercial observé avant ou autour du projet — 1,5 page

Décrire uniquement ce qui est vérifiable : besoin de présenter les produits, collecte des paramètres de devis, demandes de documents et traitement par un administrateur. Toute description d'une ancienne méthode manuelle, d'un délai ou d'une difficulté vécue sera marquée `[À PERSONNALISER PAR L'ÉTUDIANT]`.

### 1.4 Problématique détaillée et objectifs — 2 pages

Relier les besoins aux fonctions existantes : visibilité du catalogue, qualité des données techniques, collecte structurée, centralisation du suivi, contrôle des ressources, authentification et adaptation mobile. Un tableau « besoin / réponse apportée / preuve dans l'application » permettra d'éviter les affirmations vagues.

### 1.5 Organisation et méthode de travail — 0,5 page

Présenter les outils de suivi réellement utilisés et le rôle de l'étudiant. Ne pas inventer Scrum, des sprints ou des réunions si aucune preuve ou confirmation n'existe.

### Conclusion du chapitre — 0,5 page

Faire la transition vers l'analyse des besoins et le benchmark.

## 6. Chapitre 2 — Analyse des besoins et planification — 11 pages

### Introduction du chapitre — 0,5 page

Annoncer l'analyse des acteurs, du besoin, des solutions comparables et du calendrier.

### 2.1 Recueil et analyse des besoins — 1,5 page

Présenter les besoins publics et administratifs dans deux tableaux distincts. Les exigences doivent être formulées comme des comportements vérifiables : consulter les produits actifs, rechercher une ressource, soumettre un devis, mettre à jour un statut, consulter un historique, etc.

### 2.2 Acteurs et périmètre fonctionnel — 1,5 page

Définir les trois rôles utiles au modèle : visiteur, prospect/client et administrateur. Insérer le diagramme global de cas d'utilisation et expliquer les frontières du système. Le client ne possède pas de compte ; il est représenté dans la base lorsqu'une demande est créée ou regroupée.

**Illustration :** `diagrams/02_cas_utilisation_global.svg` — « Diagramme global des cas d'utilisation de G-ROD ».

### 2.3 Étude de l'existant et benchmark industriel B2B — 4 pages

#### 2.3.1 Situation fonctionnelle à traiter — 0,75 page

Présenter les informations et opérations à réunir dans une interface commune, sans inventer un ancien logiciel ou des mesures de productivité.

#### 2.3.2 Méthode et critères du benchmark — 0,5 page

Justifier les critères : catalogue, données techniques, documentation, orientation commerciale, contexte international et espace réservé.

#### 2.3.3 Wieland, KME, Aurubis et Nexans — 1,75 page

Synthétiser les constats provenant exclusivement des pages officielles. Le contenu développé se trouve dans `BENCHMARK_B2B_INDUSTRIEL.md`.

#### 2.3.4 Tableau comparatif et positionnement de G-ROD — 1 page

Mettre en évidence les choix repris dans le projet et les fonctions non couvertes. G-ROD sera positionné comme une plateforme de présentation technique et de soutien au processus commercial, pas comme un ERP, une place de marché ou un portail transactionnel complet.

### 2.4 Spécifications fonctionnelles et non fonctionnelles — 1,5 page

Regrouper les exigences par priorité et associer une preuve : route, endpoint, test ou capture. Couvrir la sécurité, le responsive, la validation des fichiers, la pagination et la maintenabilité. Les objectifs de performance non mesurés ne seront pas présentés comme atteints.

### 2.5 Planification du projet — 1,5 page

Insérer le Gantt mars–août 2026, puis distinguer :

- mars au 27 juillet : chronologie à confirmer par l'étudiant ;
- 28 juillet au 17 août : séquence reconstruite à partir des traces Git disponibles ;
- 18 au 31 août : recette et clôture à confirmer ;
- 17 août : jalon local `v1.0.0-rc.1`.

**Illustration :** `diagrams/07_gantt_mars_aout_2026.svg` — « Planification du projet G-ROD de mars à août 2026 ».

Le texte devra préciser qu'un historique Git tardif ne prouve pas les activités réalisées avant le 28 juillet.

### Conclusion du chapitre — 0,5 page

Relier les besoins retenus aux choix de conception du chapitre 3.

## 7. Chapitre 3 — Conception fonctionnelle et technique — 16 pages

### Introduction du chapitre — 0,5 page

Présenter le passage des besoins aux composants, modèles de données et échanges.

### 3.1 Architecture globale — 3 pages

Décrire le frontend React/Vite, l'API Spring Boot, Spring Security, les services, les dépôts JPA, MySQL, les uploads locaux et les intégrations optionnelles. Faire la différence entre l'environnement de développement et la cible préparée avec Nginx/systemd. Le déploiement réel ne sera pas affirmé.

**Illustration :** `diagrams/01_architecture_globale.svg` — « Architecture logique et cible de déploiement préparée pour G-ROD ».

Ajouter un tableau des technologies avec les versions installées vérifiées : Java 21, Spring Boot 3.5.14, React 19.2.6, React Router 7.18.2, Vite 8.2.1, Three.js 0.185.1, Playwright 1.62.1 et ESLint 10.4.0.

### 3.2 Modèle métier et persistance — 3 pages

Présenter les dix entités JPA et leurs rôles. Expliquer que seules les associations effectivement déclarées sont modélisées comme relations JPA : `DemandeDevis` vers `Client`, et `NotificationLecture` vers `Notification` et `Utilisateur`. Les identifiants ou noms de produits présents dans d'autres objets sont des références logiques scalaires, sans clé étrangère JPA.

**Illustration :** `diagrams/06_modele_metier_jpa.svg` — « Diagramme de classes du modèle persistant ».

Compléter par une explication de Flyway, de la migration de référence et du besoin de futures migrations `V2`, `V3`, etc.

### 3.3 Sécurité et authentification — 2,5 pages

Décrire l'authentification email/mot de passe, BCrypt, la création du JWT, son stockage en `sessionStorage` et le filtrage des appels protégés. Ajouter les contrôles CORS, validation d'uploads, rôles et limitation de fréquence. Présenter WebAuthn/Passkey avec ses limites réelles.

**Illustration :** `diagrams/04_sequence_authentification_jwt.svg` — « Séquence d'authentification Admin par JWT ».

### 3.4 Conception des flux métier — 4 pages

#### 3.4.1 Création d'une demande de devis — 2 pages

Présenter la validation, le rate limiting, le stockage temporaire optionnel, la promotion du fichier, la recherche ou création du client, la génération de référence et les notifications. La promotion du fichier a lieu avant les écritures en base : la transaction ne peut pas annuler ce déplacement.

**Illustration :** `diagrams/03_sequence_creation_devis.svg` — « Séquence de création d'une demande de devis ».

#### 3.4.2 Traitement administratif d'une demande — 2 pages

Décrire la liste paginée, le filtrage, le changement de statut et la génération PDF optionnelle sans ajouter d'étapes métier inexistantes.

**Illustration :** `diagrams/05_sequence_traitement_demande.svg` — « Séquence de consultation et de traitement d'une demande ».

### 3.5 Conception du frontend, de la PWA et de la 3D — 2,5 pages

Expliquer le routage public/Admin, le thème, les règles responsive, le manifeste et le service worker. Présenter le chargement différé de Three.js et des GLB, ainsi que l'état de secours. La dette de `App.jsx` et `App.css`, le cache hors ligne incomplet et le poids du chunk 3D seront annoncés dès la conception technique, puis repris comme limites.

### Conclusion du chapitre — 0,5 page

Préparer le passage aux écrans et aux résultats mesurés.

## 8. Chapitre 4 — Réalisation, tests et validation — 21 pages

### Introduction du chapitre — 0,5 page

Expliquer que la réalisation sera présentée par parcours, puis validée par des contrôles automatisés.

### 4.1 Réalisation de l'expérience publique — 4,5 pages

Décrire l'accueil, le catalogue dynamique, la recherche, les filtres, les deux modes d'affichage, la fiche produit et l'accès au devis. Insérer les figures 4.1 à 4.4 définies dans `CAPTURES_CHAPITRE_4.md`.

### 4.2 Aperçu 3D et contenus institutionnels — 2,5 pages

Montrer l'aperçu 3D, ses commandes, son chargement différé et son état de secours, puis le schéma de production. Insérer les figures 4.5 et 4.9. Préciser les limites CAO et le caractère codé de l'association modèle-produit.

### 4.3 Devis, ressources et documents — 3 pages

Suivre un parcours complet depuis un produit jusqu'à la confirmation de demande, puis distinguer ressource publique et demande de document. Insérer les figures 4.6 à 4.8. Expliquer les contrôles des fichiers et le comportement réel du stockage.

### 4.4 Administration et suivi commercial — 4,5 pages

Présenter la connexion, le dashboard, le pipeline, les listes filtrées et paginées, ainsi que le changement de statut. Insérer les figures 4.11 à 4.14. La pagination du pipeline sera expliquée comme réponse au volume, sans annoncer de test de charge.

### 4.5 Gestion des clients, produits, ressources et notifications — 2,5 pages

Présenter l'historique client, l'administration du catalogue, les ressources techniques, les notifications et le compte. Insérer les figures 4.15 à 4.17. Éviter l'expression « CRM complet » et ne pas suggérer l'upload de modèles 3D.

### 4.6 Tests et validation — 2 pages

Intégrer la synthèse et le tableau de `CONTENU_CHAPITRE_4_TESTS_LIMITES.md`, avec les résultats exacts :

- backend : 44 tests réussis sur 44 ;
- ESLint : réussi ;
- build Vite : réussi ;
- Playwright : 37 scénarios réussis sur 38.

Développer la cause du scénario en échec : images initiales externes et erreur DNS `net::ERR_NAME_NOT_RESOLVED`. Mentionner le chunk 3D d'environ 614,5 Ko et les validations non réalisées. La figure 4.18 peut être déplacée en annexe si elle rend cette partie trop dense.

### 4.7 Limites et perspectives — 1 page

Résumer les limites prioritaires issues de l'audit et renvoyer le tableau détaillé en annexe si nécessaire : images externes, données métier à valider, WebAuthn, états en mémoire, JWT sans révocation, CSP absente, frontend monolithique, poids 3D, PWA hors ligne incomplète, uploads locaux, recette MySQL/déploiement non réalisés et CI/CD absente.

### Conclusion du chapitre — 0,5 page

Établir le bilan sans employer « totalement validé » ou « prêt pour la production ».

## 9. Conclusion générale — 3 pages

### 9.1 Bilan du travail réalisé — 1,5 page

Répondre à la problématique en reliant les fonctions publiques et le back-office. Résumer les principaux choix techniques et rappeler les validations positives sans masquer le 37/38.

### 9.2 Apports personnels — 0,5 page

Section entièrement marquée `[À PERSONNALISER PAR L'ÉTUDIANT]` tant que les apprentissages, responsabilités et difficultés vécues n'ont pas été confirmés.

### 9.3 Limites et perspectives prioritaires — 1 page

Retenir trois horizons : correction de la dépendance aux images et validation métier ; durcissement sécurité/refactorisation/CI ; stockage et exploitation à plus grande échelle. Ne pas ajouter arbitrairement une application mobile, un ERP ou le paiement en ligne.

## 10. Références — 2 pages

Séparer :

- documentation technique officielle : Spring Boot, React, Vite, Playwright, Three.js, Flyway, JWT/WebAuthn selon les références effectivement utilisées ;
- benchmark industriel : pages officielles Wieland, KME, Aurubis et Nexans ;
- documents internes fournis par l'entreprise, avec autorisation et date si disponibles.

Chaque source citée dans le texte doit figurer dans la bibliographie et inversement. La date de consultation des pages du benchmark est le 14 septembre 2026.

## 11. Annexes proposées — hors pagination principale

| Annexe | Contenu | Preuve disponible |
|---|---|---|
| A | Endpoints REST principaux | Contrôleurs Spring audités |
| B | Diagramme d'architecture grand format | Source et exports du dossier `diagrams` |
| C | Diagramme de cas d'utilisation grand format | Source et exports du dossier `diagrams` |
| D | Séquence de création d'un devis | Source et exports du dossier `diagrams` |
| E | Séquence d'authentification JWT | Source et exports du dossier `diagrams` |
| F | Séquence de traitement d'une demande | Source et exports du dossier `diagrams` |
| G | Diagramme de classes JPA | Source et exports du dossier `diagrams` |
| H | Gantt mars–août 2026 | Source et exports du dossier `diagrams` |
| I | Captures complémentaires publiques | Données de démonstration à préparer |
| J | Captures complémentaires Admin | Données de démonstration à préparer |
| K | Sortie complète des 44 tests backend | Résultat d'audit |
| L | Sorties ESLint et build Vite | Résultat d'audit |
| M | Sortie Playwright 37/38 et erreur DNS | Résultat d'audit |
| N | Extrait de configuration de déploiement | Nginx, systemd et environnement exemple |
| O | Limites techniques et plan d'amélioration | Audit technique |

## 12. Inventaire des six diagrammes UML et du Gantt

| N° | Diagramme | Type | Section du rapport | Source |
|---:|---|---|---|---|
| 1 | Architecture globale | UML composants/déploiement simplifié | 3.1 | `diagrams/01_architecture_globale.puml` |
| 2 | Cas d'utilisation global | UML cas d'utilisation | 2.2 | `diagrams/02_cas_utilisation_global.puml` |
| 3 | Création d'une demande de devis | UML séquence | 3.4.1 | `diagrams/03_sequence_creation_devis.puml` |
| 4 | Authentification Admin JWT | UML séquence | 3.3 | `diagrams/04_sequence_authentification_jwt.puml` |
| 5 | Traitement administratif d'une demande | UML séquence | 3.4.2 | `diagrams/05_sequence_traitement_demande.puml` |
| 6 | Modèle métier persistant | UML classes | 3.2 | `diagrams/06_modele_metier_jpa.puml` |
| 7 | Planning mars–août 2026 | Gantt, hors UML | 2.5 | `diagrams/07_gantt_mars_aout_2026.puml` |

Chaque source doit être exportée en SVG pour Word et en PNG pour la vérification visuelle. Les sources PlantUML restent jointes afin que les figures puissent être corrigées sans redessiner le document.

## 13. Estimation finale par chapitre après enrichissement

| Chapitre | Texte analytique | Tableaux/diagrammes/captures | Total visé |
|---|---:|---:|---:|
| Introduction générale | 3,5 | 0,5 | **4 pages** |
| Chapitre 1 | 5,5 | 2,5 | **8 pages** |
| Chapitre 2 | 6,5 | 4,5 | **11 pages** |
| Chapitre 3 | 9 | 7 | **16 pages** |
| Chapitre 4 | 9 à 10 | 11 à 12 | **21 pages** |
| Conclusion générale | 3 | 0 | **3 pages** |
| Références | 2 | 0 | **2 pages** |
| **Corps total** | **39,5 à 40,5** | **24,5 à 25,5** | **65 pages** |

Avec les 13 pages préliminaires, la cible atteint **78 pages hors annexes**. Lors de la mise en page Word, il faudra ajuster en priorité la taille des figures et déplacer les preuves secondaires en annexes, plutôt que d'allonger artificiellement les paragraphes.

## 14. Contrôle avant génération du Word final

Le fichier `RAPPORT_PFE_GROD_FINAL_EMSI.docx` ne devra être généré qu'après les vérifications suivantes :

1. validation des champs personnels et institutionnels ou accord pour les laisser marqués ;
2. confirmation de la chronologie mars–juillet et de la fin août ;
3. validation métier des caractéristiques produits ou maintien explicite du statut « démonstration » ;
4. prise des captures avec données fictives et contrôle de confidentialité ;
5. export et inspection des six diagrammes UML et du Gantt ;
6. conservation exacte des résultats de tests ;
7. relecture des légendes, renvois, numéros de tableaux et figures ;
8. génération automatique de la table des matières et des listes ;
9. contrôle des sauts de page, veuves/orphelines et lisibilité des figures ;
10. rendu PDF de vérification avant remise du document Word.

