package com.grod.platform.dto;

import com.grod.platform.entity.StatutDemande;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ClientDemandeDTO {
    private Long id;
    private String referenceDemande;
    private String produitDemande;
    private Integer quantite;
    private LocalDateTime dateCreation;
    private StatutDemande statut;
    private boolean clientFidele;
}
