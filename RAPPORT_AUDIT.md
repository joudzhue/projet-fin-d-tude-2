# Audit du rapport PFE G-ROD

**Document audité :** `rapport/RAPPORT_PFE_GROD_EMSI_OFFICIEL.docx`  
**Référentiels :** guide officiel EMSI, modèle officiel « Page de garde Stage 5IIR.docx », code source G-ROD et résultats de tests du 13 septembre 2026.  
**Objet :** identifier ce qui peut être conservé, ce qui doit être amélioré, ce qui contredit le code et ce qui manque avant la rédaction finale.

## 1. Diagnostic général

Le rapport actuel constitue une base de travail utile. Il respecte déjà l'ordre général demandé par l'EMSI, utilise trois sections Word pour séparer la couverture, les pages préliminaires et le corps du rapport, et contient les quatre chapitres attendus. Les marges, le format A4, la police Times New Roman, la hiérarchie des titres et la logique de pagination ont été configurés.

Le contenu technique est globalement fidèle au projet, notamment pour l'architecture React/Spring Boot/MySQL, les fonctions publiques et administratives, la gestion des fichiers, la sécurité, la PWA installable et la dette de modularisation. Le texte fait aussi l'effort de distinguer la préparation du déploiement de la mise en production effective.

Le document ne peut toutefois pas encore être remis au jury. Il contient onze mentions explicites « À COMPLÉTER », vingt-cinq emplacements de captures ou diagrammes, aucune légende automatique `SEQ`, aucun renvoi Word `REF`, un résultat E2E devenu inexact et plusieurs informations personnelles ou métier non validées. Les citations techniques sont trop rares dans le corps du texte. La rédaction est parfois régulière au point de paraître générique, surtout dans les introductions, conclusions et paragraphes annonçant des figures.

Les contrôles structurels donnent environ 8 092 éléments séparés par des espaces, 811 paragraphes, 39 tableaux, 3 sections, 30 légendes de figures, 12 légendes de tableaux, 5 images intégrées et 11 objets ancrés provenant principalement de la couverture officielle. La pagination visuelle exacte n'a pas pu être validée, car LibreOffice n'est pas installé et l'automatisation Word disponible a rencontré une erreur RPC. Le volume substantiel reste donc à mesurer après insertion des figures réelles et rendu final.

## 2. Conformité au guide EMSI

| Exigence | État actuel | Observation |
|---|---|---|
| Page de garde officielle | Partiel | le modèle est conservé, mais les champs inconnus n'utilisent pas tous les placeholders demandés |
| Ordre des parties | Conforme | couverture, pages liminaires, introduction, 4 chapitres, conclusion, références et annexes |
| A4 portrait et marges | Conforme structurellement | 3 cm à gauche, 2,5 cm sur les autres côtés dans les sections de contenu |
| Times New Roman, corps 12 pt, interligne 1,5 | Conforme structurellement | à confirmer visuellement sur toutes les pages après rendu |
| Pagination romaine puis arabe | Conforme structurellement | préliminaires en romain, corps principal redémarré à 1 |
| Résumé français 150–300 mots | Conforme | environ 217 mots, 5 mots-clés |
| Abstract fidèle | À améliorer | environ 173 mots ; sens cohérent, mais traduction finale à relire après correction du français |
| Résumé arabe fidèle | À améliorer | environ 172 unités séparées par espaces ; relecture linguistique humaine recommandée |
| Introduction générale 2–4 pages | Probablement conforme en volume | environ 966 mots, mais rendu paginé non vérifié et citations à renforcer |
| Introduction et conclusion par chapitre | Conforme | les quatre chapitres possèdent les deux éléments |
| Sommaire, figures et tableaux automatiques | Partiel | trois champs TOC existent, mais leur mise à jour doit être faite dans Word |
| Légendes automatiques | Non conforme | aucune instruction Word `SEQ` n'est présente |
| Renvois automatiques | Non conforme | aucune instruction Word `REF` n'est présente |
| Figures citées avant insertion | Partiel | annonces présentes, mais beaucoup sont des formulations temporaires répétées |
| Titres des tableaux au-dessus | Conforme | convention respectée dans la version actuelle |
| Citations numérotées [1], [2]... | Partiel | numérotation présente, mais plusieurs références ne sont jamais appelées dans le texte |
| 60–100 pages hors annexes | Non vérifiable à ce stade | nombreuses pages de réserve ; contenu et illustrations définitifs manquants |

