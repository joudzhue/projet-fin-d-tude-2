package com.grod.platform.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TemporaryUploadCleanupService {
    private final StoredFileService storedFileService;
    @Value("${app.upload-cleanup.enabled:true}") private boolean enabled;
    @Value("${app.upload-temp-retention-hours:24}") private long retentionHours;

    @Scheduled(fixedDelayString = "${app.upload-cleanup.interval-ms:21600000}")
    public void cleanup() {
        if (enabled) storedFileService.cleanupExpiredTemporaryQuotes(Duration.ofHours(Math.max(1, retentionHours)), Instant.now());
    }
}
