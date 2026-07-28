package com.grod.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingsDTO {

    @NotBlank(message = "L'email admin est obligatoire")
    @Email(message = "Email admin invalide")
    private String adminEmail;

    private String adminPhone;
}
