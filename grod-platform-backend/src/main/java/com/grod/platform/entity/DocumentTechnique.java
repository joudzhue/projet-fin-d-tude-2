package com.grod.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents_techniques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTechnique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String typeDocument;

    private String produitConcerne;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String fichierUrl;

    @Column(nullable = false)
    private String fichierNom;

    private boolean actif;

    private boolean telechargementPublic;

    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        dateCreation = LocalDateTime.now();
    }
}
