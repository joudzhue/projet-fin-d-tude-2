package com.grod.platform.service;

import com.grod.platform.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.AtomicMoveNotSupportedException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Slf4j
public class StoredFileService {
    private final Path uploadRoot;

    public StoredFileService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public Resource loadTechnicalDocument(String storedUrl) {
        Path file = resolveManagedFile(storedUrl, "documents");
        try {
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable() || !Files.isRegularFile(file)) {
                throw new ResourceNotFoundException("Fichier technique introuvable");
            }
            return resource;
        } catch (ResourceNotFoundException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResourceNotFoundException("Fichier technique introuvable");
        }
    }

    public Resource loadQuoteDocument(String storedUrl) {
        Path file = resolveManagedFile(storedUrl, "quotes");
        try {
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable() || !Files.isRegularFile(file)) {
                throw new ResourceNotFoundException("Plan de devis introuvable");
            }
            return resource;
        } catch (ResourceNotFoundException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResourceNotFoundException("Plan de devis introuvable");
        }
    }

    public void deleteManagedFile(String storedUrl, String category) {
        if (storedUrl == null || storedUrl.isBlank()) return;
        try { Files.deleteIfExists(resolveManagedFile(storedUrl, category)); }
        catch (Exception ignored) { /* ancien fichier externe ou deja absent */ }
    }

    public String storeTemporaryQuote(MultipartFile file, String extension) throws Exception {
        String safeExtension = extension != null && extension.matches("\\.[a-zA-Z0-9]{1,5}") ? extension.toLowerCase() : "";
        Path root = categoryRoot("temp/quotes");
        Files.createDirectories(root);
        String filename = UUID.randomUUID() + safeExtension;
        Path target = safeResolve(root, filename);
        file.transferTo(target);
        return "/uploads/temp/quotes/" + filename;
    }

    public String promoteTemporaryQuote(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank() || storedUrl.startsWith("/uploads/quotes/")) return storedUrl;
        Path source = resolveManagedFile(storedUrl, "temp/quotes");
        Path targetRoot = categoryRoot("quotes");
        Path target = safeResolve(targetRoot, source.getFileName().toString());
        try {
            Files.createDirectories(targetRoot);
            try {
                Files.move(source, target, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException exception) {
                Files.move(source, target);
            }
            registerRollbackMove(source, target);
            log.info("Temporary quote file promoted");
            return "/uploads/quotes/" + target.getFileName();
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible de finaliser le fichier technique", exception);
        }
    }

    public int cleanupExpiredTemporaryQuotes(Duration retention, Instant now) {
        Path tempRoot = categoryRoot("temp/quotes");
        if (!Files.isDirectory(tempRoot)) return 0;
        int removed = 0;
        try (Stream<Path> files = Files.list(tempRoot)) {
            for (Path file : files.filter(Files::isRegularFile).toList()) {
                if (Files.getLastModifiedTime(file).toInstant().isBefore(now.minus(retention))
                        && Files.deleteIfExists(safeResolve(tempRoot, file.getFileName().toString()))) removed++;
            }
        } catch (Exception exception) {
            log.error("Temporary upload cleanup failed: reason={}", exception.getClass().getSimpleName());
        }
        log.info("Temporary upload cleanup completed: {} files removed", removed);
        return removed;
    }

    Path categoryRoot(String category) {
        if (!category.matches("products|quotes|documents|temp/quotes")) throw new IllegalArgumentException("Categorie invalide");
        Path root = uploadRoot.resolve(category).normalize();
        if (!root.startsWith(uploadRoot)) throw new IllegalArgumentException("Chemin de stockage invalide");
        return root;
    }

    private Path safeResolve(Path root, String filename) {
        if (filename == null || filename.isBlank() || filename.contains("/") || filename.contains("\\") || filename.contains(".."))
            throw new IllegalArgumentException("Nom de fichier invalide");
        Path resolved = root.resolve(filename).normalize();
        if (!resolved.startsWith(root)) throw new IllegalArgumentException("Chemin de fichier invalide");
        return resolved;
    }

    private void registerRollbackMove(Path source, Path target) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK && Files.exists(target)) {
                    try { Files.createDirectories(source.getParent()); Files.move(target, source, StandardCopyOption.REPLACE_EXISTING); }
                    catch (Exception exception) { log.error("Temporary quote rollback restoration failed"); }
                }
            }
        });
    }

    private Path resolveManagedFile(String storedUrl, String category) {
        String path = storedUrl;
        if (storedUrl == null) throw new IllegalArgumentException("URL de fichier invalide");
        if (storedUrl.startsWith("http://") || storedUrl.startsWith("https://"))
            throw new IllegalArgumentException("URL externe non geree par l'application");
        String prefix = "/uploads/" + category + "/";
        int index = path.indexOf(prefix);
        if (index < 0) throw new IllegalArgumentException("Fichier non gere par l'application");
        String filename = path.substring(index + prefix.length());
        if (filename.isBlank() || filename.contains("/") || filename.contains("\\") || filename.contains(".."))
            throw new IllegalArgumentException("Nom de fichier invalide");
        return safeResolve(categoryRoot(category), filename);
    }
}
