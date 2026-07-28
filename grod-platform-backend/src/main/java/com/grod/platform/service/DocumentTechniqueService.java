package com.grod.platform.service;

import com.grod.platform.dto.DocumentTechniqueRequestDTO;
import com.grod.platform.dto.DocumentTechniqueResponseDTO;
import com.grod.platform.entity.DocumentTechnique;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.DocumentTechniqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentTechniqueService {

    private final DocumentTechniqueRepository documentTechniqueRepository;

    public DocumentTechniqueResponseDTO ajouter(DocumentTechniqueRequestDTO request) {
        DocumentTechnique document = DocumentTechnique.builder()
                .titre(request.getTitre())
                .typeDocument(request.getTypeDocument())
                .produitConcerne(request.getProduitConcerne())
                .description(request.getDescription())
                .fichierUrl(request.getFichierUrl())
                .fichierNom(request.getFichierNom())
                .actif(request.isActif())
                .telechargementPublic(request.isTelechargementPublic())
                .build();
        return convertir(documentTechniqueRepository.save(document));
    }

    public List<DocumentTechniqueResponseDTO> listerTous() {
        return documentTechniqueRepository.findAll(Sort.by(Sort.Direction.DESC, "dateCreation"))
                .stream()
                .map(this::convertir)
                .toList();
    }

    public List<DocumentTechniqueResponseDTO> listerActifs() {
        return documentTechniqueRepository.findByActifTrueOrderByDateCreationDesc()
                .stream()
                .map(this::convertir)
                .toList();
    }

    public DocumentTechniqueResponseDTO modifier(Long id, DocumentTechniqueRequestDTO request) {
        DocumentTechnique document = trouver(id);
        document.setTitre(request.getTitre());
        document.setTypeDocument(request.getTypeDocument());
        document.setProduitConcerne(request.getProduitConcerne());
        document.setDescription(request.getDescription());
        document.setFichierUrl(request.getFichierUrl());
        document.setFichierNom(request.getFichierNom());
        document.setActif(request.isActif());
        document.setTelechargementPublic(request.isTelechargementPublic());
        return convertir(documentTechniqueRepository.save(document));
    }

    public void supprimer(Long id) {
        documentTechniqueRepository.delete(trouver(id));
    }

    private DocumentTechnique trouver(Long id) {
        return documentTechniqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document technique introuvable avec l'id : " + id
                ));
    }

    private DocumentTechniqueResponseDTO convertir(DocumentTechnique document) {
        return DocumentTechniqueResponseDTO.builder()
                .id(document.getId())
                .titre(document.getTitre())
                .typeDocument(document.getTypeDocument())
                .produitConcerne(document.getProduitConcerne())
                .description(document.getDescription())
                .fichierUrl(document.getFichierUrl())
                .fichierNom(document.getFichierNom())
                .actif(document.isActif())
                .telechargementPublic(document.isTelechargementPublic())
                .dateCreation(document.getDateCreation())
                .build();
    }
}
