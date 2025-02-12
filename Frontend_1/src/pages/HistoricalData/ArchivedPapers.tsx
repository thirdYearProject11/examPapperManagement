import { useEffect, useState } from 'react';
import useApi from '../../api/api';
import Loader from '../../common/Loader';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../components/Pagination';
import SearchForm from './SearchForm';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';

const ArchivedPapers = () => {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const {
    getArchivedPapers,
    deleteArchivedPaper,
    downloadArchivedPaper,
    searchArchivedPapers,
  } = useApi();
  const [searchParams, setSearchParams] = useState({
    fileName: '',
    creatorName: '',
    moderatorName: '',
    courseCode: '',
    paperType: '',
    degreeName: '',
    year: '',
    level: '',
    semester: '',
    startDate: '',
    endDate: '',
  });

  const initialSearchParams = {
    fileName: '',
    creatorName: '',
    moderatorName: '',
    courseCode: '',
    paperType: '',
    degreeName: '',
    year: '',
    level: '',
    semester: '',
    startDate: '',
    endDate: '',
  };
  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);

  useEffect(() => {
    fetchArchivedPapers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchArchivedPapers = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await getArchivedPapers(page, size);
      if (response.data?.data?.content) {
        setPapers(response.data.data.content);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
    setLoading(false);
  };

  const confirmDelete = (id: number) => {
    setSelectedPaperId(id);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (selectedPaperId !== null) {
      try {
        await deleteArchivedPaper(selectedPaperId);
        fetchArchivedPapers(currentPage, pageSize);
      } catch (error) {
        console.error('Error deleting paper', error);
      }
    }
    setShowModal(false);
    setSelectedPaperId(null);
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const response = await downloadArchivedPaper(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `paper_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading paper', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await searchArchivedPapers({
        ...searchParams,
        page: currentPage,
        size: pageSize,
      });
      setPapers(response.data?.data?.content || []);
    } catch (error) {
      console.error('Error searching papers:', error);
    }
    setLoading(false);
  };

  // Pagination Controls
  const handleNextPage = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to the first page when page size changes
  };

  // Date formatting function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setSearchParams(initialSearchParams);
    fetchArchivedPapers(currentPage, pageSize);
  };

  return (
    <div className="container mx-auto px-4">
      <Breadcrumb pageName="Archived Papers" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-full mx-auto text-sm mb-4">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
          <h3 className="font-medium text-black dark:text-white">
            Archived Papers Filter
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-primary hover:underline"
            >
              {showSearch ? 'Hide Search' : 'Show Search'}
            </button>
            <Link
              to="/history/archived/upload"
              className="text-green-600 hover:underline"
            >
              Upload Paper
            </Link>
          </div>
        </div>

        {/* Search Form */}
        {showSearch && (
          <SearchForm
            searchParams={searchParams}
            handleInputChange={handleInputChange}
            handleSearch={handleSearch}
            handleClear={handleClear}
          />
        )}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-full mx-auto text-sm">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Archived Papers
            </h3>
          </div>

          {/* Table for displaying papers */}
          <div className="overflow-x-auto m-8">
            <table className="table-auto w-full border-collapse border border-gray-200 dark:border-strokedark">
              <thead>
                <tr className="bg-gray-100 dark:bg-form-input">
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    File Name
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Remarks
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Creator
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Moderator
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Degree
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Shared At
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Created At
                  </th>
                  <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {papers.length > 0 ? (
                  papers.map((paper) => (
                    <tr
                      key={paper.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {paper.fileName}
                      </td>
                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {paper.remarks}
                      </td>
                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {paper.creatorName}
                      </td>
                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {paper.moderatorName}
                      </td>

                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {paper.degreeName}
                      </td>

                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {formatDate(paper.sharedAt)}
                      </td>
                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        {formatDate(paper.createdAt)}
                      </td>
                      <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                        <button
                          onClick={() =>
                            handleDownload(paper.id, paper.fileName)
                          }
                          className="text-primary hover:underline mr-2"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => confirmDelete(paper.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No archived papers available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={papers.length}
            onPageChange={handleNextPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this archived paper?"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ArchivedPapers;
