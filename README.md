# G-ROD Platform

La procédure complète de production est documentée dans [`deploy/README.md`](deploy/README.md).

## Configuration backend

Les secrets ne sont pas versionnes. Avant de lancer le backend, definir au minimum :

- `JWT_SECRET` : secret aleatoire d'au moins 32 caracteres ;
- `FRONTEND_URL` : origine frontend autorisee (par defaut `http://localhost:5173`).

Le bootstrap d'un premier administrateur est optionnel et ne s'execute que si les deux variables suivantes sont presentes et si l'adresse n'existe pas deja :

- `ADMIN_EMAIL` ;
- `ADMIN_INITIAL_PASSWORD`.

Variables optionnelles : `ADMIN_NAME`, `JWT_EXPIRATION_MS`, `UPLOAD_DIR`, `SHOW_SQL` et `SWAGGER_ENABLED`.
Swagger et les logs SQL sont desactives par defaut. Ils peuvent etre actives explicitement dans un environnement de developpement.

Exemple PowerShell local (utiliser vos propres valeurs, jamais celles de production) :

```powershell
$env:JWT_SECRET="<secret-local-aleatoire-de-32-caracteres-minimum>"
$env:ADMIN_EMAIL="<email-admin-local>"
$env:ADMIN_INITIAL_PASSWORD="<mot-de-passe-initial-fort>"
cd grod-platform-backend
.\mvnw.cmd spring-boot:run
```

Le frontend se lance depuis `grod-platform-frontend` avec `npm run dev`.
Pour un deploiement staging ou production, definir `VITE_API_URL` au moment du build avec l'URL publique de l'API, suffixe `/api` inclus.
# Notifications Email / SMS

Les notifications externes sont désactivées par défaut. Une demande métier est toujours enregistrée,
même si SMTP ou Twilio est absent ou indisponible. Les destinataires configurés depuis
`Mon compte > Préférences` sont persistés côté backend et prioritaires sur les valeurs initiales
fournies par l'environnement.

Variables SMTP :

- `EMAIL_NOTIFICATIONS_ENABLED`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `SMTP_STARTTLS_ENABLED`
- `SMTP_SSL_ENABLED`

Variables SMS/Twilio :

- `SMS_NOTIFICATIONS_ENABLED`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Destinataires initiaux (utilisés tant qu'aucune préférence Admin n'est persistée) :

- `ADMIN_NOTIFICATION_EMAIL`
- `ADMIN_NOTIFICATION_PHONE`

# Cycle de vie des uploads

Les nouveaux plans de devis sont d'abord stockés dans `uploads/temp/quotes`, puis promus dans
`uploads/quotes` lors de la création réussie du devis. Le nettoyage automatique ne cible que le
répertoire temporaire. Les anciens fichiers définitifs ne sont jamais supprimés par ce nettoyage.

- `UPLOAD_DIR`
- `UPLOAD_TEMP_RETENTION_HOURS` (24 heures par défaut)
- `UPLOAD_CLEANUP_ENABLED` (`true` par défaut, à désactiver si nécessaire en test/dev)
- `UPLOAD_CLEANUP_INTERVAL_MS` (6 heures par défaut)

`ManagedFileAuditService.audit()` fournit un audit interne en lecture seule des fichiers définitifs
potentiellement orphelins. Il ne supprime aucun fichier.

# Tests E2E

La suite Playwright démarre automatiquement un backend avec H2 en mémoire, un frontend Vite et un
dossier `uploads-e2e` isolé. Email, SMS, Swagger et nettoyage planifié sont désactivés. Aucun accès à
la base MySQL métier n'est effectué.

Depuis `grod-platform-frontend` :

- `npm run test:e2e` : exécution headless Chromium ;
- `npm run test:e2e:ui` : interface Playwright de diagnostic ;
- `npx playwright install chromium` : installation initiale du navigateur sur une nouvelle machine.

Les captures et traces sont produites uniquement en cas d'échec dans `test-results`.
