#!/usr/bin/env bash
set -Eeuo pipefail

command -v docker >/dev/null 2>&1 || { echo 'Docker est requis.' >&2; exit 2; }
root_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
jar_file=$(find "$root_dir/grod-platform-backend/target" -maxdepth 1 -type f -name 'grod-platform-backend-*.jar' ! -name '*.original' | head -n 1)
[[ -f "$jar_file" ]] || { echo 'Construire le JAR avec .\mvnw.cmd package avant ce test.' >&2; exit 2; }

mysql_container="grod-flyway-mysql-$$"
app_container="grod-flyway-app-$$"
mysql_password='flyway-test-secret'
backend_pid=''
backend_log=''
cleanup() {
  if [[ -n "$backend_pid" ]]; then kill "$backend_pid" >/dev/null 2>&1 || true; wait "$backend_pid" >/dev/null 2>&1 || true; fi
  docker rm -f "$mysql_container" >/dev/null 2>&1 || true
  [[ -n "$backend_log" ]] && rm -f -- "$backend_log"
}
trap cleanup EXIT

root_mount=$root_dir
jar_mount=$jar_file
upload_dir="$root_dir/grod-platform-backend/target/flyway-test-uploads"
if command -v cygpath >/dev/null 2>&1; then
  root_mount=$(cygpath -w "$root_dir")
  jar_mount=$(cygpath -w "$jar_file")
  upload_dir=$(cygpath -w "$upload_dir")
  export MSYS_NO_PATHCONV=1
fi

docker run -d --name "$mysql_container" -p 127.0.0.1::3306 -e MYSQL_ROOT_PASSWORD="$mysql_password" mysql:8.4 >/dev/null
for _ in $(seq 1 60); do
  docker exec -e MYSQL_PWD="$mysql_password" "$mysql_container" mysql -uroot -N -e 'SELECT 1' >/dev/null 2>&1 && break
  sleep 2
done
docker exec -e MYSQL_PWD="$mysql_password" "$mysql_container" mysql -uroot -N -e 'SELECT 1' >/dev/null
docker exec -e MYSQL_PWD="$mysql_password" "$mysql_container" mysql -uroot -e '
  CREATE DATABASE grod_empty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE grod_existing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
mysql_port=$(docker port "$mysql_container" 3306/tcp | sed 's/.*://')
[[ "$mysql_port" =~ ^[0-9]+$ ]] || { echo 'Port MySQL temporaire introuvable.' >&2; exit 1; }

start_backend() {
  local database=$1 baseline=$2
  if [[ -n "$backend_pid" ]]; then kill "$backend_pid" >/dev/null 2>&1 || true; wait "$backend_pid" >/dev/null 2>&1 || true; fi
  backend_log=$(mktemp)
  SPRING_PROFILES_ACTIVE=prod \
  SPRING_DATASOURCE_URL="jdbc:mysql://127.0.0.1:$mysql_port/$database?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
  DATABASE_HOST=127.0.0.1 DATABASE_PORT="$mysql_port" DATABASE_NAME="$database" \
  DATABASE_USERNAME=root DATABASE_PASSWORD="$mysql_password" \
  FLYWAY_BASELINE_ON_MIGRATE="$baseline" \
  JWT_SECRET=flyway-test-jwt-secret-with-at-least-32-characters \
  FRONTEND_URL=http://localhost WEBAUTHN_RP_ID=localhost WEBAUTHN_ORIGINS=http://localhost \
  UPLOAD_DIR="$upload_dir" UPLOAD_CLEANUP_ENABLED=false \
  SERVER_PORT=0 java -jar "$jar_mount" >"$backend_log" 2>&1 &
  backend_pid=$!
  for _ in $(seq 1 90); do
    if grep -q 'Started GrodPlatformBackendApplication' "$backend_log"; then return 0; fi
    if ! kill -0 "$backend_pid" >/dev/null 2>&1; then
      cat "$backend_log" >&2
      return 1
    fi
    sleep 2
  done
  cat "$backend_log" >&2
  return 1
}

