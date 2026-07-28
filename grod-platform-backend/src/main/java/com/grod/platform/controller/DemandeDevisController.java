package com.grod.platform.controller;

import com.grod.platform.dto.DemandeDevisRequestDTO;
import com.grod.platform.dto.DemandeDevisResponseDTO;
import com.grod.platform.dto.ClientFideleUpdateDTO;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.service.DemandeDevisPdfService;
import com.grod.platform.service.DemandeDevisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes-devis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Demandes de devis", description = "Gestion des demandes de devis clients")
public class DemandeDevisController {

    private final DemandeDevisService demandeDevisService;
    private final DemandeDevisPdfService demandeDevisPdfService;

    @PostMapping
    @Operation(summary = "Ajouter une demande de devis", description = "Enregistre une nouvelle demande de devis client")
    public DemandeDevisResponseDTO ajouterDemande(@Valid @RequestBody DemandeDevisRequestDTO demandeDTO) {
        return demandeDevisService.ajouterDemande(demandeDTO);
    }

    @GetMapping
    @Operation(summary = "Lister les demandes de devis", description = "Retourne toutes les demandes de devis enregistrees")
    public List<DemandeDevisResponseDTO> listerDemandes() {
        return demandeDevisService.listerDemandes();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une demande par ID", description = "Retourne les details d'une demande de devis")
    public DemandeDevisResponseDTO trouverDemandeParId(@PathVariable Long id) {
        return demandeDevisService.trouverDemandeParId(id);
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Telecharger une demande en PDF", description = "Genere la fiche PDF d'une demande de devis")
    public ResponseEntity<byte[]> telechargerPdf(@PathVariable Long id) {
        DemandeDevisResponseDTO demande = demandeDevisService.trouverDemandeParId(id);
        byte[] pdf = demandeDevisPdfService.genererPdf(demande);
        String reference = demande.getReferenceDemande() == null || demande.getReferenceDemande().isBlank()
                ? "demande-" + id
                : demande.getReferenceDemande();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + reference + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    @GetMapping("/statut/{statut}")
    @Operation(summary = "Lister les demandes par statut", description = "Retourne les demandes selon leur statut de traitement")
    public List<DemandeDevisResponseDTO> listerDemandesParStatut(@PathVariable StatutDemande statut) {
        return demandeDevisService.listerDemandesParStatut(statut);
    }

    @PutMapping("/{id}/statut")
    @Operation(summary = "Changer le statut d'une demande", description = "Met a jour le statut d'une demande de devis")
    public DemandeDevisResponseDTO changerStatut(@PathVariable Long id, @RequestParam StatutDemande statut) {
        return demandeDevisService.changerStatut(id, statut);
    }

    @PutMapping("/{id}/client-fidele")
    @Operation(summary = "Marquer une demande comme client fidele", description = "Met a jour le statut client fidele d'une demande")
    public DemandeDevisResponseDTO changerClientFidele(
            @PathVariable Long id,
            @RequestBody ClientFideleUpdateDTO clientFideleUpdateDTO
    ) {
        return demandeDevisService.changerClientFidele(id, clientFideleUpdateDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une demande", description = "Supprime une demande de devis")
    public void supprimerDemande(@PathVariable Long id) {
        demandeDevisService.supprimerDemande(id);
    }
}
