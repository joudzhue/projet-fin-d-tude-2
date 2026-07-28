package com.grod.platform.service;

import com.grod.platform.dto.DemandeDocumentRequestDTO;
import com.grod.platform.dto.DemandeDocumentResponseDTO;
import com.grod.platform.entity.DemandeDocument;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.DemandeDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeDocumentService {

    private final DemandeDocumentRepository demandeDocumentRepository;

    public DemandeDocumentResponseDTO ajouter(DemandeDocumentRequestDTO request) {
        DemandeDocument demande = DemandeDocument.builder()
                .societe(request.getSociete())
                .nomContact(request.getNomContact())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .typeDocument(request.getTypeDocument())
                .titreDocument(request.getTitreDocument())
                .produitConcerne(request.getProduitConcerne())
                .message(request.getMessage())
                .statut(StatutDemande.NOUVELLE)
                .build();

        demande = demandeDocumentRepository.save(demande);
        demande.setReferenceDemande("DOC-%s-%05d".formatted(Year.now().getValue(), demande.getId()));
        return convertir(demandeDocumentRepository.save(demande));
    }

    public List<DemandeDocumentResponseDTO> lister() {
        return demandeDocumentRepository.findAll(Sort.by(Sort.Direction.DESC, "dateCreation"))
                .stream()
                .map(this::convertir)
                .toList();
    }

    public DemandeDocumentResponseDTO changerStatut(Long id, StatutDemande statut) {
        DemandeDocument demande = trouver(id);
        demande.setStatut(statut);
        return convertir(demandeDocumentRepository.save(demande));
    }

    private DemandeDocument trouver(Long id) {
        return demandeDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Demande de document introuvable avec l'id : " + id
                ));
    }

    private DemandeDocumentResponseDTO convertir(DemandeDocument demande) {
        return DemandeDocumentResponseDTO.builder()
                .id(demande.getId())
                .referenceDemande(demande.getReferenceDemande())
                .societe(demande.getSociete())
                .nomContact(demande.getNomContact())
                .email(demande.getEmail())
                .telephone(demande.getTelephone())
                .typeDocument(demande.getTypeDocument())
                .titreDocument(demande.getTitreDocument())
                .produitConcerne(demande.getProduitConcerne())
                .message(demande.getMessage())
                .statut(demande.getStatut())
                .dateCreation(demande.getDateCreation())
                .build();
    }
}
