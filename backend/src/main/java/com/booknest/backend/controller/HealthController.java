package com.booknest.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> checkHealth() {
        return Map.of(
            "status", "UP",
            "service", "BookNest Backend API",
            "timestamp", Instant.now().toString()
        );
    }
}
