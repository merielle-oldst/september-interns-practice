// Project Domain shape - plain type only

export type Project = {
  id: string;
  name: string; // required, non-empty, max 120 characters
  client?: string; // optional
  active: boolean;
};

// Project Business rules:
// - Duplicate names are not allowed
// - When updating, the name is optional; the project may keep its current name
// - Archived projects cannot be modified
// - Archived projects cannot be archived again