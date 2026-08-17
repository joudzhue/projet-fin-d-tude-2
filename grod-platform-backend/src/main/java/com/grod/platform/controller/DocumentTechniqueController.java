package com.grod.platform.controller;

import com.grod.platform.dto.DocumentTechniqueRequestDTO;
import com.grod.platform.dto.DocumentTechniqueResponseDTO;
import com.grod.platform.service.DocumentTechniqueService;
import com.grod.platform.service.StoredFileService;
import com.grod.platform.entity.DocumentTechnique;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/documents-techniques")
@RequiredArgsConstructor
@Tag(name = "Documents techniques", description = "Bibliotheque des PDF techniques G-ROD")
public class DocumentTechniqueController {

    private final DocumentTechniqueService documentTechniqueService;
    private final StoredFileService storedFileService;

    @GetMapping("/actifs")
    @Operation(summary = "Lister les documents actifs visibles sur le site")
    public List<DocumentTechniqueResponseDTO> listerActifs() {
        return documentTechniqueService.listerActifs();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> telechargerPublic(@PathVariable Long id) {
        DocumentTechnique document = documentTechniqueService.trouverPublic(id);
        Resource resource = storedFileService.loadTechnicalDocument(document.getFichierUrl());
        String filename = document.getFichierNom() == null ? "document.pdf"
                : document.getFichierNom().replaceAll("[\\r\\n\\\"]", "_");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping
    @Operation(summary = "Lister tous les documents pour l'administration")
    public List<DocumentTechniqueResponseDTO> listerTous() {
        return documentTechniqueService.listerTous();
    }

    @PostMapping
    @Operation(summary = "Ajouter un document technique")
    public DocumentTechniqueResponseDTO ajouter(
            @Valid @RequestBody DocumentTechniqueRequestDTO request
    ) {
        return documentTechniqueService.ajouter(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un document technique")
    public DocumentTechniqueResponseDTO modifier(
            @PathVariable Long id,
            @Valid @RequestBody DocumentTechniqueRequestDTO request
    ) {
        return documentTechniqueService.modifier(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un document technique")
    public void supprimer(@PathVariable Long id) {
        documentTechniqueService.supprimer(id);
    }
}
