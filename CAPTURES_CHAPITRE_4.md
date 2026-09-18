# Proposition de captures d'écran — chapitre 4

## Objectif éditorial

Les captures du chapitre 4 doivent démontrer un parcours réel, pas seulement décorer le rapport. Chaque image sera introduite par un court paragraphe, numérotée, accompagnée d'une légende et suivie d'une interprétation. Les captures proposées ci-dessous correspondent aux écrans présents dans le code audité.

Le jeu final recommandé contient **17 figures**, dont plusieurs assemblages de deux vues. Il représente environ 10 à 12 pages du chapitre 4, texte compris. Les écrans secondaires pourront être déplacés en annexes si la mise en page dépasse le budget prévu.

## Protocole de prise de vue

- Utiliser une base locale contenant uniquement des données de démonstration cohérentes.
- Employer la même fenêtre de bureau pour les vues principales, idéalement 1440 × 900 px.
- Conserver un seul thème par séquence. Une comparaison clair/sombre doit être explicitement légendée.
- Masquer ou remplacer les emails personnels, numéros, noms réels, chemins locaux et fichiers confidentiels.
- Ne jamais afficher le mot de passe Admin, un JWT, une clé API, un secret `.env` ou le contenu des outils de développement.
- Désactiver les extensions et notifications du navigateur qui n'appartiennent pas à G-ROD.
- Recadrer l'image sur la zone utile tout en conservant assez d'interface pour identifier la page.
- Exporter en PNG avec un nom stable : `fig-4-XX-description-courte.png`.
- Vérifier la lisibilité à la largeur d'impression prévue avant l'insertion dans Word.
- Ajouter une bordure grise fine, sans ombre forte, puis utiliser la légende Word « Figure ».

## Séquence A — expérience publique

### Figure 4.1 — Page d'accueil et proposition de valeur

- **Route/état :** `/`, affichage bureau, thème clair.
- **Zone à montrer :** en-tête, titre principal, boutons vers le catalogue et le devis, premier aperçu des produits ou engagements.
- **But dans le texte :** expliquer le point d'entrée du parcours et l'accès direct aux deux actions principales.
- **Légende proposée :** « Figure 4.1 — Page d'accueil publique de la plateforme G-ROD ».
- **Texte d'introduction :** « La page d'accueil présente l'activité de G-ROD et oriente le visiteur vers la consultation du catalogue ou la création d'une demande de devis. »

### Figure 4.2 — Recherche et filtrage du catalogue

- **Route/état :** `/catalogue`, huit produits chargés, filtre ou recherche non vide.
- **Zone à montrer :** champ de recherche, filtre d'application, tri, option « actifs seulement » et nombre de résultats.
- **But :** démontrer que la liste publique provient des produits actifs de l'API et peut être explorée sans parcourir manuellement toutes les fiches.
- **Légende :** « Figure 4.2 — Outils de recherche, filtrage et tri du catalogue ».

### Figure 4.3 — Affichages cartes et liste

- **Route/état :** `/catalogue`, même recherche dans les deux modes.
- **Composition :** deux recadrages côte à côte, mode cartes à gauche et mode liste à droite.
- **But :** montrer deux présentations d'un même ensemble de données sans compter chaque mode comme une fonctionnalité différente.
- **Légende :** « Figure 4.3 — Modes cartes et liste du catalogue G-ROD ».

### Figure 4.4 — Fiche technique d'un produit

- **Route/état :** `/catalogue/copper-rod` ou l'identifiant réellement retourné par l'API.
- **Zone à montrer :** image, nom, catégorie, description, pureté, dimensions, normes, applications et accès au devis.
- **But :** relier l'analyse fonctionnelle aux données produit administrées.
- **Légende :** « Figure 4.4 — Fiche publique du produit Copper Rod ».
- **Précaution :** les données métier de démonstration ne doivent pas être qualifiées de spécifications contractuelles.

### Figure 4.5 — Aperçu 3D interactif

