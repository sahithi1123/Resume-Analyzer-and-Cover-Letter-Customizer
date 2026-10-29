package com.airesume.controller;

import com.airesume.dto.ApiResponse;
import com.airesume.dto.PromptRevisionDto;
import com.airesume.dto.PromptRollbackRequest;
import com.airesume.entity.TargetType;
import com.airesume.entity.User;
import com.airesume.security.UserPrincipal;
import com.airesume.service.AuthService;
import com.airesume.service.PromptRevisionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prompts")
public class PromptHistoryController {

    private final PromptRevisionService promptRevisionService;
    private final AuthService authService;

    public PromptHistoryController(PromptRevisionService promptRevisionService, AuthService authService) {
        this.promptRevisionService = promptRevisionService;
        this.authService = authService;
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PromptRevisionDto>>> getPromptHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("targetType") TargetType targetType) {
        User user = authService.getUserEntity(principal);
        List<PromptRevisionDto> history = promptRevisionService.getRevisions(user, targetType);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved prompt revision history", history));
    }

    @PostMapping("/rollback")
    public ResponseEntity<ApiResponse<PromptRevisionDto>> rollbackToRevision(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PromptRollbackRequest request) {
        User user = authService.getUserEntity(principal);
        PromptRevisionDto rolledBack = promptRevisionService.rollbackTo(
                user, request.getTargetType(), request.getTargetRevisionId());
        return ResponseEntity.ok(ApiResponse.ok("Successfully rolled back to revision #" + rolledBack.getRevisionNumber(), rolledBack));
    }

    @DeleteMapping("/erase/{revisionId}")
    public ResponseEntity<ApiResponse<Void>> eraseRevision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("revisionId") Long revisionId) {
        User user = authService.getUserEntity(principal);
        promptRevisionService.eraseRevision(user, revisionId);
        return ResponseEntity.ok(ApiResponse.ok("Prompt revision erased successfully", null));
    }
}
