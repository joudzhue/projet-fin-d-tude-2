package com.grod.platform.controller;

import com.grod.platform.dto.*;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.service.AdminPaginationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminPaginationController {
    private final AdminPaginationService service;

    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO dashboardSummary() { return service.dashboardSummary(); }

    @GetMapping("/demandes/pipeline")
    public DemandPipelineDTO demandPipeline() { return service.demandPipeline(); }

    @GetMapping("/demandes")
    public PagedResponse<DemandeDevisResponseDTO> devis(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="dateCreation") String sort, @RequestParam(defaultValue="desc") String direction,
            @RequestParam(required=false) String search, @RequestParam(required=false) StatutDemande statut,
            @RequestParam(required=false) String produit, @RequestParam(required=false) Long clientId,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return service.devis(service.pageable(page,size,sort,direction,Set.of("dateCreation","referenceDemande","quantite","statut"),"dateCreation"),search,statut,produit,clientId,dateDebut,dateFin);
    }

    @GetMapping("/documents")
    public PagedResponse<DemandeDocumentResponseDTO> documents(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="dateCreation") String sort, @RequestParam(defaultValue="desc") String direction,
            @RequestParam(required=false) String search, @RequestParam(required=false) StatutDemande statut,
            @RequestParam(required=false) String type, @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return service.documents(service.pageable(page,size,sort,direction,Set.of("dateCreation","referenceDemande","statut"),"dateCreation"),search,statut,type,dateDebut,dateFin);
    }

    @GetMapping("/produits")
    public PagedResponse<ProduitResponseDTO> produits(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="desc") String direction,
            @RequestParam(required=false) String search, @RequestParam(required=false) Boolean actif, @RequestParam(required=false) String categorie) {
        return service.produits(service.pageable(page,size,sort,direction,Set.of("id","nom","categorie"),"id"),search,actif,categorie);
    }

    @GetMapping("/ressources")
    public PagedResponse<DocumentTechniqueResponseDTO> ressources(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="dateCreation") String sort, @RequestParam(defaultValue="desc") String direction,
            @RequestParam(required=false) String search, @RequestParam(required=false) Boolean actif, @RequestParam(required=false) Boolean publique,
            @RequestParam(required=false) String type, @RequestParam(required=false) String produit) {
        return service.ressources(service.pageable(page,size,sort,direction,Set.of("dateCreation","titre","typeDocument"),"dateCreation"),search,actif,publique,type,produit);
    }
}
