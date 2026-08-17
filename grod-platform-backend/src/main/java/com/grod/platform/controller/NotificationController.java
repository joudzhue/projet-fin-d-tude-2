package com.grod.platform.controller;

import com.grod.platform.dto.NotificationDTO;
import com.grod.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.grod.platform.dto.PagedResponse;
import com.grod.platform.entity.NotificationType;
import com.grod.platform.entity.NotificationReferenceType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public Object lister(Authentication authentication, @RequestParam(required = false) Integer limit,
            @RequestParam(required=false) Integer page, @RequestParam(defaultValue="10") int size,
            @RequestParam(required=false) Boolean lue, @RequestParam(required=false) NotificationType type,
            @RequestParam(required=false) NotificationReferenceType referenceType) {
        if (limit != null) return notificationService.lister(authentication.getName(), limit);
        int safePage = Math.max(0, page == null ? 0 : page);
        int safeSize = Math.max(1, Math.min(size, 100));
        return notificationService.listerPage(authentication.getName(),
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "dateCreation")), lue, type, referenceType);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> compteur(Authentication authentication) {
        return Map.of("count", notificationService.compterNonLues(authentication.getName()));
    }

    @PutMapping("/{id}/read")
    public NotificationDTO lire(@PathVariable Long id, Authentication authentication) {
        return notificationService.marquerCommeLue(id, authentication.getName());
    }

    @PutMapping("/read-all")
    public void toutLire(Authentication authentication) {
        notificationService.toutMarquerCommeLu(authentication.getName());
    }
}
