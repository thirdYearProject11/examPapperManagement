package com.example.examManagementBackend.paperWorkflows.repo;

import com.example.examManagementBackend.paperWorkflows.entity.DegreeProgramCourseEntity;
import com.example.examManagementBackend.paperWorkflows.entity.DegreeProgramsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DegreeProgramRepo extends JpaRepository<DegreeProgramsEntity, Integer> {
    Optional<DegreeProgramsEntity> findById(int id);
}
