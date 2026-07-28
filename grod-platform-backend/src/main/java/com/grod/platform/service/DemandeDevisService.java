package com.grod.platform.service;

import com.grod.platform.dto.DemandeDevisRequestDTO;
import com.grod.platform.dto.DemandeDevisResponseDTO;
import com.grod.platform.dto.ClientFideleUpdateDTO;
import com.grod.platform.entity.StatutDemande;

import java.util.List;

public interface DemandeDevisService {

    DemandeDevisResponseDTO ajouterDemande(DemandeDevisRequestDTO demandeDTO);

    List<DemandeDevisResponseDTO> listerDemandes();

    DemandeDevisResponseDTO trouverDemandeParId(Long id);

    List<DemandeDevisResponseDTO> listerDemandesParStatut(StatutDemande statut);

    DemandeDevisResponseDTO changerStatut(Long id, StatutDemande statut);

    DemandeDevisResponseDTO changerClientFidele(Long id, ClientFideleUpdateDTO clientFideleUpdateDTO);

    void supprimerDemande(Long id);
}
