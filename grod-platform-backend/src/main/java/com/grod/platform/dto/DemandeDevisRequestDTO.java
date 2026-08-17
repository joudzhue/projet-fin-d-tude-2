package com.grod.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDevisRequestDTO {

    @NotBlank(message = "Le nom de la société est obligatoire")
    @Size(max = 255) private String societe;

    @NotBlank(message = "Le nom du contact est obligatoire")
    @Size(max = 255) private String nomContact;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Size(max = 255) private String email;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[+0-9][0-9 .()\\-]{6,24}$", message = "Telephone invalide")
    private String telephone;

    @NotBlank(message = "Le produit demandé est obligatoire")
    @Size(max = 255) private String produitDemande;

    private Long produitId;

    @DecimalMin(value = "50.0", message = "La purete du cuivre doit etre au minimum 50%")
    @DecimalMax(value = "99.99", message = "La purete du cuivre doit etre au maximum 99,99%")
    private Double pureteCuivre;

    @Positive private Double longueur;

    @Positive private Double largeur;

    @Positive private Double epaisseur;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantite doit etre strictement positive") private Integer quantite;

    @Size(max = 255) private String besoinLivraison;

    @Size(max = 1000) private String applicationProjet;

    @Size(max = 255) private String finitionSouhaitee;

    @Size(max = 255) private String normeReference;

    @Size(max = 1000) private String lienPlanTechnique;

    @Size(max = 255) private String diametreSouhaite;

    private boolean clientFidele;

    @Size(max = 255) private String referenceClient;

    @Size(max = 2000) private String message;

    @Size(max = 255) private String fichierTechniqueUrl;

    @Size(max = 255) private String fichierTechniqueNom;
}
