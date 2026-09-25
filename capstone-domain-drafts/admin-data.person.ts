
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
    private _vacationAllowanceDays : number;
    private _sickAllowanceDays : number;
    private _department: string;

  // Rules:
  // - _hoursPerWeek cannot be negative
  // - _sickLeaveDays and _vacationLeaveDays cannot be negative
  // - _role must be employee, hr_manager, or operations_manager
  // - _department must not be empty
  // - _department is an open set; new departments can be added
}

