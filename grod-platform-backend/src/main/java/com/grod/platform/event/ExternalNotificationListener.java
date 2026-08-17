package com.grod.platform.event;

import com.grod.platform.service.EmailNotificationService;
import com.grod.platform.service.SmsNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExternalNotificationListener {

    private final EmailNotificationService emailNotificationService;
    private final SmsNotificationService smsNotificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDevisCreated(DemandeDevisCreatedEvent event) {
        notifySafely(event.reference(), () -> emailNotificationService.notifierNouvelleDemande(event), "email");
        notifySafely(event.reference(), () -> smsNotificationService.notifierNouvelleDemande(event), "sms");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDocumentCreated(DemandeDocumentCreatedEvent event) {
        notifySafely(event.reference(), () -> emailNotificationService.notifierNouvelleDemandeDocument(event), "email");
        notifySafely(event.reference(), () -> smsNotificationService.notifierNouvelleDemandeDocument(event), "sms");
    }

    private void notifySafely(String reference, Runnable action, String channel) {
        try {
            action.run();
        } catch (RuntimeException exception) {
            log.error("External notification failed: channel={} reference={} reason={}",
                    channel, reference, exception.getClass().getSimpleName());
        }
    }
}
