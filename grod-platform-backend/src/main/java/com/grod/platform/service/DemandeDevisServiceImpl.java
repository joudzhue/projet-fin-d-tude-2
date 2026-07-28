package com.grod.platform.service;

import com.grod.platform.dto.ClientFideleUpdateDTO;
import com.grod.platform.dto.DemandeDevisRequestDTO;
import com.grod.platform.dto.DemandeDevisResponseDTO;
import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.DemandeDevisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeDevisServiceImpl implements DemandeDevisService {

    private final DemandeDevisRepository demandeDevisRepository;
    private final EmailNotificationService emailNotificationService;
    private final SmsNotificationService smsNotificationService;

    @Override
    public DemandeDevisResponseDTO ajouterDemande(DemandeDevisRequestDTO demandeDTO) {

        DemandeDevis demande = DemandeDevis.builder()
                .societe(demandeDTO.getSociete())
                .nomContact(demandeDTO.getNomContact())
                .email(demandeDTO.getEmail())
                .telephone(demandeDTO.getTelephone())
                .produitDemande(demandeDTO.getProduitDemande())
                .pureteCuivre(demandeDTO.getPureteCuivre())
                .longueur(demandeDTO.getLongueur())
                .largeur(demandeDTO.getLargeur())
                .epaisseur(demandeDTO.getEpaisseur())
                .quantite(demandeDTO.getQuantite())
                .besoinLivraison(demandeDTO.getBesoinLivraison())
                .clientFidele(demandeDTO.isClientFidele())
                .referenceClient(demandeDTO.getReferenceClient())
                .message(demandeDTO.getMessage())
                .fichierTechniqueUrl(demandeDTO.getFichierTechniqueUrl())
                .fichierTechniqueNom(demandeDTO.getFichierTechniqueNom())
                .statut(StatutDemande.NOUVELLE)
                .build();

        DemandeDevis savedDemande = demandeDevisRepository.save(demande);
        savedDemande.setReferenceDemande(genererReferenceDemande(savedDemande));
        savedDemande = demandeDevisRepository.save(savedDemande);

        emailNotificationService.notifierNouvelleDemande(savedDemande);
        smsNotificationService.notifierNouvelleDemande(savedDemande);

        return convertirEnResponseDTO(savedDemande);
    }

    @Override
    public List<DemandeDevisResponseDTO> listerDemandes() {
        return demandeDevisRepository.findAll()
                .stream()
                .map(this::convertirEnResponseDTO)
                .toList();
    }

    @Override
    public DemandeDevisResponseDTO trouverDemandeParId(Long id) {
        DemandeDevis demande = trouverEntityParId(id);

        return convertirEnResponseDTO(demande);
    }

    @Override
    public List<DemandeDevisResponseDTO> listerDemandesParStatut(StatutDemande statut) {
        return demandeDevisRepository.findByStatut(statut)
                .stream()
                .map(this::convertirEnResponseDTO)
                .toList();
    }

    @Override
    public DemandeDevisResponseDTO changerStatut(Long id, StatutDemande statut) {
        DemandeDevis demande = trouverEntityParId(id);

        demande.setStatut(statut);

        DemandeDevis updatedDemande = demandeDevisRepository.save(demande);

        return convertirEnResponseDTO(updatedDemande);
    }

    @Override
    public DemandeDevisResponseDTO changerClientFidele(Long id, ClientFideleUpdateDTO clientFideleUpdateDTO) {
        DemandeDevis demande = trouverEntityParId(id);

        demande.setClientFidele(clientFideleUpdateDTO.isClientFidele());
        demande.setReferenceClient(
                clientFideleUpdateDTO.isClientFidele()
                        ? clientFideleUpdateDTO.getReferenceClient()
                        : null
        );

        DemandeDevis updatedDemande = demandeDevisRepository.save(demande);

        return convertirEnResponseDTO(updatedDemande);
    }

    @Override
    public void supprimerDemande(Long id) {
        DemandeDevis demande = trouverEntityParId(id);

        demandeDevisRepository.delete(demande);
    }

    private DemandeDevis trouverEntityParId(Long id) {
        return demandeDevisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de devis introuvable avec l'id : " + id));
    }

    private DemandeDevisResponseDTO convertirEnResponseDTO(DemandeDevis demande) {
        return DemandeDevisResponseDTO.builder()
                .id(demande.getId())
                .referenceDemande(getReferenceDemande(demande))
                .societe(demande.getSociete())
                .nomContact(demande.getNomContact())
                .email(demande.getEmail())
                .telephone(demande.getTelephone())
                .produitDemande(demande.getProduitDemande())
                .pureteCuivre(demande.getPureteCuivre())
                .longueur(demande.getLongueur())
                .largeur(demande.getLargeur())
                .epaisseur(demande.getEpaisseur())
                .quantite(demande.getQuantite())
                .besoinLivraison(demande.getBesoinLivraison())
                .clientFidele(demande.isClientFidele())
                .referenceClient(demande.getReferenceClient())
                .message(demande.getMessage())
                .fichierTechniqueUrl(demande.getFichierTechniqueUrl())
                .fichierTechniqueNom(demande.getFichierTechniqueNom())
                .statut(demande.getStatut())
                .dateCreation(demande.getDateCreation())
                .build();
    }

    private String genererReferenceDemande(DemandeDevis demande) {
        return "GROD-%s-%05d".formatted(Year.now().getValue(), demande.getId());
    }

    private String getReferenceDemande(DemandeDevis demande) {
        if (demande.getReferenceDemande() != null && !demande.getReferenceDemande().isBlank()) {
            return demande.getReferenceDemande();
        }

        return genererReferenceDemande(demande);
    }
}
