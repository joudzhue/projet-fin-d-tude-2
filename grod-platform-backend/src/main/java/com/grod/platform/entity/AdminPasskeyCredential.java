package com.grod.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_passkey_credentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPasskeyCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, unique = true, length = 500)
    private String credentialId;

    @Lob
    @Column(nullable = false)
    private String publicKeyCose;

    private long signCount;

    private boolean active;
}
