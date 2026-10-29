package com.airesume.dto;

import com.airesume.entity.TargetType;
import jakarta.validation.constraints.NotNull;

public class PromptRollbackRequest {

    @NotNull(message = "Target type is required")
    private TargetType targetType;

    @NotNull(message = "Revision ID to rollback to is required")
    private Long targetRevisionId;

    public PromptRollbackRequest() {
    }

    public PromptRollbackRequest(TargetType targetType, Long targetRevisionId) {
        this.targetType = targetType;
        this.targetRevisionId = targetRevisionId;
    }

    public TargetType getTargetType() {
        return targetType;
    }

    public void setTargetType(TargetType targetType) {
        this.targetType = targetType;
    }

    public Long getTargetRevisionId() {
        return targetRevisionId;
    }

    public void setTargetRevisionId(Long targetRevisionId) {
        this.targetRevisionId = targetRevisionId;
    }
}
