// Project Domain shape - plain type only

export type Project = {
  id: string;
  name: string; // required, non-empty, max 120 characters
  client?: string; // optional
  active: boolean;
};

// Project Business rules:

// Identity & validation:
// - Duplicate IDs are not allowed.
// - A project must have a name.
// - A project's name cannot exceed 120 characters.
// - Duplicate project names are not allowed.

// Status:
// - An archived project cannot be modified.
// - An archived project cannot be archived again.
// - An archived project cannot have new hours logged against it.

// Updates:
// - A project's name and client can be updated independently.
// - When updating, omitted fields keep their current values.