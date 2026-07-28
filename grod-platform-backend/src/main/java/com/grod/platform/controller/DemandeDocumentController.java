package com.grod.platform.controller;

import com.grod.platform.dto.DemandeDocumentRequestDTO;
import com.grod.platform.dto.DemandeDocumentResponseDTO;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.service.DemandeDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes-documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Demandes de documents", description = "Gestion des demandes de documents techniques")
public class DemandeDocumentController {

    private final DemandeDocumentService demandeDocumentService;

    @PostMapping
    @Operation(summary = "Envoyer une demande de document technique")
    public DemandeDocumentResponseDTO ajouter(
            @Valid @RequestBody DemandeDocumentRequestDTO request
    ) {
        return demandeDocumentService.ajouter(request);
    }

    @GetMapping
    @Operation(summary = "Lister les demandes de documents")
    public List<DemandeDocumentResponseDTO> lister() {
        return demandeDocumentService.lister();
    }

    @PutMapping("/{id}/statut")
    @Operation(summary = "Changer le statut d'une demande de document")
    public DemandeDocumentResponseDTO changerStatut(
            @PathVariable Long id,
            @RequestParam StatutDemande statut
    ) {
        return demandeDocumentService.changerStatut(id, statut);
    }
}
