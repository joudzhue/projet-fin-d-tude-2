package com.grod.platform.service;

import com.grod.platform.event.DemandeDevisCreatedEvent;
import com.grod.platform.event.DemandeDocumentCreatedEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationSettingsService settings;

    @Value("${app.notifications.email.enabled:${app.notifications.enabled:false}}")
    private boolean enabled;
    @Value("${spring.mail.host:}")
    private String smtpHost;
    @Value("${app.notifications.from-email:}")
    private String fromEmail;

    public void notifierNouvelleDemande(DemandeDevisCreatedEvent event) {
        JavaMailSender sender = senderOrNull(event.reference());
        if (sender == null) return;
        send(sender, settings.getAdminEmail(), subject("Nouvelle demande de devis", event.reference()), devisHtml(event), event.reference());
        // Cette confirmation client existait avant l'étape 6 : elle est conservée, désormais après commit.
        send(sender, event.email(), "[G-ROD] Demande de devis reçue — " + safeHeader(event.reference()),
                clientHtml(event), event.reference());
    }

    public void notifierNouvelleDemandeDocument(DemandeDocumentCreatedEvent event) {
        JavaMailSender sender = senderOrNull(event.reference());
        if (sender == null) return;
        String body = fields("Nouvelle demande de document",
                "Référence", event.reference(), "Société", event.societe(), "Contact", event.contact(),
                "Email", event.email(), "Téléphone", event.telephone(), "Type de document", event.typeDocument(),
                "Titre", event.titreDocument(), "Produit concerné", event.produit(), "Date", format(event.dateCreation()));
        send(sender, settings.getAdminEmail(), subject("Nouvelle demande de document", event.reference()), body, event.reference());
    }

    private JavaMailSender senderOrNull(String reference) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (!enabled || !StringUtils.hasText(smtpHost) || sender == null || !StringUtils.hasText(fromEmail)) {
            log.info("Email notification skipped: SMTP not configured reference={}", reference);
            return null;
        }
        return sender;
    }

    private void send(JavaMailSender sender, String recipient, String subject, String html, String reference) {
        if (!StringUtils.hasText(recipient)) {
            log.warn("Email notification skipped: recipient not configured reference={}", reference);
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(message);
            log.info("External notification sent: channel=email reference={} recipient={}", reference, maskEmail(recipient));
        } catch (Exception exception) {
            log.error("External notification failed: channel=email reference={} recipient={} reason={}",
                    reference, maskEmail(recipient), exception.getClass().getSimpleName());
        }
    }

    private String devisHtml(DemandeDevisCreatedEvent e) {
        String html = fields("Nouvelle demande de devis", "Référence", e.reference(), "Société", e.societe(),
                "Contact", e.contact(), "Email", e.email(), "Téléphone", e.telephone(), "Produit", e.produit(),
                "Quantité", e.quantite(), "Pureté", e.purete(), "Longueur", e.longueur(), "Largeur", e.largeur(),
                "Épaisseur", e.epaisseur(), "Livraison", e.livraison(), "Application", e.application(),
                "Finition", e.finition(), "Norme", e.norme(), "Diamètre", e.diametre(),
                "Message client", e.message(), "Date", format(e.dateCreation()));
        return e.fichierDisponible() ? html.replace("</div>", "<p><strong>Plan :</strong> un fichier est disponible dans l’Admin.</p></div>") : html;
    }

    private String clientHtml(DemandeDevisCreatedEvent e) {
        return fields("Votre demande a bien été reçue", "Référence", e.reference(), "Produit", e.produit(),
                "Quantité", e.quantite(), "Contact G-ROD", settings.getAdminEmail());
    }

    private String fields(String title, Object... values) {
        StringBuilder html = new StringBuilder("<div style=\"font-family:Arial,sans-serif;max-width:640px;color:#173b2d\"><h2>G-ROD — ")
                .append(escape(title)).append("</h2><table style=\"border-collapse:collapse;width:100%\">");
        for (int i = 0; i < values.length; i += 2) {
            Object value = values[i + 1];
            if (value != null && StringUtils.hasText(value.toString())) {
                html.append("<tr><td style=\"padding:6px;font-weight:bold\">").append(escape(values[i].toString()))
                        .append("</td><td style=\"padding:6px\">").append(escape(value.toString())).append("</td></tr>");
            }
        }
        return html.append("</table><p>Consultez l’espace Admin G-ROD pour traiter la demande.</p></div>").toString();
    }

    private String subject(String type, String reference) { return "[G-ROD] " + type + " — " + safeHeader(reference); }
    private String safeHeader(String value) { return value == null ? "" : value.replace("\r", "").replace("\n", ""); }
    private String format(java.time.LocalDateTime value) { return value == null ? null : DATE_FORMAT.format(value); }
    private String escape(String value) { return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;"); }
    private String maskEmail(String value) {
        int at = value.indexOf('@');
        return at > 1 ? value.charAt(0) + "***" + value.substring(at) : "***";
    }
}
