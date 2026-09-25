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

