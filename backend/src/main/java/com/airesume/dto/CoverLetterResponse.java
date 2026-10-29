package com.airesume.dto;

public class CoverLetterResponse {
    private String coverLetterMarkdown;
    private String subjectLine;
    private Long revisionId;
    private Integer revisionNumber;
    private String toneUsed;

    public CoverLetterResponse() {
    }

    public CoverLetterResponse(String coverLetterMarkdown, String subjectLine, Long revisionId, Integer revisionNumber, String toneUsed) {
        this.coverLetterMarkdown = coverLetterMarkdown;
        this.subjectLine = subjectLine;
        this.revisionId = revisionId;
        this.revisionNumber = revisionNumber;
        this.toneUsed = toneUsed;
    }

    public String getCoverLetterMarkdown() {
        return coverLetterMarkdown;
    }

    public void setCoverLetterMarkdown(String coverLetterMarkdown) {
        this.coverLetterMarkdown = coverLetterMarkdown;
    }

    public String getSubjectLine() {
        return subjectLine;
    }

    public void setSubjectLine(String subjectLine) {
        this.subjectLine = subjectLine;
    }

    public Long getRevisionId() {
        return revisionId;
    }

    public void setRevisionId(Long revisionId) {
        this.revisionId = revisionId;
    }

    public Integer getRevisionNumber() {
        return revisionNumber;
    }

    public void setRevisionNumber(Integer revisionNumber) {
        this.revisionNumber = revisionNumber;
    }

    public String getToneUsed() {
        return toneUsed;
    }

    public void setToneUsed(String toneUsed) {
        this.toneUsed = toneUsed;
    }
}
