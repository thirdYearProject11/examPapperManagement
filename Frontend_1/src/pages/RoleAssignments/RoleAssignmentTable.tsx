import React from 'react';
import SearchableSelectBox from '../../components/SearchableSelectBox';

interface Course {
  id: string;
  name: string;
  code: string;
  courseType: string; // Either "THEORY" or "PRACTICAL"
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

interface RoleAssignmentTableProps {
  courses: Course[];
  users: User[];
  roleAssignments: Record<
    string,
    { THEORY: RoleAssignments; PRACTICAL: RoleAssignments }
  >;
  isCourseAssigned: (
    courseId: string,
    paperType: 'THEORY' | 'PRACTICAL',
  ) => boolean;
  handleRoleChange: (
    courseId: string,
    role: string,
    userId: string,
    paperType: 'THEORY' | 'PRACTICAL',
  ) => void;
  handleAssignRole: (course: Course, paperType: 'THEORY' | 'PRACTICAL') => void;
}

const RoleAssignmentTable: React.FC<RoleAssignmentTableProps> = ({
  courses,
  users,
  roleAssignments,
  isCourseAssigned,
  handleRoleChange,
  handleAssignRole,
}) => {
  return (
    <div className="overflow-x-auto my-8">
      <h4 className="font-medium text-black dark:text-white mb-4">
        Pending Assignments
      </h4>
      <table className="table-auto w-full border-collapse border border-gray-200 dark:border-strokedark">
        <thead>
          <tr className="bg-gray-100 dark:bg-form-input">
            <th className="border border-gray-300 px-4 py-2 text-left">
              Course Code
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Course Name
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Course Type
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Paper Type
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Roles
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const paperType = course.courseType as 'THEORY' | 'PRACTICAL';

            // Skip if the course is already assigned for the given paper type
            if (isCourseAssigned(course.id, paperType)) {
              return null;
            }

            return (
              <tr
                key={`${course.id}-${paperType}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="border px-4 py-2">{course.code}</td>
                <td className="border px-4 py-2">{course.name}</td>
                <td className="border px-4 py-2">{course.courseType}</td>
                <td className="border px-4 py-2">{paperType}</td>
                <td className="border px-4 py-2">
                  {[
                    'PAPER_CREATOR',
                    'PAPER_MODERATOR',
                    'FIRST_MAKER',
                    'SECOND_MAKER',
                  ].map((role) => (
                    <SearchableSelectBox
                      key={role}
                      options={users.map((user) => ({
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                      }))}
                      value={
                        roleAssignments[course.id]?.[paperType]?.[role] || ''
                      }
                      onChange={(value) =>
                        handleRoleChange(course.id, role, value, paperType)
                      }
                      placeholder={`Select ${role.replace('_', ' ')}`}
                      label={''}
                    />
                  ))}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleAssignRole(course, paperType)}
                    className="bg-primary text-white px-4 py-2 rounded"
                    disabled={isCourseAssigned(course.id, paperType)}
                  >
                    Assign {paperType}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoleAssignmentTable;
