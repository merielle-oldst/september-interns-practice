/**
 * APPLICATION LAYER, the "archive a project" use-case. ── TASK 2 ──
 *
 * This is a STUB for you to implement. Follow the shape of the worked
 * use-cases: take the repository through the constructor, do the work in
 * `execute()`, keep NestJS out of this file.
 */
import { Project } from '../domain/project';
import { ProjectNotFoundError } from '../domain/project.errors';
import { ProjectRepository } from '../domain/project.repository';
// You will need this:
// import { ProjectNotFoundError } from '../domain/project.errors';

export interface ArchiveProjectInput {
  id: string;
}

export class ArchiveProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(_input: ArchiveProjectInput): Promise<Project> {

    const project = await this.projects.findById(_input.id);
    if (!project) { 
      throw new ProjectNotFoundError(`Project ${_input.id} not found.`)
    }
    
    project.archive();

    await this.projects.save(project);
    return project;
  }
}
