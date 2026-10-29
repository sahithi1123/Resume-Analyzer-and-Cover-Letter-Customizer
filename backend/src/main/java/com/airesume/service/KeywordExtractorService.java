package com.airesume.service;

import com.airesume.dto.KeywordAnalysisRequest;
import com.airesume.dto.KeywordAnalysisResponse;
import com.airesume.entity.MasterResume;
import com.airesume.entity.PromptRevision;
import com.airesume.entity.TargetType;
import com.airesume.entity.User;
import com.airesume.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class KeywordExtractorService {

    private static final Logger logger = LoggerFactory.getLogger(KeywordExtractorService.class);

    private final GeminiAiService geminiAiService;
    private final ResumeService resumeService;
    private final PromptRevisionService promptRevisionService;
    private final DynamicCustomizerEngine dynamicCustomizerEngine;
    private final ObjectMapper objectMapper;

    public KeywordExtractorService(GeminiAiService geminiAiService,
                                   ResumeService resumeService,
                                   PromptRevisionService promptRevisionService,
                                   DynamicCustomizerEngine dynamicCustomizerEngine,
                                   ObjectMapper objectMapper) {
        this.geminiAiService = geminiAiService;
        this.resumeService = resumeService;
        this.promptRevisionService = promptRevisionService;
        this.dynamicCustomizerEngine = dynamicCustomizerEngine;
        this.objectMapper = objectMapper;
    }

    public KeywordAnalysisResponse analyzeKeywords(User user, KeywordAnalysisRequest request) {
        String resumeContent;

        if (request.getRawResumeText() != null && !request.getRawResumeText().trim().isEmpty()) {
            resumeContent = request.getRawResumeText().trim();
        } else if (request.getResumeId() != null) {
            MasterResume resume = resumeService.getResumeEntity(user, request.getResumeId());
            resumeContent = resume.getExtractedText();
        } else {
            throw new BadRequestException("Either a valid resumeId or rawResumeText must be provided.");
        }

        String jobDesc = request.getJobDescription().trim();
        String jobTitle = (request.getJobTitle() != null && !request.getJobTitle().trim().isEmpty()) ? request.getJobTitle().trim() : "Target Position";
        String company = (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) ? request.getCompanyName().trim() : "";

        String systemInstruction = """
        You are an elite Applicant Tracking System (ATS) optimization engine and senior technical recruiter.
        Analyze the provided candidate resume against the target job description.
        Identify:
        1. matchScore: an integer from 0 to 100 indicating keyword alignment.
        2. matchedKeywords: key technical and domain skills present in both the resume and the job description.
        3. missingKeywords: critical skills, tools, frameworks, or methodologies required by the job that are missing or under-represented in the resume.
        4. recommendedAdditions: 3-5 concrete bullet recommendations for incorporating missing keywords naturally.
        5. summary: a 2-3 sentence executive assessment of candidate fit and high-priority gaps.

        Respond strictly with a JSON object matching this schema:
        {
          "matchScore": number,
          "matchedKeywords": ["string"],
          "missingKeywords": ["string"],
          "recommendedAdditions": ["string"],
          "summary": "string"
        }
        """;

        String roleHeader = "\nTARGET JOB TITLE: " + jobTitle;
        if (!company.isEmpty()) {
            roleHeader += "\nTARGET COMPANY: " + company;
        }

        String prompt = "KEYWORD_ANALYSIS" + roleHeader
                + "\n\nTARGET JOB DESCRIPTION:\n" + jobDesc
                + "\n\nCANDIDATE MASTER RESUME:\n" + resumeContent;

        String aiResponse = geminiAiService.callGemini(systemInstruction, prompt, true);
        KeywordAnalysisResponse parsedResponse = null;

        if (aiResponse != null && !aiResponse.trim().isEmpty()) {
            parsedResponse = parseKeywordResponse(aiResponse);
        }

        // If Gemini was unavailable or response failed to parse, use DynamicCustomizerEngine (ZERO HARDCODED MOCK STRINGS)
        if (parsedResponse == null) {
            logger.info("Performing dynamic ATS keyword analysis using DynamicCustomizerEngine.");
            parsedResponse = dynamicCustomizerEngine.analyzeKeywordsDynamically(resumeContent, jobDesc, jobTitle, company);
            try {
                aiResponse = objectMapper.writeValueAsString(parsedResponse);
            } catch (Exception e) {
                aiResponse = "{\"matchScore\":" + parsedResponse.getMatchScore() + "}";
            }
        }

        // Record prompt snapshot for revision tracking and rollback
        PromptRevision revision = promptRevisionService.createRevision(
                user,
                TargetType.KEYWORD_ANALYSIS,
                prompt,
                aiResponse,
                null
        );

        parsedResponse.setRevisionId(revision.getId());

        return parsedResponse;
    }

    private KeywordAnalysisResponse parseKeywordResponse(String rawJson) {
        try {
            // In case response is wrapped in markdown code fence ```json ... ```
            String cleanJson = rawJson.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);

            int matchScore = root.path("matchScore").asInt(70);

            List<String> matched = new ArrayList<>();
            if (root.has("matchedKeywords") && root.get("matchedKeywords").isArray()) {
                for (JsonNode n : root.get("matchedKeywords")) {
                    matched.add(n.asText());
                }
            }

            List<String> missing = new ArrayList<>();
            if (root.has("missingKeywords") && root.get("missingKeywords").isArray()) {
                for (JsonNode n : root.get("missingKeywords")) {
                    missing.add(n.asText());
                }
            }

            List<String> recommendations = new ArrayList<>();
            if (root.has("recommendedAdditions") && root.get("recommendedAdditions").isArray()) {
                for (JsonNode n : root.get("recommendedAdditions")) {
                    recommendations.add(n.asText());
                }
            }

            String summary = root.path("summary").asText("ATS Keyword alignment analysis complete.");

            return new KeywordAnalysisResponse(matchScore, matched, missing, recommendations, summary, null);
        } catch (Exception ex) {
            logger.warn("Could not parse Gemini JSON response, delegating to dynamic analyzer: {}", ex.getMessage());
            return null; // Signals caller to run dynamicCustomizerEngine
        }
    }
}
