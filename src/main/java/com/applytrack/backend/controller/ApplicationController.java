
package com.applytrack.backend.controller;

import com.applytrack.backend.entity.Application;
import com.applytrack.backend.repository.ApplicationRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5500", "http://localhost:5500"})
public class ApplicationController {

    private final ApplicationRepository repository;

    public ApplicationController(ApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Application> getAllApplications() {
        return repository.findAll();
    }

    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        return repository.save(application);
    }
    @PutMapping("/{id}")
public Application updateApplication(
        @PathVariable Integer id,
        @RequestBody Application updatedApplication) {

    Application existingApplication = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    existingApplication.setCompanyName(updatedApplication.getCompanyName());
    existingApplication.setJobRole(updatedApplication.getJobRole());
    existingApplication.setWorkMode(updatedApplication.getWorkMode());
    existingApplication.setApplicationStatus(updatedApplication.getApplicationStatus());
    existingApplication.setApplicationDate(updatedApplication.getApplicationDate());
    existingApplication.setFollowUpDate(updatedApplication.getFollowUpDate());
    existingApplication.setJobLink(updatedApplication.getJobLink());
    existingApplication.setNotes(updatedApplication.getNotes());

    return repository.save(existingApplication);
}

    @DeleteMapping("/{id}")
    public void deleteApplication(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}

