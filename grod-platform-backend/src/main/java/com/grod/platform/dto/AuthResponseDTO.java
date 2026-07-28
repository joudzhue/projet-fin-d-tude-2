package com.grod.platform.dto;

import com.grod.platform.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;

    private String type;

    private long expiresIn;

    private String email;

    private String nomComplet;

    private Role role;
}
