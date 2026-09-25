/**
 * APPLICATION LAYER, the "archive a project" use-case. ── TASK 2 ──
 *
 * This is a STUB for you to implement. Follow the shape of the worked
 * use-cases: take the repository through the constructor, do the work in
 * `execute()`, keep NestJS out of this file.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
// You will need this:
import { ProjectNotFoundError } from '../domain/project.errors';

export interface ArchiveProjectInput {
  id: string;
}

export class ArchiveProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: ArchiveProjectInput): Promise<Project> {
    
    const existingProject = await this.projects.findById(input.id);
    
    if (!existingProject) {
      throw new ProjectNotFoundError(`Project ${input.id} not found.`);
    }

    existingProject.archive();
    await this.projects.save(existingProject);

    return existingProject;
    
  }
}
