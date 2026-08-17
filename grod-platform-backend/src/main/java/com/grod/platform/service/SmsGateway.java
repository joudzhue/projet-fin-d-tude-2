package com.grod.platform.service;

public interface SmsGateway {
    boolean isConfigured();
    void send(String recipient, String body) throws Exception;
}
