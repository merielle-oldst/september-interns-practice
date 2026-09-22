/**
 * APPLICATION LAYER, the "list all projects" use-case.
 *
 * This one is a complete, WORKED EXAMPLE. Read it, get AI to explain it if you
 * like (then explain it back!), and use it as the template for the use-cases
 * you write yourself.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';

export class ListProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projects.findAll();
  }
}
