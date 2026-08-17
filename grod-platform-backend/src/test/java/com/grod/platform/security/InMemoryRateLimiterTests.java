package com.grod.platform.security;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

class InMemoryRateLimiterTests {
    @Test
    void recupereApresLaFenetreEtNettoieLesEntreesExpirees() {
        MutableClock clock = new MutableClock();
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(clock);
        RateLimitProperties.Policy policy = new RateLimitProperties.Policy(1, 10);

        assertThat(limiter.consume("login:ip", policy).allowed()).isTrue();
        assertThat(limiter.consume("login:ip", policy).allowed()).isFalse();
        clock.advanceSeconds(11);
        assertThat(limiter.consume("login:ip", policy).allowed()).isTrue();
        limiter.cleanupExpired();
    }

    private static final class MutableClock extends Clock {
        private Instant instant = Instant.parse("2026-08-15T00:00:00Z");
        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return instant; }
        void advanceSeconds(long seconds) { instant = instant.plusSeconds(seconds); }
    }
}
