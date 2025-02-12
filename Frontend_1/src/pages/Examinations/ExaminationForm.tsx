import { ChangeEvent, FormEvent, useState } from 'react';

interface ExaminationFormProps {
  formData: {
    year: string;
    level: string;
    semester: string;
    examProcessStartDate: string | null;
    paperSettingCompleteDate: string | null;
    markingCompleteDate: string | null;
  };
  setFormData: (data: ExaminationFormProps['formData']) => void;
  editId: number | null;
  handleSave: () => void;
  cancelEdit: () => void;
  degreePrograms: { id: string; name: string }[];
  selectedDegreeProgram: string;
  setSelectedDegreeProgram: (value: string) => void;
}

export default function ExaminationForm({
  formData,
  setFormData,
  editId,
  handleSave,
  cancelEdit,
  degreePrograms,
  selectedDegreeProgram,
  setSelectedDegreeProgram,
}: ExaminationFormProps) {
  const [errors, setErrors] = useState({
    examProcessStartDate: '',
    paperSettingCompleteDate: '',
    markingCompleteDate: '',
  });

  const validateDates = (name: string, value: string | null) => {
    let updatedErrors = { ...errors };
    const {
      examProcessStartDate,
      paperSettingCompleteDate,
      markingCompleteDate,
    } = {
      ...formData,
      [name]: value,
    } as typeof formData;

    const examStart = examProcessStartDate
      ? new Date(examProcessStartDate)
      : null;
    const paperComplete = paperSettingCompleteDate
      ? new Date(paperSettingCompleteDate)
      : null;
    const markingComplete = markingCompleteDate
      ? new Date(markingCompleteDate)
      : null;

    if (examStart && paperComplete && paperComplete <= examStart) {
      updatedErrors.paperSettingCompleteDate =
        'Paper Setting Complete Date must be after Exam Process Start Date.';
    } else {
      updatedErrors.paperSettingCompleteDate = '';
    }

    if (paperComplete && markingComplete && markingComplete <= paperComplete) {
      updatedErrors.markingCompleteDate =
        'Marking Complete Date must be after Paper Setting Complete Date.';
    } else {
      updatedErrors.markingCompleteDate = '';
    }

    setErrors(updatedErrors);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'degreeProgram') {
      setSelectedDegreeProgram(value);
    } else {
      setFormData({ ...formData, [name]: value });
      validateDates(name, value);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDegreeProgram) {
      alert('Please select a degree program.');
      return;
    }

    if (
      errors.examProcessStartDate ||
      errors.paperSettingCompleteDate ||
      errors.markingCompleteDate
    ) {
      alert('Please correct the date errors before submitting.');
      return;
    }

    handleSave();
  };
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <form onSubmit={handleSubmit}>
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            {editId !== null ? 'Edit Examination' : 'Add Examination'}
          </h3>
        </div>

        <div className="p-6.5 overflow-y-auto max-h-[500px] no-scrollbar">
          <div className="mb-4.5">
            <label
              htmlFor="degreeProgram"
              className="mb-2.5 block text-black dark:text-white"
            >
              Degree Program
            </label>
            <select
              id="degreeProgram"
              name="degreeProgram"
              value={selectedDegreeProgram}
              onChange={handleInputChange}
              className="input-field appearance-none"
              required
            >
              <option value="">Select Degree Program</option>
              {degreePrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="year"
              className="mb-2.5 block text-black dark:text-white"
            >
              Examination Year
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="e.g., 2023/2024"
              required
              className="input-field"
            />
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="level"
              className="mb-2.5 block text-black dark:text-white"
            >
              Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="input-field appearance-none"
              required
            >
              <option value="">Select Level</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="3">Level 4</option>
            </select>
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="semester"
              className="mb-2.5 block text-black dark:text-white"
            >
              Semester
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="input-field appearance-none"
              required
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="examProcessStartDate"
              className="mb-2.5 block text-black dark:text-white"
            >
              Exam Process Start Date
            </label>
            <input
              type="datetime-local"
              id="examProcessStartDate"
              name="examProcessStartDate"
              value={formData.examProcessStartDate || ''}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="paperSettingCompleteDate"
              className="mb-2.5 block text-black dark:text-white"
            >
              Paper Setting Complete Date
            </label>
            <input
              type="datetime-local"
              id="paperSettingCompleteDate"
              name="paperSettingCompleteDate"
              value={formData.paperSettingCompleteDate || ''}
              onChange={handleInputChange}
              className="input-field"
              required
            />
            {errors.paperSettingCompleteDate && (
              <p className="text-red-500 text-sm">
                {errors.paperSettingCompleteDate}
              </p>
            )}
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="markingCompleteDate"
              className="mb-2.5 block text-black dark:text-white"
            >
              Marking Complete Date
            </label>
            <input
              type="datetime-local"
              id="markingCompleteDate"
              name="markingCompleteDate"
              value={formData.markingCompleteDate || ''}
              onChange={handleInputChange}
              className="input-field"
              required
            />
            {errors.markingCompleteDate && (
              <p className="text-red-500 text-sm">
                {errors.markingCompleteDate}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            {editId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded bg-gray-500 py-2 px-6 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary">
              {editId !== null ? 'Update Examination' : 'Add Examination'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
