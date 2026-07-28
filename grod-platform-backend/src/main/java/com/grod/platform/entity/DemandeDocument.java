package com.grod.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String referenceDemande;

    @Column(nullable = false)
    private String societe;

    @Column(nullable = false)
    private String nomContact;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String typeDocument;

    @Column(nullable = false)
    private String titreDocument;

    private String produitConcerne;

    @Column(length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut;

    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        dateCreation = LocalDateTime.now();
        if (statut == null) {
            statut = StatutDemande.NOUVELLE;
        }
    }
}
