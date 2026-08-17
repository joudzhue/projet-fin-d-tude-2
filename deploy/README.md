# Déploiement production G-ROD

La procédure complémentaire de sauvegarde/restauration MySQL et uploads se trouve dans [`backup/README.md`](backup/README.md).

La gestion versionnée du schéma et l'adoption contrôlée d'une base historique sont documentées dans [`flyway/README.md`](flyway/README.md).

## Architecture retenue

```text
Internet → HTTPS Nginx → React statique
                      └→ /api/* → Spring Boot sur 127.0.0.1:8080
                                      ├→ MySQL
                                      └→ UPLOAD_DIR hors webroot
```

Le frontend utilise `VITE_API_URL=/api`. Nginx ne sert jamais directement `UPLOAD_DIR` : seules les
images produits publiques sont relayées par `/uploads/products/`; PDF techniques et plans de devis
passent par leurs endpoints API contrôlés.

## Prérequis et modèles

Prévoir Linux, Java 21, Nginx, MySQL, Node.js/npm pour le build, un domaine et un certificat TLS.

Le backend applique un rate limiting local par IP sur les endpoints publics sensibles. En production,
`RATE_LIMIT_TRUST_PROXY_HEADERS=true` ne doit être utilisé que lorsque le backend reste lié à
`127.0.0.1` derrière le Nginx contrôlé fourni. Nginx remplace alors les en-têtes d'IP transmis au backend.
La protection est volontairement applicative et n'est pas dupliquée dans Nginx. En cas de passage à
plusieurs instances, utiliser une limite partagée (Redis/API Gateway) ou une politique Nginx globale.
Créer un utilisateur système `grod` et un fichier d'environnement protégé, par exemple
`/etc/grod/grod.env` en mode `0600`.

- Nginx : `nginx/grod.conf.example` ;
- systemd : `systemd/grod-backend.service.example` ;
- variables : `../.env.production.example`.

## Variables

Copier `.env.production.example` hors du dépôt. Renseigner au minimum :

- `SPRING_PROFILES_ACTIVE=prod` ;
- `FRONTEND_URL=https://<domaine>` ;
- `WEBAUTHN_RP_ID=<domaine-sans-schéma-ni-port>` ;
- `WEBAUTHN_ORIGINS=https://<domaine>` ;
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` ;
- `JWT_SECRET`, avec au moins 32 caractères aléatoires ;
- `UPLOAD_DIR`, chemin absolu hors du répertoire public.

`VITE_API_URL=/api` est injectée au build frontend. SMTP, SMS/Twilio, notifications et assistant sont
optionnels. Aucun secret ni compte MySQL root ne doit être versionné.

## Build et installation

```bash
cd grod-platform-backend
./mvnw test
./mvnw clean package -DskipTests

cd ../grod-platform-frontend
npm ci
VITE_API_URL=/api npm run build
npm run lint
npm run test:e2e
npm run test:responsive
```

Sous Windows, utiliser `.\mvnw.cmd`. Copier le JAR dans `/opt/grod/backend/` et le contenu de `dist/`
dans `/var/www/grod`, ou adapter les chemins des modèles.

## Backend et systemd

Le profil `prod` lie Spring à `127.0.0.1` par défaut, respecte `X-Forwarded-*`, désactive Swagger et
les logs SQL par défaut et n'expose pas de stacktrace HTTP. Adapter puis installer le modèle systemd :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now grod-backend
sudo systemctl status grod-backend
```

Le fichier d'environnement ne doit pas être inclus dans l'unité ni lisible par des utilisateurs non
autorisés.

## Nginx et HTTPS

Remplacer `example.com`, les chemins TLS et les chemins d'installation dans le modèle. Valider avant
rechargement :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Le modèle conserve `Authorization`, compresse JS/CSS/JSON/SVG, met en cache les assets Vite hashés,
évite le cache agressif d'`index.html` et utilise le fallback React Router. Sa limite d'upload est
16 Mo, légèrement supérieure aux 15 Mo de Spring. Les erreurs `/api/` restent gérées par Spring.

HSTS ne doit être activé qu'après validation complète de HTTPS. Aucune CSP n'est imposée : elle
nécessite un audit séparé des images externes, de Three.js et des services tiers.

## Admin initial

Au premier démarrage seulement, définir `ADMIN_EMAIL` et `ADMIN_INITIAL_PASSWORD`. Le compte est créé
uniquement si l'adresse n'existe pas et son mot de passe n'est jamais réinitialisé au redémarrage.
Après connexion et changement du mot de passe, retirer `ADMIN_INITIAL_PASSWORD` puis redémarrer.

## Passkey / WebAuthn

Hors localhost, Passkey exige HTTPS. `WEBAUTHN_RP_ID` contient le domaine sans schéma ni port et
`WEBAUTHN_ORIGINS` l'origine HTTPS exacte ; plusieurs origines sont séparées par des virgules. Le
backend valide l'origine du `clientDataJSON` et le hash du RP ID authentificateur.

Les challenges sont en mémoire : conserver une seule instance backend tant qu'aucun stockage partagé
n'est prévu.

## Checklist post-déploiement

- [ ] HTTP redirigé vers HTTPS et certificat valide ;
- [ ] aucune ressource en mixed content ;
- [ ] routes React rechargeables directement ;
- [ ] API publique et login/logout Admin fonctionnels ;
- [ ] aucune erreur CORS ;
- [ ] devis, upload de plan et notification fonctionnels ;
- [ ] téléchargement authentifié du plan de devis ;
- [ ] ressources privée et publique téléchargeables ;
- [ ] changement du mot de passe et Passkey sur le domaine final ;
- [ ] rendu mobile contrôlé ;
- [ ] Swagger inaccessible lorsque désactivé ;
- [ ] `/uploads/quotes/` et `/uploads/documents/` inaccessibles directement.
