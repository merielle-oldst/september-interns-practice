// Person Domain shape - plain type only

export type Person = {
  id: string; // unique identifier
  name: string; // required, non-empty
  email: string; // required, valid email format
  role: 'employee' | 'hr_manager' | 'operations_manager'; // must be one of these roles
  hoursPerWeek: number; //cannot be negative; default: 40 
  active: boolean;
  vacationAllowanceDays: number; // cannot be negative
  sickAllowanceDays: number; // cannot be negative
  department: string; // required, non-empty; open set (new departments can be added)
};

// Person Business rules:

// Identity:
// - Duplicate IDs are not allowed
// - Two people can have the same name
// - A person must have a name, role, department, and hours per week
// - A person's email must be unique

// Validation:
// - A person's role can only be one of the following: employee, hr_manager, or operations_manager
// - A person's email must be in a valid email format
// - vacationAllowanceDays and sickAllowanceDays cannot be negative
// - hoursPerWeek defaults to 40 and must be greater than 0 (max number: not finalized yet)
// - Part-time people can have fewer than 40 hours per week

// Status:
// - An inactive person cannot be deactivated again
// - An inactive person cannot log new hours
// - An inactive person cannot request leave
// - People are deactivated instead of deleted so their work and leave history are preserved

// Updates:
// - A person's name can be updated
// - A person's role can be updated
// - A person's email can be updated
// - A person's department can be updated
// - A person's hours per week can be updated
// - vacationAllowanceDays and sickAllowanceDays can be updated
// - Holidays and leave do not change hoursPerWeek