package com.grod.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTechniqueRequestDTO {

    @NotBlank(message = "Le titre du document est obligatoire")
    private String titre;

    @NotBlank(message = "Le type de document est obligatoire")
    private String typeDocument;

    private String produitConcerne;

    private String description;

    @NotBlank(message = "Le fichier PDF est obligatoire")
    private String fichierUrl;

    @NotBlank(message = "Le nom du fichier est obligatoire")
    private String fichierNom;

    private boolean actif;

    private boolean telechargementPublic;
}
