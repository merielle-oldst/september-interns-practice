// Person Domain shape - plain type only

export type Person = {
  id: string;
  name: string; // required, non-empty
  role: 'employee' | 'hr_manager' | 'operations_manager'; // must be one of these roles
  hoursPerWeek: number; // cannot be negative
  active: boolean;
  vacationAllowanceDays: number; // cannot be negative
  sickAllowanceDays: number; // cannot be negative
  department: string; // required, non-empty; open set (new departments can be added)
};

// Person Business rules:
// - Duplicate IDs are not allowed
// - A person must have a name, role, department, and hours per week
// - A person's role can only be one of the following: employee, hr_manager, or operations_manager
// - An inactive person cannot be deactivated again
// - A person's name, role, department, and hours per week can be updated
// - vacationAllowanceDays and sickAllowanceDays cannot be negative