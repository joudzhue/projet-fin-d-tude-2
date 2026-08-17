#!/usr/bin/env bash
set -Eeuo pipefail

started_at_epoch=$(date +%s)
timestamp=$(date -u +%Y-%m-%d_%H%M%S)

log() { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
fail() { log "ERREUR: $*" >&2; exit 1; }
require_command() { command -v "$1" >/dev/null 2>&1 || fail "Commande requise absente: $1"; }

: "${BACKUP_DIR:?BACKUP_DIR doit être défini}"
: "${UPLOAD_DIR:?UPLOAD_DIR doit être défini}"
: "${DATABASE_HOST:?DATABASE_HOST doit être défini}"
: "${DATABASE_NAME:?DATABASE_NAME doit être défini}"
: "${DATABASE_USERNAME:?DATABASE_USERNAME doit être défini}"
: "${DATABASE_PASSWORD:?DATABASE_PASSWORD doit être défini}"

DATABASE_PORT=${DATABASE_PORT:-3306}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}
MYSQLDUMP_BIN=${MYSQLDUMP_BIN:-mysqldump}

[[ "$BACKUP_DIR" = /* ]] || fail "BACKUP_DIR doit être un chemin absolu"
[[ "$UPLOAD_DIR" = /* ]] || fail "UPLOAD_DIR doit être un chemin absolu"
[[ "$BACKUP_DIR" != "/" && "$UPLOAD_DIR" != "/" ]] || fail "Un répertoire racine n'est jamais accepté"
[[ "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ ]] || fail "BACKUP_RETENTION_DAYS doit être un entier positif"

require_command "$MYSQLDUMP_BIN"
require_command gzip
require_command tar
require_command sha256sum

mkdir -p -- "$BACKUP_DIR"
[[ -d "$UPLOAD_DIR" ]] || fail "UPLOAD_DIR introuvable: $UPLOAD_DIR"

final_dir="$BACKUP_DIR/backup-$timestamp"
work_dir="$BACKUP_DIR/.grod-backup-$timestamp.incomplete"
[[ ! -e "$final_dir" && ! -e "$work_dir" ]] || fail "Le jeu de sauvegarde existe déjà"
mkdir -p -- "$work_dir/uploads-stage"
trap 'status=$?; if (( status != 0 )); then log "Échec: jeu incomplet conservé dans $work_dir" >&2; fi' EXIT

log "Démarrage de la sauvegarde G-ROD: $timestamp"
log "Dump MySQL cohérent de ${DATABASE_NAME} sur ${DATABASE_HOST}:${DATABASE_PORT}"
MYSQL_PWD="$DATABASE_PASSWORD" "$MYSQLDUMP_BIN" \
  --host="$DATABASE_HOST" \
  --port="$DATABASE_PORT" \
  --user="$DATABASE_USERNAME" \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  --set-gtid-purged=OFF \
  --no-tablespaces \
  "$DATABASE_NAME" | gzip -9 > "$work_dir/database.sql.gz"
[[ -s "$work_dir/database.sql.gz" ]] || fail "Le dump MySQL est vide"

log "Copie des uploads métier (products, quotes, documents)"
for category in products quotes documents; do
  mkdir -p -- "$work_dir/uploads-stage/$category"
  if [[ -d "$UPLOAD_DIR/$category" ]]; then
    cp -a -- "$UPLOAD_DIR/$category/." "$work_dir/uploads-stage/$category/"
  fi
done
tar -C "$work_dir/uploads-stage" -czf "$work_dir/uploads.tar.gz" products quotes documents
rm -r -- "$work_dir/uploads-stage"

(
  cd "$work_dir"
  sha256sum database.sql.gz uploads.tar.gz > SHA256SUMS
)

git_version=$(git describe --always --dirty 2>/dev/null || printf 'inconnu')
database_size=$(wc -c < "$work_dir/database.sql.gz" | tr -d '[:space:]')
uploads_size=$(wc -c < "$work_dir/uploads.tar.gz" | tr -d '[:space:]')
cat > "$work_dir/manifest.txt" <<EOF
status=complete
created_at_utc=$timestamp
environment=${APP_ENVIRONMENT:-production}
git_version=$git_version
database_name=$DATABASE_NAME
database_file=database.sql.gz
database_size_bytes=$database_size
uploads_file=uploads.tar.gz
uploads_size_bytes=$uploads_size
uploads_included=products,quotes,documents
uploads_excluded=temp/quotes
checksum_file=SHA256SUMS
EOF

mv -- "$work_dir" "$final_dir"
work_dir="$final_dir"

if (( BACKUP_RETENTION_DAYS > 0 )); then
  log "Nettoyage des jeux G-ROD complets de plus de $BACKUP_RETENTION_DAYS jours"
  while IFS= read -r -d '' candidate; do
    [[ -f "$candidate/manifest.txt" ]] || continue
    grep -qx 'status=complete' "$candidate/manifest.txt" || continue
    rm -r -- "$candidate"
  done < <(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name 'backup-????-??-??_??????' -mtime "+$BACKUP_RETENTION_DAYS" -print0)
fi

duration=$(($(date +%s) - started_at_epoch))
log "Succès: $final_dir"
log "Dump: ${database_size} octets; uploads: ${uploads_size} octets; durée: ${duration}s"
exit 0
