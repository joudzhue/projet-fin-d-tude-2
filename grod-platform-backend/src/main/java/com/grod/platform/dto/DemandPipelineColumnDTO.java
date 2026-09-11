package com.grod.platform.dto;

import java.util.List;

public record DemandPipelineColumnDTO(long total, List<DemandeDevisResponseDTO> demandes) {
}
