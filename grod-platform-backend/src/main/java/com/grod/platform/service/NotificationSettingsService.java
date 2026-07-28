package com.grod.platform.service;

import com.grod.platform.dto.NotificationSettingsDTO;
import com.grod.platform.entity.AppSetting;
import com.grod.platform.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class NotificationSettingsService {

    public static final String ADMIN_EMAIL_KEY = "notifications.adminEmail";
    public static final String ADMIN_PHONE_KEY = "notifications.adminPhone";

    private final AppSettingRepository appSettingRepository;

    @Value("${app.notifications.admin-email:admin@grod.ma}")
    private String defaultAdminEmail;

    @Value("${app.notifications.admin-phone:+212 6 68 61 56 08}")
    private String defaultAdminPhone;

    public NotificationSettingsDTO getSettings() {
        return NotificationSettingsDTO.builder()
                .adminEmail(getAdminEmail())
                .adminPhone(getAdminPhone())
                .build();
    }

    public NotificationSettingsDTO updateSettings(NotificationSettingsDTO settingsDTO) {
        AppSetting emailSetting = AppSetting.builder()
                .key(ADMIN_EMAIL_KEY)
                .value(settingsDTO.getAdminEmail().trim())
                .build();
        AppSetting phoneSetting = AppSetting.builder()
                .key(ADMIN_PHONE_KEY)
                .value(settingsDTO.getAdminPhone() == null ? "" : settingsDTO.getAdminPhone().trim())
                .build();

        appSettingRepository.save(emailSetting);
        appSettingRepository.save(phoneSetting);

        return getSettings();
    }

    public String getAdminEmail() {
        String configuredEmail = appSettingRepository.findById(ADMIN_EMAIL_KEY)
                .map(AppSetting::getValue)
                .orElse(defaultAdminEmail);

        return StringUtils.hasText(configuredEmail) ? configuredEmail : defaultAdminEmail;
    }

    public String getAdminPhone() {
        String configuredPhone = appSettingRepository.findById(ADMIN_PHONE_KEY)
                .map(AppSetting::getValue)
                .orElse(defaultAdminPhone);

        return StringUtils.hasText(configuredPhone) ? configuredPhone : defaultAdminPhone;
    }
}