- **Route/état :** fiche ou modale d'aperçu après clic sur « Aperçu 3D ».
- **Zone à montrer :** modèle visible et commandes Face, Côté, Dessus, Reset, Capture PNG et Plein écran.
- **But :** illustrer le chargement à la demande du composant Three.js.
- **Légende :** « Figure 4.5 — Aperçu WebGL d'une représentation géométrique du produit ».
- **Formulation obligatoire :** parler de représentation géométrique ou d'aperçu 3D, jamais de modèle CAO certifié.

### Figure 4.6 — Formulaire de demande de devis

- **Route/état :** `/devis?produit=Copper%20Rod`, produit présélectionné, données fictives.
- **Zone à montrer :** informations de contact, produit, quantité, dimensions, application, livraison et pièce jointe optionnelle.
- **But :** présenter la collecte structurée du besoin industriel.
- **Légende :** « Figure 4.6 — Saisie d'une demande de devis détaillée ».

### Figure 4.7 — Confirmation après envoi du devis

- **Route/état :** état de succès obtenu après une soumission locale valide.
- **Zone à montrer :** confirmation et référence retournée si elle est affichée par l'interface.
- **But :** fermer le parcours public et préparer l'explication du traitement côté Admin.
- **Légende :** « Figure 4.7 — Confirmation de l'enregistrement d'une demande ».
- **Précaution :** employer une pièce jointe de démonstration non confidentielle.

### Figure 4.8 — Recherche de ressources et demande de document

- **Route/état :** `/ressources`, puis formulaire de demande de document si nécessaire.
- **Composition :** recherche des ressources publiques à gauche ; formulaire de demande à droite.
- **But :** distinguer un téléchargement public d'une ressource à accès restreint nécessitant une demande.
- **Légende :** « Figure 4.8 — Consultation et demande de documents techniques ».

### Figure 4.9 — Schéma du processus de production

- **Route/état :** `/processus`.
- **Zone à montrer :** schéma de production remplacé par le visuel MCF validé, sans barre du navigateur.
- **But :** montrer l'intégration d'un contenu institutionnel réel dans le site public.
- **Légende :** « Figure 4.9 — Présentation du processus de production MCF ».

### Figure 4.10 — Adaptation mobile et installation PWA

- **Route/état :** accueil ou catalogue en 390 × 844 px ; invitation d'installation lorsqu'elle est effectivement proposée par Chrome.
- **Composition :** vue mobile avec navigation à gauche ; invite PWA à droite si elle peut être reproduite.
- **But :** illustrer le responsive et le caractère installable de l'application web.
- **Légende :** « Figure 4.10 — Interface mobile et installation de la PWA ».
- **Limite à rappeler :** il ne s'agit pas d'une application mobile native et le mode hors ligne est incomplet.

## Séquence B — administration et suivi commercial

### Figure 4.11 — Connexion sécurisée à l'administration

- **Route/état :** `/admin/login`, champs vides.
- **Zone à montrer :** email, mot de passe, bouton de connexion et option Passkey/Face ID.
- **But :** introduire la séparation entre espace public et espace protégé.
- **Légende :** « Figure 4.11 — Écran d'authentification de l'espace Admin ».
- **Précaution :** ne pas faire apparaître un mot de passe ou un gestionnaire de mots de passe ouvert. La Passkey doit être présentée comme une implémentation à durcir avant production.

### Figure 4.12 — Tableau de bord commercial

- **Route/état :** `/admin/dashboard`, données de démonstration.
- **Zone à montrer :** indicateurs, demandes récentes, état du catalogue et actions rapides.
- **But :** expliquer la synthèse fournie à l'administrateur après authentification.
- **Légende :** « Figure 4.12 — Tableau de bord commercial G-ROD ».

### Figure 4.13 — Pipeline avec pagination par colonne

- **Route/état :** partie basse de `/admin/dashboard`.
- **Zone à montrer :** quatre statuts, compteur de chaque colonne, cartes prioritaires et contrôles de pagination lorsqu'une colonne contient beaucoup de demandes.
- **But :** répondre concrètement au besoin de lisibilité lorsque le volume augmente.
- **Légende :** « Figure 4.13 — Pipeline paginé des opportunités par statut ».

### Figure 4.14 — Gestion d'une demande et changement de statut

