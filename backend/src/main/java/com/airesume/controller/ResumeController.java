package com.airesume.controller;

import com.airesume.dto.ApiResponse;
import com.airesume.dto.ResumeUploadResponse;
import com.airesume.entity.User;
import com.airesume.security.UserPrincipal;
import com.airesume.service.AuthService;
import com.airesume.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final AuthService authService;

    public ResumeController(ResumeService resumeService, AuthService authService) {
        this.resumeService = resumeService;
        this.authService = authService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeUploadResponse>> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        User user = authService.getUserEntity(principal);
        ResumeUploadResponse response = resumeService.uploadResume(user, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Resume uploaded and parsed successfully", response));
    }

    @GetMapping("/my-resumes")
    public ResponseEntity<ApiResponse<List<ResumeUploadResponse>>> getMyResumes(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = authService.getUserEntity(principal);
        List<ResumeUploadResponse> resumes = resumeService.getUserResumes(user);
        return ResponseEntity.ok(ApiResponse.ok(resumes));
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeUploadResponse>> getResumeById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("resumeId") Long resumeId) {
        User user = authService.getUserEntity(principal);
        ResumeUploadResponse response = resumeService.getResumeDetails(user, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("resumeId") Long resumeId) {
        User user = authService.getUserEntity(principal);
        resumeService.deleteResume(user, resumeId);
        return ResponseEntity.ok(ApiResponse.ok("Resume deleted successfully", null));
    }
}
