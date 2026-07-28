package com.grod.platform.service;

import com.grod.platform.dto.ProduitRequestDTO;
import com.grod.platform.dto.ProduitResponseDTO;
import com.grod.platform.entity.Produit;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduitServiceImpl implements ProduitService {

    private final ProduitRepository produitRepository;

    @Override
    public ProduitResponseDTO ajouterProduit(ProduitRequestDTO produitDTO) {
        Produit produit = Produit.builder()
                .nom(produitDTO.getNom())
                .description(produitDTO.getDescription())
                .categorie(produitDTO.getCategorie())
                .imageUrl(produitDTO.getImageUrl())
                .applications(produitDTO.getApplications())
                .dimensions(produitDTO.getDimensions())
                .purete(produitDTO.getPurete())
                .normes(produitDTO.getNormes())
                .conditionnement(produitDTO.getConditionnement())
                .actif(produitDTO.isActif())
                .build();

        Produit savedProduit = produitRepository.save(produit);

        return convertirEnResponseDTO(savedProduit);
    }

    @Override
    public List<ProduitResponseDTO> listerProduits() {
        return produitRepository.findAll()
                .stream()
                .map(this::convertirEnResponseDTO)
                .toList();
    }

    @Override
    public List<ProduitResponseDTO> listerProduitsActifs() {
        return produitRepository.findByActifTrue()
                .stream()
                .map(this::convertirEnResponseDTO)
                .toList();
    }

    @Override
    public ProduitResponseDTO trouverProduitParId(Long id) {
        Produit produit = trouverEntityParId(id);

        return convertirEnResponseDTO(produit);
    }

    @Override
    public ProduitResponseDTO modifierProduit(Long id, ProduitRequestDTO produitDTO) {
        Produit produitExistant = trouverEntityParId(id);

        produitExistant.setNom(produitDTO.getNom());
        produitExistant.setDescription(produitDTO.getDescription());
        produitExistant.setCategorie(produitDTO.getCategorie());
        produitExistant.setImageUrl(produitDTO.getImageUrl());
        produitExistant.setApplications(produitDTO.getApplications());
        produitExistant.setDimensions(produitDTO.getDimensions());
        produitExistant.setPurete(produitDTO.getPurete());
        produitExistant.setNormes(produitDTO.getNormes());
        produitExistant.setConditionnement(produitDTO.getConditionnement());
        produitExistant.setActif(produitDTO.isActif());

        Produit updatedProduit = produitRepository.save(produitExistant);

        return convertirEnResponseDTO(updatedProduit);
    }

    @Override
    public void supprimerProduit(Long id) {
        Produit produit = trouverEntityParId(id);
        produitRepository.delete(produit);
    }

    private Produit trouverEntityParId(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'id : " + id));
    }

    private ProduitResponseDTO convertirEnResponseDTO(Produit produit) {
        return ProduitResponseDTO.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .categorie(produit.getCategorie())
                .imageUrl(produit.getImageUrl())
                .applications(produit.getApplications())
                .dimensions(produit.getDimensions())
                .purete(produit.getPurete())
                .normes(produit.getNormes())
                .conditionnement(produit.getConditionnement())
                .actif(produit.isActif())
                .build();
    }
}
