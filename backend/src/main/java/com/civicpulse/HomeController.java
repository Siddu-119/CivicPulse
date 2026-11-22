package com.civicpulse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "project", "CivicPulse",
            "message", "Smart City Complaint and Resolution Platform",
            "status", "Backend is running successfully"
        );
    }

    @GetMapping(value = {"/api/health", "/health", "/healthz"})
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "service", "CivicPulse Backend",
            "timestamp", System.currentTimeMillis()
        );
    }
}
