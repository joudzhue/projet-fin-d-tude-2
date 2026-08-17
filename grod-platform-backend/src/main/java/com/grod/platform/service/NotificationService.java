package com.grod.platform.service;

import com.grod.platform.dto.NotificationDTO;
import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.DemandeDocument;
import java.util.List;
import com.grod.platform.dto.PagedResponse;
import com.grod.platform.entity.NotificationType;
import com.grod.platform.entity.NotificationReferenceType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void notifierNouveauDevis(DemandeDevis demande);
    void notifierNouvelleDemandeDocument(DemandeDocument demande);
    List<NotificationDTO> lister(String email, Integer limit);
    PagedResponse<NotificationDTO> listerPage(String email, Pageable pageable, Boolean lue, NotificationType type, NotificationReferenceType referenceType);
    long compterNonLues(String email);
    NotificationDTO marquerCommeLue(Long id, String email);
    void toutMarquerCommeLu(String email);
}
