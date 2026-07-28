package com.grod.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDocumentRequestDTO {

    @NotBlank(message = "Le nom de la societe est obligatoire")
    private String societe;

    @NotBlank(message = "Le nom du contact est obligatoire")
    private String nomContact;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le telephone est obligatoire")
    private String telephone;

    @NotBlank(message = "Le type de document est obligatoire")
    private String typeDocument;

    @NotBlank(message = "Le document demande est obligatoire")
    private String titreDocument;

    private String produitConcerne;

    private String message;
}
