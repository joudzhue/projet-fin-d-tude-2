package com.grod.platform.dto;

import com.grod.platform.entity.StatutDemande;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDocumentResponseDTO {

    private Long id;
    private String referenceDemande;
    private String societe;
    private String nomContact;
    private String email;
    private String telephone;
    private String typeDocument;
    private String titreDocument;
    private String produitConcerne;
    private String message;
    private StatutDemande statut;
    private LocalDateTime dateCreation;
}