## 3. A. CONTENU CORRECT

### A.1 Structure académique

- L'ordre des parties suit le guide EMSI.
- Les chapitres portent les titres demandés : contexte, analyse de l'existant, conception, réalisation.
- Chaque chapitre comprend une introduction et une conclusion.
- Les résumés français, anglais et arabe sont présents.
- Le résumé français respecte la plage de 150 à 300 mots et contient cinq mots-clés.
- La séparation Word entre couverture, pages préliminaires et corps principal est adaptée à la pagination demandée.
- La table des matières, la table des figures et la liste des tableaux ont des champs automatiques à actualiser.

### A.2 Contenu technique à conserver

- La plateforme est correctement présentée comme une application web responsive et installable, pas comme une application mobile native.
- L'architecture SPA React + API Spring Boot + base relationnelle MySQL correspond au code.
- Java 21, Spring Boot 3.5.14, React 19.2.6, Three.js 0.185.1 et Playwright 1.62.1 sont exacts.
- Les pages publiques décrites existent : accueil, catalogue, fiche produit, ressources, processus, présentation de G-ROD, devis et demande de document.
- Les pages Admin décrites existent : connexion, dashboard, demandes, pipeline, clients, produits, documents, ressources, notifications, compte et préférences.
- Les mécanismes Spring Security, JWT, BCrypt, CORS, limitation de requêtes et validation de fichiers existent réellement.
- La gestion temporaire puis définitive des pièces jointes de devis est conforme au code.
- La génération PDF avec OpenPDF est réelle.
- La pagination serveur, les recherches et filtres reposent sur Spring Data JPA et des `Specification`.
- Les notifications internes et leur état lu/non lu sont persistés.
- Les huit modèles GLB locaux et le chargement différé Three.js sont réels.
- Le rapport mentionne correctement la concentration de `App.jsx` et `App.css` comme dette technique.
- Le déploiement est correctement présenté comme préparé, avec Nginx, systemd, variables d'environnement et scripts, et non comme déjà exploité en production.
- L'intégration ERP/Odoo, le cloud, le stockage objet et le CI/CD sont placés parmi les perspectives.

### A.3 Prudence sur les informations métier

- Le rapport n'invente pas un ancien processus métier détaillé : il laisse une mention à compléter avec l'entreprise.
- Les chiffres industriels, investissements, capacités et projections sont signalés comme devant être validés.
- Le périmètre exclut clairement paiement, commande, facturation et stock industriel.
- La formulation « démarche itérative inspirée des méthodes agiles » est plus fidèle aux preuves disponibles qu'une affirmation de Scrum strict.

## 4. B. CONTENU À AMÉLIORER

### B.1 Page de garde

Le modèle EMSI est conservé, ce qui est correct. Les valeurs génériques actuelles doivent toutefois être remplacées par les placeholders explicites demandés :

- `Prénom et nom de l'étudiant` → `[NOM COMPLET]` ;
- `Pr. Prénom et nom` → `[TUTEUR EMSI]` ;
- `M. ou Mme Prénom et nom` → `[TUTEUR ENTREPRISE]` ;
- `Activité : ---` → `[ACTIVITÉ À VALIDER]` ;
- `Adresse : ---` → `[ADRESSE ENTREPRISE]`.

Il faut aussi corriger « 31 Aout 2026 » en « 31 août 2026 » sans modifier l'organisation graphique de la couverture.

### B.2 Style de rédaction

Le document possède un ton académique, mais certaines séquences sont trop régulières. Les phrases « La figure ... présente ... Elle sera remplacée... » sont répétées pour presque toutes les captures. Cette formulation temporaire doit disparaître : le texte final annoncera naturellement chaque figure, puis la figure et sa légende seront insérées.

Plusieurs introductions et conclusions utilisent des formulations générales comme « la solution est cohérente », « une base solide » ou « le projet a permis de consolider ». Elles doivent être remplacées par des constats précis : parcours vérifié, test concerné, résultat observé ou limite identifiée. Toute expérience personnelle inconnue doit devenir `[À PERSONNALISER PAR L’ÉTUDIANT]`.

