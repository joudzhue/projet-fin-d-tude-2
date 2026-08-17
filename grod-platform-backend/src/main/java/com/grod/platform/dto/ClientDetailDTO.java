package com.grod.platform.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ClientDetailDTO {
    private Long id;
    private String nom;
    private String societe;
    private String email;
    private String telephone;
    private boolean actif;
    private long nombreDemandes;
    private LocalDateTime premiereDemande;
    private LocalDateTime derniereDemande;
    private List<String> produitsDemandes;
    private List<ClientDemandeDTO> historique;
    private boolean recurrent;
}
