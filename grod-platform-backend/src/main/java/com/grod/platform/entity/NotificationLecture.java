package com.grod.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_lectures", uniqueConstraints = @UniqueConstraint(name = "uk_notification_lecture", columnNames = {"notification_id", "utilisateur_id"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationLecture {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    @Column(nullable = false)
    private LocalDateTime dateLecture;
}
