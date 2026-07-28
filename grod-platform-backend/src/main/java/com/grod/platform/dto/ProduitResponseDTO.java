package com.grod.platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduitResponseDTO {

    private Long id;

    private String nom;

    private String description;

    private String categorie;

    private String imageUrl;

    private String applications;

    private String dimensions;

    private String purete;

    private String normes;

    private String conditionnement;

    private boolean actif;
}
