package com.grod.platform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@RequiredArgsConstructor
public class PublicEndpointRateLimitFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(PublicEndpointRateLimitFilter.class);
    private static final String MESSAGE = "Trop de requêtes. Veuillez réessayer dans quelques instants.";

    private final RateLimitProperties properties;
    private final InMemoryRateLimiter limiter;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Endpoint endpoint = endpoint(request);
        if (!properties.isEnabled() || endpoint == null) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = clientIp(request);
        InMemoryRateLimiter.Decision decision = limiter.consume(endpoint.name() + ':' + clientIp, endpoint.policy());
        if (decision.allowed()) {
            chain.doFilter(request, response);
            return;
        }

        log.warn("Public endpoint rate limit exceeded endpoint={} client={}", endpoint.name(), anonymize(clientIp));
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", Long.toString(decision.retryAfterSeconds()));
        objectMapper.writeValue(response.getWriter(), Map.of("message", MESSAGE));
    }

    private Endpoint endpoint(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) return null;
        return switch (request.getRequestURI()) {
            case "/api/auth/login" -> new Endpoint("login", properties.getLogin());
            case "/api/assistant/chat" -> new Endpoint("assistant", properties.getAssistant());
            case "/api/demandes-devis" -> new Endpoint("quote", properties.getQuote());
            case "/api/demandes-documents" -> new Endpoint("document", properties.getDocument());
            case "/api/uploads/quote-documents" -> new Endpoint("quote-upload", properties.getQuoteUpload());
            default -> null;
        };
    }

    private String clientIp(HttpServletRequest request) {
        String remote = normalize(request.getRemoteAddr());
        if (!properties.isTrustProxyHeaders() || !isLoopback(remote)) return remote;
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = normalize(forwarded.split(",", 2)[0]);
            if (!first.isBlank()) return first;
        }
        String realIp = normalize(request.getHeader("X-Real-IP"));
        return realIp.isBlank() ? remote : realIp;
    }

    private String normalize(String value) {
        return value == null ? "unknown" : value.trim().toLowerCase();
    }

    private boolean isLoopback(String value) {
        return "127.0.0.1".equals(value) || "::ffff:127.0.0.1".equals(value)
                || "::1".equals(value) || "0:0:0:0:0:0:0:1".equals(value);
    }

    private String anonymize(String value) {
        return Integer.toHexString(value.hashCode());
    }

    private record Endpoint(String name, RateLimitProperties.Policy policy) {}
}
