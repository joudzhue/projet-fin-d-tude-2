package com.grod.platform.controller;

import com.grod.platform.entity.DocumentTechnique;
import com.grod.platform.service.DocumentTechniqueService;
import com.grod.platform.service.StoredFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ressources")
@RequiredArgsConstructor
public class AdminResourceDownloadController {
    private final DocumentTechniqueService documentTechniqueService;
    private final StoredFileService storedFileService;

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        DocumentTechnique document = documentTechniqueService.trouverAdmin(id);
        Resource resource = storedFileService.loadTechnicalDocument(document.getFichierUrl());
        String filename = document.getFichierNom() == null ? "document.pdf"
                : document.getFichierNom().replaceAll("[\\r\\n\\\"]", "_");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
