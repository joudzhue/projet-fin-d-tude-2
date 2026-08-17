package com.grod.platform;

import com.grod.platform.entity.Role;
import com.grod.platform.entity.Utilisateur;
import com.grod.platform.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "app.rate-limit.enabled=true",
        "app.rate-limit.trust-proxy-headers=true",
        "app.rate-limit.login.requests=2", "app.rate-limit.login.window-seconds=60",
        "app.rate-limit.assistant.requests=2", "app.rate-limit.assistant.window-seconds=60",
        "app.rate-limit.quote.requests=2", "app.rate-limit.quote.window-seconds=60",
        "app.rate-limit.document.requests=2", "app.rate-limit.document.window-seconds=60",
        "app.rate-limit.quote-upload.requests=2", "app.rate-limit.quote-upload.window-seconds=60",
        "app.upload-dir=target/rate-limit-uploads"
})
@AutoConfigureMockMvc
class RateLimitIntegrationTests {
    @Autowired MockMvc mvc;
    @Autowired UtilisateurRepository utilisateurs;
    @Autowired PasswordEncoder encoder;

    @BeforeEach
    void admin() {
        if (!utilisateurs.existsByEmail("rate-limit-admin@example.test")) {
            utilisateurs.save(Utilisateur.builder().nomComplet("Rate Limit Admin")
                    .email("rate-limit-admin@example.test").motDePasse(encoder.encode("Password123!"))
                    .role(Role.ADMIN).actif(true).build());
        }
    }

    @Test
    void loginRetourne429AvecRetryAfter() throws Exception {
        for (int index = 0; index < 2; index++) login("198.51.100.10").andExpect(status().isOk());
        login("198.51.100.10").andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.message").value("Trop de requêtes. Veuillez réessayer dans quelques instants."));
    }

    @Test
    void assistantEstLimiteAvantAppelExterne() throws Exception {
        String body = "{\"messages\":[{\"role\":\"user\",\"content\":\"Bonjour\"}],\"language\":\"fr\"}";
        for (int index = 0; index < 2; index++) {
            mvc.perform(post("/api/assistant/chat").with(request -> { request.setRemoteAddr("198.51.100.20"); return request; })
                    .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isServiceUnavailable());
        }
        mvc.perform(post("/api/assistant/chat").with(request -> { request.setRemoteAddr("198.51.100.20"); return request; })
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isTooManyRequests());
    }

    @Test
    void devisEtDocumentsOntDesBucketsDistincts() throws Exception {
        String quote = "{\"societe\":\"Rate Limit\",\"nomContact\":\"Test\",\"email\":\"rl@example.test\",\"telephone\":\"+212600000001\",\"produitDemande\":\"Copper Rod\",\"quantite\":1}";
        for (int index = 0; index < 2; index++) postJson("/api/demandes-devis", quote, "198.51.100.30").andExpect(status().isOk());
        postJson("/api/demandes-devis", quote, "198.51.100.30").andExpect(status().isTooManyRequests());

        String document = "{\"societe\":\"Rate Limit\",\"nomContact\":\"Test\",\"email\":\"rl@example.test\",\"telephone\":\"+212600000001\",\"typeDocument\":\"Fiche\",\"titreDocument\":\"Copper Rod\"}";
        for (int index = 0; index < 2; index++) postJson("/api/demandes-documents", document, "198.51.100.30").andExpect(status().isOk());
        postJson("/api/demandes-documents", document, "198.51.100.30").andExpect(status().isTooManyRequests());
    }

    @Test
    void uploadTemporaireEstLimite() throws Exception {
        for (int index = 0; index < 2; index++) upload("198.51.100.40").andExpect(status().isOk());
        upload("198.51.100.40").andExpect(status().isTooManyRequests());
    }

    @Test
    void ipsDifferentesOntDesBucketsDistincts() throws Exception {
        for (int index = 0; index < 2; index++) login("198.51.100.50").andExpect(status().isOk());
        login("198.51.100.50").andExpect(status().isTooManyRequests());
        login("198.51.100.51").andExpect(status().isOk());
    }

    @Test
    void proxyControleEstPrisEnCompteMaisUnClientDirectNePeutPasUsurperXff() throws Exception {
        for (int index = 0; index < 2; index++) proxiedLogin("127.0.0.1", "198.51.100.60").andExpect(status().isOk());
        proxiedLogin("127.0.0.1", "198.51.100.61").andExpect(status().isOk());

        for (int index = 0; index < 2; index++) proxiedLogin("203.0.113.70", "198.51.100." + (70 + index)).andExpect(status().isOk());
        proxiedLogin("203.0.113.70", "198.51.100.99").andExpect(status().isTooManyRequests());
    }

    private org.springframework.test.web.servlet.ResultActions login(String ip) throws Exception {
        return proxiedLogin(ip, null);
    }

    private org.springframework.test.web.servlet.ResultActions proxiedLogin(String remoteIp, String forwarded) throws Exception {
        var request = post("/api/auth/login").with(value -> { value.setRemoteAddr(remoteIp); return value; })
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"rate-limit-admin@example.test\",\"motDePasse\":\"Password123!\"}");
        if (forwarded != null) request.header("X-Forwarded-For", forwarded);
        return mvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions postJson(String path, String body, String ip) throws Exception {
        return mvc.perform(post(path).with(request -> { request.setRemoteAddr(ip); return request; })
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private org.springframework.test.web.servlet.ResultActions upload(String ip) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "plan.pdf", "application/pdf", "%PDF-1.4 rate-limit".getBytes());
        return mvc.perform(multipart("/api/uploads/quote-documents").file(file)
                .with(request -> { request.setRemoteAddr(ip); return request; }));
    }
}
