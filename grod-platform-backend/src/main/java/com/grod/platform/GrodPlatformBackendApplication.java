package com.grod.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GrodPlatformBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GrodPlatformBackendApplication.class, args);
	}

}
