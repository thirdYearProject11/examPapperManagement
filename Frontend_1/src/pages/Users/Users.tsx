import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SuccessMessage from '../../components/SuccessMessage'; // Import SuccessMessage
import ErrorMessage from '../../components/ErrorMessage'; // Import ErrorMessage
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import { Link } from 'react-router-dom';
import SelectBox from '../../components/SelectBox'; // Import SelectBox component for filtering roles
import useHasPermission from '../../hooks/useHasPermission';
import useApi from '../../api/api';
import Loader from '../../common/Loader';

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  active: boolean;
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(''); // Status filter state
  const hasDeletePermission = useHasPermission('DELETE_USER');
  const hasCreatePermission = useHasPermission('CREATE_USER');
  const hasEditPermission = useHasPermission('UPDATE_USER');
  const hasChangePermission = useHasPermission('CHANGE_USER_STATUS');
  const { fetchUsers, deleteUser, updateUserStatus } = useApi();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async () => {
    if (selectedUserId !== null) {
      try {
        await deleteUser(selectedUserId);
        setUsers(users.filter((user) => user.id !== selectedUserId));
        setIsModalOpen(false);
        setSuccessMessage('User deleted successfully!');
        setErrorMessage(null);
      } catch (err: any) {
        setErrorMessage('Failed to delete user');
        setSuccessMessage(null);
        setIsModalOpen(false);
      }
    }
  };

  const openModal = (id: number) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUserId(null);
    setIsModalOpen(false);
  };

  const handleSearchAndFilter = () => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filtered = users.filter((user) => {
      const matchesSearchTerm =
        user.username.toLowerCase().includes(lowercasedSearchTerm) ||
        user.email.toLowerCase().includes(lowercasedSearchTerm) ||
        (user.firstName + ' ' + user.lastName)
          .toLowerCase()
          .includes(lowercasedSearchTerm);

      const matchesCategory =
        categoryFilter === '' || user.roles.includes(categoryFilter);

      const matchesStatus =
        statusFilter === '' ||
        (statusFilter === 'active' && user.active) ||
        (statusFilter === 'inactive' && !user.active);

      return matchesSearchTerm && matchesCategory && matchesStatus;
    });

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchTerm, categoryFilter, statusFilter, users]);

  const toggleUserStatus = async (userId: number, newStatus: boolean) => {
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, active: newStatus } : user,
        ),
      );
      setSuccessMessage('User status updated successfully!');
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage('Failed to update user status');
      setSuccessMessage(null);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-8 text-gray-500">
        <Loader />
      </div>
    );
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="mx-auto container px-4">
      <Breadcrumb pageName="Users" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6.5 text-sm">
        <div className="mb-6 flex justify-between items-center flex-wrap">
          <h3 className="font-medium text-black dark:text-white w-full sm:w-auto">
            Users List
          </h3>
          {hasCreatePermission && (
            <div className="ml-auto flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <Link
                to="/usermanagement/users/create"
                className="inline-block bg-primary text-gray py-2 px-6 rounded font-medium hover:bg-opacity-90 w-full sm:w-auto mb-2 sm:mb-0"
              >
                Create User
              </Link>
              <Link
                to="/usermanagement/users/createbulk"
                className="inline-block bg-primary text-gray py-2 px-6 rounded font-medium hover:bg-opacity-90 w-full sm:w-auto"
              >
                Bulk User Creation
              </Link>
            </div>
          )}
        </div>

        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-2/3 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <SelectBox
            options={[
              { value: '', label: 'All Roles' },
              ...users
                .map((user) => user.roles)
                .flat()
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((role) => ({ value: role, label: role })),
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Select role"
            className="appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 pr-10 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <SelectBox
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Select status"
            className="appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 pr-10 outline-none transition focus:border-primary active:border-primary dark:bg-form-input dark:border-form-strokedark dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 dark:border-strokedark">
            <thead>
              <tr className="bg-gray-100 dark:bg-form-input">
                {/* <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  ID
                </th> */}
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Username
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Email
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Roles
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Status
                </th>
                <th className="border border-gray-300 dark:border-strokedark px-4 py-2 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {/* <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {user.id}
                  </td> */}
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {user.username}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {user.email}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {user.roles.join(', ')}
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    <button
                      onClick={() => toggleUserStatus(user.id, !user.active)}
                      className={`py-1 px-4 rounded ${
                        user.active ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}
                      disabled={
                        !hasChangePermission || user.username.includes('admin')
                      }
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="border border-gray-300 dark:border-strokedark px-4 py-2">
                    {user.username.includes('admin') ? (
                      <span className="text-gray-500">
                        No actions available
                      </span>
                    ) : (
                      <>
                        {hasEditPermission && (
                          <Link
                            to={`/usermanagement/users/edit/${user.id}`}
                            className="text-primary hover:underline"
                          >
                            Edit
                          </Link>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => openModal(user.id)}
                            className="ml-4 text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this user?"
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}

      {/* test push */}
    </div>
  );
};

export default Users;
