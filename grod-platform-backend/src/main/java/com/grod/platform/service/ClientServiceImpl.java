package com.grod.platform.service;

import com.grod.platform.dto.*;
import com.grod.platform.entity.Client;
import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.ClientRepository;
import com.grod.platform.repository.DemandeDevisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;
    private final DemandeDevisRepository demandeRepository;

    @Override
    @Transactional
    public Client trouverOuCreer(String nom, String societe, String email, String telephone) {
        String normalizedEmail = normaliserEmail(email);
        Client client = clientRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> Client.builder()
                        .nom(nom.trim()).societe(societe.trim()).email(normalizedEmail)
                        .telephone(telephone.trim()).actif(true).build());
        appliquerSiNonVide(client::setNom, nom);
        appliquerSiNonVide(client::setSociete, societe);
        appliquerSiNonVide(client::setTelephone, telephone);
        return clientRepository.save(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientListDTO> listerClients() {
        List<Client> clients = clientRepository.findAll();
        if (clients.isEmpty()) return List.of();
        Map<Long, List<DemandeDevis>> demandes = demandeRepository
                .findByClientIdIn(clients.stream().map(Client::getId).toList()).stream()
                .collect(Collectors.groupingBy(demande -> demande.getClient().getId()));
        return clients.stream().map(client -> toListDTO(client, demandes.getOrDefault(client.getId(), List.of())))
                .sorted(Comparator.comparing(ClientListDTO::getDerniereDemande,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDetailDTO trouverClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + id));
        List<DemandeDevis> demandes = demandeRepository.findByClientIdOrderByDateCreationDesc(id);
        ClientListDTO summary = toListDTO(client, demandes);
        return ClientDetailDTO.builder().id(client.getId()).nom(client.getNom()).societe(client.getSociete())
                .email(client.getEmail()).telephone(client.getTelephone()).actif(client.isActif())
                .nombreDemandes(summary.getNombreDemandes()).premiereDemande(summary.getPremiereDemande())
                .derniereDemande(summary.getDerniereDemande()).produitsDemandes(summary.getProduitsDemandes())
                .recurrent(summary.isRecurrent()).historique(demandes.stream().map(this::toDemandeDTO).toList()).build();
    }

    @Override
    @Transactional
    public int rattacherDemandesExistantes() {
        int count = 0;
        for (DemandeDevis demande : demandeRepository.findByClientIsNull()) {
            if (demande.getEmail() == null || demande.getEmail().isBlank()) continue;
            demande.setClient(trouverOuCreer(demande.getNomContact(), demande.getSociete(), demande.getEmail(), demande.getTelephone()));
            demandeRepository.save(demande);
            count++;
        }
        return count;
    }

    private ClientListDTO toListDTO(Client client, List<DemandeDevis> demandes) {
        List<DemandeDevis> dated = demandes.stream().filter(item -> item.getDateCreation() != null).toList();
        return ClientListDTO.builder().id(client.getId()).nom(client.getNom()).societe(client.getSociete())
                .email(client.getEmail()).telephone(client.getTelephone()).actif(client.isActif())
                .nombreDemandes(demandes.size())
                .nombreDemandesOuvertes(demandes.stream().filter(item -> item.getStatut() == StatutDemande.NOUVELLE || item.getStatut() == StatutDemande.EN_TRAITEMENT).count())
                .premiereDemande(dated.stream().map(DemandeDevis::getDateCreation).min(Comparator.naturalOrder()).orElse(null))
                .derniereDemande(dated.stream().map(DemandeDevis::getDateCreation).max(Comparator.naturalOrder()).orElse(null))
                .produitsDemandes(demandes.stream().map(DemandeDevis::getProduitDemande).filter(Objects::nonNull).distinct().sorted().toList())
                .recurrent(demandes.size() > 1).build();
    }

    private ClientDemandeDTO toDemandeDTO(DemandeDevis demande) {
        return ClientDemandeDTO.builder().id(demande.getId()).referenceDemande(demande.getReferenceDemande())
                .produitDemande(demande.getProduitDemande()).quantite(demande.getQuantite())
                .dateCreation(demande.getDateCreation()).statut(demande.getStatut())
                .clientFidele(demande.isClientFidele()).build();
    }

    private String normaliserEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void appliquerSiNonVide(java.util.function.Consumer<String> setter, String value) {
        if (value != null && !value.isBlank()) setter.accept(value.trim());
    }
}
