package com.airesume.dto;

import java.util.ArrayList;
import java.util.List;

public class BulletItem {
    private String originalBullet;
    private String rewrittenBullet;
    private List<String> keySkillsHighlighted = new ArrayList<>();
    private String improvementReason;

    public BulletItem() {
    }

    public BulletItem(String originalBullet, String rewrittenBullet, List<String> keySkillsHighlighted, String improvementReason) {
        this.originalBullet = originalBullet;
        this.rewrittenBullet = rewrittenBullet;
        this.keySkillsHighlighted = keySkillsHighlighted;
        this.improvementReason = improvementReason;
    }

    public String getOriginalBullet() {
        return originalBullet;
    }

    public void setOriginalBullet(String originalBullet) {
        this.originalBullet = originalBullet;
    }

    public String getRewrittenBullet() {
        return rewrittenBullet;
    }

    public void setRewrittenBullet(String rewrittenBullet) {
        this.rewrittenBullet = rewrittenBullet;
    }

    public List<String> getKeySkillsHighlighted() {
        return keySkillsHighlighted;
    }

    public void setKeySkillsHighlighted(List<String> keySkillsHighlighted) {
        this.keySkillsHighlighted = keySkillsHighlighted;
    }

    public String getImprovementReason() {
        return improvementReason;
    }

    public void setImprovementReason(String improvementReason) {
        this.improvementReason = improvementReason;
    }
}
