import React, { useEffect, useState } from 'react';
import { Paper } from '../../types/transferpaper';
import SuccessMessage from '../../components/SuccessMessage';
import ErrorMessage from '../../components/ErrorMessage';
import useAuth from '../../hooks/useAuth';
import useApi from '../../api/api';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';

const FileList: React.FC = () => {
  const { auth } = useAuth();
  const [files, setFiles] = useState<Paper[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [viewType, setViewType] = useState<'sender' | 'receiver'>('sender');
  const [structureStatus, setStructureStatus] = useState<
    Record<number, boolean>
  >({});
  const moderatorId = Number(auth.id);
  const { getAllFiles, downloadFile, deleteFile, getStructureData } = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await getAllFiles();
      setFiles(response);

      // Fetch structure data for each file
      const structurePromises = response.map(async (file: Paper) => {
        const structure = await getStructureData(file.id);
        return { fileId: file.id, hasStructure: structure.data.length > 0 };
      });

      const structureData = await Promise.all(structurePromises);
      const structureMap = structureData.reduce(
        (acc, { fileId, hasStructure }) => ({ ...acc, [fileId]: hasStructure }),
        {},
      );
      setStructureStatus(structureMap);
    } catch (error: any) {
      setErrorMessage(
        'Error fetching files: ' + (error.message || 'Unknown error'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await downloadFile(id, moderatorId);
      setSuccessMessage('File downloaded successfully.');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Error downloading file.');
    }
  };

  const openModal = (id: number) => {
    setTransactionToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionToDelete(null);
  };

  const handleDelete = async () => {
    if (transactionToDelete === null) return; // If no transaction is selected, exit
    try {
      const response = await deleteFile(transactionToDelete);
      setSuccessMessage(response?.message || 'File deleted successfully.');
      fetchFiles();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Error deleting file.');
    } finally {
      closeModal();
    }
  };

  const filteredFiles =
    viewType === 'sender'
      ? files.filter((file) => file.creator.id === moderatorId)
      : files.filter((file) => file.moderator.id === moderatorId);

  return (
    <div className="mb-6">
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />

      <div className="mb-4 flex justify-between">
        <div>
          <Link
            to="/paper/transfer/new"
            className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-opacity-80"
          >
            New Transaction
          </Link>
        </div>
        <div>
          <button
            className={`mr-2 px-4 py-2 ${
              viewType === 'sender' ? 'bg-primary text-white' : 'bg-gray-200'
            } rounded`}
            onClick={() => setViewType('sender')}
          >
            Sent
          </button>
          <button
            className={`px-4 py-2 ${
              viewType === 'receiver' ? 'bg-primary text-white' : 'bg-gray-200'
            } rounded`}
            onClick={() => setViewType('receiver')}
          >
            Received
          </button>
        </div>
      </div>

      {filteredFiles.length > 0 ? (
        <div className="overflow-x-auto my-8">
          <table className="table-auto w-full border-collapse border border-gray-200 dark:border-strokedark">
            <thead>
              <tr className="bg-gray-100 dark:bg-form-input">
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  File Name
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  {viewType === 'sender' ? 'Receiver' : 'Sender'}
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Date Uploaded
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {file.fileName}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {viewType === 'sender'
                      ? file.moderator.firstName
                      : file.creator.firstName}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {file.createdAt &&
                      new Date(file.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    <button
                      type="button"
                      className="text-primary hover:text-opacity-80"
                      onClick={() => handleDownload(file.id)}
                    >
                      Download
                    </button>
                    {viewType === 'sender' && (
                      <>
                        <button
                          type="button"
                          className="ml-4 text-red-600 hover:text-opacity-80"
                          onClick={() => openModal(file.id)}
                        >
                          Delete
                        </button>
                        <Link
                          to={`/paper/transfer/edit/${file.id}`}
                          className="ml-4 text-green-600 hover:text-opacity-80"
                        >
                          Modify
                        </Link>
                        {structureStatus[file.id] ? (
                          <Link
                            to={`/paper/edit/structure/${file.id}`}
                            className="ml-4 text-green-600 hover:text-opacity-80"
                          >
                            Modify Structure
                          </Link>
                        ) : (
                          <Link
                            to={`/paper/create/structure/${file.id}`}
                            className="ml-4 text-green-600 hover:text-opacity-80"
                          >
                            Set Structure
                          </Link>
                        )}
                      </>
                    )}
                    {viewType === 'receiver' && (
                      <>
                      <Link
                        to={`/paper/moderate/${file.id}/${moderatorId}`}
                        className="ml-4 text-green-600 hover:text-opacity-80"
                      >
                        Moderate
                      </Link>
                      <Link
                      to={`/paper/feedback/${file.id}/${moderatorId}`}
                      className="ml-4 text-green-600 hover:text-opacity-80"
                    >
                      Feedback
                    </Link>
                    </>
                      
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No files found for {viewType === 'sender' ? 'Sender' : 'Receiver'}.
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this transaction?"
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default FileList;
