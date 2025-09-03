package com.mindcare.connect.service;

import com.mindcare.connect.entity.PreApprovedProfessional;

public class AutoVerificationResult {
    private boolean approved;
    private double confidence;
    private String reason;
    private PreApprovedProfessional matchedProfessional;
    
    public AutoVerificationResult(boolean approved, double confidence, String reason, 
                                PreApprovedProfessional matchedProfessional) {
        this.approved = approved;
        this.confidence = confidence;
        this.reason = reason;
        this.matchedProfessional = matchedProfessional;
    }
    
    // Getters and setters
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public PreApprovedProfessional getMatchedProfessional() { return matchedProfessional; }
    public void setMatchedProfessional(PreApprovedProfessional matchedProfessional) { 
        this.matchedProfessional = matchedProfessional; 
    }
}
