/**
 * APPLICATION LAYER, the "get one project" use-case. ── TASK 1 ──
 *
 * Orchestrates one job: fetch a project by id, or say it does not exist. The
 * "does not exist" answer is a DOMAIN error, not a 404 — turning it into a 404
 * is the presentation layer's job (see domain-exception.filter.ts).
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
import { ProjectNotFoundError } from '../domain/project.errors';

export interface GetProjectInput {
  id: string;
}


export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<Project> {
    const project = await this.projects.findById(input.id);
    if (!project) {
      throw new ProjectNotFoundError(`Project ${input.id} was not found.`);
    }
    return project;
  }


}
