#!/usr/bin/env bash
set -Eeuo pipefail

log() { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
fail() { log "ERREUR: $*" >&2; exit 1; }
usage() { printf 'Usage: %s --backup /chemin/backup-AAAA-MM-JJ_HHMMSS --confirm\n' "$0"; }

backup_set=''
confirmed=false
while (( $# > 0 )); do
  case "$1" in
    --backup) [[ $# -ge 2 ]] || fail "Valeur manquante pour --backup"; backup_set=$2; shift 2 ;;
    --confirm) confirmed=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage; fail "Argument inconnu: $1" ;;
  esac
done

[[ "$confirmed" == true ]] || fail "Restauration refusée sans --confirm"
[[ -n "$backup_set" && "$backup_set" = /* && "$backup_set" != "/" ]] || fail "Chemin absolu de backup requis"
: "${UPLOAD_DIR:?UPLOAD_DIR doit être défini}"
: "${DATABASE_HOST:?DATABASE_HOST doit être défini}"
: "${DATABASE_NAME:?DATABASE_NAME doit être défini}"
: "${DATABASE_USERNAME:?DATABASE_USERNAME doit être défini}"
: "${DATABASE_PASSWORD:?DATABASE_PASSWORD doit être défini}"
DATABASE_PORT=${DATABASE_PORT:-3306}
MYSQL_BIN=${MYSQL_BIN:-mysql}

[[ "$UPLOAD_DIR" = /* && "$UPLOAD_DIR" != "/" ]] || fail "UPLOAD_DIR doit être un chemin absolu non racine"
[[ -d "$backup_set" ]] || fail "Jeu de sauvegarde introuvable: $backup_set"
for file in manifest.txt SHA256SUMS database.sql.gz uploads.tar.gz; do
  [[ -f "$backup_set/$file" ]] || fail "Fichier requis absent: $file"
done
grep -qx 'status=complete' "$backup_set/manifest.txt" || fail "Le manifeste ne déclare pas un backup complet"
command -v "$MYSQL_BIN" >/dev/null 2>&1 || fail "Commande MySQL absente: $MYSQL_BIN"
command -v gzip >/dev/null 2>&1 || fail "gzip absent"
command -v tar >/dev/null 2>&1 || fail "tar absent"
command -v sha256sum >/dev/null 2>&1 || fail "sha256sum absent"

log "Vérification SHA-256"
(cd "$backup_set" && sha256sum --check --strict SHA256SUMS) || fail "Checksum invalide"

log "Contrôle des chemins de l'archive"
if tar -tzf "$backup_set/uploads.tar.gz" | awk '
  /^\// { bad=1 }
  { n=split($0,p,"/"); for(i=1;i<=n;i++) if(p[i]=="..") bad=1 }
  !/^(products|quotes|documents)(\/|$)/ { bad=1 }
  END { exit bad ? 1 : 0 }
'; then :; else fail "Archive uploads non sûre ou structure inattendue"; fi

restore_parent=$(dirname "$UPLOAD_DIR")
mkdir -p -- "$restore_parent"
temp_dir=$(mktemp -d "$restore_parent/.grod-restore.XXXXXX")
rollback_dir="$restore_parent/grod-uploads-before-restore-$(date -u +%Y-%m-%d_%H%M%S)"
trap 'status=$?; if (( status != 0 )); then log "Échec; fichiers temporaires conservés dans $temp_dir" >&2; fi' EXIT
tar -xzf "$backup_set/uploads.tar.gz" -C "$temp_dir"
for category in products quotes documents; do [[ -d "$temp_dir/$category" ]] || fail "Dossier $category absent de l'archive"; done

log "Import explicite de la base $DATABASE_NAME"
gzip -dc "$backup_set/database.sql.gz" | MYSQL_PWD="$DATABASE_PASSWORD" "$MYSQL_BIN" \
  --host="$DATABASE_HOST" --port="$DATABASE_PORT" --user="$DATABASE_USERNAME" \
  --default-character-set=utf8mb4 "$DATABASE_NAME"

log "Remplacement contrôlé des uploads"
mkdir -p -- "$UPLOAD_DIR" "$rollback_dir"
for category in products quotes documents; do
  if [[ -e "$UPLOAD_DIR/$category" ]]; then mv -- "$UPLOAD_DIR/$category" "$rollback_dir/$category"; fi
  mv -- "$temp_dir/$category" "$UPLOAD_DIR/$category"
done
rmdir -- "$temp_dir"
log "Restauration réussie. Ancien état des uploads conservé dans: $rollback_dir"
exit 0
