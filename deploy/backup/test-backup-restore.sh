#!/usr/bin/env bash
set -Eeuo pipefail

command -v docker >/dev/null 2>&1 || { echo 'Docker est requis pour cette recette isolée.' >&2; exit 2; }
root_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
container="grod-backup-test-$$"
test_root=$(mktemp -d)
root_mount=$root_dir
test_mount=$test_root
if command -v cygpath >/dev/null 2>&1; then
  root_mount=$(cygpath -w "$root_dir")
  test_mount=$(cygpath -w "$test_root")
  export MSYS_NO_PATHCONV=1
fi
trap 'docker rm -f "$container" >/dev/null 2>&1 || true; rm -r -- "$test_root"' EXIT
mkdir -p "$test_root/uploads/products" "$test_root/uploads/quotes" "$test_root/uploads/documents" "$test_root/uploads/temp/quotes" "$test_root/backups"
printf 'image' > "$test_root/uploads/products/product.jpg"
printf 'plan' > "$test_root/uploads/quotes/quote.pdf"
printf 'technique' > "$test_root/uploads/documents/technical.pdf"
printf 'temporary' > "$test_root/uploads/temp/quotes/expired.tmp"

docker run -d --name "$container" -e MYSQL_ROOT_PASSWORD=test-secret -e MYSQL_DATABASE=grod_restore_test mysql:8.4 >/dev/null
for _ in $(seq 1 60); do
  if docker exec -e MYSQL_PWD=test-secret "$container" mysql -uroot -N -e 'SELECT 1' >/dev/null 2>&1; then break; fi
  sleep 2
done
docker exec -e MYSQL_PWD=test-secret "$container" mysql -uroot -N -e 'SELECT 1' >/dev/null

docker exec -i -e MYSQL_PWD=test-secret "$container" mysql -uroot grod_restore_test <<'SQL'
CREATE TABLE admin_user (id BIGINT PRIMARY KEY, email VARCHAR(255));
CREATE TABLE client (id BIGINT PRIMARY KEY, email VARCHAR(255));
CREATE TABLE produit (id BIGINT PRIMARY KEY, nom VARCHAR(255));
CREATE TABLE demande_devis (id BIGINT PRIMARY KEY, client_id BIGINT, produit_id BIGINT,
  CONSTRAINT fk_devis_client FOREIGN KEY (client_id) REFERENCES client(id),
  CONSTRAINT fk_devis_produit FOREIGN KEY (produit_id) REFERENCES produit(id));
CREATE TABLE notification (id BIGINT PRIMARY KEY, demande_id BIGINT,
  CONSTRAINT fk_notification_devis FOREIGN KEY (demande_id) REFERENCES demande_devis(id));
CREATE TABLE document_technique (id BIGINT PRIMARY KEY, produit_id BIGINT,
  CONSTRAINT fk_document_produit FOREIGN KEY (produit_id) REFERENCES produit(id));
INSERT INTO admin_user VALUES (1,'admin@test.invalid');
INSERT INTO client VALUES (1,'client@test.invalid');
INSERT INTO produit VALUES (1,'Copper Rod');
INSERT INTO demande_devis VALUES (1,1,1);
INSERT INTO notification VALUES (1,1);
INSERT INTO document_technique VALUES (1,1);
SQL

common=(-e DATABASE_HOST=127.0.0.1 -e DATABASE_PORT=3306 -e DATABASE_NAME=grod_restore_test -e DATABASE_USERNAME=root -e DATABASE_PASSWORD=test-secret -e UPLOAD_DIR=/test/uploads -v "$test_mount:/test" -v "$root_mount:/project:ro" --network "container:$container")
docker run --rm "${common[@]}" -e BACKUP_DIR=/test/backups -e BACKUP_RETENTION_DAYS=14 --entrypoint bash mysql:8.4 /project/deploy/backup/backup-grod.sh
backup_set=$(find "$test_root/backups" -mindepth 1 -maxdepth 1 -type d -name 'backup-*' | head -n 1)
[[ -n "$backup_set" && -f "$backup_set/SHA256SUMS" ]]
(cd "$backup_set" && sha256sum --check --strict SHA256SUMS)
[[ $(tar -tzf "$backup_set/uploads.tar.gz" | grep -c 'temp/quotes' || true) -eq 0 ]]

docker exec -e MYSQL_PWD=test-secret "$container" mysql -uroot -e 'DROP DATABASE grod_restore_test; CREATE DATABASE grod_restore_test CHARACTER SET utf8mb4;'
rm -r -- "$test_root/uploads/products" "$test_root/uploads/quotes" "$test_root/uploads/documents"
docker run --rm "${common[@]}" --entrypoint bash mysql:8.4 /project/deploy/backup/restore-grod.sh --backup "/test/backups/$(basename "$backup_set")" --confirm

rows=$(docker exec -e MYSQL_PWD=test-secret "$container" mysql -N -uroot grod_restore_test -e 'SELECT (SELECT COUNT(*) FROM admin_user)+(SELECT COUNT(*) FROM client)+(SELECT COUNT(*) FROM produit)+(SELECT COUNT(*) FROM demande_devis)+(SELECT COUNT(*) FROM notification)+(SELECT COUNT(*) FROM document_technique);')
[[ "$rows" = 6 ]]
[[ -f "$test_root/uploads/products/product.jpg" && -f "$test_root/uploads/quotes/quote.pdf" && -f "$test_root/uploads/documents/technical.pdf" ]]
echo 'Recette backup/restauration MySQL 8.4 et uploads: OK'
