package com.example.examManagementBackend.paperWorkflows.service;

import com.example.examManagementBackend.paperWorkflows.dto.QuestionModerationDTO;
import com.example.examManagementBackend.paperWorkflows.dto.SubQuestionModerationDTO;
import com.example.examManagementBackend.paperWorkflows.dto.SubSubQuestionModerationDTO;
import com.example.examManagementBackend.paperWorkflows.entity.EncryptedPaper;
import com.example.examManagementBackend.paperWorkflows.entity.Enums.ExamPaperStatus;
import com.example.examManagementBackend.paperWorkflows.entity.QuestionStructureEntity;
import com.example.examManagementBackend.paperWorkflows.entity.SubQuestionEntity;
import com.example.examManagementBackend.paperWorkflows.entity.SubSubQuestionEntity;
import com.example.examManagementBackend.paperWorkflows.repository.EncryptedPaperRepository;
import com.example.examManagementBackend.paperWorkflows.repository.QuestionStructureRepository;
import com.example.examManagementBackend.paperWorkflows.repository.SubQuestionRepository;
import com.example.examManagementBackend.paperWorkflows.repository.SubSubQuestionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ModerationService {

    private final QuestionStructureRepository questionRepository;

    private final SubQuestionRepository subQuestionRepository;

    private final SubSubQuestionRepository subSubQuestionRepository;

    private final EncryptedPaperRepository encryptedPaperRepository;

    public ModerationService(QuestionStructureRepository questionRepository, SubQuestionRepository subQuestionRepository, SubSubQuestionRepository subSubQuestionRepository, EncryptedPaperRepository encryptedPaperRepository) {
        this.questionRepository = questionRepository;
        this.subQuestionRepository = subQuestionRepository;
        this.subSubQuestionRepository = subSubQuestionRepository;
        this.encryptedPaperRepository = encryptedPaperRepository;
    }

    public void moderateQuestionWithHierarchy(QuestionModerationDTO dto) {
        // Moderate the main question
        if (questionRepository.existsById(dto.getQuestionId())) {
            QuestionStructureEntity question = questionRepository.findById(dto.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Main question not found"));
            question.setModeratorComment(dto.getComment());
            question.setStatus(dto.getStatus());
            questionRepository.save(question);

            // Moderate sub-questions
            for (SubQuestionModerationDTO subQuestionDTO : dto.getSubQuestions()) {
                SubQuestionEntity subQuestion = subQuestionRepository.findById(subQuestionDTO.getSubQuestionId())
                        .orElseThrow(() -> new RuntimeException("Sub-question not found"));
                subQuestion.setModeratorComment(subQuestionDTO.getComment());
                subQuestion.setStatus(subQuestionDTO.getStatus());
                subQuestionRepository.save(subQuestion);

                // Moderate sub-sub-questions
                for (SubSubQuestionModerationDTO subSubQuestionDTO : subQuestionDTO.getSubSubQuestions()) {
                    SubSubQuestionEntity subSubQuestion = subSubQuestionRepository.findById(subSubQuestionDTO.getSubSubQuestionId())
                            .orElseThrow(() -> new RuntimeException("Sub-sub-question not found"));
                    subSubQuestion.setModeratorComment(subSubQuestionDTO.getComment());
                    subSubQuestion.setStatus(subSubQuestionDTO.getStatus());
                    subSubQuestionRepository.save(subSubQuestion);
                }
            }
            // Auto approve paper if all main questions are approved
            autoApprovePaperIfAllQuestionsApproved(question.getEncryptedPaper().getId());
        } else {
            throw new RuntimeException("Main question not found for moderation");
        }
    }

    private void autoApprovePaperIfAllQuestionsApproved(Long paperId) {
        EncryptedPaper paper = encryptedPaperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        boolean allQuestionsApproved = questionRepository.findByEncryptedPaperId(paperId)
                .stream()
                .allMatch(q -> q.getStatus().toString().equals(ExamPaperStatus.APPROVED.toString()));

        if (allQuestionsApproved) {
            paper.setStatus(ExamPaperStatus.APPROVED);
            encryptedPaperRepository.save(paper);
        }
    }

    public String updateStatusAndFeedback(Long id, ExamPaperStatus status, String feedback) {
        EncryptedPaper paper = encryptedPaperRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Paper not found"));

        boolean statusUpdated = false;
        boolean feedbackUpdated = false;

        if (status != null) {
            paper.setStatus(status);
            statusUpdated = true;
        }

        if (feedback != null && !feedback.isEmpty()) {
            paper.setFeedback(feedback);
            feedbackUpdated = true;
        }

        encryptedPaperRepository.save(paper);

        if (statusUpdated && feedbackUpdated) {
            return "Status and feedback updated successfully.";
        } else if (statusUpdated) {
            return "Status updated successfully.";
        } else if (feedbackUpdated) {
            return "Feedback updated successfully.";
        } else {
            return "No changes were made.";
        }
    }
}
