/**
 * DOMAIN LAYER, the repository PORT.
 *
 * This is an INTERFACE, a promise about what a data store can do, described in
 * the language of the domain ("save a project", "find one by name"). It says
 * nothing about HOW (DynamoDB? in-memory? a file?). That "how" is an
 * Infrastructure concern and plugs in from the OUTSIDE.
 *
 * This is the dependency rule in action: the domain owns the interface; the
 * outer layers must satisfy it. The domain never reaches out to a database, the
 * database reaches IN and implements this contract.
 */
import { Project } from './project';

/**
 * A DI token. A TypeScript `interface` disappears at runtime, so NestJS cannot
 * inject "a ProjectRepository" by its type alone. We give it this symbol as a
 * name to look up instead (wired in projects.module.ts).
 */
export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  /** Used to enforce the "no duplicate project names" rule. Case-insensitive. */
  findByName(name: string): Promise<Project | null>;
}
