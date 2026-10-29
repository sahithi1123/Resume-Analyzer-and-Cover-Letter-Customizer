package com.airesume.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class BulletRewriteRequest {
    private Long resumeId;
    private String rawResumeText;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    private String jobTitle;
    private String companyName;

    private List<String> bulletPointsToRewrite = new ArrayList<>();

    // Custom prompt directive provided by the user (e.g., "Make it more executive-sounding", "Emphasize React and Cloud")
    private String promptInstruction;

    // Optional parent revision ID if this is an iterative refinement
    private Long parentRevisionId;

    public BulletRewriteRequest() {
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public String getRawResumeText() {
        return rawResumeText;
    }

    public void setRawResumeText(String rawResumeText) {
        this.rawResumeText = rawResumeText;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public List<String> getBulletPointsToRewrite() {
        return bulletPointsToRewrite;
    }

    public void setBulletPointsToRewrite(List<String> bulletPointsToRewrite) {
        this.bulletPointsToRewrite = bulletPointsToRewrite;
    }

    public String getPromptInstruction() {
        return promptInstruction;
    }

    public void setPromptInstruction(String promptInstruction) {
        this.promptInstruction = promptInstruction;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Long getParentRevisionId() {
        return parentRevisionId;
    }

    public void setParentRevisionId(Long parentRevisionId) {
        this.parentRevisionId = parentRevisionId;
    }
}
