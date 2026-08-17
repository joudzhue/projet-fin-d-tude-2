package com.grod.platform.event;

import java.time.LocalDateTime;

public record DemandeDevisCreatedEvent(
        String reference, String societe, String contact, String email, String telephone,
        String produit, Integer quantite, Double purete, Double longueur, Double largeur,
        Double epaisseur, String livraison, String application, String finition, String norme,
        String diametre, String message, boolean fichierDisponible, LocalDateTime dateCreation
) {
}
