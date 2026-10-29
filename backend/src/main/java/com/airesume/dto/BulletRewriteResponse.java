package com.airesume.dto;

import java.util.ArrayList;
import java.util.List;

public class BulletRewriteResponse {
    private List<BulletItem> rewrittenBullets = new ArrayList<>();
    private Long revisionId;
    private Integer revisionNumber;
    private String usedPromptInstruction;

    public BulletRewriteResponse() {
    }

    public BulletRewriteResponse(List<BulletItem> rewrittenBullets, Long revisionId, Integer revisionNumber, String usedPromptInstruction) {
        this.rewrittenBullets = rewrittenBullets;
        this.revisionId = revisionId;
        this.revisionNumber = revisionNumber;
        this.usedPromptInstruction = usedPromptInstruction;
    }

    public List<BulletItem> getRewrittenBullets() {
        return rewrittenBullets;
    }

    public void setRewrittenBullets(List<BulletItem> rewrittenBullets) {
        this.rewrittenBullets = rewrittenBullets;
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

    public String getUsedPromptInstruction() {
        return usedPromptInstruction;
    }

    public void setUsedPromptInstruction(String usedPromptInstruction) {
        this.usedPromptInstruction = usedPromptInstruction;
    }
}
