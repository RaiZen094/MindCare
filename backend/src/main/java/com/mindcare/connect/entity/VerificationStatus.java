package com.mindcare.connect.entity;

public enum VerificationStatus {
    PENDING("Verification application submitted and pending review"),
    UNDER_REVIEW("Application is currently being reviewed by admin"),
    APPROVED("Verification approved - professional status granted"),
    REJECTED("Verification rejected - see rejection reason"),
    REVOKED("Previously approved verification has been revoked");

    private final String description;

    VerificationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public String getDisplayName() {
        switch (this) {
            case PENDING:
                return "Pending Review";
            case UNDER_REVIEW:
                return "Under Review";
            case APPROVED:
                return "Approved";
            case REJECTED:
                return "Rejected";
            case REVOKED:
                return "Revoked";
            default:
                return name();
        }
    }

    public boolean isFinal() {
        return this == APPROVED || this == REJECTED || this == REVOKED;
    }

    public boolean canBeModified() {
        return this == PENDING || this == UNDER_REVIEW;
    }
}
