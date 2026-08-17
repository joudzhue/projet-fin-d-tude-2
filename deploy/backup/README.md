# Sauvegarde et restauration G-ROD

Cette procédure cible Linux et MySQL 8.4. Un jeu complet contient `database.sql.gz`, `uploads.tar.gz`, `SHA256SUMS` et `manifest.txt` dans un dossier `backup-AAAA-MM-JJ_HHMMSS`.

Un dossier reste caché et suffixé `.incomplete` si une étape échoue. Il n'est jamais présenté comme valide. Pour une cohérence stricte entre SQL et fichiers, arrêter temporairement le backend ou le placer en maintenance pendant le backup.

## Périmètre

- Toutes les tables, triggers, routines et événements de `DATABASE_NAME`.
- `UPLOAD_DIR/products`, `UPLOAD_DIR/quotes` et `UPLOAD_DIR/documents`.
- `UPLOAD_DIR/temp/quotes` est exclu : ses fichiers sont temporaires et expirables.
- Builds, logs et caches sont exclus.
- Le frontend et ses assets sont reconstruits depuis le tag Git du manifeste.
- Les secrets ne sont jamais archivés.

Le dump utilise UTF-8 (`utf8mb4`), `--single-transaction` et `--quick`. Pour InnoDB, cela donne une vue cohérente sans verrouillage global lourd. `--routines`, `--triggers` et `--events` préservent les objets associés. D'éventuelles tables non transactionnelles exigent une maintenance stricte.

## Prérequis et credentials

Installer des clients compatibles MySQL 8.4 (`mysql`, `mysqldump`), plus `bash`, `gzip`, `tar` et `sha256sum`.

Après copie sur le serveur, rendre les scripts exécutables :

```bash
chmod 0750 deploy/backup/backup-grod.sh deploy/backup/restore-grod.sh deploy/backup/test-backup-restore.sh
```

Variables obligatoires : `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `UPLOAD_DIR`, `BACKUP_DIR`. Variables facultatives : `DATABASE_PORT=3306`, `BACKUP_RETENTION_DAYS=14`, `APP_ENVIRONMENT=production`.

Les credentials viennent de l'environnement ou d'un fichier hors dépôt protégé :

```bash
sudo install -o root -g grod -m 0640 deploy/backup/backup.env.example /etc/grod/backup.env
```

Ne jamais placer de mot de passe dans une commande, le timer ou le dépôt. Les scripts le transmettent aux outils MySQL par leur environnement et ne l'affichent pas.

## Créer un backup

```bash
sudo -u grod bash -c 'set -a; source /etc/grod/grod.env; source /etc/grod/backup.env; set +a; /opt/grod/current/deploy/backup/backup-grod.sh'
```

Le script journalise début, succès/échec, destination, tailles et durée. Le code de sortie vaut `0` uniquement pour un jeu complet. Les deux archives possèdent un SHA-256.

La rétention supprime uniquement les dossiers `backup-AAAA-MM-JJ_HHMMSS` directement situés dans `BACKUP_DIR`, plus anciens que la durée configurée et déclarés complets dans leur manifeste. La valeur `0` désactive le nettoyage.

## Automatisation quotidienne

Adapter les chemins des modèles puis :

```bash
sudo install -m 0644 deploy/backup/grod-backup.service.example /etc/systemd/system/grod-backup.service
sudo install -m 0644 deploy/backup/grod-backup.timer.example /etc/systemd/system/grod-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now grod-backup.timer
systemctl list-timers grod-backup.timer
```

Le modèle lance un backup quotidien vers 02:30 avec un léger délai aléatoire. Ajuster la fréquence au volume et au RPO attendu.

## Restaurer

Avant restauration : arrêter le backend ou activer une maintenance, vérifier le jeu, les versions, l'espace disque et les permissions, sauvegarder l'état actuel si possible, puis confirmer que la base cible est la bonne.

La restauration est refusée sans `--confirm` :

```bash
sudo systemctl stop grod-backend
sudo -u grod bash -c 'set -a; source /etc/grod/grod.env; set +a; /opt/grod/current/deploy/backup/restore-grod.sh --backup /var/backups/grod/backup-2026-08-14_230000 --confirm'
sudo systemctl start grod-backend
```

Le script vérifie manifeste, SHA-256 et chemins de l'archive. Il refuse les chemins absolus, `..` et tout dossier autre que `products`, `quotes` ou `documents`. L'extraction se fait dans un dossier temporaire. L'ancien état des uploads est déplacé vers `grod-uploads-before-restore-*` pour permettre un retour manuel.

L'import SQL précède le basculement des fichiers. En cas d'échec partiel, ne pas démarrer le backend : examiner les logs, restaurer l'état précédent et recommencer avec un jeu validé.

Après restauration, contrôler : login Admin, clients, produits, devis, relations, statuts, notifications, demandes de documents, images, plans, PDF publics/privés et logs Spring.

## Recette isolée MySQL 8.4

Le test Docker crée une base représentative (Admin, client, produit, devis, notification, document) et trois fichiers. Il sauvegarde, détruit cet état isolé, restaure puis vérifie données, relations, checksums, fichiers et exclusion des temporaires :

```bash
./deploy/backup/test-backup-restore.sh
```

Il utilise seulement un conteneur temporaire `grod-backup-test-*` et un dossier `mktemp`. Ne jamais pointer ce test vers la base métier.

## Sécurité et continuité

Stocker les backups hors racine web, avec permissions minimales et idéalement sur un volume chiffré. Une copie sur le même disque ne protège pas d'une perte serveur : prévoir séparément une copie hors serveur et tester régulièrement sa restauration.

Avant un déploiement risqué, lancer un backup manuel, vérifier `SHA256SUMS`, noter son chemin et conserver l'ancien artefact applicatif. Ce mécanisme n'est pas un déploiement blue/green.