Le rapport final doit conserver un français simple, varier la longueur des phrases et limiter les listes aux synthèses réellement utiles. Il ne faut pas réécrire les passages exacts uniquement pour changer leur style.

### B.3 Résumés et introduction

Le résumé français est dans la bonne plage, mais sa phrase sur « les tests ... de bout en bout » doit intégrer le résultat actuel de 37/38 ou être mise à jour après correction. L'Abstract et le résumé arabe devront ensuite être retraduits fidèlement depuis la version française définitive.

L'introduction générale possède un volume raisonnable, proche de 966 mots. Elle doit cependant relier plus clairement la transformation numérique au problème précis de G-ROD, éviter les généralités et citer les rares affirmations externes. La problématique centrale doit apparaître sous la forme d'une question explicite, suivie des objectifs généraux, objectifs spécifiques, démarche et annonce du plan.

### B.4 Chapitre 1

Les descriptions de Morocco Copper Foundry et de la trajectoire industrielle nécessitent des sources officielles. Les informations non publiques ou non démontrables doivent rester sous la forme `[À VALIDER AVEC L’ENTREPRISE]`. Les valeurs et le positionnement ne doivent pas être transformés en slogans non justifiés.

Le schéma de production fourni par l'étudiant peut être utilisé comme illustration, avec une source claire du type « document fourni par Morocco Copper Foundry » uniquement si cette origine est confirmée. La lisibilité des textes dans le format A4 devra être contrôlée au rendu.

### B.5 Chapitre 2 et planification

L'analyse de l'existant doit conserver le placeholder métier tant que l'entreprise n'a pas expliqué l'ancien processus. Le planning actuel est trop générique et le diagramme de Gantt manque.

La période imposée est du 1er mars au 31 août 2026, mais l'historique Git disponible ne commence que le 28 juillet 2026. Il est donc possible de justifier les lots visibles de fin juillet à août. Les activités antérieures doivent rester à confirmer par l'étudiant, sans inventer de dates exactes. Le commit `v1.0.0-rc.2` du 11 septembre 2026 est postérieur à la période de stage et doit être présenté, si l'étudiant le confirme, comme une finalisation après stage plutôt que comme une activité comprise entre mars et août.

### B.6 Chapitre 3

La comparaison React/Angular/Vue, Spring Boot/Node.js/Django et MySQL/PostgreSQL/MongoDB doit rester courte et reliée aux besoins réels. Les critères doivent être concrets : structure de l'équipe, typage, validation, modèle relationnel, écosystème de tests et conditions de déploiement. Il faut éviter d'attribuer à l'étudiant un processus de sélection qui n'est pas documenté ; utiliser `[À CONFIRMER PAR L’ÉTUDIANT]` lorsque le choix réel n'est pas connu.

L'architecture en texte doit être remplacée ou complétée par un diagramme réel. Les séquences doivent suivre les contrôleurs et services existants. Le diagramme de classes devra refléter les associations JPA réellement déclarées, sans inventer une relation `Produit` vers les demandes ou documents lorsque le code ne la modélise pas.

### B.7 Chapitre 4

Le tableau des technologies doit distinguer les contraintes déclarées et les versions installées : React Router 7.18.2, Vite 8.2.1 et ESLint 10.4.0. Pour MySQL, écrire « cible MySQL ; version serveur à confirmer » tant que la version de l'instance n'est pas relevée. Pour Spring Security, Flyway et H2, préciser qu'ils sont gérés par le parent Spring Boot au lieu d'inventer une version.

La partie 3D doit dire que les modèles sont générés avec des géométries simples, utilisés comme aperçus et non comme modèles CAO. La partie PWA doit distinguer installation et mode hors ligne. La partie Passkey doit expliciter la dépendance à HTTPS hors localhost et les limites de l'implémentation personnalisée.

La partie déploiement doit employer « préparation du déploiement » partout. Les scripts existent, mais le serveur de production, le domaine, TLS, les secrets et la restauration réelle n'ont pas été validés dans cet audit.

