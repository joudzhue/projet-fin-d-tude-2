package com.grod.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class TwilioSmsGateway implements SmsGateway {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    @Value("${app.notifications.sms.twilio-account-sid:}") private String accountSid;
    @Value("${app.notifications.sms.twilio-auth-token:}") private String authToken;
    @Value("${app.notifications.sms.twilio-from-number:}") private String fromNumber;

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(accountSid) && StringUtils.hasText(authToken) && StringUtils.hasText(fromNumber);
    }

    @Override
    public void send(String recipient, String body) throws Exception {
        String form = "To=%s&From=%s&Body=%s".formatted(encode(recipient), encode(fromNumber), encode(body));
        String auth = Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json".formatted(accountSid)))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form)).build();
        HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
        if (response.statusCode() >= 300) throw new IllegalStateException("Twilio HTTP " + response.statusCode());
    }

    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
}
