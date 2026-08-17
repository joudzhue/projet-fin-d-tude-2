package com.grod.platform.dto;

import com.grod.platform.entity.NotificationReferenceType;
import com.grod.platform.entity.NotificationType;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private String titre;
    private String message;
    private boolean lue;
    private LocalDateTime dateCreation;
    private LocalDateTime dateLecture;
    private NotificationReferenceType referenceType;
    private Long referenceId;
    private String referenceCode;
    private Long clientId;
}
