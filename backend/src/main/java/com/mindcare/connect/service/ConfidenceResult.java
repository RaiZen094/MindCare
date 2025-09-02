package com.mindcare.connect.service;

import com.mindcare.connect.entity.PreApprovedProfessional;

public class ConfidenceResult {
    private double confidence;
    private String recommendation;
    private PreApprovedProfessional bestMatch;
    private String matchDetails;
    
    public ConfidenceResult(double confidence, String recommendation, 
                          PreApprovedProfessional bestMatch, String matchDetails) {
        this.confidence = confidence;
        this.recommendation = recommendation;
        this.bestMatch = bestMatch;
        this.matchDetails = matchDetails;
    }
    
    // Getters and setters
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    
    public PreApprovedProfessional getBestMatch() { return bestMatch; }
    public void setBestMatch(PreApprovedProfessional bestMatch) { this.bestMatch = bestMatch; }
    
    public String getMatchDetails() { return matchDetails; }
    public void setMatchDetails(String matchDetails) { this.matchDetails = matchDetails; }
    
    public String getConfidencePercentage() {
        return String.format("%.1f%%", confidence * 100);
    }
    
    public String getConfidenceLevel() {
        if (confidence >= 0.90) return "EXCELLENT";
        if (confidence >= 0.75) return "GOOD";
        if (confidence >= 0.50) return "FAIR";
        if (confidence >= 0.25) return "POOR";
        return "NO_MATCH";
    }
}
