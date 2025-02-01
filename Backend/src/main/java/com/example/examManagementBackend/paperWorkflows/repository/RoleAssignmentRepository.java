package com.example.examManagementBackend.paperWorkflows.repository;

import com.example.examManagementBackend.paperWorkflows.entity.Enums.PaperType;
import com.example.examManagementBackend.paperWorkflows.entity.ExaminationEntity;
import com.example.examManagementBackend.paperWorkflows.entity.CoursesEntity;
import com.example.examManagementBackend.paperWorkflows.entity.RoleAssignmentEntity;
import com.example.examManagementBackend.userManagement.userManagementEntity.RolesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleAssignmentRepository extends JpaRepository<RoleAssignmentEntity, Long> {

    // Check if a role assignment already exists for a given combination of course, role, and academic year
    boolean existsByCourseAndRoleAndExaminationIdAndPaperType(CoursesEntity course, RolesEntity role, ExaminationEntity academicYear, PaperType paperType);
    List<RoleAssignmentEntity> findByUserId_UserId(Long userId);
    List<RoleAssignmentEntity> findByExaminationId_Id(Long examinationId);
    // Check if a specific paper type (THEORY/PRACTICAL) is assigned to a course in an examination
    boolean existsByCourseIdAndExaminationIdAndPaperType(Long course_id, ExaminationEntity examinationId, PaperType paperType);

}

