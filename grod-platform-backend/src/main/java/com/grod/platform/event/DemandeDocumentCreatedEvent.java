package com.grod.platform.event;

import java.time.LocalDateTime;

public record DemandeDocumentCreatedEvent(
        String reference, String societe, String contact, String email, String telephone,
        String typeDocument, String titreDocument, String produit, LocalDateTime dateCreation
) {
}
