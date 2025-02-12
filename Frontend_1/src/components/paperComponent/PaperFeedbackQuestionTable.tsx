import { useState, useEffect } from 'react';

type childFormData = {
  answer: string;
  comment: string;
  id: number;
};

const PaperFeedbackQuestionTable = ({ getDataFromTable }: any) => {
  const [childformData, setchildFormData] = useState<{
    [key: string]: childFormData;
  }>({
    item1: { answer: '', comment: '', id: 1 },
    item2: { answer: '', comment: '', id: 2 },
    item3: { answer: '', comment: '', id: 3 },
    item4: { answer: '', comment: '', id: 4 },
    item5: { answer: '', comment: '', id: 5 },
    item6: { answer: '', comment: '', id: 6 },
    item7: { answer: '', comment: '', id: 7 },
    item8: { answer: '', comment: '', id: 8 },
    item9: { answer: '', comment: '', id: 9 },
  });
  useEffect(() => {
    getDataFromTable(childformData);
  }, [childformData]);
  const handleRadioChange = (item: string, value: string) => {
    setchildFormData((prevData) => ({
      ...prevData,
      [item]: { ...prevData[item], answer: value },
    }));
  };

  const handleCommentChange = (item: string, value: string) => {
    setchildFormData((prevData) => ({
      ...prevData,
      [item]: { ...prevData[item], comment: value },
    }));
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 p-6 rounded-sm shadow-md">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-800">
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
              Row No.
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
              Item
            </th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">
              Yes
            </th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">
              No
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
              Specific Comment
            </th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <tr key={i} className="bg-white dark:bg-gray-800">
              <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 dark:text-gray-300">
                {i}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-gray-900 dark:text-gray-300">
                {i === 1
                  ? 'Does the exam paper provide clear instructions to the candidates?'
                  : i === 2
                  ? 'Do the Questions reflect the learning outcomes adequately?'
                  : i === 3
                  ? 'Are the questions clear and easily understandable?'
                  : i === 4
                  ? 'Is there any repetition of questions?'
                  : i === 5
                  ? 'Are the marks allocated for questions and sections appropriate?'
                  : i === 6
                  ? 'Is the time given to attend each question/section adequate?'
                  : 'Are the questions up to the standard and appropriate to the level being assessed?'}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`item${i}`}
                  value="yes"
                  checked={childformData[`item${i}`]?.answer === 'yes'}
                  required
                  onChange={() => handleRadioChange(`item${i}`, 'yes')}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`item${i}`}
                  value="no"
                  checked={childformData[`item${i}`]?.answer === 'no'}
                  required
                  onChange={() => handleRadioChange(`item${i}`, 'no')}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <textarea
                  className="input-field"
                  placeholder="Add comment"
                  rows={3}
                  value={childformData[`item${i}`]?.comment}
                  onChange={(e) =>
                    handleCommentChange(`item${i}`, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={5} className="font-bold text-center text-lg">
              Comment on Marking Scheme
            </td>
          </tr>
          {[8, 9].map((i) => (
            <tr key={i} className="bg-white dark:bg-gray-800">
              <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 dark:text-gray-300">
                {i}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-gray-900 dark:text-gray-300">
                {i === 8
                  ? 'Is the marking scheme clearly defined and easy to follow?'
                  : 'Does the marking scheme ensure fairness and consistency in evaluation?'}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`item${i}`}
                  value="yes"
                  checked={childformData[`item${i}`]?.answer === 'yes'}
                  required
                  onChange={() => handleRadioChange(`item${i}`, 'yes')}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`item${i}`}
                  value="no"
                  checked={childformData[`item${i}`]?.answer === 'no'}
                  required
                  onChange={() => handleRadioChange(`item${i}`, 'no')}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <textarea
                  className="input-field"
                  placeholder="Add comment"
                  rows={3}
                  value={childformData[`item${i}`]?.comment}
                  onChange={(e) =>
                    handleCommentChange(`item${i}`, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaperFeedbackQuestionTable;
