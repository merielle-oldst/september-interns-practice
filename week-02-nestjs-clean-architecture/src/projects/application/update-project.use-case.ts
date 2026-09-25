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
    // ─────────────────────────────────────────────────────────────────────────
    // TODO(intern), TASK 3:
    //   1. Look up the project by id; throw `ProjectNotFoundError` if missing.
    //   2. Enforce "no duplicate name": if `findByName` returns a project whose
    //      id is DIFFERENT from this one, throw `DuplicateProjectNameError`.
    //      (Renaming a project to the name it already has must be allowed.)
    //   3. Call `project.rename(name, client)` — the entity enforces the name
    //      rules and the "archived cannot be modified" rule for you.
    //   4. Save and return the project.
    //
    // Turns green: test/update-project.use-case.spec.ts and the e2e
    // "PATCH /:id" tests.
    // ─────────────────────────────────────────────────────────────────────────
    const project = await this.projects.findById(input.id);

    if (!project) {
      throw new ProjectNotFoundError(`No project found with ID ${input.id}`)
    } 

    const existing = await this.projects.findByName(input.name);

    if (existing && existing.id !== project.id) {
      throw new DuplicateProjectNameError(`The project ${input.name} already exists.`);
    }
    project.rename(input.name, input.client);
    await this.projects.save(project);
    
    return project;
  }
}