### B.8 Citations et bibliographie

Les références [3], [4], [6], [7], [8] et [9] apparaissent une seule fois, ce qui correspond à leur entrée bibliographique et montre qu'elles ne sont pas réellement appelées dans le corps du rapport. La référence [5] placée après un paragraphe décrivant toute la pile ne peut pas justifier Spring Security, JWT, BCrypt, React et Passkey si elle renvoie au manuel MySQL.

Les citations doivent être replacées près des affirmations qu'elles soutiennent : documentation Java, Spring Boot/Security, React, Vite, MySQL, Playwright, WebAuthn et OWASP. La bibliographie finale ne doit conserver que les sources effectivement citées et consultées, avec une date de consultation exacte.

### B.9 Word, tableaux et accessibilité

Les tableaux de données possèdent une structure exploitable. Les vingt-cinq tableaux utilisés comme cadres de capture génèrent toutefois des avertissements d'accessibilité concernant l'absence de ligne d'en-tête. Lors du remplacement par de vraies images, ces tableaux décoratifs devront être supprimés ou marqués de manière appropriée. Les images finales devront recevoir un texte alternatif utile.

Les numéros de figures et tableaux sont aujourd'hui du texte manuel. Il faut utiliser de vraies légendes Word avec champs `SEQ`, des signets et des renvois `REF` lorsqu'une figure ou un tableau est cité. Les trois listes automatiques devront être actualisées dans Microsoft Word après la dernière modification.

## 5. C. CONTENU INCORRECT PAR RAPPORT AU CODE OU AUX TESTS

### C.1 Résultat Playwright

Le tableau 4.2 affirme « 38 scénarios réussis ». L'exécution du 13 septembre 2026 donne **37 scénarios réussis et 1 scénario échoué**. L'échec provient d'erreurs DNS lors du chargement des images de produits initiales hébergées sur `grod.achrafchtouki.ma`. Cette valeur doit être corrigée maintenant, puis réévaluée si le code est modifié et les 38 scénarios relancés.

### C.2 Versions frontend

- React Router : le rapport affiche 7.15.1 ; la version installée dans le lock est 7.18.2.
- Vite : le rapport affiche 8.0.12 ; la version installée est 8.2.1.
- ESLint n'apparaît pas avec sa version exacte ; la version installée est 10.4.0.

Les valeurs actuelles correspondent aux contraintes minimales déclarées dans `package.json`, pas à l'environnement reproductible décrit par `package-lock.json`.

### C.3 Formulations de validation finale

Les phrases « la recette finale confirme le bon fonctionnement » et « après validation des tests » ne sont plus exactes sans nuance. Elles doivent devenir : les tests backend, lint, build et 37 scénarios E2E réussissent ; une dépendance d'images externes reste à corriger.

### C.4 Publication de la Release Candidate

Le commit courant `2ef845f` correspond à la référence locale `origin/main`, et les tags RC existent localement. L'audit n'a pas interrogé GitHub pour confirmer que le tag `v1.0.0-rc.2` est publié. Le rapport doit éviter d'affirmer la publication distante du tag sans preuve supplémentaire.

### C.5 Portée implicite de la PWA et des modèles 3D

Si le texte est interprété comme une promesse de fonctionnement hors connexion complet, il devient incorrect : le service worker ne précharge pas la racine de l'application et omet un modèle GLB dans son shell initial. De même, les modèles 3D ne sont pas des plans industriels validés. Ces deux points doivent être formulés explicitement.

### C.6 Moment de promotion d'une pièce jointe de devis

Le rapport indique que le fichier est promu vers son emplacement définitif « après réussite de la transaction ». Le code appelle `promoteTemporaryQuote(...)` au début de `DemandeDevisServiceImpl.ajouterDemande(...)`, avant l'enregistrement du client et de la demande. La transaction protège les écritures en base, mais ne peut pas annuler un déplacement sur le système de fichiers. Le rapport final doit décrire cette séquence exacte et signaler qu'un échec ultérieur peut produire un fichier orphelin détectable par l'audit en lecture seule.

## 6. D. INFORMATIONS MANQUANTES

### D.1 Informations personnelles et entreprise

