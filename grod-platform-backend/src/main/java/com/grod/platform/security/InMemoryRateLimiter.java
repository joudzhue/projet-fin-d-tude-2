package com.grod.platform.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryRateLimiter {
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    public InMemoryRateLimiter() {
        this(Clock.systemUTC());
    }

    InMemoryRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public Decision consume(String key, RateLimitProperties.Policy policy) {
        long now = clock.millis();
        long windowMillis = Math.max(1, policy.getWindowSeconds()) * 1000L;
        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now >= current.expiresAt()) {
                return new Window(1, now + windowMillis);
            }
            return new Window(current.count() + 1, current.expiresAt());
        });
        boolean allowed = window.count() <= Math.max(1, policy.getRequests());
        long retryAfter = Math.max(1, (window.expiresAt() - now + 999) / 1000);
        return new Decision(allowed, retryAfter);
    }

    @Scheduled(fixedDelayString = "${app.rate-limit.cleanup-interval-ms:300000}")
    public void cleanupExpired() {
        long now = clock.millis();
        windows.entrySet().removeIf(entry -> now >= entry.getValue().expiresAt());
    }

    void clear() {
        windows.clear();
    }

    private record Window(int count, long expiresAt) {}
    public record Decision(boolean allowed, long retryAfterSeconds) {}
}
