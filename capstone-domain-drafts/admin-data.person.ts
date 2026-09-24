export const PersonRoleEnum = {
    EMPLOYEE: 'employee',
    HR_MANAGER: 'hr_manager',
    OPERATIONS_MANAGER: 'operations_manager' 
} as const;

export type RoleType = (typeof PersonRoleEnum)[keyof typeof PersonRoleEnum];

export class Person {
    private readonly _id: string;
    private _name: string;
    private _role: RoleType; 
    private _hoursPerWeek: number;
    private _active: boolean;
    private _leaveAllowanceDays: number;
    private _department: string;

  // Rules:
  // - hoursPerWeek cannot be negative
  // - leaveAllowanceDays cannot be negative
  // - role must be employee, hr_manager, or operations_manager
  // - department must not be empty
  // - department is an open set; new departments can be added
}