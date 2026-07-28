package com.grod.platform.service;

import com.grod.platform.entity.DemandeDevis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationService {

    private final NotificationSettingsService notificationSettingsService;

    @Value("${app.notifications.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.notifications.sms.twilio-account-sid:}")
    private String twilioAccountSid;

    @Value("${app.notifications.sms.twilio-auth-token:}")
    private String twilioAuthToken;

    @Value("${app.notifications.sms.twilio-from-number:}")
    private String twilioFromNumber;

    public void notifierNouvelleDemande(DemandeDevis demande) {
        if (!smsEnabled) {
            log.info("Notifications SMS desactivees. Demande #{} non envoyee par SMS.", demande.getId());
            return;
        }

        String adminPhone = notificationSettingsService.getAdminPhone();
        if (!StringUtils.hasText(adminPhone)) {
            log.warn("Aucun numero admin configure. SMS non envoye pour la demande #{}.", demande.getId());
            return;
        }

        if (!isTwilioConfigured()) {
            log.warn("Configuration Twilio incomplete. SMS non envoye pour la demande #{}.", demande.getId());
            return;
        }

        try {
            sendTwilioSms(adminPhone, buildSmsBody(demande));
        } catch (IOException exception) {
            log.error("Impossible d envoyer le SMS pour la demande #{}.", demande.getId(), exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.error("Envoi SMS interrompu pour la demande #{}.", demande.getId(), exception);
        }
    }

    private boolean isTwilioConfigured() {
        return StringUtils.hasText(twilioAccountSid)
                && StringUtils.hasText(twilioAuthToken)
                && StringUtils.hasText(twilioFromNumber);
    }

    private void sendTwilioSms(String toPhone, String body) throws IOException, InterruptedException {
        String endpoint = "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json"
                .formatted(twilioAccountSid);
        String formBody = "To=%s&From=%s&Body=%s".formatted(
                encode(toPhone),
                encode(twilioFromNumber),
                encode(body)
        );
        String auth = Base64.getEncoder()
                .encodeToString((twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 300) {
            log.error("Twilio a refuse le SMS. Status: {} Body: {}", response.statusCode(), response.body());
        }
    }

    private String buildSmsBody(DemandeDevis demande) {
        return "Nouvelle demande G-ROD %s - %s - %s - Qty: %s - %s"
                .formatted(
                        StringUtils.hasText(demande.getReferenceDemande()) ? demande.getReferenceDemande() : "#" + demande.getId(),
                        demande.getSociete(),
                        demande.getProduitDemande(),
                        demande.getQuantite(),
                        demande.getTelephone()
                );
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
