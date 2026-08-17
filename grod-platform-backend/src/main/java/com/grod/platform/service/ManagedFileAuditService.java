package com.grod.platform.service;

import com.grod.platform.repository.DemandeDevisRepository;
import com.grod.platform.repository.DocumentTechniqueRepository;
import com.grod.platform.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ManagedFileAuditService {
    private final StoredFileService storage;
    private final ProduitRepository produits;
    private final DemandeDevisRepository devis;
    private final DocumentTechniqueRepository documents;

    public ManagedFileAudit audit() {
        Set<String> references = new HashSet<>();
        produits.findAll().forEach(p -> addName(references, p.getImageUrl()));
        devis.findAll().forEach(d -> addName(references, d.getFichierTechniqueUrl()));
        documents.findAll().forEach(d -> addName(references, d.getFichierUrl()));
        long physical = 0, orphanCount = 0, orphanBytes = 0;
        for (String category : new String[]{"products", "quotes", "documents"}) {
            Path root = storage.categoryRoot(category);
            if (!Files.isDirectory(root)) continue;
            try (Stream<Path> stream = Files.list(root)) {
                for (Path file : stream.filter(Files::isRegularFile).toList()) {
                    physical++;
                    if (!references.contains(category + "/" + file.getFileName())) {
                        orphanCount++;
                        orphanBytes += Files.size(file);
                    }
                }
            } catch (Exception exception) {
                throw new IllegalStateException("Impossible d'auditer les fichiers gérés", exception);
            }
        }
        return new ManagedFileAudit(physical, references.size(), orphanCount, orphanBytes);
    }

    private void addName(Set<String> references, String url) {
        if (url == null) return;
        for (String category : new String[]{"products", "quotes", "documents"}) {
            String prefix = "/uploads/" + category + "/";
            int index = url.indexOf(prefix);
            if (index >= 0) {
                String name = url.substring(index + prefix.length());
                if (!name.isBlank() && !name.contains("/") && !name.contains("\\") && !name.contains(".."))
                    references.add(category + "/" + name);
            }
        }
    }
}
