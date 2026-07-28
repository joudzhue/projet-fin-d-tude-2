package com.grod.platform.controller;

import com.grod.platform.dto.AuthRequestDTO;
import com.grod.platform.dto.AuthResponseDTO;
import com.grod.platform.entity.Utilisateur;
import com.grod.platform.repository.UtilisateurRepository;
import com.grod.platform.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentification", description = "Connexion des utilisateurs back-office")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    @Operation(summary = "Connecter un utilisateur", description = "Retourne un token JWT pour acceder aux routes protegees")
    public AuthResponseDTO login(@Valid @RequestBody AuthRequestDTO request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getMotDePasse()
        ));

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));

        return AuthResponseDTO.builder()
                .token(jwtService.generateToken(utilisateur))
                .type("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .email(utilisateur.getEmail())
                .nomComplet(utilisateur.getNomComplet())
                .role(utilisateur.getRole())
                .build();
    }
}
