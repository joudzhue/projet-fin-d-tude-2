package com.grod.platform.controller;

import com.grod.platform.dto.DocumentTechniqueRequestDTO;
import com.grod.platform.dto.DocumentTechniqueResponseDTO;
import com.grod.platform.service.DocumentTechniqueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents-techniques")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Documents techniques", description = "Bibliotheque des PDF techniques G-ROD")
public class DocumentTechniqueController {

    private final DocumentTechniqueService documentTechniqueService;

    @GetMapping("/actifs")
    @Operation(summary = "Lister les documents actifs visibles sur le site")
    public List<DocumentTechniqueResponseDTO> listerActifs() {
        return documentTechniqueService.listerActifs();
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
