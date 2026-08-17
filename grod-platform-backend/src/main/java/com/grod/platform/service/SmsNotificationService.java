package com.grod.platform.service;

import com.grod.platform.event.DemandeDevisCreatedEvent;
import com.grod.platform.event.DemandeDocumentCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationService {
    private final NotificationSettingsService settings;
    private final SmsGateway gateway;
    @Value("${app.notifications.sms.enabled:false}") private boolean enabled;

    public void notifierNouvelleDemande(DemandeDevisCreatedEvent event) {
        send(event.reference(), "G-ROD: nouvelle demande %s - %s - %s - Qté %s. Voir l'Admin."
                .formatted(event.reference(), event.societe(), event.produit(), event.quantite()));
    }

    public void notifierNouvelleDemandeDocument(DemandeDocumentCreatedEvent event) {
        send(event.reference(), "G-ROD: nouvelle demande document %s - %s. Voir l'Admin."
                .formatted(event.reference(), event.societe()));
    }

    private void send(String reference, String body) {
        String recipient = settings.getAdminPhone();
        if (!enabled || !gateway.isConfigured() || !StringUtils.hasText(recipient)) {
            log.info("SMS notification skipped: Twilio not configured reference={}", reference);
            return;
        }
        try {
            gateway.send(recipient, body.length() > 320 ? body.substring(0, 320) : body);
            log.info("External notification sent: channel=sms reference={} recipient={}", reference, maskPhone(recipient));
        } catch (Exception exception) {
            if (exception instanceof InterruptedException) Thread.currentThread().interrupt();
            log.error("External notification failed: channel=sms reference={} recipient={} reason={}",
                    reference, maskPhone(recipient), exception.getClass().getSimpleName());
        }
    }

    private String maskPhone(String value) {
        String compact = value.replaceAll("\\s+", "");
        return compact.length() > 4 ? "***" + compact.substring(compact.length() - 4) : "***";
    }
}
