package com.grod.platform.repository;

import com.grod.platform.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    List<Notification> findAllByOrderByDateCreationDesc();
    List<Notification> findByOrderByDateCreationDesc(Pageable pageable);
}
