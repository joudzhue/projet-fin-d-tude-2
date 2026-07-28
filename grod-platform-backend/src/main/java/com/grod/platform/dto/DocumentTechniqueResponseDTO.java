package com.grod.platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTechniqueResponseDTO {

    private Long id;
    private String titre;
    private String typeDocument;
    private String produitConcerne;
    private String description;
    private String fichierUrl;
    private String fichierNom;
    private boolean actif;
    private boolean telechargementPublic;
    private LocalDateTime dateCreation;
}
