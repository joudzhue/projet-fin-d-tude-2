package com.grod.platform;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:flyway_verification;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "app.bootstrap-admin.email=",
        "app.bootstrap-admin.password="
})
class FlywayMigrationIntegrationTests {

    @Autowired JdbcTemplate jdbc;

    @Test
    void migrationV1CreatesExpectedSchemaAndHistoryOnce() {
        List<String> expectedTables = List.of(
                "ADMIN_PASSKEY_CREDENTIALS", "APP_SETTINGS", "CLIENTS", "DEMANDES_DEVIS",
                "DEMANDES_DOCUMENTS", "DOCUMENTS_TECHNIQUES", "NOTIFICATIONS",
                "NOTIFICATION_LECTURES", "PRODUITS", "UTILISATEURS");

        Integer tableCount = jdbc.queryForObject(
                "select count(*) from information_schema.tables where table_schema='PUBLIC' and table_name in (" +
                        String.join(",", expectedTables.stream().map(name -> "'" + name + "'").toList()) + ")",
                Integer.class);
        Integer migrationCount = jdbc.queryForObject(
                "select count(*) from \"flyway_schema_history\" where \"version\"='1' and \"success\"=true",
                Integer.class);

        assertThat(tableCount).isEqualTo(expectedTables.size());
        assertThat(migrationCount).isEqualTo(1);
    }
}
