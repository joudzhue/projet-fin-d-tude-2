package com.grod.platform.service;

import com.grod.platform.dto.ProduitRequestDTO;
import com.grod.platform.dto.ProduitResponseDTO;

import java.util.List;

public interface ProduitService {

    ProduitResponseDTO ajouterProduit(ProduitRequestDTO produitDTO);

    List<ProduitResponseDTO> listerProduits();

    List<ProduitResponseDTO> listerProduitsActifs();

    ProduitResponseDTO trouverProduitParId(Long id);

    ProduitResponseDTO modifierProduit(Long id, ProduitRequestDTO produitDTO);

    void supprimerProduit(Long id);
}
