package com.grod.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDevisRequestDTO {

    @NotBlank(message = "Le nom de la société est obligatoire")
    private String societe;

    @NotBlank(message = "Le nom du contact est obligatoire")
    private String nomContact;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @NotBlank(message = "Le produit demandé est obligatoire")
    private String produitDemande;

    @DecimalMin(value = "50.0", message = "La purete du cuivre doit etre au minimum 50%")
    @DecimalMax(value = "99.99", message = "La purete du cuivre doit etre au maximum 99,99%")
    private Double pureteCuivre;

    private Double longueur;

    private Double largeur;

    private Double epaisseur;

    @NotNull(message = "La quantité est obligatoire")
    private Integer quantite;

    private String besoinLivraison;

    private boolean clientFidele;

    private String referenceClient;

    private String message;

    private String fichierTechniqueUrl;

    private String fichierTechniqueNom;
}
