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
import {
  DuplicateProjectNameError,
  InvalidProjectError,
  ProjectNotFoundError,
} from '../domain/project.errors';

export interface UpdateProjectInput {
  id: string;
  name: string;
  client?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    const project = await this.projects.findById(input.id);
    if (!project) {
      throw new ProjectNotFoundError(`Project ${input.id} was not found.`);
    }

    // Trimmed here as well as in the entity, because the uniqueness lookup has
    // to compare the same string the entity will eventually store.
    const name = (input.name ?? '').trim();

    // Name is required. The entity checks this too, but only once rename() runs,
    // which is after the uniqueness lookup below. Without this guard an empty
    // name would first be searched for, and findByName('') would decide the
    // outcome before the real rule ever got a say.
    if (name.length === 0) {
      throw new InvalidProjectError('Project name is required.');
    }

    // Business rule: names are unique ACROSS projects. A project keeping its own
    // name is not a duplicate, so compare ids before rejecting. Without the
    // id check, renaming "Apollo" to "Apollo" would 409 against itself.
    const clash = await this.projects.findByName(name);
    if (clash && clash.id !== project.id) {
      throw new DuplicateProjectNameError(`A project named "${name}" already exists.`);
    }

    // The entity owns the rest: the name rules, and refusing to modify an
    // archived project. We do not re-check either of those here.
    project.rename(name, input.client);

    await this.projects.save(project);
    return project;
  }
}
