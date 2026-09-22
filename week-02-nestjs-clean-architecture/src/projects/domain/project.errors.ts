/**
 * DOMAIN LAYER, errors.
 *
 * These are pure business errors. They know NOTHING about HTTP status codes or
 * NestJS, that mapping happens later, at the boundary (see
 * presentation/domain-exception.filter.ts). Keeping them framework-free is the
 * whole point of Clean Architecture: the rules do not depend on the tools.
 */

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    // `new.target.name` is the concrete subclass name, e.g. "DuplicateProjectNameError".
    this.name = new.target.name;
  }
}

/** The data breaks a rule of what a Project is (e.g. empty name). */
export class InvalidProjectError extends DomainError {}

/** Two projects would share the same name. */
export class DuplicateProjectNameError extends DomainError {}

/** No project exists for the given id. */
export class ProjectNotFoundError extends DomainError {}

/** The project is already archived, so it cannot be archived again. */
export class ProjectAlreadyArchivedError extends DomainError {}

/** The project is archived, so it cannot be modified (e.g. renamed). */
export class ArchivedProjectError extends DomainError {}
