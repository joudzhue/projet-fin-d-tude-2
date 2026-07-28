package com.grod.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasskeyRegistrationDTO {

    @NotBlank
    private String credentialId;

    @NotBlank
    private String clientDataJSON;

    @NotBlank
    private String attestationObject;
}
