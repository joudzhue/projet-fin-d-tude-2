package com.grod.platform.service;

import com.grod.platform.entity.DemandeDevis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationSettingsService notificationSettingsService;

    @Value("${app.notifications.enabled:false}")
    private boolean notificationsEnabled;

    @Value("${app.notifications.from-email:noreply@grod.ma}")
    private String fromEmail;

    public void notifierNouvelleDemande(DemandeDevis demande) {
        if (!notificationsEnabled) {
            log.info("Notifications email desactivees. Nouvelle demande #{} non envoyee par email.", demande.getId());
            return;
        }

        Optional<JavaMailSender> mailSender = Optional.ofNullable(mailSenderProvider.getIfAvailable());

        if (mailSender.isEmpty()) {
            log.warn("Aucun JavaMailSender configure. Emails non envoyes pour la demande #{}.", demande.getId());
            return;
        }

        try {
            mailSender.get().send(buildClientConfirmation(demande));
            mailSender.get().send(buildAdminNotification(demande));
        } catch (Exception exception) {
            log.error("Impossible d envoyer les emails pour la demande #{}.", demande.getId(), exception);
        }
    }

    private SimpleMailMessage buildClientConfirmation(DemandeDevis demande) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(demande.getEmail());
        message.setSubject("G-ROD - Demande de devis recue " + getReference(demande));
        message.setText("""
                Bonjour %s,

                Votre demande de devis a bien ete recue par l equipe G-ROD.

                Reference demande: %s
                Produit: %s
                Quantite: %s

                Notre equipe commerciale va analyser votre besoin et vous recontacter.
                Contact commercial: %s - %s

                Cordialement,
                Equipe G-ROD
                """.formatted(
                demande.getNomContact(),
                demande.getId(),
                demande.getProduitDemande(),
                demande.getQuantite(),
                notificationSettingsService.getAdminEmail(),
                notificationSettingsService.getAdminPhone()
        ));

        return message;
    }

    private SimpleMailMessage buildAdminNotification(DemandeDevis demande) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(notificationSettingsService.getAdminEmail());
        message.setSubject("Nouvelle demande de devis G-ROD " + getReference(demande));
        message.setText(buildAdminBody(demande));

        return message;
    }

    private String buildAdminBody(DemandeDevis demande) {
        StringBuilder builder = new StringBuilder();
        builder.append("Nouvelle demande de devis recue.\n\n");
        builder.append("Reference: ").append(getReference(demande)).append('\n');
        builder.append("Societe: ").append(demande.getSociete()).append('\n');
        builder.append("Contact: ").append(demande.getNomContact()).append('\n');
        builder.append("Email: ").append(demande.getEmail()).append('\n');
        builder.append("Telephone: ").append(demande.getTelephone()).append("\n\n");
        builder.append("Client fidele: ").append(demande.isClientFidele() ? "Oui" : "Non").append('\n');
        appendIfPresent(builder, "Reference client", demande.getReferenceClient());
        builder.append("Produit: ").append(demande.getProduitDemande()).append('\n');
        builder.append("Quantite: ").append(demande.getQuantite()).append('\n');
        appendIfPresent(builder, "Purete cuivre", demande.getPureteCuivre());
        appendIfPresent(builder, "Longueur", demande.getLongueur());
        appendIfPresent(builder, "Largeur", demande.getLargeur());
        appendIfPresent(builder, "Epaisseur", demande.getEpaisseur());
        appendIfPresent(builder, "Besoin livraison", demande.getBesoinLivraison());
        appendIfPresent(builder, "Fichier technique", demande.getFichierTechniqueUrl());

        if (StringUtils.hasText(demande.getMessage())) {
            builder.append("\nMessage client:\n").append(demande.getMessage()).append('\n');
        }

        return builder.toString();
    }

    private String getReference(DemandeDevis demande) {
        return StringUtils.hasText(demande.getReferenceDemande())
                ? demande.getReferenceDemande()
                : "#" + demande.getId();
    }

    private void appendIfPresent(StringBuilder builder, String label, Object value) {
        if (value == null) {
            return;
        }

        if (value instanceof String text && !StringUtils.hasText(text)) {
            return;
        }

        builder.append(label).append(": ").append(value).append('\n');
    }
}
