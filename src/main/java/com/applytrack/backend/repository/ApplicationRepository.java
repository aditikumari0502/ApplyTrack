package com.applytrack.backend.repository;

import com.applytrack.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository
        extends JpaRepository<Application, Integer> {
}