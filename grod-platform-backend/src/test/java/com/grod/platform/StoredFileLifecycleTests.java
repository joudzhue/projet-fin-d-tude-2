package com.grod.platform;

import com.grod.platform.service.StoredFileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StoredFileLifecycleTests {
    @TempDir Path tempDir;

    @Test
    void uploadPlanCreeUnFichierTemporaire() throws Exception {
        StoredFileService storage = storage();
        String url = storage.storeTemporaryQuote(file(), ".pdf");
        assertThat(url).startsWith("/uploads/temp/quotes/");
        assertThat(path(url)).exists();
    }

    @Test
    void creationDevisPromeutLePlanVersLeStockageDefinitif() throws Exception {
        StoredFileService storage = storage();
        String temporaryUrl = storage.storeTemporaryQuote(file(), ".pdf");
        String finalUrl = storage.promoteTemporaryQuote(temporaryUrl);
        assertThat(finalUrl).startsWith("/uploads/quotes/");
        assertThat(path(temporaryUrl)).doesNotExist();
        assertThat(path(finalUrl)).exists();
    }

    @Test
    void nettoyageConserveUnFichierTemporaireRecent() throws Exception {
        StoredFileService storage = storage();
        String url = storage.storeTemporaryQuote(file(), ".pdf");
        assertThat(storage.cleanupExpiredTemporaryQuotes(Duration.ofHours(24), Instant.now())).isZero();
        assertThat(path(url)).exists();
    }

    @Test
    void nettoyageSupprimeUnFichierTemporaireExpire() throws Exception {
        StoredFileService storage = storage();
        String url = storage.storeTemporaryQuote(file(), ".pdf");
        Files.setLastModifiedTime(path(url), FileTime.from(Instant.now().minus(Duration.ofHours(25))));
        assertThat(storage.cleanupExpiredTemporaryQuotes(Duration.ofHours(24), Instant.now())).isOne();
        assertThat(path(url)).doesNotExist();
    }

    @Test
    void nettoyageTemporaireNeToucheJamaisAuxAnciensPlans() throws Exception {
        Path oldQuote = tempDir.resolve("quotes/ancien-plan.pdf");
        Files.createDirectories(oldQuote.getParent());
        Files.writeString(oldQuote, "ancien");
        Files.setLastModifiedTime(oldQuote, FileTime.from(Instant.EPOCH));
        storage().cleanupExpiredTemporaryQuotes(Duration.ofHours(1), Instant.now());
        assertThat(oldQuote).exists();
    }

    @Test
    void suppressionRefuseTraversalEtFichierExterne() throws Exception {
        StoredFileService storage = storage();
        Path outside = tempDir.getParent().resolve("outside-grod-test.pdf");
        Files.writeString(outside, "ne pas supprimer");
        try {
            storage.deleteManagedFile("/uploads/quotes/../outside-grod-test.pdf", "quotes");
            storage.deleteManagedFile(outside.toAbsolutePath().toString(), "quotes");
            assertThat(outside).exists();
        } finally {
            Files.deleteIfExists(outside);
        }
    }

    @Test
    void promotionRefuseCheminAbsoluOuExterne() {
        StoredFileService storage = storage();
        assertThatThrownBy(() -> storage.promoteTemporaryQuote("C:\\Windows\\system.ini"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> storage.promoteTemporaryQuote("/uploads/temp/quotes/../secret.pdf"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private StoredFileService storage() { return new StoredFileService(tempDir.toString()); }
    private MockMultipartFile file() { return new MockMultipartFile("file", "plan.pdf", "application/pdf", "%PDF-test".getBytes()); }
    private Path path(String url) { return tempDir.resolve(url.substring("/uploads/".length()).replace('/', java.io.File.separatorChar)); }
}
