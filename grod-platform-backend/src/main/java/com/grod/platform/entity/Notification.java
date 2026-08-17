package com.grod.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name="idx_notification_date", columnList="dateCreation"),
        @Index(name="idx_notification_type_reference", columnList="type,referenceType")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private NotificationType type;
    @Column(nullable = false)
    private String titre;
    @Column(nullable = false, length = 1000)
    private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private NotificationReferenceType referenceType;
    @Column(nullable = false)
    private Long referenceId;
    private String referenceCode;
    private Long clientId;
    @Column(nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist void prePersist() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }
}
