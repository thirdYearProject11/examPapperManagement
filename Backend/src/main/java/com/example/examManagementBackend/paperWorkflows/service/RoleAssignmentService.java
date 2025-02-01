package com.example.examManagementBackend.paperWorkflows.service;

import com.example.examManagementBackend.paperWorkflows.dto.CreateRoleAssignmentDTO;
import com.example.examManagementBackend.paperWorkflows.dto.RoleAssignmentDTO;
import com.example.examManagementBackend.paperWorkflows.entity.ExaminationEntity;
import com.example.examManagementBackend.paperWorkflows.entity.CoursesEntity;
import com.example.examManagementBackend.paperWorkflows.entity.RoleAssignmentEntity;
import com.example.examManagementBackend.paperWorkflows.repository.ExaminationRepository;
import com.example.examManagementBackend.paperWorkflows.repository.CoursesRepository;
import com.example.examManagementBackend.paperWorkflows.repository.RoleAssignmentRepository;

import com.example.examManagementBackend.userManagement.userManagementEntity.RolesEntity;
import com.example.examManagementBackend.userManagement.userManagementEntity.UserEntity;
import com.example.examManagementBackend.userManagement.userManagementRepo.RoleRepository;
import com.example.examManagementBackend.userManagement.userManagementRepo.UserManagementRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoleAssignmentService {

    @Autowired
    private RoleAssignmentRepository roleAssignmentRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private RoleRepository rolesRepository;

    @Autowired
    private UserManagementRepo userRepository;

    @Autowired
    private ExaminationRepository examinationRepository;

    public RoleAssignmentDTO assignRole(CreateRoleAssignmentDTO createRoleAssignmentDTO) {
        // Fetch required entities from the database
        CoursesEntity course = coursesRepository.findById(createRoleAssignmentDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + createRoleAssignmentDTO.getCourseId()));

        RolesEntity role = rolesRepository.findById(createRoleAssignmentDTO.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + createRoleAssignmentDTO.getRoleId()));

        UserEntity user = userRepository.findById(createRoleAssignmentDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + createRoleAssignmentDTO.getUserId()));

        ExaminationEntity examination = examinationRepository.findById(createRoleAssignmentDTO.getExaminationId())
                .orElseThrow(() -> new RuntimeException("Examination not found with ID: " + createRoleAssignmentDTO.getExaminationId()));

        // Check for duplicates before inserting
        boolean exists = roleAssignmentRepository.existsByCourseAndRoleAndExaminationIdAndPaperType(course, role, examination,createRoleAssignmentDTO.getPaperType());
        if (exists) {
            throw new RuntimeException("Role assignment already exists for the specified course, role, and Examination.");
        }
        // Create and save role assignment
        RoleAssignmentEntity roleAssignment = new RoleAssignmentEntity();
        roleAssignment.setCourse(course);
        roleAssignment.setRole(role);
        roleAssignment.setUserId(user);
        roleAssignment.setExaminationId(examination);
        roleAssignment.setIsAuthorized(createRoleAssignmentDTO.getIsAuthorized());
        roleAssignment.setPaperType(createRoleAssignmentDTO.getPaperType());
        roleAssignment = roleAssignmentRepository.save(roleAssignment);

        // Convert to DTO for return
        return new RoleAssignmentDTO(
                roleAssignment.getId(),
                roleAssignment.getCourse().getId(),
                roleAssignment.getRole().getRoleId(),
                roleAssignment.getUserId().getUserId(),
                roleAssignment.getExaminationId().getId(),
                roleAssignment.getIsAuthorized(),
                roleAssignment.getPaperType()
        );
    }

    @Transactional
    public List<RoleAssignmentDTO> assignMultipleRoles(List<CreateRoleAssignmentDTO> createRoleAssignmentsDTOs) {
        List<RoleAssignmentDTO> result = new ArrayList<>();

        for (CreateRoleAssignmentDTO createRoleAssignmentDTO : createRoleAssignmentsDTOs) {
            // Fetch required entities from the database
            CoursesEntity course = coursesRepository.findById(createRoleAssignmentDTO.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found with ID: " + createRoleAssignmentDTO.getCourseId()));

            RolesEntity role = rolesRepository.findById(createRoleAssignmentDTO.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with ID: " + createRoleAssignmentDTO.getRoleId()));

            UserEntity user = userRepository.findById(createRoleAssignmentDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + createRoleAssignmentDTO.getUserId()));

            ExaminationEntity examination = examinationRepository.findById(createRoleAssignmentDTO.getExaminationId())
                    .orElseThrow(() -> new RuntimeException("Examination not found with ID: " + createRoleAssignmentDTO.getExaminationId()));

            // Check for duplicates before inserting
            boolean exists = roleAssignmentRepository.existsByCourseAndRoleAndExaminationIdAndPaperType(course, role, examination, createRoleAssignmentDTO.getPaperType());
            if (exists) {
                throw new RuntimeException("Role assignment already exists for the specified course,paper type, role, and Examination.");
            }
            // Create and save role assignment
            RoleAssignmentEntity roleAssignment = new RoleAssignmentEntity();
            roleAssignment.setCourse(course);
            roleAssignment.setRole(role);
            roleAssignment.setUserId(user);
            roleAssignment.setExaminationId(examination);
            roleAssignment.setIsAuthorized(createRoleAssignmentDTO.getIsAuthorized());
            roleAssignment.setPaperType(createRoleAssignmentDTO.getPaperType());
            roleAssignment = roleAssignmentRepository.save(roleAssignment);

            // Convert to DTO for return
            RoleAssignmentDTO assignmentDTO = new RoleAssignmentDTO(
                    roleAssignment.getId(),
                    roleAssignment.getCourse().getId(),
                    roleAssignment.getRole().getRoleId(),
                    roleAssignment.getUserId().getUserId(),
                    roleAssignment.getExaminationId().getId(),
                    roleAssignment.getIsAuthorized(),
                    roleAssignment.getPaperType()
            );

            result.add(assignmentDTO);
        }
        return result;
    }

    public RoleAssignmentDTO authorizeRole(Long id) {
        RoleAssignmentEntity roleAssignment = roleAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role assignment not found with ID: " + id));

        roleAssignment.setIsAuthorized(true);
        RoleAssignmentEntity updatedRole = roleAssignmentRepository.save(roleAssignment);

        return new RoleAssignmentDTO(
                updatedRole.getId(),
                updatedRole.getCourse().getId(),
                updatedRole.getRole().getRoleId(),
                updatedRole.getUserId().getUserId(),
                updatedRole.getExaminationId().getId(),
                updatedRole.getIsAuthorized(),
                updatedRole.getPaperType()
        );
    }

    public void unassignRole(Long id) {
        RoleAssignmentEntity roleAssignment = roleAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role assignment not found with ID: " + id));

        roleAssignmentRepository.delete(roleAssignment);
    }

    public List<RoleAssignmentDTO> getAllRoleAssignments() {
        List<RoleAssignmentEntity> roleAssignments = roleAssignmentRepository.findAll();
        List<RoleAssignmentDTO> result = new ArrayList<>();

        for (RoleAssignmentEntity roleAssignment : roleAssignments) {
            result.add(new RoleAssignmentDTO(
                    roleAssignment.getId(),
                    roleAssignment.getCourse().getId(),
                    roleAssignment.getRole().getRoleId(),
                    roleAssignment.getUserId().getUserId(),
                    roleAssignment.getExaminationId().getId(),
                    roleAssignment.getIsAuthorized(),
                    roleAssignment.getPaperType()
            ));
        }

        return result;
    }

    public List<RoleAssignmentDTO> getRoleAssignmentsByUser(Long userId) {
        List<RoleAssignmentEntity> roleAssignments = roleAssignmentRepository.findByUserId_UserId(userId);
        List<RoleAssignmentDTO> result = new ArrayList<>();

        for (RoleAssignmentEntity roleAssignment : roleAssignments) {
            result.add(new RoleAssignmentDTO(
                    roleAssignment.getId(),
                    roleAssignment.getCourse().getId(),
                    roleAssignment.getRole().getRoleId(),
                    roleAssignment.getUserId().getUserId(),
                    roleAssignment.getExaminationId().getId(),
                    roleAssignment.getIsAuthorized(),
                    roleAssignment.getPaperType()
            ));
        }

        return result;
    }

    public List<RoleAssignmentDTO> getRoleAssignmentsByExamination(Long examinationId) {
        List<RoleAssignmentEntity> roleAssignments = roleAssignmentRepository.findByExaminationId_Id(examinationId);
        List<RoleAssignmentDTO> result = new ArrayList<>();

        for (RoleAssignmentEntity roleAssignment : roleAssignments) {
            result.add(new RoleAssignmentDTO(
                    roleAssignment.getId(),
                    roleAssignment.getCourse().getId(),
                    roleAssignment.getRole().getRoleId(),
                    roleAssignment.getUserId().getUserId(),
                    roleAssignment.getExaminationId().getId(),
                    roleAssignment.getIsAuthorized(),
                    roleAssignment.getPaperType()
            ));
        }

        return result;
    }

}


