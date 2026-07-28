package com.grod.platform.dto;

import com.grod.platform.entity.StatutDemande;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDevisResponseDTO {

    private Long id;

    private String referenceDemande;

    private String societe;

    private String nomContact;

    private String email;

    private String telephone;

    private String produitDemande;

    private Double pureteCuivre;

    private Double longueur;

    private Double largeur;

    private Double epaisseur;

    private Integer quantite;

    private String besoinLivraison;

    private boolean clientFidele;

    private String referenceClient;

    private String message;

    private String fichierTechniqueUrl;

    private String fichierTechniqueNom;

    private StatutDemande statut;

    private LocalDateTime dateCreation;
}
