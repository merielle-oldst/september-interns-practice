/**
 * DOMAIN LAYER, the Project entity.
 *
 * This is the innermost layer. It depends on NOTHING outward, no NestJS, no
 * database, no HTTP. Only the Node standard library and other domain files.
 *
 * The entity PROTECTS ITS OWN RULES (its "invariants"). You cannot create a
 * Project with an empty name, and you cannot build one in an invalid state,
 * because the constructor is private and `create()` validates first.
 *
 * This maps to the capstone: Intern 4 (Admin & Data) owns the real Project
 * entity, and every other slice builds against the shape agreed here.
 */
import { randomUUID } from 'node:crypto';
import { InvalidProjectError, ProjectAlreadyArchivedError } from './project.errors';

export interface CreateProjectProps {
  /** Optional, a new project gets a generated id when this is omitted. */
  id?: string;
  name: string;
  client?: string;
  /** Optional, defaults to true (a new project is active). */
  active?: boolean;
}

export class Project {
  readonly id: string;
  readonly name: string;
  readonly client?: string;
  private _active: boolean;

  private constructor(id: string, name: string, active: boolean, client?: string) {
    this.id = id;
    this.name = name;
    this.client = client;
    this._active = active;
  }

  /**
   * The ONLY way to build a Project. It validates the invariants first, so a
   * Project object can never exist in an invalid state.
   */
  static create(props: CreateProjectProps): Project {
    const name = (props.name ?? '').trim();
    if (name.length === 0) {
      throw new InvalidProjectError('Project name must not be empty.');
    }
    if (name.length > 120) {
      throw new InvalidProjectError('Project name must be at most 120 characters.');
    }

    const client = props.client?.trim() ? props.client.trim() : undefined;

    return new Project(props.id ?? randomUUID(), name, props.active ?? true, client);
  }

  get active(): boolean {
    return this._active;
  }

  /**
   * Archiving is BEHAVIOUR, not just a field flip. The entity enforces its own
   * rule: you cannot archive something that is already archived.
   */
  archive(): void {
    if (!this._active) {
      throw new ProjectAlreadyArchivedError(`Project ${this.id} is already archived.`);
    }
    this._active = false;
  }
}
