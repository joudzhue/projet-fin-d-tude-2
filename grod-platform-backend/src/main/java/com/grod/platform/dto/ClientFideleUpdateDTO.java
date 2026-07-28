package com.grod.platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientFideleUpdateDTO {

    private boolean clientFidele;

    private String referenceClient;
}
