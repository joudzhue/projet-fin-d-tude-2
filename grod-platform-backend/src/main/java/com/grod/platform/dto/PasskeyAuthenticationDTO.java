package com.grod.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasskeyAuthenticationDTO {

    @NotBlank
    private String credentialId;

    @NotBlank
    private String clientDataJSON;

    @NotBlank
    private String authenticatorData;

    @NotBlank
    private String signature;
}
