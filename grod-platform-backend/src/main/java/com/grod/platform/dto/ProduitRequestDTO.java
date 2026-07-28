package com.grod.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduitRequestDTO {

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    private String description;

    private String categorie;

    private String imageUrl;

    private String applications;

    private String dimensions;

    private String purete;

    private String normes;

    private String conditionnement;

    private boolean actif = true;
}
