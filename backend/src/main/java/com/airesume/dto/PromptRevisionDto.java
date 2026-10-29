package com.airesume.dto;

import com.airesume.entity.RevisionStatus;
import com.airesume.entity.TargetType;
import java.time.LocalDateTime;

public class PromptRevisionDto {
    private Long id;
    private TargetType targetType;
    private String promptText;
    private String outputText;
    private Integer revisionNumber;
    private RevisionStatus status;
    private Long parentRevisionId;
    private LocalDateTime createdAt;

    public PromptRevisionDto() {
    }

    public PromptRevisionDto(Long id, TargetType targetType, String promptText, String outputText, Integer revisionNumber, RevisionStatus status, Long parentRevisionId, LocalDateTime createdAt) {
        this.id = id;
        this.targetType = targetType;
        this.promptText = promptText;
        this.outputText = outputText;
        this.revisionNumber = revisionNumber;
        this.status = status;
        this.parentRevisionId = parentRevisionId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TargetType getTargetType() {
        return targetType;
    }

    public void setTargetType(TargetType targetType) {
        this.targetType = targetType;
    }

    public String getPromptText() {
        return promptText;
    }

    public void setPromptText(String promptText) {
        this.promptText = promptText;
    }

    public String getOutputText() {
        return outputText;
    }

    public void setOutputText(String outputText) {
        this.outputText = outputText;
    }

    public Integer getRevisionNumber() {
        return revisionNumber;
    }

    public void setRevisionNumber(Integer revisionNumber) {
        this.revisionNumber = revisionNumber;
    }

    public RevisionStatus getStatus() {
        return status;
    }

    public void setStatus(RevisionStatus status) {
        this.status = status;
    }

    public Long getParentRevisionId() {
        return parentRevisionId;
    }

    public void setParentRevisionId(Long parentRevisionId) {
        this.parentRevisionId = parentRevisionId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
