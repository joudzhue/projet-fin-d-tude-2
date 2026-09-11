package com.grod.platform.dto;

import java.util.Map;

public record DemandPipelineDTO(Map<String, DemandPipelineColumnDTO> columns) {
}
