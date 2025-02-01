package com.example.examManagementBackend.paperWorkflows.service;

import com.example.examManagementBackend.paperWorkflows.dto.ExaminationCoursesDTO;
import com.example.examManagementBackend.paperWorkflows.dto.ExaminationDTO;
import com.example.examManagementBackend.paperWorkflows.entity.CoursesEntity;
import com.example.examManagementBackend.paperWorkflows.entity.Enums.PaperType;
import com.example.examManagementBackend.paperWorkflows.entity.ExaminationEntity;
import com.example.examManagementBackend.paperWorkflows.entity.DegreeProgramsEntity;
import com.example.examManagementBackend.paperWorkflows.entity.RoleAssignmentEntity;
import com.example.examManagementBackend.paperWorkflows.repository.ExaminationRepository;
import com.example.examManagementBackend.paperWorkflows.repository.DegreeProgramRepo;
import com.example.examManagementBackend.paperWorkflows.repository.RoleAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExaminationService {

    private ExaminationRepository examinationRepository;

    public ExaminationService(ExaminationRepository examinationRepository) {
        this.examinationRepository = examinationRepository;
    }

    @Autowired
    private DegreeProgramRepo degreeProgramsRepository;

    @Autowired
    private RoleAssignmentRepository roleAssignmentRepository;


    public ExaminationDTO createExamination(ExaminationDTO examinationDTO) {
        DegreeProgramsEntity degreeProgram = degreeProgramsRepository.findById(examinationDTO.getDegreeProgramId())
                .orElseThrow(() -> new RuntimeException("Degree Program not found"));

        ExaminationEntity entity = new ExaminationEntity();
        entity.setYear(examinationDTO.getYear());
        entity.setLevel(examinationDTO.getLevel());
        entity.setSemester(examinationDTO.getSemester());
        entity.setDegreeProgramsEntity(degreeProgram);

        ExaminationEntity savedEntity = examinationRepository.save(entity);

        return mapToDTO(savedEntity);
    }


    public ExaminationDTO getExaminationById(Long id) {
        ExaminationEntity entity = examinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Examination not found"));
        return mapToDTO(entity);
    }


    public List<ExaminationDTO> getAllExaminations() {
        return examinationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    public ExaminationDTO updateExamination(Long id, ExaminationDTO examinationDTO) {
        ExaminationEntity entity = examinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Examination not found"));

        DegreeProgramsEntity degreeProgram = degreeProgramsRepository.findById(examinationDTO.getDegreeProgramId())
                .orElseThrow(() -> new RuntimeException("Degree Program not found"));

        entity.setYear(examinationDTO.getYear());
        entity.setLevel(examinationDTO.getLevel());
        entity.setSemester(examinationDTO.getSemester());
        entity.setDegreeProgramsEntity(degreeProgram);

        ExaminationEntity updatedEntity = examinationRepository.save(entity);

        return mapToDTO(updatedEntity);
    }


    public void deleteExamination(Long id) {
        if (!examinationRepository.existsById(id)) {
            throw new RuntimeException("Examination not found");
        }
        examinationRepository.deleteById(id);
    }

    private ExaminationDTO mapToDTO(ExaminationEntity entity) {
        ExaminationDTO dto = new ExaminationDTO();
        dto.setId(entity.getId());
        dto.setYear(entity.getYear());
        dto.setLevel(entity.getLevel());
        dto.setSemester(entity.getSemester());
        dto.setDegreeProgramId(entity.getDegreeProgramsEntity().getId());
        return dto;
    }

    public ExaminationCoursesDTO getExaminationWithCoursesById(Long examinationId) {
        ExaminationEntity examination = examinationRepository.findById(examinationId)
                .orElseThrow(() -> new RuntimeException("Examination not found with id: " + examinationId));

        DegreeProgramsEntity degreeProgram = examination.getDegreeProgramsEntity();
        if (degreeProgram == null) {
            throw new RuntimeException("Degree program not found for examination id: " + examinationId);
        }

        List<ExaminationCoursesDTO.ActiveCourseDTO> activeCourses = degreeProgram.getCoursesEntities().stream()
                .filter(course -> isCourseActiveAndMatchesExamination(course, examination))
                .flatMap(course -> mapCourseToActiveCourseDTOs(course, examination).stream())
                .collect(Collectors.toList());

        return ExaminationCoursesDTO.builder()
                .id(examination.getId())
                .degreeId(degreeProgram.getId())
                .degreeName(degreeProgram.getDegreeName())
                .activeCourses(activeCourses)
                .build();
    }

    private boolean isCourseActiveAndMatchesExamination(CoursesEntity course, ExaminationEntity examination) {
        return course.getLevel().equals(Integer.parseInt(examination.getLevel())) &&
                course.getSemester().equals(examination.getSemester()) &&
                course.getIsActive();
    }

    private List<ExaminationCoursesDTO.ActiveCourseDTO> mapCourseToActiveCourseDTOs(CoursesEntity course, ExaminationEntity examination) {
        if ("BOTH".equalsIgnoreCase(course.getCourseType().toString())) {
            return handleBothCourseType(course, examination);
        } else {
            // For non-BOTH course types, include the course as is
            return Collections.singletonList(new ExaminationCoursesDTO.ActiveCourseDTO(
                    course.getId(), course.getCode(), course.getName(), course.getCourseType()
            ));
        }
    }

    private List<ExaminationCoursesDTO.ActiveCourseDTO> handleBothCourseType(CoursesEntity course, ExaminationEntity examination) {
        boolean hasTheoryAssigned = roleAssignmentRepository.existsByCourseIdAndExaminationIdAndPaperType(
                course.getId(), examination, PaperType.THEORY
        );
        boolean hasPracticalAssigned = roleAssignmentRepository.existsByCourseIdAndExaminationIdAndPaperType(
                course.getId(), examination, PaperType.PRACTICAL
        );

        if (hasTheoryAssigned && hasPracticalAssigned) {
            // Exclude the course entirely if both THEORY and PRACTICAL are assigned
            return Collections.emptyList();
        } else if (hasTheoryAssigned) {
            // Only include PRACTICAL if THEORY is already assigned
            return Collections.singletonList(new ExaminationCoursesDTO.ActiveCourseDTO(
                    course.getId(), course.getCode(), course.getName(), CoursesEntity.CourseType.PRACTICAL
            ));
        } else if (hasPracticalAssigned) {
            // Only include THEORY if PRACTICAL is already assigned
            return Collections.singletonList(new ExaminationCoursesDTO.ActiveCourseDTO(
                    course.getId(), course.getCode(), course.getName(), CoursesEntity.CourseType.THEORY
            ));
        } else {
            // Include both THEORY and PRACTICAL if neither is assigned
            return Arrays.asList(
                    new ExaminationCoursesDTO.ActiveCourseDTO(
                            course.getId(), course.getCode(), course.getName(), CoursesEntity.CourseType.THEORY
                    ),
                    new ExaminationCoursesDTO.ActiveCourseDTO(
                            course.getId(), course.getCode(), course.getName(), CoursesEntity.CourseType.PRACTICAL
                    )
            );
        }
    }


}
