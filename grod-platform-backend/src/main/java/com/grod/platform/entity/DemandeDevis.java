package com.grod.platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_devis", indexes = {
        @Index(name="idx_devis_statut_date", columnList="statut,dateCreation"),
        @Index(name="idx_devis_email", columnList="email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDevis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String referenceDemande;

    @NotBlank(message = "Le nom de la société est obligatoire")
    @Column(nullable = false)
    private String societe;

    @NotBlank(message = "Le nom du contact est obligatoire")
    @Column(nullable = false)
    private String nomContact;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Column(nullable = false)
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Column(nullable = false)
    private String telephone;

    @NotBlank(message = "Le produit demandé est obligatoire")
    @Column(nullable = false)
    private String produitDemande;

    private Long produitId;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "client_id")
    private Client client;

    private Double pureteCuivre;

    private Double longueur;

    private Double largeur;

    private Double epaisseur;

    @NotNull(message = "La quantité est obligatoire")
    private Integer quantite;

    private String besoinLivraison;

    @Column(length = 1000)
    private String applicationProjet;

    private String finitionSouhaitee;

    private String normeReference;

    @Column(length = 1000)
    private String lienPlanTechnique;

    private String diametreSouhaite;

    private boolean clientFidele;

    private String referenceClient;

    @Column(length = 2000)
    private String message;

    private String fichierTechniqueUrl;

    private String fichierTechniqueNom;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.NOUVELLE;

    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();

        if (this.statut == null) {
            this.statut = StatutDemande.NOUVELLE;
        }
    }
}
