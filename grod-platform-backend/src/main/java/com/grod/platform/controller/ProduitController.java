package com.grod.platform.controller;

import com.grod.platform.dto.ProduitRequestDTO;
import com.grod.platform.dto.ProduitResponseDTO;
import com.grod.platform.service.ProduitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Produits", description = "Gestion du catalogue de produits G-ROD")
public class ProduitController {

    private final ProduitService produitService;

    // Ajouter un produit
    @PostMapping
    @Operation(summary = "Ajouter un produit", description = "Cree un nouveau produit dans le catalogue")
    public ProduitResponseDTO ajouterProduit(@Valid @RequestBody ProduitRequestDTO produitDTO) {
        return produitService.ajouterProduit(produitDTO);
    }

    // Lister tous les produits
    @GetMapping
    @Operation(summary = "Lister tous les produits", description = "Retourne tous les produits enregistres")
    public List<ProduitResponseDTO> listerProduits() {
        return produitService.listerProduits();
    }

    // Lister seulement les produits actifs
    @GetMapping("/actifs")
    @Operation(summary = "Lister les produits actifs", description = "Retourne uniquement les produits visibles dans le catalogue")
    public List<ProduitResponseDTO> listerProduitsActifs() {
        return produitService.listerProduitsActifs();
    }

    // Trouver un produit par son ID
    @GetMapping("/{id}")
    @Operation(summary = "Trouver un produit par ID", description = "Retourne les details d'un produit a partir de son identifiant")
    public ProduitResponseDTO trouverProduitParId(@PathVariable Long id) {
        return produitService.trouverProduitParId(id);
    }

    // Modifier un produit
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un produit", description = "Met a jour les informations d'un produit existant")
    public ProduitResponseDTO modifierProduit(@PathVariable Long id, @Valid @RequestBody ProduitRequestDTO produitDTO) {
        return produitService.modifierProduit(id, produitDTO);
    }

    // Supprimer un produit
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un produit", description = "Supprime un produit du catalogue")
    public void supprimerProduit(@PathVariable Long id) {
        produitService.supprimerProduit(id);
    }
}
