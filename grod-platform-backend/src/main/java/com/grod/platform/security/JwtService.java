package com.grod.platform.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grod.platform.entity.Utilisateur;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String TOKEN_TYPE = "JWT";
    private static final TypeReference<Map<String, Object>> CLAIMS_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final String secret;
    private final long expirationMs;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.jwt.secret:grod-platform-dev-secret-change-me}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        this.objectMapper = objectMapper;
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    public String generateToken(Utilisateur utilisateur) {
        Instant now = Instant.now();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", TOKEN_TYPE);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", utilisateur.getEmail());
        payload.put("nomComplet", utilisateur.getNomComplet());
        payload.put("role", utilisateur.getRole().name());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusMillis(expirationMs).getEpochSecond());

        String unsignedToken = base64UrlEncode(toJson(header)) + "." + base64UrlEncode(toJson(payload));
        return unsignedToken + "." + sign(unsignedToken);
    }

    public String extractUsername(String token) {
        return getClaims(token).get("sub").toString();
    }

    public boolean isTokenValid(String token, String username) {
        Map<String, Object> claims = getClaims(token);
        Object subject = claims.get("sub");
        Object expiration = claims.get("exp");

        return username.equals(subject)
                && expiration instanceof Number exp
                && exp.longValue() > Instant.now().getEpochSecond()
                && hasValidSignature(token);
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    private Map<String, Object> getClaims(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3 || !hasValidSignature(token)) {
            throw new IllegalArgumentException("Token JWT invalide");
        }

        try {
            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(decodedPayload, CLAIMS_TYPE);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Token JWT invalide", exception);
        }
    }

    private boolean hasValidSignature(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        String unsignedToken = parts[0] + "." + parts[1];
        return sign(unsignedToken).equals(parts[2]);
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return base64UrlEncode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible de signer le token JWT", exception);
        }
    }

    private String toJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible de construire le token JWT", exception);
        }
    }

    private String base64UrlEncode(String value) {
        return base64UrlEncode(value.getBytes(StandardCharsets.UTF_8));
    }

    private String base64UrlEncode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }
}
