import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SuccessMessage from '../../components/SuccessMessage';
import ErrorMessage from '../../components/ErrorMessage';
import useApi from '../../api/api';
import RoleAssignmentTable from './RoleAssignmentTable';

interface Examination {
  id: string;
  year: string;
  level: string;
  semester: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  courseType: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface RoleAssignments {
  PAPER_CREATOR: string;
  PAPER_MODERATOR: string;
  FIRST_MAKER: string;
  SECOND_MAKER: string;
  [key: string]: string;
}

interface AssignedRoleRow {
  course: Course;
  assignments: RoleAssignments;
  paperType: 'THEORY' | 'PRACTICAL';
}

const AssignRoles: React.FC = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedExamination, setSelectedExamination] = useState<string>('');
  const [roleAssignments, setRoleAssignments] = useState<
    Record<string, { THEORY: RoleAssignments; PRACTICAL: RoleAssignments }>
  >({});
  const [assignedRoles, setAssignedRoles] = useState<AssignedRoleRow[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setIsLoading] = useState<boolean>(false);

  const {
    getExaminations,
    fetchUsers,
    getExaminationsCourses,
    createRoleAssignment,
    fetchRoleAssignments,
  } = useApi();

  // Fetch examinations and users
  useEffect(() => {
    setIsLoading(true);
    Promise.all([getExaminations(), fetchUsers()])
      .then(([examResponse, userResponse]) => {
        setExaminations(examResponse.data.data);
        setUsers(userResponse);
      })
      .catch((error) => {
        console.error('Error fetching initial data', error);
        setErrorMessage('Failed to fetch data. Please try again.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch courses and existing role assignments for the selected examination
  useEffect(() => {
    if (selectedExamination) {
      setIsLoading(true);
      Promise.all([
        getExaminationsCourses(Number(selectedExamination)),
        fetchRoleAssignments(Number(selectedExamination)),
      ])
        .then(([courseResponse, roleAssignmentResponse]) => {
          const coursesData = courseResponse.data?.activeCourses || [];
          setCourses(coursesData);

          // Initialize role assignments for each course
          const initialAssignments = coursesData.reduce(
            (
              acc: Record<
                string,
                { THEORY: RoleAssignments; PRACTICAL: RoleAssignments }
              >,
              course: Course,
            ) => ({
              ...acc,
              [course.id]: {
                THEORY: roleAssignmentResponse.data[course.id]?.THEORY || {
                  PAPER_CREATOR: '',
                  PAPER_MODERATOR: '',
                  FIRST_MAKER: '',
                  SECOND_MAKER: '',
                },
                PRACTICAL: roleAssignmentResponse.data[course.id]
                  ?.PRACTICAL || {
                  PAPER_CREATOR: '',
                  PAPER_MODERATOR: '',
                  FIRST_MAKER: '',
                  SECOND_MAKER: '',
                },
              },
            }),
            {},
          );
          setRoleAssignments(initialAssignments);
        })
        .catch((error) => {
          console.error('Error fetching courses and role assignments', error);
          setErrorMessage('Failed to fetch courses and role assignments.');
          setCourses([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setCourses([]);
      setRoleAssignments({});
    }
  }, [selectedExamination]);

  const handleRoleChange = (
    courseId: string,
    role: string,
    userId: string,
    paperType: 'THEORY' | 'PRACTICAL',
  ) => {
    setRoleAssignments((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [paperType]: {
          ...prev[courseId][paperType],
          [role]: userId,
        },
      },
    }));
  };

  const handleAssignRole = (
    course: Course,
    paperType: 'THEORY' | 'PRACTICAL',
  ) => {
    const assignments = roleAssignments[course.id][paperType];

    // Validate that all roles are assigned
    if (
      !assignments.PAPER_CREATOR ||
      !assignments.PAPER_MODERATOR ||
      !assignments.FIRST_MAKER ||
      !assignments.SECOND_MAKER
    ) {
      setErrorMessage('Please assign all roles before submitting.');
      return;
    }

    setIsLoading(true);

    // Prepare the payload for the specified paperType
    const payload = Object.entries(assignments).map(([role, userId]) => ({
      courseId: Number(course.id),
      roleId: getRoleIdByName(role),
      userId: Number(userId),
      examinationId: Number(selectedExamination),
      isAuthorized: false,
      paperType,
    }));

    createRoleAssignment(payload)
      .then(() => {
        setAssignedRoles((prev) => [
          ...prev,
          { course, assignments, paperType },
        ]);
        setSuccessMessage(
          `Roles successfully assigned for ${course.name} (${paperType})`,
        );
      })
      .catch((error) => {
        console.error('Error assigning roles:', error);
        setErrorMessage('Failed to assign roles. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  const getRoleIdByName = (roleName: string): number => {
    const roleMap: Record<string, number> = {
      PAPER_CREATOR: 2,
      PAPER_MODERATOR: 3,
      FIRST_MAKER: 4,
      SECOND_MAKER: 5,
    };
    return roleMap[roleName] || 0;
  };

  const isCourseAssigned = (
    courseId: string,
    paperType: 'THEORY' | 'PRACTICAL',
  ) => {
    return assignedRoles.some(
      (role) => role.course.id === courseId && role.paperType === paperType,
    );
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Assign Roles" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-270 mx-auto text-sm">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Assign Exam Roles
          </h3>
        </div>

        <div className="p-6.5">
          <SuccessMessage
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
          <ErrorMessage
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Examination
            </label>
            <select
              value={selectedExamination}
              onChange={(e) => setSelectedExamination(e.target.value)}
              className="w-1/3 rounded border-[1.5px] border-stroke bg-gray py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary appearance-none"
              required
            >
              <option value="">Select Examination</option>
              {examinations?.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.year} - Level {exam.level} - Semester {exam.semester}
                </option>
              ))}
            </select>
          </div>

          {selectedExamination && (
            <>
              {courses?.length > 0 && (
                <RoleAssignmentTable
                  courses={courses}
                  users={users}
                  roleAssignments={roleAssignments}
                  isCourseAssigned={isCourseAssigned}
                  handleRoleChange={handleRoleChange}
                  handleAssignRole={handleAssignRole}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignRoles;