package com.grod.platform.controller;

import com.grod.platform.dto.AssistantRequestDTO;
import com.grod.platform.dto.AssistantResponseDTO;
import com.grod.platform.service.OpenAiAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Assistant IA", description = "Assistant commercial cuivre G-ROD")
public class AssistantController {

    private final OpenAiAssistantService openAiAssistantService;

    @PostMapping("/chat")
    @Operation(summary = "Envoyer un message a l'assistant IA")
    public AssistantResponseDTO chat(@Valid @RequestBody AssistantRequestDTO request) {
        return openAiAssistantService.repondre(request);
    }
}
