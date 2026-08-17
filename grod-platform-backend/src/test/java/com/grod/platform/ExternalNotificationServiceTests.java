package com.grod.platform;

import com.grod.platform.event.DemandeDevisCreatedEvent;
import com.grod.platform.event.DemandeDocumentCreatedEvent;
import com.grod.platform.service.EmailNotificationService;
import com.grod.platform.service.NotificationSettingsService;
import com.grod.platform.service.SmsGateway;
import com.grod.platform.service.SmsNotificationService;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.*;

class ExternalNotificationServiceTests {

    @Test
    void emailAbsentEstIgnore() {
        JavaMailSender sender = mock(JavaMailSender.class);
        EmailNotificationService service = emailService(sender, false);
        service.notifierNouvelleDemande(devis());
        verifyNoInteractions(sender);
    }

    @Test
    void emailDevisUtiliseLaReferenceEtEnvoieUneFoisALAdminEtAuClient() throws Exception {
        JavaMailSender sender = mock(JavaMailSender.class);
        JavaMailSenderImpl messageFactory = new JavaMailSenderImpl();
        when(sender.createMimeMessage()).thenAnswer(invocation -> messageFactory.createMimeMessage());
        EmailNotificationService service = emailService(sender, true);

        service.notifierNouvelleDemande(devis());

        var captor = org.mockito.ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender, times(2)).send(captor.capture());
        assertThat(captor.getAllValues().getFirst().getSubject()).contains("GROD-2026-00015");
    }

    @Test
    void erreurEmailNeRemontePas() {
        JavaMailSender sender = mock(JavaMailSender.class);
        when(sender.createMimeMessage()).thenThrow(new IllegalStateException("smtp indisponible"));
        EmailNotificationService service = emailService(sender, true);
        org.assertj.core.api.Assertions.assertThatCode(() -> service.notifierNouvelleDemande(devis())).doesNotThrowAnyException();
    }

    @Test
    void smsAbsentNestPasAppele() throws Exception {
        SmsGateway gateway = mock(SmsGateway.class);
        SmsNotificationService service = smsService(gateway, false);
        service.notifierNouvelleDemande(devis());
        verify(gateway, never()).send(any(), any());
    }

    @Test
    void smsDevisEstAppeleeUneFoisAvecLaReference() throws Exception {
        SmsGateway gateway = mock(SmsGateway.class);
        when(gateway.isConfigured()).thenReturn(true);
        SmsNotificationService service = smsService(gateway, true);
        service.notifierNouvelleDemande(devis());
        verify(gateway).send(eq("+212600000000"), contains("GROD-2026-00015"));
    }

    @Test
    void erreurSmsNeRemontePasEtDocumentUtiliseSaReference() throws Exception {
        SmsGateway gateway = mock(SmsGateway.class);
        when(gateway.isConfigured()).thenReturn(true);
        doThrow(new IllegalStateException("twilio indisponible")).when(gateway).send(any(), any());
        SmsNotificationService service = smsService(gateway, true);
        var document = new DemandeDocumentCreatedEvent("DOC-2026-00004", "ABC", "Contact", "c@abc.ma",
                "+212611111111", "Fiche technique", "Fiche", "Copper Rod", LocalDateTime.now());
        org.assertj.core.api.Assertions.assertThatCode(() -> service.notifierNouvelleDemandeDocument(document)).doesNotThrowAnyException();
        verify(gateway).send(eq("+212600000000"), contains("DOC-2026-00004"));
    }

    @SuppressWarnings("unchecked")
    private EmailNotificationService emailService(JavaMailSender sender, boolean enabled) {
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        NotificationSettingsService settings = mock(NotificationSettingsService.class);
        when(settings.getAdminEmail()).thenReturn("alerts@grod.ma");
        EmailNotificationService service = new EmailNotificationService(provider, settings);
        ReflectionTestUtils.setField(service, "enabled", enabled);
        ReflectionTestUtils.setField(service, "smtpHost", enabled ? "smtp.example.test" : "");
        ReflectionTestUtils.setField(service, "fromEmail", "noreply@grod.ma");
        return service;
    }

    private SmsNotificationService smsService(SmsGateway gateway, boolean enabled) {
        NotificationSettingsService settings = mock(NotificationSettingsService.class);
        when(settings.getAdminPhone()).thenReturn("+212600000000");
        SmsNotificationService service = new SmsNotificationService(settings, gateway);
        ReflectionTestUtils.setField(service, "enabled", enabled);
        return service;
    }

    private DemandeDevisCreatedEvent devis() {
        return new DemandeDevisCreatedEvent("GROD-2026-00015", "ABC", "Contact", "client@abc.ma",
                "+212611111111", "Copper Rod", 5, 99.9, null, null, null, null,
                null, null, null, null, "Besoin urgent", true, LocalDateTime.now());
    }
}
