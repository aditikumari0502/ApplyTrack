
package com.applytrack.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;

@Entity
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String companyName;
    private String jobRole;
    private String applicationStatus;
    private LocalDate followUpDate;
    private LocalDate applicationDate;
    private String jobLink;
    private String notes;
    private String workMode;

    public Application() {
    }

    public Integer getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getJobRole() {
        return jobRole;
    }

    public String getApplicationStatus() {
        return applicationStatus;
    }

    public LocalDate getApplicationDate() {
    return applicationDate;
}

    public LocalDate getFollowUpDate() {
    return followUpDate;
}

public void setFollowUpDate(LocalDate followUpDate) {
    this.followUpDate = followUpDate;
}

    public String getJobLink() {
        return jobLink;
    }

    public String getNotes() {
        return notes;
    }

    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setJobRole(String jobRole) {
        this.jobRole = jobRole;
    }

    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public void setJobLink(String jobLink) {
        this.jobLink = jobLink;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getWorkMode() {
    return workMode;
}

    public void setWorkMode(String workMode) {
        this.workMode = workMode;
    }

}
