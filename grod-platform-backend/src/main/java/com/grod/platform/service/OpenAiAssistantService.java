package com.grod.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.grod.platform.dto.AssistantMessageDTO;
import com.grod.platform.dto.AssistantRequestDTO;
import com.grod.platform.dto.AssistantResponseDTO;
import com.grod.platform.entity.Produit;
import com.grod.platform.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenAiAssistantService {

    private final ProduitRepository produitRepository;

    @Value("${app.openai.api-key:}")
    private String apiKey;

    @Value("${app.openai.model:gpt-5.5}")
    private String model;

    public AssistantResponseDTO repondre(AssistantRequestDTO request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "L'assistant IA n'est pas encore active. Configurez OPENAI_API_KEY dans le backend."
            );
        }

        List<Map<String, Object>> input = new ArrayList<>();
        for (AssistantMessageDTO message : request.getMessages()) {
            String role = normaliserRole(message.getRole());
            input.add(Map.of(
                    "role", role,
                    "content", List.of(Map.of(
                            "type", "input_text",
                            "text", message.getContent().trim()
                    ))
            ));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("instructions", construireInstructions(request.getLanguage()));
        body.put("input", input);
        body.put("max_output_tokens", 600);

        JsonNode response = RestClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build()
                .post()
                .uri("/v1/responses")
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        String text = extraireTexte(response);
        if (text == null || text.isBlank()) {
            throw new IllegalStateException("L'assistant IA n'a pas retourne de reponse.");
        }

        return AssistantResponseDTO.builder().message(text).build();
    }

    private String normaliserRole(String role) {
        return "assistant".equalsIgnoreCase(role) ? "assistant" : "user";
    }

    private String construireInstructions(String language) {
        String langue = "en".equalsIgnoreCase(language) ? "English" : "French";
        String catalogue = produitRepository.findByActifTrue()
                .stream()
                .map(this::decrireProduit)
                .reduce((first, second) -> first + "\n" + second)
                .orElse("Aucun produit actif n'est actuellement disponible.");

        return """
                You are the G-ROD B2B copper sales assistant.
                Answer in %s with short, clear and professional responses.
                Help industrial customers select a product, identify useful specifications,
                prepare a quote request, and understand which technical document to request.

                Strict rules:
                - Only recommend products from the catalog below.
                - Never invent prices, stock, lead times, certifications, standards compliance,
                  chemical composition, or guaranteed technical values.
                - Clearly say when information must be confirmed by the G-ROD commercial team.
                - For copper anodes, purity may be requested between 50%% and 99.99%%.
                - Ask at most two useful questions at a time.
                - When enough information is available, summarize the recommended product and
                  the information the customer should include in the quote request.
                - Do not request passwords, payment card details, identity documents, or secrets.

                Active G-ROD catalog:
                %s
                """.formatted(langue, catalogue);
    }

    private String decrireProduit(Produit produit) {
        return "- %s | Description: %s | Applications: %s | Dimensions: %s | Purete: %s | Normes: %s | Conditionnement: %s"
                .formatted(
                        valeur(produit.getNom()),
                        valeur(produit.getDescription()),
                        valeur(produit.getApplications()),
                        valeur(produit.getDimensions()),
                        valeur(produit.getPurete()),
                        valeur(produit.getNormes()),
                        valeur(produit.getConditionnement())
                );
    }

    private String valeur(String value) {
        return value == null || value.isBlank() ? "a confirmer" : value;
    }

    private String extraireTexte(JsonNode response) {
        if (response == null) {
            return null;
        }

        JsonNode output = response.path("output");
        if (!output.isArray()) {
            return null;
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode item : output) {
            JsonNode content = item.path("content");
            if (!content.isArray()) {
                continue;
            }
            for (JsonNode part : content) {
                if ("output_text".equals(part.path("type").asText())) {
                    if (!text.isEmpty()) {
                        text.append("\n");
                    }
                    text.append(part.path("text").asText());
                }
            }
        }
        return text.toString().trim();
    }
}
