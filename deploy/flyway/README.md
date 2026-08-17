# Gestion du schéma G-ROD avec Flyway

Flyway est l'unique outil autorisé à faire évoluer le schéma. Hibernate utilise `ddl-auto=validate` et refuse le démarrage si le schéma ne correspond pas aux entités.

## Stratégie V1

`V1__baseline_schema.sql` représente le schéma stabilisé actuel.

- Base vide : Flyway exécute V1 et crée les dix tables applicatives.
- Base historique non vide : après backup et contrôle du schéma, activer ponctuellement `FLYWAY_BASELINE_ON_MIGRATE=true`. Flyway inscrit une baseline en version 1 sans recréer les objets. Hibernate valide ensuite leur compatibilité.
- La baseline reste `false` par défaut et doit revenir à `false` dès le premier démarrage réussi.

Le placeholder `textLobType` vaut `TINYTEXT` sur MySQL, conformément au schéma Hibernate historique de la Passkey, et `CLOB` dans les tests H2 (`FLYWAY_TEXT_LOB_TYPE=CLOB`). Il maintient une migration unique malgré la différence de vocabulaire SQL.

## Adopter une base existante

1. Arrêter le backend ou passer en maintenance.
2. Exécuter [`../backup/backup-grod.sh`](../backup/backup-grod.sh).
3. Vérifier `SHA256SUMS` et, idéalement, disposer d'une restauration récemment testée.
4. Vérifier les tables attendues et l'absence d'un historique Flyway étranger.
5. Démarrer une seule fois avec `FLYWAY_BASELINE_ON_MIGRATE=true`.
6. Contrôler les logs : baseline v1, validation Hibernate, démarrage réussi.
7. Vérifier les données et `flyway_schema_history`.
8. Remettre `FLYWAY_BASELINE_ON_MIGRATE=false` et redémarrer.

Ne jamais baseliner automatiquement une base inconnue ou vide. La baseline ne compare pas elle-même toute la structure historique ; Hibernate `validate` refuse ensuite une structure incompatible.

## Nouvelle installation et développement

Créer une base vide `utf8mb4`, configurer `DATABASE_*`, puis démarrer. Flyway applique V1 avant JPA. Pour réinitialiser le développement, supprimer uniquement la base de développement explicitement identifiée, la recréer vide, puis redémarrer. Ne jamais faire cela en staging ou production.

Les tests H2 utilisent également V1 et Hibernate validate : Hibernate n'y construit plus un schéma divergent.

## Créer une future migration

Ne jamais modifier V1 après application : son checksum est enregistré. Toute correction devient un nouveau fichier, par exemple :

```text
src/main/resources/db/migration/V2__add_delivery_country.sql
```

Exemple conceptuel :

```sql
ALTER TABLE demandes_devis ADD COLUMN delivery_country VARCHAR(100);
CREATE INDEX idx_devis_delivery_country ON demandes_devis (delivery_country);
```

Tester toute migration sur une base vide et une copie isolée représentative. Privilégier les migrations additives et compatibles avec les données existantes.

## Déployer et gérer un échec

1. Backup complet DB/uploads et vérification des checksums.
2. Test de restauration récent.
3. Test de la migration sur MySQL 8.4 isolé.
4. Déploiement : Flyway valide les checksums et applique les versions manquantes.
5. Hibernate valide le résultat.
6. Contrôle de `flyway_schema_history` et des parcours métier.

Flyway Community ne fournit pas de rollback automatique complet. En cas d'échec grave : arrêter l'application, restaurer le backup et redéployer la version précédente. Une correction non destructive doit être une nouvelle migration Vn+1.

## Propriétés utilisées

- `spring.flyway.enabled=true`
- `spring.flyway.locations=classpath:db/migration`
- `spring.flyway.baseline-on-migrate=${FLYWAY_BASELINE_ON_MIGRATE:false}`
- `spring.flyway.baseline-version=1`
- `spring.flyway.validate-on-migrate=true`
- `spring.flyway.clean-disabled=true`
- `spring.jpa.hibernate.ddl-auto=validate`

Flyway réutilise la datasource ; aucun credential supplémentaire n'est versionné.

## Recette MySQL 8.4 isolée

```bash
./mvnw package
./deploy/flyway/test-flyway-mysql.sh
```

Le script crée un MySQL 8.4 temporaire, teste une base vide, un second démarrage, puis une base historique contenant huit types de données. Il vérifie leur conservation, Hibernate validate et l'idempotence de l'historique. Il ne cible jamais la base métier.
