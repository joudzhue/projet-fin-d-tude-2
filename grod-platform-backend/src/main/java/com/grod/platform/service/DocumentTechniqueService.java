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
    private final StoredFileService storedFileService;

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
        return convertir(documentTechniqueRepository.save(document), false);
    }

    public List<DocumentTechniqueResponseDTO> listerTous() {
        return documentTechniqueRepository.findAll(Sort.by(Sort.Direction.DESC, "dateCreation"))
                .stream()
                .map(document -> convertir(document, false))
                .toList();
    }

    public List<DocumentTechniqueResponseDTO> listerActifs() {
        return documentTechniqueRepository.findByActifTrueAndTelechargementPublicTrueOrderByDateCreationDesc()
                .stream()
                .map(document -> convertir(document, true))
                .toList();
    }

    public DocumentTechniqueResponseDTO modifier(Long id, DocumentTechniqueRequestDTO request) {
        DocumentTechnique document = trouver(id);
        String ancienFichier = document.getFichierUrl();
        document.setTitre(request.getTitre());
        document.setTypeDocument(request.getTypeDocument());
        document.setProduitConcerne(request.getProduitConcerne());
        document.setDescription(request.getDescription());
        if (request.getFichierUrl() == null || !request.getFichierUrl().startsWith("/api/admin/ressources/")) {
            document.setFichierUrl(request.getFichierUrl());
        }
        document.setFichierNom(request.getFichierNom());
        document.setActif(request.isActif());
        document.setTelechargementPublic(request.isTelechargementPublic());
        DocumentTechnique saved = documentTechniqueRepository.save(document);
        if (ancienFichier != null && !ancienFichier.equals(saved.getFichierUrl())) {
            storedFileService.deleteManagedFile(ancienFichier, "documents");
        }
        return convertir(saved, false);
    }

    public void supprimer(Long id) {
        DocumentTechnique document = trouver(id);
        documentTechniqueRepository.delete(document);
        storedFileService.deleteManagedFile(document.getFichierUrl(), "documents");
    }

    public DocumentTechnique trouverPublic(Long id) {
        DocumentTechnique document = trouver(id);
        if (!document.isActif() || !document.isTelechargementPublic()) {
            throw new ResourceNotFoundException("Document technique introuvable");
        }
        return document;
    }

    public DocumentTechnique trouverAdmin(Long id) { return trouver(id); }

    private DocumentTechnique trouver(Long id) {
        return documentTechniqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document technique introuvable avec l'id : " + id
                ));
    }

    private DocumentTechniqueResponseDTO convertir(DocumentTechnique document, boolean publicView) {
        return DocumentTechniqueResponseDTO.builder()
                .id(document.getId())
                .titre(document.getTitre())
                .typeDocument(document.getTypeDocument())
                .produitConcerne(document.getProduitConcerne())
                .description(document.getDescription())
                .fichierUrl(publicView
                        ? "/api/documents-techniques/" + document.getId() + "/download"
                        : "/api/admin/ressources/" + document.getId() + "/download")
                .fichierNom(document.getFichierNom())
                .actif(document.isActif())
                .telechargementPublic(document.isTelechargementPublic())
                .dateCreation(document.getDateCreation())
                .build();
    }
}
