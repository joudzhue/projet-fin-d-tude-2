package com.grod.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTechniqueRequestDTO {

    @NotBlank(message = "Le titre du document est obligatoire")
    @Size(max = 255) private String titre;

    @NotBlank(message = "Le type de document est obligatoire")
    @Size(max = 255) private String typeDocument;

    @Size(max = 255) private String produitConcerne;

    @Size(max = 1000) private String description;

    @NotBlank(message = "Le fichier PDF est obligatoire")
    @Size(max = 255) private String fichierUrl;

    @NotBlank(message = "Le nom du fichier est obligatoire")
    @Size(max = 255) private String fichierNom;

    private boolean actif;

    private boolean telechargementPublic;
}
