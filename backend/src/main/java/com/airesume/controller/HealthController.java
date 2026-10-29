package com.airesume.controller;

import com.airesume.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.ok("Service is running smoothly", Map.of(
                "status", "UP",
                "application", "AI-Powered Resume Customizer Backend",
                "version", "1.0.0"
        )));
    }
}