- **Route/état :** `/admin/demandes`, détail ouvert ou ligne complète.
- **Zone à montrer :** référence, client, produit, paramètres techniques, priorité, statut et actions PDF/traitement.
- **But :** établir la continuité entre la soumission publique et le traitement interne.
- **Légende :** « Figure 4.14 — Consultation et traitement d'une demande de devis ».
- **Précaution :** ne conserver que des identités fictives.

### Figure 4.15 — Clients et historique des demandes

- **Route/état :** `/admin/clients` et `/admin/clients/:clientKey`.
- **Composition :** tableau paginé des clients à gauche ; historique d'un client de démonstration à droite.
- **But :** présenter l'agrégation des demandes par client sans annoncer un CRM complet.
- **Légende :** « Figure 4.15 — Suivi des clients et consultation de leur historique ».

### Figure 4.16 — Administration des produits et ressources

- **Route/état :** `/admin/produits` et `/admin/ressources`.
- **Composition :** liste produit avec statut et aperçu 3D ; liste ou modale d'ajout d'une ressource avec type et produit associé.
- **But :** montrer que le contenu public est administrable et que les ressources peuvent être liées au catalogue.
- **Légende :** « Figure 4.16 — Gestion du catalogue et des ressources techniques ».
- **Précaution :** ne pas suggérer l'envoi de nouveaux modèles GLB depuis l'administration, car cette fonction n'existe pas.

### Figure 4.17 — Notifications, compte et sécurité

- **Route/état :** `/admin/notifications` et `/admin/account?tab=security` ou `preferences`.
- **Composition :** écran des notifications à gauche ; onglet de sécurité ou préférences à droite.
- **But :** illustrer la persistance des notifications internes et les paramètres réels du compte.
- **Légende :** « Figure 4.17 — Notifications internes et paramètres du compte Admin ».
- **Limite :** ne pas laisser entendre que les notifications email ou SMS sont actives si SMTP/Twilio n'est pas configuré.

## Séquence C — validation technique

### Figure 4.18 — Résultats des tests automatisés

Cette figure est facultative dans le corps du chapitre si la limite de pages est atteinte ; elle peut être placée en annexe et citée dans la section 4.6.

- **Composition :** quatre recadrages lisibles : `44/44` backend, ESLint réussi, build Vite réussi, Playwright `37/38`.
- **But :** apporter une preuve visuelle cohérente avec le tableau de validation.
- **Légende :** « Figure 4.18 — Synthèse des contrôles automatisés exécutés le 13 septembre 2026 ».
- **Précaution :** le test Playwright en échec doit rester visible ou être explicitement mentionné dans la légende. Il ne faut pas afficher « tous les tests passent ».

## Captures à réserver aux annexes

Les écrans suivants sont utiles comme preuves complémentaires mais alourdiraient le chapitre 4 s'ils étaient tous intégrés au fil du texte :

- filtres et pagination détaillés des demandes de documents ;
- modale complète d'ajout d'une ressource ;
- modification de l'image et des caractéristiques d'un produit ;
- panneau de recherche rapide avec produits et documents publics ;
- thème clair et sombre comparés sur plusieurs pages ;
- drawer de navigation Admin sur mobile ;
- état de secours de la visualisation 3D ;
- détails complets d'une notification ;
- sorties terminal complètes des quatre campagnes de vérification.

## Répartition estimée dans le chapitre 4

| Sous-section | Figures | Volume estimé texte + figures |
|---|---:|---:|
| 4.1 Réalisation de l'interface publique | 4.1 à 4.5 | 5 pages |
| 4.2 Parcours de demande | 4.6 à 4.8 | 3 pages |
| 4.3 Contenu institutionnel et responsive | 4.9 à 4.10 | 2 pages |
| 4.4 Administration et pilotage | 4.11 à 4.14 | 5 pages |
| 4.5 Gestion des données métier | 4.15 à 4.17 | 3 pages |
| 4.6 Tests, validation, limites | 4.18 ou renvoi annexe | 3 pages |
| **Total chapitre 4** | **17 figures principales + 1 facultative** | **21 pages** |

