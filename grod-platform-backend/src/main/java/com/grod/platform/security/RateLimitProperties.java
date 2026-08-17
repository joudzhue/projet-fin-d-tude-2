package com.grod.platform.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {
    private boolean enabled = true;
    private boolean trustProxyHeaders = false;
    private Policy login = new Policy(8, 60);
    private Policy assistant = new Policy(15, 60);
    private Policy quote = new Policy(10, 600);
    private Policy document = new Policy(10, 600);
    private Policy quoteUpload = new Policy(12, 600);

    @Getter
    @Setter
    public static class Policy {
        private int requests;
        private long windowSeconds;

        public Policy() {}

        public Policy(int requests, long windowSeconds) {
            this.requests = requests;
            this.windowSeconds = windowSeconds;
        }
    }
}
