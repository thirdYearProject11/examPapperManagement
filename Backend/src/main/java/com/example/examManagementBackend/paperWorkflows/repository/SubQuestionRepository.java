package com.example.examManagementBackend.paperWorkflows.repository;

import com.example.examManagementBackend.paperWorkflows.entity.SubQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubQuestionRepository extends JpaRepository<SubQuestionEntity, Long> {
    // Additional query methods (if needed) can be added here.
}
