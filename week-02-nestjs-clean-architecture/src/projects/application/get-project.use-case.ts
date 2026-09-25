/**
 * APPLICATION LAYER, the "get one project" use-case. ── TASK 1 ──
 *
 * This is a STUB for you to implement. It is the smallest use-case, do this one
 * first to get the rhythm. Model it on ListProjectsUseCase and
 * CreateProjectUseCase.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
// You will need this:
import { ProjectNotFoundError } from '../domain/project.errors';

export interface GetProjectInput {
  id: string;
}

export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<Project> {
   
    const existingProject = await this.projects.findById(input.id);
    
    if (!existingProject) {
       throw new ProjectNotFoundError(`Project ${input.id} not found.`);
    }
    
    return existingProject;
  }
}
