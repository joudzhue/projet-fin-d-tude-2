package com.grod.platform.dto;

import java.util.Map;

public record DashboardSummaryDTO(long demandesTotales, long nouvellesDemandes, long documentsEnAttente,
                                  long produitsActifs, long clients, Map<String, Long> demandesParStatut) {}
