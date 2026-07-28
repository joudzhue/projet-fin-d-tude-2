package com.grod.platform.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Test", description = "Endpoint simple pour verifier le fonctionnement du backend")
public class TestController {

    @GetMapping("/api/test")
    @Operation(summary = "Tester le backend", description = "Verifie que le backend G-ROD est demarre")
    public Map<String, String> test() {
        return Map.of(
                "message", "Backend G-ROD demarre avec succes",
                "status", "OK"
        );
    }
}
