package com.grod.platform.config;

import com.grod.platform.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
@RequiredArgsConstructor
public class ClientDataInitializer implements CommandLineRunner {
    private final ClientService clientService;

    @Override
    public void run(String... args) {
        clientService.rattacherDemandesExistantes();
    }
}
