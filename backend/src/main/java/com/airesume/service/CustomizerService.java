package com.airesume.service;

import com.airesume.dto.*;
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
public class CustomizerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomizerService.class);

    private final GeminiAiService geminiAiService;
    private final ResumeService resumeService;
    private final PromptRevisionService promptRevisionService;
    private final DynamicCustomizerEngine dynamicCustomizerEngine;
    private final ObjectMapper objectMapper;

    public CustomizerService(GeminiAiService geminiAiService,
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

    public BulletRewriteResponse rewriteBullets(User user, BulletRewriteRequest request) {
        String resumeContent;
        if (request.getRawResumeText() != null && !request.getRawResumeText().trim().isEmpty()) {
            resumeContent = request.getRawResumeText().trim();
        } else if (request.getResumeId() != null) {
            MasterResume resume = resumeService.getResumeEntity(user, request.getResumeId());
            resumeContent = resume.getExtractedText();
        } else {
            throw new BadRequestException("Either resumeId or rawResumeText is required.");
        }

        String jobDesc = request.getJobDescription().trim();
        String jobTitle = (request.getJobTitle() != null && !request.getJobTitle().trim().isEmpty()) ? request.getJobTitle().trim() : "Target Position";
        String company = (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) ? request.getCompanyName().trim() : "";

        String userInstruction = (request.getPromptInstruction() != null && !request.getPromptInstruction().trim().isEmpty())
                ? request.getPromptInstruction().trim()
                : "Rewrite experience bullet points using the STAR method (Action Verb + Context + Result) with quantifiable impact and relevant job keywords.";

        boolean hasSpecificBullets = request.getBulletPointsToRewrite() != null && !request.getBulletPointsToRewrite().isEmpty();
        String bulletsToRewrite = hasSpecificBullets
                ? "- " + String.join("\n- ", request.getBulletPointsToRewrite())
                : "Extract the top 4-5 weak or passive experience bullets from the master resume to rewrite.";

        String systemInstruction = """
        You are an elite, highly ethical executive resume writer specializing in ATS optimization.
        Your mission is to improve the candidate's existing resume bullet points using the STAR/Google XYZ framework:
        "Accomplished [X] by doing [Z], with impact [Y]"
        
        CRITICAL ACCURACY & GROUNDING RULES (NEVER INVENT INFORMATION):
        1. STRICT TRUTHFULNESS: NEVER fabricate, hallucinate, or invent ANY new information.
           - DO NOT invent fake metrics, imaginary numbers, budget amounts, or fabricated percentages (e.g. do NOT invent "cut latency by 40%" or "managed $2M budget" if no such numbers appear in the master resume).
           - DO NOT invent technologies, programming languages, cloud platforms, databases, or tools that are not already stated in the candidate's master resume.
           - DO NOT invent unearned job titles, leadership responsibilities, or company achievements.
        2. HOW TO ENHANCE WITHOUT INVENTING:
           - Elevate passive language into powerful, active verbs (e.g. replace "Worked on" or "Responsible for" with "Engineered", "Implemented", "Spearheaded", "Optimized").
           - Clarify the technical scope, methodology, and direct business purpose based ONLY on what the candidate actually described in their resume.
           - Connect their verified technical skills directly to the keywords and phrasing emphasized in the target job requirements.
           - If the candidate's original bullet already has existing metrics or scope (e.g. "team of 4", "3 applications"), preserve and emphasize them truthfully.
        3. EXACT "originalBullet" MATCH:
           - "originalBullet" MUST be copied VERBATIM (word-for-word, character-for-character) from the candidate's master resume text so it can be located and replaced in their document. Do NOT truncate, alter, or paraphrase "originalBullet".
        4. In "improvementReason", explain briefly and transparently how the revised bullet improves readability, ATS keyword alignment, and professional impact without altering the candidate's genuine experience.

        Respond strictly with a JSON object conforming to this schema:
        {
          "rewrittenBullets": [
            {
              "originalBullet": "string (exact verbatim text from master resume)",
              "rewrittenBullet": "string (truthful, high-impact STAR enhancement)",
              "keySkillsHighlighted": ["string"],
              "improvementReason": "string"
            }
          ]
        }
        """;

        String roleInfo = "\nTARGET ROLE: " + jobTitle;
        if (!company.isEmpty()) {
            roleInfo += "\nTARGET COMPANY: " + company;
        }

        String prompt = "BULLET_REWRITE" + roleInfo
                + "\n\nTARGET JOB REQUIREMENTS:\n" + jobDesc
                + "\n\nCUSTOM USER DIRECTIVE:\n" + userInstruction
                + "\n\nBULLET POINTS TO REWRITE:\n" + bulletsToRewrite
                + "\n\nFULL CANDIDATE RESUME CONTEXT:\n" + resumeContent;

        String aiResponse = geminiAiService.callGemini(systemInstruction, prompt, true);
        List<BulletItem> rewrittenItems = null;

        if (aiResponse != null && !aiResponse.trim().isEmpty()) {
            rewrittenItems = parseBulletResponse(aiResponse);
        }

        // If Gemini was unavailable or returned invalid JSON, execute DynamicCustomizerEngine (ZERO MOCK RESULTS)
        if (rewrittenItems == null || rewrittenItems.isEmpty()) {
            logger.info("Generating dynamic bullet rewrites using DynamicCustomizerEngine.");
            rewrittenItems = dynamicCustomizerEngine.rewriteBulletsDynamically(
                    resumeContent,
                    jobDesc,
                    jobTitle,
                    company,
                    request.getBulletPointsToRewrite(),
                    userInstruction
            );
            try {
                aiResponse = objectMapper.writeValueAsString(new BulletRewriteResponse(rewrittenItems, null, 1, userInstruction));
            } catch (Exception e) {
                aiResponse = "{\"rewrittenBullets\":[]}";
            }
        }

        // Store snapshot for prompt rollback / erase
        PromptRevision revision = promptRevisionService.createRevision(
                user,
                TargetType.BULLET_REWRITE,
                prompt,
                aiResponse,
                request.getParentRevisionId()
        );

        return new BulletRewriteResponse(
                rewrittenItems,
                revision.getId(),
                revision.getRevisionNumber(),
                userInstruction
        );
    }

    public CoverLetterResponse generateCoverLetter(User user, CoverLetterRequest request) {
        String resumeContent;
        if (request.getRawResumeText() != null && !request.getRawResumeText().trim().isEmpty()) {
            resumeContent = request.getRawResumeText().trim();
        } else if (request.getResumeId() != null) {
            MasterResume resume = resumeService.getResumeEntity(user, request.getResumeId());
            resumeContent = resume.getExtractedText();
        } else {
            throw new BadRequestException("Either resumeId or rawResumeText is required.");
        }

        String jobDesc = request.getJobDescription().trim();
        String jobTitle = (request.getJobTitle() != null && !request.getJobTitle().isEmpty()) ? request.getJobTitle() : "Target Role";
        String company = (request.getCompanyName() != null && !request.getCompanyName().isEmpty()) ? request.getCompanyName() : "Target Company";
        String tone = (request.getTone() != null && !request.getTone().isEmpty()) ? request.getTone() : "Professional and persuasive";
        String extraNotes = (request.getAdditionalPromptNotes() != null) ? request.getAdditionalPromptNotes().trim() : "";

        String systemInstruction = """
        You are an elite career counselor and professional communications strategist.
        Write a compelling, bespoke cover letter tailored specifically to the target job description and candidate resume.
        
        Guidelines:
        1. Tone: """ + tone + """
        2. Hook the hiring manager in the opening paragraph with enthusiasm and direct alignment.
        3. Body paragraphs should connect 2-3 significant accomplishments from the resume directly to company challenges mentioned in the job description.
        4. CRITICAL TRUTHFULNESS: Only mention genuine skills, tools, experiences, and qualifications explicitly found in the candidate's master resume. Do NOT fabricate fake employers, degrees, or imaginary projects.
        5. Include a strong closing call to action.
        6. Format clearly in standard Markdown.
        """;

        String prompt = "COVER_LETTER\n\nTARGET ROLE: " + jobTitle + "\nCOMPANY: " + company
                + "\nJOB DESCRIPTION:\n" + jobDesc
                + "\nADDITIONAL USER NOTES:\n" + extraNotes
                + "\nCANDIDATE MASTER RESUME:\n" + resumeContent;

        String aiResponse = geminiAiService.callGemini(systemInstruction, prompt, false);

        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            logger.info("Generating dynamic tailored cover letter using DynamicCustomizerEngine.");
            aiResponse = dynamicCustomizerEngine.generateCoverLetterDynamically(
                    resumeContent,
                    jobDesc,
                    jobTitle,
                    company,
                    tone,
                    extraNotes
            );
        }

        // Store snapshot for prompt rollback / erase
        PromptRevision revision = promptRevisionService.createRevision(
                user,
                TargetType.COVER_LETTER,
                prompt,
                aiResponse,
                request.getParentRevisionId()
        );

        String subjectLine = "Application for " + jobTitle + " - " + company;

        return new CoverLetterResponse(
                aiResponse,
                subjectLine,
                revision.getId(),
                revision.getRevisionNumber(),
                tone
        );
    }

    private List<BulletItem> parseBulletResponse(String rawJson) {
        List<BulletItem> list = new ArrayList<>();
        try {
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
            JsonNode bulletsNode = root.path("rewrittenBullets");

            if (bulletsNode.isArray()) {
                for (JsonNode b : bulletsNode) {
                    String original = b.path("originalBullet").asText();
                    String rewritten = b.path("rewrittenBullet").asText();
                    String reason = b.path("improvementReason").asText();

                    List<String> skills = new ArrayList<>();
                    if (b.has("keySkillsHighlighted") && b.get("keySkillsHighlighted").isArray()) {
                        for (JsonNode s : b.get("keySkillsHighlighted")) {
                            skills.add(s.asText());
                        }
                    }

                    // Guarantee enhancement if AI response is identical to original
                    if (rewritten == null || rewritten.trim().isEmpty() || rewritten.trim().equalsIgnoreCase(original.trim())) {
                        rewritten = dynamicCustomizerEngine.elevateBulletToStar(original, "", skills, "");
                    }

                    list.add(new BulletItem(original, rewritten, skills, reason));
                }
            }
            return list.isEmpty() ? null : list;
        } catch (Exception ex) {
            logger.warn("Failed to parse bullet rewrite JSON, delegating to dynamic rewriter: {}", ex.getMessage());
            return null; // Signals caller to run dynamic engine
        }
    }
}
