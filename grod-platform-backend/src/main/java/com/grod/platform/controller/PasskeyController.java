package com.grod.platform.controller;

import com.grod.platform.dto.PasskeyAuthenticationDTO;
import com.grod.platform.dto.PasskeyLoginStartDTO;
import com.grod.platform.dto.PasskeyRegistrationDTO;
import com.grod.platform.security.WebAuthnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/passkeys")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Passkeys", description = "Connexion admin avec Face ID, Touch ID ou Windows Hello")
public class PasskeyController {

    private final WebAuthnService webAuthnService;

    @PostMapping("/register/options")
    @Operation(summary = "Preparer l'activation Face ID")
    public Map<String, Object> startRegistration(Authentication authentication) {
        return webAuthnService.startRegistration(authentication.getName());
    }

    @PostMapping("/register")
    @Operation(summary = "Activer Face ID pour l'admin connecte")
    public void finishRegistration(Authentication authentication, @Valid @RequestBody PasskeyRegistrationDTO request) {
        webAuthnService.finishRegistration(authentication.getName(), request);
    }

    @PostMapping("/login/options")
    @Operation(summary = "Preparer la connexion Face ID")
    public Map<String, Object> startLogin(@Valid @RequestBody PasskeyLoginStartDTO request) {
        return webAuthnService.startLogin(request.getEmail());
    }

    @PostMapping("/login")
    @Operation(summary = "Connecter l'admin avec Face ID")
    public Map<String, Object> finishLogin(@Valid @RequestBody PasskeyAuthenticationDTO request) {
        return webAuthnService.finishLogin(request);
    }
}
