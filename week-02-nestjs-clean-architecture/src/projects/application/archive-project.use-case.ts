/**
 * APPLICATION LAYER, the "archive a project" use-case.
 *
 * This is a STUB for you to implement (TASK 2). Follow the shape of
 * ListProjectsUseCase and CreateProjectUseCase: take the repository through the
 * constructor, do the work in `execute()`, keep NestJS out of this file.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
// You will need these:
// import { ProjectNotFoundError } from '../domain/project.errors';

export interface ArchiveProjectInput {
  id: string;
}

export class ArchiveProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(_input: ArchiveProjectInput): Promise<Project> {
    // ─────────────────────────────────────────────────────────────────────────
    // TODO(intern), TASK 2: implement archiving.
    //   1. Look up the project by id (`this.projects.findById`).
    //   2. If it does not exist, throw `ProjectNotFoundError`.
    //   3. Ask the ENTITY to archive itself (`project.archive()`), let the
    //      domain enforce the "already archived" rule, do not re-implement it here.
    //   4. Save the project and return it.
    //
    // Tests to turn green: test/archive-project.use-case.spec.ts and the
    // "PATCH archive" e2e test.
    // ─────────────────────────────────────────────────────────────────────────
    throw new Error('Not implemented yet: ArchiveProjectUseCase.execute (see TASK 2).');
  }
}
