/**
 * DOMAIN LAYER, the Project entity.
 *
 * This is the innermost layer. It depends on NOTHING outward, no NestJS, no
 * database, no HTTP. Only the Node standard library and other domain files.
 *
 * The entity PROTECTS ITS OWN RULES (its "invariants"). You cannot create a
 * Project with an empty name, you cannot archive one twice, and you cannot
 * rename an archived one, because those checks live in the methods below and the
 * constructor is private.
 *
 * This maps to the capstone: Intern 4 (Admin & Data) owns the real Project
 * entity, and every other slice builds against the shape agreed here.
 *
 * NOTE: this whole file is PROVIDED. You read it and call its methods, you do
 * not edit it. (Modelling entities as classes with invariants is the Week 3
 * lesson, here you just use one.)
 */
import { randomUUID } from 'node:crypto';
import { ArchivedProjectError, InvalidProjectError, ProjectAlreadyArchivedError } from './project.errors';

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
  private _name: string;
  private _client?: string;
  private _active: boolean;

  private constructor(id: string, name: string, active: boolean, client?: string) {
    this.id = id;
    this._name = name;
    this._active = active;
    this._client = client;
  }

  /**
   * The ONLY way to build a Project. It validates the invariants first, so a
   * Project object can never exist in an invalid state.
   */
  static create(props: CreateProjectProps): Project {
    return new Project(
      props.id ?? randomUUID(),
      Project.normalizeName(props.name),
      props.active ?? true,
      Project.normalizeClient(props.client),
    );
  }

  get name(): string {
    return this._name;
  }

  get client(): string | undefined {
    return this._client;
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

  /**
   * Rename (and optionally re-client) the project. The entity enforces two
   * invariants: the new name must be valid, and an archived project cannot be
   * modified. Pass `client` only when you want to change it.
   */
  rename(name: string, client?: string): void {
    if (!this._active) {
      throw new ArchivedProjectError(`Project ${this.id} is archived and cannot be modified.`);
    }
    this._name = Project.normalizeName(name);
    if (client !== undefined) {
      this._client = Project.normalizeClient(client);
    }
  }

  private static normalizeName(raw: string): string {
    const name = (raw ?? '').trim();
    if (name.length === 0) {
      throw new InvalidProjectError('Project name must not be empty.');
    }
    if (name.length > 120) {
      throw new InvalidProjectError('Project name must be at most 120 characters.');
    }
    return name;
  }

  private static normalizeClient(raw?: string): string | undefined {
    const client = raw?.trim();
    return client ? client : undefined;
  }
}
