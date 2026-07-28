package com.grod.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantMessageDTO {

    @NotBlank(message = "Le role du message est obligatoire")
    private String role;

    @NotBlank(message = "Le contenu du message est obligatoire")
    @Size(max = 2000, message = "Le message ne doit pas depasser 2000 caracteres")
    private String content;
}
