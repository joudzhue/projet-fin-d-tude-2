package com.grod.platform.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI grodOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("G-ROD Platform API")
                        .version("1.0.0")
                        .description("Documentation des API REST de la plateforme B2B G-ROD"));
    }
}
