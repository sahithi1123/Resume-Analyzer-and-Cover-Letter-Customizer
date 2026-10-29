package com.airesume.dto;

import jakarta.validation.constraints.NotBlank;

public class CoverLetterRequest {
    private Long resumeId;
    private String rawResumeText;

    private String jobTitle;
    private String companyName;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    private String tone = "Professional, persuasive, and confident"; // e.g. Executive, Startup/Enthusiastic, Creative
    private String additionalPromptNotes; // custom instructions from user
    private Long parentRevisionId;

    public CoverLetterRequest() {
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

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getAdditionalPromptNotes() {
        return additionalPromptNotes;
    }

    public void setAdditionalPromptNotes(String additionalPromptNotes) {
        this.additionalPromptNotes = additionalPromptNotes;
    }

    public Long getParentRevisionId() {
        return parentRevisionId;
    }

    public void setParentRevisionId(Long parentRevisionId) {
        this.parentRevisionId = parentRevisionId;
    }
}
