/**
 * APPLICATION LAYER, the "get one project" use-case. ── TASK 1 ──
 *
 * This is a STUB for you to implement. It is the smallest use-case, do this one
 * first to get the rhythm. Model it on ListProjectsUseCase and
 * CreateProjectUseCase.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
import { ProjectNotFoundError } from '../domain/project.errors';

export interface GetProjectInput {
  id: string;
}

export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(_input: GetProjectInput): Promise<Project> {
    // ─────────────────────────────────────────────────────────────────────────
    // TODO(intern), TASK 1:
    //   1. [/] Look up the project by id (`this.projects.findById`).
    //   2. [/] If it does not exist, throw `ProjectNotFoundError`.
    //   3. [/] Otherwise return it.
    //
    // Turns green: test/get-project.use-case.spec.ts and the e2e "GET /:id" tests.
    // ─────────────────────────────────────────────────────────────────────────
    const matchingProjectId = await this.projects.findById(_input.id)
    if (!matchingProjectId){
      throw new ProjectNotFoundError(`Project not found ${_input.id}`);
    } else{
      return matchingProjectId;
    }
  }
}
