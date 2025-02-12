import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SuccessMessage from '../../components/SuccessMessage';
import ErrorMessage from '../../components/ErrorMessage';
import Checkbox from '../../components/Checkbox';
import { useNavigate, useParams } from 'react-router-dom';
import useApi from '../../api/api';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); // Get userId from route params
  //console.log(userId);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<any[]>([]);
  const [, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { updateUserWithRoles, fetchAllRoles, getUserById } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const roleResponse = await fetchAllRoles();
        setAvailableRoles(roleResponse.data);
        setFilteredRoles(roleResponse.data);

        // Fetch user details if userId is provided
        if (userId) {
          const userResponse = await getUserById(Number(userId));
          const user = userResponse.data;
          setEmail(user.email);
          setUsername(user.username);
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setRoles(user.roles || []);
        }
      } catch (error) {
        setErrorMessage('Failed to load data.');
        console.error(error);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const filtered = availableRoles.filter((role) =>
      role.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredRoles(filtered);
  }, [searchTerm, availableRoles]);

  const handleRoleChange = (roleName: string) => {
    setRoles((prevRoles) =>
      prevRoles.includes(roleName)
        ? prevRoles.filter((r) => r !== roleName)
        : [...prevRoles, roleName],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName) {
      setErrorMessage('All fields are required.');
      return;
    }

    const updatedUser = {
      username,
      email,
      firstName,
      lastName,
      roles,
      active: true,
    };

    try {
      setIsLoading(true);
      await updateUserWithRoles(Number(userId), updatedUser);
      setSuccessMessage('User updated successfully!');
      setTimeout(() => navigate('/usermanagement/users'), 1000);
    } catch (error) {
      setErrorMessage('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="mx-auto max-w-270 ">
      <Breadcrumb pageName="Edit User" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-270 mx-auto text-sm">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Edit User</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <SuccessMessage
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
            <ErrorMessage
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>
             
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Roles Section */}
            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Assign Roles
              </label>

              {/* Search Bar */}
              <div className="mb-4 flex items-center">
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Selected Roles as Tags */}
              <div className="mb-4">
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((roleName) => {
                      const role = availableRoles.find(
                        (role) => role.roleName === roleName,
                      );
                      return (
                        role && (
                          <span
                            key={role.roleName}
                            className="flex items-center justify-between rounded bg-primary py-1 px-4 text-white"
                          >
                            {role.roleName}
                            <button
                              type="button"
                              onClick={() => handleRoleChange(role.roleName)}
                              className="ml-2 text-sm text-white"
                            >
                              ×
                            </button>
                          </span>
                        )
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Roles as Checkboxes in a Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles
                  //.filter((role) => role.roleName !== 'ADMIN') // Exclude ADMIN role
                  .map((role) => (
                    <div key={role.roleId} className="flex items-center gap-2">
                      <Checkbox
                        label={role.roleName}
                        checked={roles.includes(role.roleName)}
                        onChange={() => handleRoleChange(role.roleName)}
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
