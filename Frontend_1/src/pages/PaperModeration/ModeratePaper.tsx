import { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Loader from '../../common/Loader';
import { Link, useLocation } from 'react-router-dom';
import QuestionStructure from './QuestionStructure';
import useApi from '../../api/api';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import useAuth from '../../hooks/useAuth';

export default function ModeratePaper() {
  const { auth } = useAuth();
  const moderatorId = Number(auth.id);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [questionStructure, setQuestionStructure] = useState<any>(null);
  const {
    fetchEncryptedPaper,
    getPaperStructure,
    createModeration,
    updatePaperStatusAndFeedback,
    getPaperStatus,
  } = useApi();
  const [feedback, setFeedback] = useState<string>('');
  const [paperStatus, setPaperStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const { paperId } = location.state || {};

  const fetchPdf = async () => {
    try {
      const response = await fetchEncryptedPaper(
        Number(paperId),
        Number(moderatorId),
      );
      const url = URL.createObjectURL(response.data);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  const fetchQuestionStructure = async () => {
    try {
      const response = await getPaperStructure(Number(paperId));
      if (response.data.data && Object.keys(response.data.data).length > 0) {
        setQuestionStructure(response.data);
        console.log('Question structure fetched:', response.data);
      } else {
        console.log('Question structure is empty. Not updating the state.');
      }
    } catch (error) {
      console.error('Error fetching question structure:', error);
    }
  };

  const fetchPaperStatus = async () => {
    try {
      const response = await getPaperStatus(Number(paperId));
      if (response.data) {
        setPaperStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching paper status:', error);
    }
  };

  const approvePaper = async () => {
    try {
      const response = await updatePaperStatusAndFeedback(
        Number(paperId),
        'APPROVED',
        feedback,
      );
      if (response.code === 200) {
        fetchPaperStatus();
        console.log('Paper approved successfully');
      }
    } catch (error) {
      console.error('Error approving paper:', error);
    }
  };

  const handleApproveClick = () => {
    setShowModal(true);
  };

  const handleConfirmApprove = () => {
    setShowModal(false);
    approvePaper();
  };

  const updateModerationForMainQuestion = async (questionId: number) => {
    const updatedStructure = { ...questionStructure };
    const question = updatedStructure.data.find(
      (q: any) => q.questionId === questionId,
    );

    if (question) {
      try {
        const response = await createModeration({
          questionId: question.questionId,
          comment: question.comment || '',
          status: question.status || 'PENDING',
          subQuestions: question.subQuestions.map((subQuestion: any) => ({
            subQuestionId: subQuestion.subQuestionId,
            comment: subQuestion.comment || '',
            status: subQuestion.status || 'PENDING',
            subSubQuestions: subQuestion.subSubQuestions.map(
              (subSubQuestion: any) => ({
                subSubQuestionId: subSubQuestion.subSubQuestionId,
                comment: subSubQuestion.comment || '',
                status: subSubQuestion.status || 'PENDING',
              }),
            ),
          })),
        });

        if (response.data.code === 200) {
          console.log('Main question moderated successfully');
          fetchQuestionStructure(); // Fetch updated structure after submission
        }
      } catch (error) {
        console.error('Error updating moderation for main question:', error);
      }
    }
  };

  const handleMainQuestionChange = (
    questionId: number,
    newComment: string,
    newStatus: string,
  ) => {
    const updatedStructure = { ...questionStructure };
    const question = updatedStructure.data.find(
      (q: any) => q.questionId === questionId,
    );

    if (question) {
      question.comment = newComment;
      question.status = newStatus;

      question.subQuestions.forEach((subQuestion: any) => {
        subQuestion.status = newStatus;
        subQuestion.subSubQuestions.forEach((subSubQuestion: any) => {
          subSubQuestion.status = newStatus;
        });
      });
    }

    setQuestionStructure(updatedStructure);
  };

  const handleSubQuestionChange = (
    questionId: number,
    subQuestionId: number,
    comment: string,
    status: string,
  ) => {
    const updatedStructure = { ...questionStructure };
    const question = updatedStructure.data.find(
      (q: any) => q.questionId === questionId,
    );

    if (question) {
      const subQuestion = question.subQuestions.find(
        (sq: any) => sq.subQuestionId === subQuestionId,
      );

      if (subQuestion) {
        subQuestion.comment = comment;
        subQuestion.status = status;

        subQuestion.subSubQuestions.forEach((subSubQuestion: any) => {
          subSubQuestion.status = status;
        });
      }
    }

    setQuestionStructure(updatedStructure);
  };

  const handleSubSubQuestionChange = (
    questionId: number,
    subQuestionId: number,
    subSubQuestionId: number,
    comment: string,
    status: string,
  ) => {
    const updatedStructure = { ...questionStructure };
    const question = updatedStructure.data.find(
      (q: any) => q.questionId === questionId,
    );

    if (question) {
      const subQuestion = question.subQuestions.find(
        (sq: any) => sq.subQuestionId === subQuestionId,
      );

      if (subQuestion) {
        const subSubQuestion = subQuestion.subSubQuestions.find(
          (ssq: any) => ssq.subSubQuestionId === subSubQuestionId,
        );

        if (subSubQuestion) {
          subSubQuestion.comment = comment;
          subSubQuestion.status = status;
        }
      }
    }

    setQuestionStructure(updatedStructure);
  };

  useEffect(() => {
    fetchPdf();
    fetchQuestionStructure();
    fetchPaperStatus();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [paperId, moderatorId]);

  return (
    <div>
      <Breadcrumb pageName="Paper Moderation" />
      <div className="flex h-screen ">
        <div className="flex-1 bg-white rounded shadow-lg overflow-hidden">
          {pdfUrl ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          ) : (
            <div className="flex justify-center items-center h-full text-xl text-gray-500">
              <Loader />
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3 lg:ml-6">
          {/* Show paper status if already approved */}
          {paperStatus === 'APPROVED' ? (
            <div className="text-center text-green-600 text-md font-semibold">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 mr-2"
              />
              This paper has been approved.
              {feedback && (
                <p className="text-gray-600 mt-2">Feedback: {feedback}</p>
              )}
              <p className="mt-4 text-blue-600">
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Kindly complete the
                <Link
                  to={`/paper/feedback`}
                  className="underline flex items-center"
                >
                  Evaluation Form for Moderation of Examination Paper
                </Link>
              </p>
            </div>
          ) : questionStructure ? (
            <QuestionStructure
              questionStructure={questionStructure}
              onMainQuestionChange={handleMainQuestionChange}
              onSubQuestionChange={handleSubQuestionChange}
              onSubSubQuestionChange={handleSubSubQuestionChange}
              onSubmitModeration={updateModerationForMainQuestion}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-6">
              No question structure available for this paper.
            </div>
          )}

          {/* Show feedback and approve button if paper is not already approved */}
          {paperStatus !== 'APPROVED' && questionStructure === null && (
            <div className="mt-4">
              <textarea
                className="input-field w-full p-2 border rounded h-32"
                placeholder="Enter feedback (optional)"
                value={feedback}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setFeedback(e.target.value);
                  }
                }}
                maxLength={500} // Ensures input doesn't exceed 500 characters
              ></textarea>
              <div className="text-sm text-gray-500 mt-1">
                {feedback.length}/500 characters
              </div>
              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleApproveClick}
              >
                Approve Paper
              </button>
            </div>
          )}
        </div>
        {showModal && (
          <ConfirmationModal
            message="Are you sure you want to approve this paper?"
            onConfirm={handleConfirmApprove} // Call approval on confirm
            onCancel={() => setShowModal(false)} // Close modal on cancel
          />
        )}
      </div>
    </div>
  );
}
