package com.grod.platform.service;

import com.grod.platform.dto.NotificationDTO;
import com.grod.platform.entity.*;
import com.grod.platform.exception.ResourceNotFoundException;
import com.grod.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.grod.platform.dto.PagedResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationLectureRepository lectureRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public void notifierNouveauDevis(DemandeDevis demande) {
        notificationRepository.save(Notification.builder().type(NotificationType.NOUVELLE_DEMANDE_DEVIS)
                .titre("Nouvelle demande de devis")
                .message("%s — %s — %s".formatted(demande.getReferenceDemande(), demande.getProduitDemande(), demande.getSociete()))
                .referenceType(NotificationReferenceType.DEVIS).referenceId(demande.getId())
                .referenceCode(demande.getReferenceDemande())
                .clientId(demande.getClient() == null ? null : demande.getClient().getId()).build());
    }

    @Override
    public void notifierNouvelleDemandeDocument(DemandeDocument demande) {
        String objet = demande.getProduitConcerne() == null || demande.getProduitConcerne().isBlank()
                ? demande.getTitreDocument() : demande.getTitreDocument() + " " + demande.getProduitConcerne();
        notificationRepository.save(Notification.builder().type(NotificationType.NOUVELLE_DEMANDE_DOCUMENT)
                .titre("Nouvelle demande de document")
                .message("%s — %s".formatted(demande.getReferenceDemande(), objet))
                .referenceType(NotificationReferenceType.DOCUMENT).referenceId(demande.getId())
                .referenceCode(demande.getReferenceDemande()).build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> lister(String email, Integer limit) {
        Utilisateur user = utilisateur(email);
        List<Notification> notifications = limit == null
                ? notificationRepository.findAllByOrderByDateCreationDesc()
                : notificationRepository.findByOrderByDateCreationDesc(PageRequest.of(0, Math.max(1, Math.min(limit, 50))));
        Map<Long, NotificationLecture> lectures = lectureRepository.findByUtilisateurId(user.getId()).stream()
                .collect(Collectors.toMap(item -> item.getNotification().getId(), Function.identity()));
        return notifications.stream().map(item -> convertir(item, lectures.get(item.getId()))).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationDTO> listerPage(String email, Pageable pageable, Boolean lue,
            NotificationType type, NotificationReferenceType referenceType) {
        Utilisateur user = utilisateur(email);
        Map<Long, NotificationLecture> lectures = lectureRepository.findByUtilisateurId(user.getId()).stream()
                .collect(Collectors.toMap(item -> item.getNotification().getId(), Function.identity()));
        Set<Long> readIds = lectures.keySet();
        Specification<Notification> spec = Specification.where(null);
        if (lue != null) spec = spec.and((root, query, cb) -> {
            if (readIds.isEmpty()) return lue ? cb.disjunction() : cb.conjunction();
            return lue ? root.get("id").in(readIds) : cb.not(root.get("id").in(readIds));
        });
        if (type != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        if (referenceType != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("referenceType"), referenceType));
        return PagedResponse.from(notificationRepository.findAll(spec, pageable)
                .map(item -> convertir(item, lectures.get(item.getId()))));
    }

    @Override
    @Transactional(readOnly = true)
    public long compterNonLues(String email) {
        Utilisateur user = utilisateur(email);
        return Math.max(0, notificationRepository.count() - lectureRepository.findByUtilisateurId(user.getId()).size());
    }

    @Override
    @Transactional
    public NotificationDTO marquerCommeLue(Long id, String email) {
        Utilisateur user = utilisateur(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable avec l'id : " + id));
        NotificationLecture lecture = lectureRepository.findByUtilisateurId(user.getId()).stream()
                .filter(item -> item.getNotification().getId().equals(id)).findFirst()
                .orElseGet(() -> lectureRepository.save(NotificationLecture.builder().notification(notification)
                        .utilisateur(user).dateLecture(LocalDateTime.now()).build()));
        return convertir(notification, lecture);
    }

    @Override
    @Transactional
    public void toutMarquerCommeLu(String email) {
        Utilisateur user = utilisateur(email);
        Set<Long> lus = lectureRepository.findByUtilisateurId(user.getId()).stream()
                .map(item -> item.getNotification().getId()).collect(Collectors.toSet());
        List<NotificationLecture> nouvellesLectures = notificationRepository.findAll().stream()
                .filter(item -> !lus.contains(item.getId()))
                .map(item -> NotificationLecture.builder().notification(item).utilisateur(user).dateLecture(LocalDateTime.now()).build())
                .toList();
        lectureRepository.saveAll(nouvellesLectures);
    }

    private Utilisateur utilisateur(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private NotificationDTO convertir(Notification item, NotificationLecture lecture) {
        return NotificationDTO.builder().id(item.getId()).type(item.getType()).titre(item.getTitre())
                .message(item.getMessage()).lue(lecture != null).dateCreation(item.getDateCreation())
                .dateLecture(lecture == null ? null : lecture.getDateLecture()).referenceType(item.getReferenceType())
                .referenceId(item.getReferenceId()).referenceCode(item.getReferenceCode()).clientId(item.getClientId()).build();
    }
}
