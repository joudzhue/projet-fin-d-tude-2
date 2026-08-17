package com.grod.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDocumentRequestDTO {

    @NotBlank(message = "Le nom de la societe est obligatoire")
    @Size(max = 255) private String societe;

    @NotBlank(message = "Le nom du contact est obligatoire")
    @Size(max = 255) private String nomContact;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Size(max = 255) private String email;

    @NotBlank(message = "Le telephone est obligatoire")
    @Pattern(regexp = "^[+0-9][0-9 .()\\-]{6,24}$", message = "Telephone invalide")
    private String telephone;

    @NotBlank(message = "Le type de document est obligatoire")
    @Size(max = 100) private String typeDocument;

    @NotBlank(message = "Le document demande est obligatoire")
    @Size(max = 255) private String titreDocument;

    @Size(max = 255) private String produitConcerne;

    @Size(max = 2000) private String message;
}
