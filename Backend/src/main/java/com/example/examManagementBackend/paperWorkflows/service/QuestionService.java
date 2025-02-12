package com.example.examManagementBackend.paperWorkflows.service;

import com.example.examManagementBackend.paperWorkflows.dto.*;
import com.example.examManagementBackend.paperWorkflows.entity.*;
import com.example.examManagementBackend.paperWorkflows.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final EncryptedPaperRepository encryptedPaperRepository;

    private final QuestionStructureRepository questionStructureRepository;

    private final SubQuestionRepository subQuestionRepository;

    private final SubSubQuestionRepository subSubQuestionRepository;

    private final QuestionTemplateRepository questionTemplateRepository;

    public QuestionService(EncryptedPaperRepository encryptedPaperRepository, QuestionStructureRepository questionStructureRepository, SubQuestionRepository subQuestionRepository, SubSubQuestionRepository subSubQuestionRepository, QuestionTemplateRepository questionTemplateRepository) {
        this.encryptedPaperRepository = encryptedPaperRepository;
        this.questionStructureRepository = questionStructureRepository;
        this.subQuestionRepository = subQuestionRepository;
        this.subSubQuestionRepository = subSubQuestionRepository;
        this.questionTemplateRepository = questionTemplateRepository;
    }

    public void saveQuestionStructure(Long paperId, List<QuestionStructureDTO> questionStructureDTOs) {
        EncryptedPaper paper = encryptedPaperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        List<QuestionStructureEntity> questionEntities = questionStructureDTOs.stream().map(dto -> {
            QuestionStructureEntity questionEntity = new QuestionStructureEntity();
            questionEntity.setEncryptedPaper(paper);
            questionEntity.setQuestionNumber(dto.getQuestionNumber());
            questionEntity.setQuestionType(dto.getQuestionType());
            questionEntity.setTotalMarks(dto.getTotalMarks());

            return getQuestionStructureEntity(dto, questionEntity);
        }).collect(Collectors.toList());

        questionStructureRepository.saveAll(questionEntities);
    }

    public List<QuestionStructureDTO> getQuestionStructure(Long paperId) {
        List<QuestionStructureEntity> questionEntities = questionStructureRepository.findByEncryptedPaperId(paperId);

        if (questionEntities.isEmpty()) {
            // Log a warning and handle gracefully
            System.out.println("No question structure found for paper ID: " + paperId);
        }

        return questionEntities.stream().map(entity -> {
            QuestionStructureDTO dto = new QuestionStructureDTO();
            dto.setQuestionId(entity.getId());
            dto.setQuestionNumber(entity.getQuestionNumber());
            dto.setQuestionType(entity.getQuestionType());
            dto.setTotalMarks(entity.getTotalMarks());
            dto.setModeratorComment(entity.getModeratorComment());
            dto.setStatus(entity.getStatus());
            dto.setPaperId(entity.getEncryptedPaper().getId());

            List<SubQuestionDTO> subQuestions = entity.getSubQuestions().stream().map(subEntity -> {
                SubQuestionDTO subDto = new SubQuestionDTO();
                subDto.setSubQuestionId(subEntity.getId());
                subDto.setSubQuestionNumber(subEntity.getSubQuestionNumber());
                subDto.setQuestionType(subEntity.getQuestionType());
                subDto.setMarks(subEntity.getMarks());
                subDto.setModeratorComment(subEntity.getModeratorComment());
                subDto.setStatus(subEntity.getStatus());

                List<SubSubQuestionDTO> subSubQuestions = subEntity.getSubSubQuestions().stream().map(subSubEntity -> {
                    SubSubQuestionDTO subSubDto = new SubSubQuestionDTO();
                    subSubDto.setSubSubQuestionId(subSubEntity.getId());
                    subSubDto.setSubSubQuestionNumber(subSubEntity.getSubSubQuestionNumber());
                    subSubDto.setQuestionType(subSubEntity.getQuestionType());
                    subSubDto.setMarks(subSubEntity.getMarks());
                    subSubDto.setModeratorComment(subSubEntity.getModeratorComment());
                    subSubDto.setStatus(subSubEntity.getStatus());
                    return subSubDto;
                }).collect(Collectors.toList());

                subDto.setSubSubQuestions(subSubQuestions);
                return subDto;
            }).collect(Collectors.toList());

            dto.setSubQuestions(subQuestions);
            return dto;
        }).collect(Collectors.toList());
    }

    public void updateQuestionStructure(Long paperId, List<QuestionStructureDTO> updatedQuestionStructures) {
        EncryptedPaper paper = encryptedPaperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        List<QuestionStructureEntity> existingQuestions = questionStructureRepository.findByEncryptedPaperId(paperId);

        for (QuestionStructureDTO dto : updatedQuestionStructures) {
            Optional<QuestionStructureEntity> existingQuestionOpt = existingQuestions.stream()
                    .filter(q -> q.getId().equals(dto.getQuestionId()))
                    .findFirst();

            QuestionStructureEntity questionEntity = existingQuestionOpt.orElse(new QuestionStructureEntity());
            questionEntity.setEncryptedPaper(paper);
            questionEntity.setQuestionNumber(dto.getQuestionNumber());
            questionEntity.setQuestionType(dto.getQuestionType());
            questionEntity.setTotalMarks(dto.getTotalMarks());
            questionEntity.setModeratorComment(dto.getModeratorComment());
            questionEntity.setStatus(dto.getStatus());

            List<SubQuestionEntity> subQuestions = dto.getSubQuestions().stream().map(subDto -> {
                SubQuestionEntity subQuestion = subDto.getSubQuestionId() != null ?
                        subQuestionRepository.findById(subDto.getSubQuestionId()).orElse(new SubQuestionEntity()) :
                        new SubQuestionEntity();
                subQuestion.setQuestionStructure(questionEntity);
                subQuestion.setSubQuestionNumber(subDto.getSubQuestionNumber());
                subQuestion.setQuestionType(subDto.getQuestionType());
                subQuestion.setMarks(subDto.getMarks());

                List<SubSubQuestionEntity> subSubQuestions = subDto.getSubSubQuestions().stream().map(subSubDto -> {
                    SubSubQuestionEntity subSubQuestion = subSubDto.getSubSubQuestionId() != null ?
                            subSubQuestionRepository.findById(subSubDto.getSubSubQuestionId()).orElse(new SubSubQuestionEntity()) :
                            new SubSubQuestionEntity();
                    subSubQuestion.setSubQuestion(subQuestion);
                    subSubQuestion.setSubSubQuestionNumber(subSubDto.getSubSubQuestionNumber());
                    subSubQuestion.setQuestionType(subSubDto.getQuestionType());
                    subSubQuestion.setMarks(subSubDto.getMarks());
                    return subSubQuestion;
                }).collect(Collectors.toList());

                subQuestion.setSubSubQuestions(subSubQuestions);
                return subQuestion;
            }).collect(Collectors.toList());

            questionEntity.setSubQuestions(subQuestions);

            questionStructureRepository.save(questionEntity);
        }
    }

    public void deleteQuestionStructure(Long paperId) {
        List<QuestionStructureEntity> questionEntities = questionStructureRepository.findByEncryptedPaperId(paperId);
        if (questionEntities.isEmpty()) {
            throw new RuntimeException("No question structure found for paper ID: " + paperId);
        }
        questionStructureRepository.deleteAll(questionEntities);
    }

    public void deleteSubQuestion(Long subQuestionId) {
        SubQuestionEntity subQuestion = subQuestionRepository.findById(subQuestionId)
                .orElseThrow(() -> new RuntimeException("Sub-question not found with ID: " + subQuestionId));
        subQuestionRepository.delete(subQuestion);
    }

    public void deleteSubSubQuestion(Long subSubQuestionId) {
        SubSubQuestionEntity subSubQuestion = subSubQuestionRepository.findById(subSubQuestionId)
                .orElseThrow(() -> new RuntimeException("Sub-sub-question not found with ID: " + subSubQuestionId));
        subSubQuestionRepository.delete(subSubQuestion);
    }

    @Transactional
    public void saveTemplateAndStructure(QuestionTemplateDTO templateDTO, List<QuestionStructureDTO> questionStructureDTOs) {
        // Save Template
        QuestionTemplateEntity template = new QuestionTemplateEntity();
        template.setTemplateName(templateDTO.getTemplateName());
        questionTemplateRepository.save(template);

        List<QuestionStructureEntity> questionEntities = questionStructureDTOs.stream().map(dto -> {
            QuestionStructureEntity questionEntity = new QuestionStructureEntity();
            questionEntity.setQuestionNumber(dto.getQuestionNumber());
            questionEntity.setQuestionType(dto.getQuestionType());
            questionEntity.setTotalMarks(dto.getTotalMarks());
            questionEntity.setTemplate(template); // Associate template with structure

            return getQuestionStructureEntity(dto, questionEntity);
        }).collect(Collectors.toList());

        questionStructureRepository.saveAll(questionEntities);
    }

    public List<QuestionTemplateDTO> getAllTemplates() {
        List<QuestionTemplateEntity> templates = questionTemplateRepository.findAll();
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Fetch a specific template by ID
    public QuestionTemplateDTO getTemplateById(Long templateId) {
        QuestionTemplateEntity template = questionTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found with ID: " + templateId));
        return convertToDTO(template);
    }

    private QuestionTemplateDTO convertToDTO(QuestionTemplateEntity entity) {
        QuestionTemplateDTO dto = new QuestionTemplateDTO();
        dto.setTemplateId(entity.getId());
        dto.setTemplateName(entity.getTemplateName());
        return dto;
    }

    private QuestionStructureEntity getQuestionStructureEntity(QuestionStructureDTO dto, QuestionStructureEntity questionEntity) {
        List<SubQuestionEntity> subQuestions = dto.getSubQuestions().stream().map(subDto -> {
            SubQuestionEntity subQuestion = new SubQuestionEntity();
            subQuestion.setQuestionStructure(questionEntity);
            subQuestion.setSubQuestionNumber(subDto.getSubQuestionNumber());
            subQuestion.setQuestionType(subDto.getQuestionType());
            subQuestion.setMarks(subDto.getMarks());

            List<SubSubQuestionEntity> subSubQuestions = subDto.getSubSubQuestions().stream().map(subSubDto -> {
                SubSubQuestionEntity subSubQuestion = new SubSubQuestionEntity();
                subSubQuestion.setSubQuestion(subQuestion);
                subSubQuestion.setSubSubQuestionNumber(subSubDto.getSubSubQuestionNumber());
                subSubQuestion.setQuestionType(subSubDto.getQuestionType());
                subSubQuestion.setMarks(subSubDto.getMarks());
                return subSubQuestion;
            }).collect(Collectors.toList());

            subQuestion.setSubSubQuestions(subSubQuestions);
            return subQuestion;
        }).collect(Collectors.toList());

        questionEntity.setSubQuestions(subQuestions);
        return questionEntity;
    }

    public TemplateAndStructureDTO getTemplateWithQuestionStructure(Long templateId) {
        // Fetch the template entity by ID
        QuestionTemplateEntity template = questionTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found with ID: " + templateId));

        // Fetch the question structures associated with the template
        List<QuestionStructureEntity> questionStructures = questionStructureRepository.findByTemplateId(templateId);

        // Map the template entity and question structure entities to DTOs
        TemplateAndStructureDTO templateAndStructureDTO = new TemplateAndStructureDTO();
        templateAndStructureDTO.setTemplate(convertToTemplateDTO(template));
        templateAndStructureDTO.setQuestionStructures(questionStructures.stream()
                .map(this::convertToQuestionStructureDTO)
                .collect(Collectors.toList()));

        return templateAndStructureDTO;
    }

    public List<TemplateAndStructureDTO> getAllTemplatesWithQuestionStructure() {
        // Fetch all templates
        List<QuestionTemplateEntity> templates = questionTemplateRepository.findAll();

        // For each template, fetch its associated question structures
        List<TemplateAndStructureDTO> result = new ArrayList<>();

        for (QuestionTemplateEntity template : templates) {
            List<QuestionStructureEntity> questionStructures = questionStructureRepository.findByTemplateId(template.getId());
            TemplateAndStructureDTO templateAndStructureDTO = new TemplateAndStructureDTO();
            templateAndStructureDTO.setTemplate(convertToTemplateDTO(template));
            templateAndStructureDTO.setQuestionStructures(questionStructures.stream()
                    .map(this::convertToQuestionStructureDTO)
                    .collect(Collectors.toList()));
            result.add(templateAndStructureDTO);
        }

        return result;
    }


    // Helper method to map a template entity to a DTO
    private QuestionTemplateDTO convertToTemplateDTO(QuestionTemplateEntity entity) {
        QuestionTemplateDTO dto = new QuestionTemplateDTO();
        dto.setTemplateId(entity.getId());
        dto.setTemplateName(entity.getTemplateName());
        return dto;
    }

    // Helper method to map a question structure entity to a DTO
    private QuestionStructureDTO convertToQuestionStructureDTO(QuestionStructureEntity entity) {
        QuestionStructureDTO dto = new QuestionStructureDTO();
        dto.setQuestionId(entity.getId());
        dto.setQuestionNumber(entity.getQuestionNumber());
        dto.setQuestionType(entity.getQuestionType());
        dto.setTotalMarks(entity.getTotalMarks());

        // Map sub-questions
        dto.setSubQuestions(entity.getSubQuestions().stream()
                .map(this::convertToSubQuestionDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    // Helper method to map sub-question entities to DTOs
    private SubQuestionDTO convertToSubQuestionDTO(SubQuestionEntity entity) {
        SubQuestionDTO dto = new SubQuestionDTO();
        dto.setSubQuestionId(entity.getId());
        dto.setSubQuestionNumber(entity.getSubQuestionNumber());
        dto.setQuestionType(entity.getQuestionType());
        dto.setMarks(entity.getMarks());

        // Map sub-sub-questions
        dto.setSubSubQuestions(entity.getSubSubQuestions().stream()
                .map(this::convertToSubSubQuestionDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    // Helper method to map sub-sub-question entities to DTOs
    private SubSubQuestionDTO convertToSubSubQuestionDTO(SubSubQuestionEntity entity) {
        SubSubQuestionDTO dto = new SubSubQuestionDTO();
        dto.setSubSubQuestionId(entity.getId());
        dto.setSubSubQuestionNumber(entity.getSubSubQuestionNumber());
        dto.setQuestionType(entity.getQuestionType());
        dto.setMarks(entity.getMarks());
        return dto;
    }

    public void deleteTemplateAndStructure(Long templateId) {
        // Fetch the template by ID
        QuestionTemplateEntity template = questionTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found with ID: " + templateId));

        // Fetch the associated question structures for the template
        List<QuestionStructureEntity> questionStructures = questionStructureRepository.findByTemplateId(templateId);
        // Now delete all question structures for the template
        questionStructureRepository.deleteAll(questionStructures);
        // Finally, delete the template
        questionTemplateRepository.delete(template);
    }


}


