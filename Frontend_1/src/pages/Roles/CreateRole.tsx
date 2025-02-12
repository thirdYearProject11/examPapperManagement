import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Checkbox from '../../components/Checkbox';
import SelectBox from '../../components/SelectBox';
import SuccessMessage from '../../components/SuccessMessage';
import ErrorMessage from '../../components/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import useApi from '../../api/api';

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<number[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchAllPermissions, createRole } = useApi();

  useEffect(() => {
    fetchAllPermissions()
      .then((response) => {
        setAvailablePermissions(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage('Error fetching permissions.');
        setIsLoading(false);
        console.error('Error fetching permissions:', error);
      });
  }, []);

  const groupedPermissions = availablePermissions.reduce(
    (acc, permission) => {
      const { category } = permission;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {} as Record<
      string,
      {
        permissionId: number;
        permissionName: string;
        permissionDescription: string;
        category: string;
      }[]
    >,
  );

  const handlePermissionChange = (permissionId: number) => {
    setPermissions((prevPermissions) =>
      prevPermissions.includes(permissionId)
        ? prevPermissions.filter((id) => id !== permissionId)
        : [...prevPermissions, permissionId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName || !description) {
      setErrorMessage('Role name and description are required.');
      return;
    }

    const newRole = {
      roleName,
      description,
      permissionIds: permissions,
    };
    createRole(newRole)
      .then(() => {
        setRoleName('');
        setDescription('');
        setPermissions([]);
        setErrorMessage('');
        setSuccessMessage('Role created successfully!');
        setTimeout(() => navigate('/usermanagement/roles'), 1000);
      })
      .catch((error) => {
        setErrorMessage('Failed to create role. Please try again.');
        console.error('Error creating role:', error);
      });
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="mx-auto max-w-270 ">
      <Breadcrumb pageName="Create Role" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-270 mx-auto text-sm">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Create Role
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {/* Success and Error Messages */}
            <SuccessMessage
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
            <ErrorMessage
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />

            {/* Form Fields */}

            {/* First Section: Role Name and Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Role Name
                </label>
                <input
                  type="text"
                  placeholder="Enter role name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value.toUpperCase())}
                  className="w-full rounded border-[1.5px] border-stroke  bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  rows={3}
                  required
                ></textarea>
              </div>
            </div>

            {/* Second Section: Permissions */}
            <div className="mb-6 ">
              <label className="mb-2.5 block text-black dark:text-white">
                Permissions
              </label>

              {/* Search Bar and Filter Dropdown in one line */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:flex-1 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <SelectBox
                  options={[
                    { value: '', label: 'All Categories' },
                    ...Object.keys(groupedPermissions).map((category) => ({
                      value: category,
                      label: category,
                    })),
                  ]}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Filter by category"
                  className="w-full sm:w-auto appearance-none rounded border border-stroke bg-transparent py-3 px-5 pr-10 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 overflow-y-auto max-h-[200px] no-scrollbar">
                {isLoading ? (
                  <p className="text-center text-gray-500">
                    Loading permissions...
                  </p>
                ) : (
                  Object.keys(groupedPermissions)
                    .filter(
                      (category) =>
                        categoryFilter === '' || category === categoryFilter,
                    )
                    .map((category) => (
                      <div key={category}>
                        <h4 className="mb-4 text-md">{category}</h4>
                        {groupedPermissions[category]
                          .filter((permission) =>
                            permission.permissionName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          )
                          .map((permission) => (
                            <div className="mb-2" key={permission.permissionId}>
                              <Checkbox
                                label={permission.permissionName.toLowerCase()}
                                checked={permissions.includes(
                                  permission.permissionId,
                                )}
                                onChange={() =>
                                  handlePermissionChange(
                                    permission.permissionId,
                                  )
                                }
                              />
                            </div>
                          ))}
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Submit Button */}
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
                Create Role
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRole;
