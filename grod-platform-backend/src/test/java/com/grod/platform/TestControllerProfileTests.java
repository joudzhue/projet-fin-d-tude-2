package com.grod.platform;

import com.grod.platform.controller.TestController;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

class TestControllerProfileTests {
    @Test
    void endpointTestExisteHorsProdMaisPasEnProd() {
        try (var development = context("dev")) {
            assertThat(development.getBeansOfType(TestController.class)).hasSize(1);
        }
        try (var production = context("prod")) {
            assertThat(production.getBeansOfType(TestController.class)).isEmpty();
        }
    }

    private AnnotationConfigApplicationContext context(String profile) {
        var context = new AnnotationConfigApplicationContext();
        context.getEnvironment().setActiveProfiles(profile);
        context.register(TestController.class);
        context.refresh();
        return context;
    }
}
