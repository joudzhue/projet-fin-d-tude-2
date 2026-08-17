package com.grod.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clients", uniqueConstraints = @UniqueConstraint(name = "uk_clients_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String societe;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String telephone;

    @Builder.Default
    private boolean actif = true;

    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;

    @PrePersist
    void prePersist() {
        dateCreation = LocalDateTime.now();
        dateMiseAJour = dateCreation;
    }

    @PreUpdate
    void preUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}
