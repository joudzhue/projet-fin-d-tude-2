package com.grod.platform.repository;

import com.grod.platform.entity.NotificationLecture;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationLectureRepository extends JpaRepository<NotificationLecture, Long> {
    List<NotificationLecture> findByUtilisateurId(Long utilisateurId);
    boolean existsByNotificationIdAndUtilisateurId(Long notificationId, Long utilisateurId);
}
