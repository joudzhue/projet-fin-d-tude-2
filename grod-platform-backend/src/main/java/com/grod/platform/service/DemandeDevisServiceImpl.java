package com.grod.platform.service;

import com.grod.platform.dto.ClientFideleUpdateDTO;
import com.grod.platform.dto.DemandeDevisRequestDTO;
import com.grod.platform.dto.DemandeDevisResponseDTO;
import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.event.DemandeDevisCreatedEvent;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.DemandeDevisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.Resource;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeDevisServiceImpl implements DemandeDevisService {

    private final DemandeDevisRepository demandeDevisRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StoredFileService storedFileService;
    private final ClientService clientService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public DemandeDevisResponseDTO ajouterDemande(DemandeDevisRequestDTO demandeDTO) {

        String fichierTechniqueUrl = storedFileService.promoteTemporaryQuote(demandeDTO.getFichierTechniqueUrl());

        DemandeDevis demande = DemandeDevis.builder()
                .societe(demandeDTO.getSociete())
                .nomContact(demandeDTO.getNomContact())
                .email(demandeDTO.getEmail())
                .telephone(demandeDTO.getTelephone())
                .produitDemande(demandeDTO.getProduitDemande())
                .produitId(demandeDTO.getProduitId())
                .client(clientService.trouverOuCreer(demandeDTO.getNomContact(), demandeDTO.getSociete(), demandeDTO.getEmail(), demandeDTO.getTelephone()))
                .pureteCuivre(demandeDTO.getPureteCuivre())
                .longueur(demandeDTO.getLongueur())
                .largeur(demandeDTO.getLargeur())
                .epaisseur(demandeDTO.getEpaisseur())
                .quantite(demandeDTO.getQuantite())
                .besoinLivraison(demandeDTO.getBesoinLivraison())
                .applicationProjet(demandeDTO.getApplicationProjet())
                .finitionSouhaitee(demandeDTO.getFinitionSouhaitee())
                .normeReference(demandeDTO.getNormeReference())
                .lienPlanTechnique(demandeDTO.getLienPlanTechnique())
                .diametreSouhaite(demandeDTO.getDiametreSouhaite())
                .clientFidele(demandeDTO.isClientFidele())
                .referenceClient(demandeDTO.getReferenceClient())
                .message(demandeDTO.getMessage())
                .fichierTechniqueUrl(fichierTechniqueUrl)
                .fichierTechniqueNom(demandeDTO.getFichierTechniqueNom())
                .statut(StatutDemande.NOUVELLE)
                .build();

        DemandeDevis savedDemande = demandeDevisRepository.save(demande);
        savedDemande.setReferenceDemande(genererReferenceDemande(savedDemande));
        savedDemande = demandeDevisRepository.save(savedDemande);

        notificationService.notifierNouveauDevis(savedDemande);

        eventPublisher.publishEvent(toCreatedEvent(savedDemande));

        return convertirEnResponseDTO(savedDemande);
    }

    private DemandeDevisCreatedEvent toCreatedEvent(DemandeDevis demande) {
        return new DemandeDevisCreatedEvent(demande.getReferenceDemande(), demande.getSociete(),
                demande.getNomContact(), demande.getEmail(), demande.getTelephone(), demande.getProduitDemande(),
                demande.getQuantite(), demande.getPureteCuivre(), demande.getLongueur(), demande.getLargeur(),
                demande.getEpaisseur(), demande.getBesoinLivraison(), demande.getApplicationProjet(),
                demande.getFinitionSouhaitee(), demande.getNormeReference(), demande.getDiametreSouhaite(),
                demande.getMessage(), demande.getFichierTechniqueUrl() != null, demande.getDateCreation());
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
    public Resource chargerPieceJointe(Long id) {
        return storedFileService.loadQuoteDocument(trouverEntityParId(id).getFichierTechniqueUrl());
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
        storedFileService.deleteManagedFile(demande.getFichierTechniqueUrl(), "quotes");
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
                .produitId(demande.getProduitId())
                .clientId(demande.getClient() == null ? null : demande.getClient().getId())
                .pureteCuivre(demande.getPureteCuivre())
                .longueur(demande.getLongueur())
                .largeur(demande.getLargeur())
                .epaisseur(demande.getEpaisseur())
                .quantite(demande.getQuantite())
                .besoinLivraison(demande.getBesoinLivraison())
                .applicationProjet(demande.getApplicationProjet())
                .finitionSouhaitee(demande.getFinitionSouhaitee())
                .normeReference(demande.getNormeReference())
                .lienPlanTechnique(demande.getLienPlanTechnique())
                .diametreSouhaite(demande.getDiametreSouhaite())
                .clientFidele(demande.isClientFidele())
                .referenceClient(demande.getReferenceClient())
                .message(demande.getMessage())
                .fichierTechniqueUrl(demande.getFichierTechniqueUrl() == null ? null : "/api/demandes-devis/" + demande.getId() + "/attachment")
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
