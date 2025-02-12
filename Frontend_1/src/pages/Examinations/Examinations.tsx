import { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SuccessMessage from '../../components/SuccessMessage';
import ErrorMessage from '../../components/ErrorMessage';
import useApi from '../../api/api';
import ExaminationList from './ExaminationList';
import ExaminationForm from './ExaminationForm';

interface Examination {
  id: number;
  year: string;
  degreeProgramId: string;
  level: string;
  semester: string;
  examProcessStartDate: string | null;
  paperSettingCompleteDate: string | null;
  markingCompleteDate: string | null;
  status: string;
}

interface DegreeProgram {
  id: string;
  name: string;
}

export default function Examinations() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [formData, setFormData] = useState<Omit<Examination, 'id' | 'degreeProgramId'|'status'>>({
    year: '',
    level: '',
    semester: '',
    examProcessStartDate: null,
    paperSettingCompleteDate: null,
    markingCompleteDate: null,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [degreePrograms, setDegreePrograms] = useState<DegreeProgram[]>([]);
  const [selectedDegreeProgram, setSelectedDegreeProgram] = useState<string>('');

  const {
    getDegreePrograms,
    getExaminations,
    deleteExamination,
    createExamination,
    updateExamination,
  } = useApi();

  // Fetch degree programs
  useEffect(() => {
    const fetchDegreePrograms = async () => {
      try {
        const response = await getDegreePrograms();
        setDegreePrograms(response.data);
      } catch (error) {
        console.error('Error fetching degree programs', error);
        setErrorMessage('Failed to load degree programs.');
      }
    };
    fetchDegreePrograms();
  }, []);

  // Fetch examinations
  const fetchExaminations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getExaminations();
      if (response.data.code === 200) {
        setExaminations(response.data.data);
      } else {
        setErrorMessage('Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error fetching examinations', error);
      setErrorMessage('Error fetching examinations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  // Save or update examination
  const handleSave = async () => {
    if (!formData.year.trim()) {
      setErrorMessage('Year cannot be empty.');
      return;
    }
    if (!selectedDegreeProgram) {
      setErrorMessage('Please select a degree program.');
      return;
    }

    try {
      const payload = { ...formData, degreeProgramId: selectedDegreeProgram };

      if (editId !== null) {
        await updateExamination(editId, payload);
        setSuccessMessage('Examination updated successfully!');
        setEditId(null);
      } else {
        await createExamination(payload);
        setSuccessMessage('Examination added successfully!');
      }

      resetForm();
      fetchExaminations();
    } catch (error) {
      console.error('Error saving examination', error);
      setErrorMessage('Error saving examination.');
    }
  };

  // Edit an examination
  const handleEdit = (id: number) => {
    const examToEdit = examinations.find((exam) => exam.id === id);
    if (examToEdit) {
      setFormData({
        year: examToEdit.year,
        level: examToEdit.level,
        semester: examToEdit.semester,
        examProcessStartDate: examToEdit.examProcessStartDate,
        paperSettingCompleteDate: examToEdit.paperSettingCompleteDate,
        markingCompleteDate: examToEdit.markingCompleteDate,
      });
      setSelectedDegreeProgram(examToEdit.degreeProgramId);
      setEditId(id);
    }
  };

  // Delete an examination
  const handleDelete = async (id: number) => {
    try {
      await deleteExamination(id);
      setSuccessMessage('Examination deleted successfully!');
      fetchExaminations();
    } catch (error) {
      setErrorMessage('Error deleting examination.');
    }
  };

  const resetForm = () => {
    setFormData({
      year: '',
      level: '',
      semester: '',
      examProcessStartDate: null,
      paperSettingCompleteDate: null,
      markingCompleteDate: null,
    });
    setSelectedDegreeProgram('');
    setEditId(null);
  };

  return (
    <div className="container mx-auto px-4">
      <Breadcrumb pageName="Examinations" />
      <div className="grid grid-cols-5 gap-8 ">
        <div className="col-span-5 xl:col-span-3">
          <SuccessMessage message={successMessage} onClose={() => setSuccessMessage('')} />
          <ErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />
          <ExaminationList examinations={examinations} degreePrograms={degreePrograms} loading={loading} handleEdit={handleEdit} handleDelete={handleDelete} />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <ExaminationForm
            formData={formData}
            setFormData={setFormData}
            editId={editId}
            handleSave={handleSave}
            cancelEdit={resetForm}
            degreePrograms={degreePrograms}
            selectedDegreeProgram={selectedDegreeProgram}
            setSelectedDegreeProgram={setSelectedDegreeProgram}
          />
        </div>
      </div>
    </div>
  );
}
