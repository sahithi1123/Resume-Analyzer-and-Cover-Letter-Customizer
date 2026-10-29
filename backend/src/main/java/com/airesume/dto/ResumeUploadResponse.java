package com.airesume.dto;

import java.time.LocalDateTime;

public class ResumeUploadResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private int extractedCharacterCount;
    private String textPreview;
    private LocalDateTime uploadedAt;
    private String extractedText;

    public ResumeUploadResponse() {
    }

    public ResumeUploadResponse(Long id, String fileName, String fileType, int extractedCharacterCount, String textPreview, LocalDateTime uploadedAt) {
        this(id, fileName, fileType, extractedCharacterCount, textPreview, uploadedAt, null);
    }

    public ResumeUploadResponse(Long id, String fileName, String fileType, int extractedCharacterCount, String textPreview, LocalDateTime uploadedAt, String extractedText) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.extractedCharacterCount = extractedCharacterCount;
        this.textPreview = textPreview;
        this.uploadedAt = uploadedAt;
        this.extractedText = extractedText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public int getExtractedCharacterCount() {
        return extractedCharacterCount;
    }

    public void setExtractedCharacterCount(int extractedCharacterCount) {
        this.extractedCharacterCount = extractedCharacterCount;
    }

    public String getTextPreview() {
        return textPreview;
    }

    public void setTextPreview(String textPreview) {
        this.textPreview = textPreview;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
}