- `[NOM COMPLET]` ;
- `[TUTEUR EMSI]` ;
- `[TUTEUR ENTREPRISE]` ;
- `[ADRESSE ENTREPRISE]` ;
- `[ACTIVITÉ À VALIDER]` ;
- texte personnel de dédicace ;
- remerciements personnalisés ;
- validation de l'historique, de l'implantation, des valeurs et des données industrielles de MCF ;
- ancien processus métier réel ;
- rôle exact de l'étudiant, organisation de l'encadrement et difficultés personnelles vécues ;
- confirmation des travaux réalisés entre mars et le 27 juillet 2026.

### D.2 Diagrammes obligatoires

Aucun des six diagrammes UML définitifs n'est actuellement inséré :

1. architecture globale G-ROD ;
2. cas d'utilisation global ;
3. séquence de création d'une demande de devis ;
4. séquence d'authentification Admin JWT ;
5. séquence de traitement d'une demande ;
6. diagramme de classes issu des entités JPA.

Le diagramme de Gantt professionnel manque également. Les sources PlantUML et les exports SVG/PNG restent à produire dans `/diagrams`.

### D.3 Captures d'écran

Les emplacements existent, mais les captures finales manquent pour :

- accueil public ;
- catalogue cartes et liste ;
- fiche produit ;
- aperçu 3D ;
- formulaire de devis et confirmation ;
- ressources et demande de document ;
- rendu mobile ;
- connexion Admin ;
- dashboard ;
- pipeline ;
- demandes ;
- clients ;
- produits ;
- demandes de documents ;
- ressources techniques ;
- notifications ;
- compte et sécurité ;
- sidebar réduite/drawer mobile ;
- installation PWA ;
- résultats de tests.

Les captures devront utiliser uniquement des données de démonstration. Aucun mot de passe, secret, token, email personnel ou pièce jointe confidentielle ne doit apparaître.

### D.4 Preuves et mesures

- version exacte du serveur MySQL visé ;
- résultat d'une recette sur MySQL réel ;
- test du domaine HTTPS et de Passkey ;
- résultat du script de sauvegarde/restauration ;
- preuve d'un déploiement serveur, si celui-ci est réalisé plus tard ;
- état GitHub distant du tag RC ;
- mesures de performance ou de charge, si elles sont ajoutées ;
- compatibilité Firefox/Safari/Edge, si elle est revendiquée.

Ces éléments ne sont pas obligatoires pour décrire la Release Candidate actuelle, mais ils ne doivent pas être présentés comme acquis.

## 7. Plan de correction retenu pour la future version finale

1. Conserver la couverture officielle et remplacer les champs génériques par les placeholders exacts.
2. Conserver l'ossature des quatre chapitres et les passages techniques validés.
3. Réécrire localement les paragraphes génériques ou trop répétitifs dans un style académique naturel.
4. Corriger les versions et résultats de tests à partir de `AUDIT_TECHNIQUE_GROD.md`.
5. Maintenir les informations personnelles ou métier inconnues sous forme de placeholders explicites.
6. Produire les six UML et le Gantt depuis le code et les preuves disponibles.
7. Remplacer les vingt-cinq cadres de capture par un ensemble plus restreint de figures réellement utiles.
8. Insérer des légendes automatiques, signets et renvois Word.
9. Replacer chaque citation près de l'affirmation correspondante et supprimer les références inutilisées.
10. Actualiser résumé, Abstract et résumé arabe après stabilisation du contenu français.
11. Mettre à jour les trois tables automatiques dans Word.
12. Générer le PDF et vérifier visuellement toutes les pages avant livraison.

## 8. Conclusion de l'audit

Le rapport actuel n'est pas à refaire depuis zéro. Sa structure, une grande partie de son analyse technique et plusieurs précautions de vocabulaire sont correctes. La future version doit surtout remplacer les réserves visuelles, renforcer les preuves, corriger les résultats E2E et versions frontend, automatiser les légendes/renvois et rendre le style moins uniforme.

La rédaction finale ne devra attribuer aucune expérience personnelle non confirmée à l'étudiant. Chaque passage concerné restera marqué `[À PERSONNALISER PAR L’ÉTUDIANT]` jusqu'à sa validation.