sql() {
  local database=$1 statement=$2
  docker exec -e MYSQL_PWD="$mysql_password" "$mysql_container" mysql -N -uroot "$database" -e "$statement"
}

echo 'Cas A: base vide, V1 puis second démarrage'
start_backend grod_empty false
[[ "$(sql grod_empty "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='grod_empty' AND table_name IN ('utilisateurs','admin_passkey_credentials','app_settings','produits','clients','demandes_devis','demandes_documents','documents_techniques','notifications','notification_lectures','flyway_schema_history');")" = 11 ]]
[[ "$(sql grod_empty 'SELECT COUNT(*) FROM flyway_schema_history WHERE version=1 AND success=1;')" = 1 ]]
start_backend grod_empty false
[[ "$(sql grod_empty 'SELECT COUNT(*) FROM flyway_schema_history WHERE version=1 AND success=1;')" = 1 ]]

echo 'Cas B: schéma historique avec données, baseline contrôlée'
sed 's/${textLobType}/TINYTEXT/g' "$root_dir/grod-platform-backend/src/main/resources/db/migration/V1__baseline_schema.sql" |
  docker exec -i -e MYSQL_PWD="$mysql_password" "$mysql_container" mysql -uroot grod_existing
docker exec -i -e MYSQL_PWD="$mysql_password" "$mysql_container" mysql -uroot grod_existing <<'SQL'
INSERT INTO utilisateurs (id,nom_complet,email,mot_de_passe,role,actif) VALUES (9001,'Admin historique','historic-admin@test.invalid','hash','ADMIN',true);
INSERT INTO produits (id,nom,actif) VALUES (9001,'Produit historique',false);
INSERT INTO clients (id,nom,societe,email,telephone,actif) VALUES (9001,'Client','Société','historic-client@test.invalid','000',true);
INSERT INTO demandes_devis (id,reference_demande,societe,nom_contact,email,telephone,produit_demande,client_id,quantite,client_fidele,statut) VALUES (9001,'DEV-HIST','Société','Client','historic-client@test.invalid','000','Produit historique',9001,1,false,'NOUVELLE');
INSERT INTO demandes_documents (id,reference_demande,societe,nom_contact,email,telephone,type_document,titre_document,statut) VALUES (9001,'DOC-HIST','Société','Client','historic-client@test.invalid','000','FICHE','Fiche historique','NOUVELLE');
INSERT INTO documents_techniques (id,titre,type_document,fichier_url,fichier_nom,actif,telechargement_public) VALUES (9001,'Ressource historique','PDF','/uploads/documents/historic.pdf','historic.pdf',true,false);
INSERT INTO notifications (id,type,titre,message,reference_type,reference_id,date_creation) VALUES (9001,'NOUVELLE_DEMANDE_DEVIS','Historique','Notification historique','DEVIS',9001,NOW());
INSERT INTO notification_lectures (id,notification_id,utilisateur_id,date_lecture) VALUES (9001,9001,9001,NOW());
SQL
start_backend grod_existing true
[[ "$(sql grod_existing "SELECT COUNT(*) FROM flyway_schema_history WHERE type='BASELINE' AND version=1 AND success=1;")" = 1 ]]
[[ "$(sql grod_existing 'SELECT (SELECT COUNT(*) FROM utilisateurs WHERE id=9001)+(SELECT COUNT(*) FROM produits WHERE id=9001 AND actif=false)+(SELECT COUNT(*) FROM clients WHERE id=9001)+(SELECT COUNT(*) FROM demandes_devis WHERE id=9001)+(SELECT COUNT(*) FROM demandes_documents WHERE id=9001)+(SELECT COUNT(*) FROM documents_techniques WHERE id=9001)+(SELECT COUNT(*) FROM notifications WHERE id=9001)+(SELECT COUNT(*) FROM notification_lectures WHERE id=9001);')" = 8 ]]
start_backend grod_existing false
[[ "$(sql grod_existing 'SELECT COUNT(*) FROM flyway_schema_history WHERE version=1 AND success=1;')" = 1 ]]

echo 'Flyway MySQL 8.4: base vide, baseline existante, validate, historique et idempotence: OK'
