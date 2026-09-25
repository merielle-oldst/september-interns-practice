/**
 * APPLICATION LAYER, the "rename / update a project" use-case. ── TASK 3 ──
 *
 * This is the meatiest task. It combines two things you have already seen:
 *   - the "not found → error" lookup (like get / archive), and
 *   - the "no duplicate name" business rule (like create).
 *
 * The twist: when renaming, a name that belongs to THIS SAME project is fine,
 * only a clash with a DIFFERENT project is a duplicate. And the "archived
 * projects cannot be modified" rule is the ENTITY's job (`project.rename`), not
 * yours here.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
// You will need these:
import { DuplicateProjectNameError, ProjectNotFoundError } from '../domain/project.errors';

export interface UpdateProjectInput {
  id: string;
  name: string;
  client?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    
    const projectToUpdate = await this.projects.findById(input.id);
    
    if (!projectToUpdate) {
      throw new ProjectNotFoundError(`Project ${input.id} not found.`);
    }

    const projectName = await this.projects.findByName(input.name);

    if (projectName && projectName.id !== projectToUpdate.id) {
      throw new DuplicateProjectNameError(`Project ${input.name} is already existing.`);
    }

    projectToUpdate.rename(input.name, input.client);
    await this.projects.save(projectToUpdate);

    return projectToUpdate;
   
  }
}
