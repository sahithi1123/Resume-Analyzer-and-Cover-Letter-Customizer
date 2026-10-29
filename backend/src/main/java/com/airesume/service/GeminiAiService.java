package com.airesume.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String configuredModel;

    // Cache the last working endpoint to optimize response times
    private volatile String cachedWorkingEndpoint = null;

    public GeminiAiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Executes Gemini API prompt expecting JSON or formatted text response with multi-model fallback.
     * Returns null if Gemini is unreachable or API key is not configured, allowing services to fall back
     * to the DynamicCustomizerEngine rather than returning hardcoded mock strings.
     */
    public String callGemini(String systemInstruction, String userPrompt, boolean requireJson) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equalsIgnoreCase("your_gemini_api_key_here")) {
            logger.info("No valid GEMINI_API_KEY configured. Delegating to dynamic customizer engine.");
            return null;
        }

        String apiKey = geminiApiKey.trim();

        // Endpoints to attempt in sequence
        List<String> candidateEndpoints = buildCandidateEndpoints();

        // If we already discovered a working endpoint in a prior request, try that first
        if (cachedWorkingEndpoint != null) {
            candidateEndpoints.remove(cachedWorkingEndpoint);
            candidateEndpoints.add(0, cachedWorkingEndpoint);
        }

        Map<String, Object> requestBody = buildRequestBody(systemInstruction, userPrompt, requireJson);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (String endpoint : candidateEndpoints) {
            String fullUrl = endpoint + "?key=" + apiKey;
            try {
                logger.info("Attempting Gemini AI request with endpoint: {}", endpoint);
                ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                        if (!textNode.isMissingNode()) {
                            cachedWorkingEndpoint = endpoint;
                            logger.info("Successfully received Gemini AI response using: {}", endpoint);
                            return textNode.asText();
                        }
                    }
                }
            } catch (HttpClientErrorException.NotFound ex) {
                logger.warn("Gemini model endpoint not found (404): {}. Trying alternative model...", endpoint);
            } catch (Exception ex) {
                logger.warn("Error calling Gemini endpoint {}: {}", endpoint, ex.getMessage());
            }
        }

        // If Google Gemini endpoints fail (e.g. rate-limited, offline, or invalid key), return null
        logger.warn("All Gemini API candidate models exhausted or unavailable. Delegating to dynamic customizer engine.");
        return null;
    }

    private List<String> buildCandidateEndpoints() {
        List<String> endpoints = new ArrayList<>();
        if (configuredModel != null && !configuredModel.trim().isEmpty()) {
            endpoints.add("https://generativelanguage.googleapis.com/v1beta/models/" + configuredModel.trim() + ":generateContent");
        }
        endpoints.add("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent");
        endpoints.add("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
        endpoints.add("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent");
        endpoints.add("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent");
        endpoints.add("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent");
        return endpoints;
    }

    private Map<String, Object> buildRequestBody(String systemInstruction, String userPrompt, boolean requireJson) {
        Map<String, Object> requestBody = new HashMap<>();

        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();

        String combinedPrompt = (systemInstruction != null && !systemInstruction.isEmpty())
                ? "System Context:\n" + systemInstruction + "\n\nTask Instructions:\n" + userPrompt
                : userPrompt;

        parts.add(Map.of("text", combinedPrompt));
        contentMap.put("parts", parts);
        contents.add(contentMap);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.2);
        generationConfig.put("maxOutputTokens", 4096);
        if (requireJson) {
            generationConfig.put("responseMimeType", "application/json");
        }
        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }
}
