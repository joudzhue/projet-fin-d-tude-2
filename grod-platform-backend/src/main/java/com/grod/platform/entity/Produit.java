package com.grod.platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "produits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Column(nullable = false)
    private String nom;

    @Column(length = 1000)
    private String description;

    private String categorie;

    private String imageUrl;

    @Column(length = 1000)
    private String applications;

    private String dimensions;

    private String purete;

    private String normes;

    private String conditionnement;

    private boolean actif = true;
}
