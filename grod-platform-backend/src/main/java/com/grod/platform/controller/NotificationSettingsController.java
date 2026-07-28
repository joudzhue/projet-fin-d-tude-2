package com.grod.platform.controller;

import com.grod.platform.dto.NotificationSettingsDTO;
import com.grod.platform.service.NotificationSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Admin settings", description = "Configuration admin des notifications")
public class NotificationSettingsController {

    private final NotificationSettingsService notificationSettingsService;

    @GetMapping
    @Operation(summary = "Recuperer les reglages de notifications")
    public NotificationSettingsDTO getSettings() {
        return notificationSettingsService.getSettings();
    }

    @PutMapping
    @Operation(summary = "Modifier l'email admin de notification")
    public NotificationSettingsDTO updateSettings(@Valid @RequestBody NotificationSettingsDTO settingsDTO) {
        return notificationSettingsService.updateSettings(settingsDTO);
    }
}
