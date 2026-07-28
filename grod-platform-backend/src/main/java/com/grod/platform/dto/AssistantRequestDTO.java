package com.grod.platform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantRequestDTO {

    @NotEmpty(message = "La conversation est vide")
    @Size(max = 12, message = "La conversation est trop longue")
    private List<@Valid AssistantMessageDTO> messages;

    private String language;
}
