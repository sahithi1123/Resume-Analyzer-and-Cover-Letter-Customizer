package com.airesume.dto;

import java.util.ArrayList;
import java.util.List;

public class KeywordAnalysisResponse {
    private int matchScore; // 0 to 100
    private List<String> matchedKeywords = new ArrayList<>();
    private List<String> missingKeywords = new ArrayList<>();
    private List<String> recommendedAdditions = new ArrayList<>();
    private String summary;
    private Long revisionId;

    public KeywordAnalysisResponse() {
    }

    public KeywordAnalysisResponse(int matchScore, List<String> matchedKeywords, List<String> missingKeywords, List<String> recommendedAdditions, String summary, Long revisionId) {
        this.matchScore = matchScore;
        this.matchedKeywords = matchedKeywords;
        this.missingKeywords = missingKeywords;
        this.recommendedAdditions = recommendedAdditions;
        this.summary = summary;
        this.revisionId = revisionId;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }

    public void setMatchedKeywords(List<String> matchedKeywords) {
        this.matchedKeywords = matchedKeywords;
    }

    public List<String> getMissingKeywords() {
        return missingKeywords;
    }

    public void setMissingKeywords(List<String> missingKeywords) {
        this.missingKeywords = missingKeywords;
    }

    public List<String> getRecommendedAdditions() {
        return recommendedAdditions;
    }

    public void setRecommendedAdditions(List<String> recommendedAdditions) {
        this.recommendedAdditions = recommendedAdditions;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Long getRevisionId() {
        return revisionId;
    }

    public void setRevisionId(Long revisionId) {
        this.revisionId = revisionId;
    }
}
