package com.airesume.controller;

import com.airesume.dto.*;
import com.airesume.entity.User;
import com.airesume.security.UserPrincipal;
import com.airesume.service.AuthService;
import com.airesume.service.CustomizerService;
import com.airesume.service.KeywordExtractorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customizer")
public class CustomizerController {

    private final KeywordExtractorService keywordExtractorService;
    private final CustomizerService customizerService;
    private final AuthService authService;

    public CustomizerController(KeywordExtractorService keywordExtractorService,
                                CustomizerService customizerService,
                                AuthService authService) {
        this.keywordExtractorService = keywordExtractorService;
        this.customizerService = customizerService;
        this.authService = authService;
    }

    @PostMapping("/analyze-keywords")
    public ResponseEntity<ApiResponse<KeywordAnalysisResponse>> analyzeKeywords(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody KeywordAnalysisRequest request) {
        User user = authService.getUserEntity(principal);
        KeywordAnalysisResponse response = keywordExtractorService.analyzeKeywords(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Keyword analysis completed", response));
    }

    @PostMapping("/rewrite-bullets")
    public ResponseEntity<ApiResponse<BulletRewriteResponse>> rewriteBullets(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BulletRewriteRequest request) {
        User user = authService.getUserEntity(principal);
        BulletRewriteResponse response = customizerService.rewriteBullets(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Bullets successfully rewritten with quantifiable impact", response));
    }

    @PostMapping("/generate-cover-letter")
    public ResponseEntity<ApiResponse<CoverLetterResponse>> generateCoverLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CoverLetterRequest request) {
        User user = authService.getUserEntity(principal);
        CoverLetterResponse response = customizerService.generateCoverLetter(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Tailored cover letter generated successfully", response));
    }
}
