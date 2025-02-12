import { useEffect, useState } from 'react';

const PaperFeedBackSignTableEnd = ({ getModerateData }: any) => {
  const [formData, setFormData] = useState({
    generalComment: '',
    agreeAndAddressed: '',
    notAgreeAndReasons: '',
    learningOutcomes: '',
    courseContent: '',
  });
  useEffect(() => {
    getModerateData(formData);
  }, [formData]);

  const handleInputChange = (
    key: string,
    value: string,
    index: number | null = null,
  ) => {
    if (index !== null) {
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 p-6 rounded-sm shadow-md">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <tbody>
          <tr>
            <td colSpan={5} className='p-4'>
              <div className="mb-4 flex gap-4 items-center justify-center font-bold text-center text-lg sm:text-xl pt-2">
                General Comment on Question Paper and Marking Scheme
              </div>
              <textarea
                className="input-field"
                placeholder="Add comment"
                rows={3}
                value={formData.generalComment}
                onChange={(e) =>
                  handleInputChange('generalComment', e.target.value)
                }
              />
            </td>
          </tr>
          {/* <tr className="flex flex-col sm:table-row">
            <td className="h-full border px-4 font-bold text-center" colSpan={2}>
              Name of the Moderator
            </td>
            <td className="h-full border px-4 font-bold text-center" colSpan={2}>
              Signature
            </td>
            <td className="h-full border px-4 font-bold text-center" colSpan={1}>
              Date
            </td>
          </tr> */}
          <tr>
            <td
              colSpan={5}
              className="font-bold text-center text-lg sm:text-xl pt-2"
            >
              Follow-up Action by Examiner/s
            </td>
          </tr>
          <tr className="flex flex-col sm:table-row">
            <td colSpan={3} className="p-4">
              <label className="font-bold" htmlFor="agree-a">
                (a) Agree and Addressed
              </label>
              <textarea
                className="input-field mt-2"
                placeholder="Add comment"
                rows={3}
                id="agree-a"
                value={formData.agreeAndAddressed}
                onChange={(e) =>
                  handleInputChange('agreeAndAddressed', e.target.value)
                }
              />
            </td>
            <td colSpan={2} className="p-4">
              <label className="font-bold" htmlFor="agree-b">
                (b) Not Agree and Reasons
              </label>
              <textarea
                className="input-field mt-2"
                placeholder="Add comment"
                rows={3}
                id="agree-b"
                value={formData.notAgreeAndReasons}
                onChange={(e) =>
                  handleInputChange('notAgreeAndReasons', e.target.value)
                }
              />
            </td>
          </tr>
          {/* <tr>
            <td colSpan={5}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-start">
                  <h2 className="font-bold ml-4">Name</h2>
                  <ul className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <li className="flex items-center" key={index}>
                        <label className="font-bold mr-2" htmlFor={`name${index + 1}`}>
                          ({index + 1})
                        </label>
                        <label className="ml-2">---------------------</label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="font-bold ml-4">Sign</h2>
                  <ul className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <li className="flex items-center" key={index}>
                        -------------------
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="font-bold ml-4">Date</h2>
                  <ul className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <li className="flex items-center" key={index}>
                        -------------------
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </td>
          </tr> */}
          <tr>
            <td
              colSpan={5}
              className="border border-gray-300 p-4 bg-gray-50 dark:bg-gray-800 "
            >
              <label
                htmlFor="learningOutcomes"
                className="block font-bold mb-2 text-lg"
              >
                Learning Outcomes:
              </label>
              <textarea
                id="learningOutcomes"
                className="input-field"
                placeholder="Enter your text here..."
                rows={4}
                value={formData.learningOutcomes}
                onChange={(e) =>
                  handleInputChange('learningOutcomes', e.target.value)
                }
              />
            </td>
          </tr>
          <tr>
            <td
              colSpan={5}
              className="border border-gray-300 p-4 bg-gray-50 dark:bg-gray-800"
            >
              <label
                htmlFor="courseContent"
                className="block font-bold mb-2 text-lg"
              >
                Course Content:
              </label>
              <textarea
                id="courseContent"
                className="input-field"
                placeholder="Enter your text here..."
                rows={4}
                value={formData.courseContent}
                onChange={(e) =>
                  handleInputChange('courseContent', e.target.value)
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PaperFeedBackSignTableEnd;
