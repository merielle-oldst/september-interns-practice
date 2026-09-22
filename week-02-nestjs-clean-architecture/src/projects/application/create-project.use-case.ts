/**
 * APPLICATION LAYER, the "create a project" use-case. ── WORKED REFERENCE ──
 *
 * This is a COMPLETE example. It is the template for every use-case you write in
 * this exercise, so read it closely.
 *
 * A use-case orchestrates ONE piece of work. It depends on the domain (the
 * Project entity, the repository PORT, the domain errors) but NOT on NestJS and
 * NOT on the database implementation. Notice there is no `@Injectable()` here,
 * this class stays framework-free on purpose. It is wired into NestJS in
 * projects.module.ts using a factory.
 *
 * Notice too WHERE the business rule lives: "no two projects share a name" needs
 * to look at OTHER projects, so it cannot live inside a single Project entity,
 * it belongs in a use-case, right here. (Shape validation, "is name a string?",
 * is a different job and lives in the DTO at the boundary.)
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
import { DuplicateProjectNameError } from '../domain/project.errors';

export interface CreateProjectInput {
  name: string;
  client?: string;
}

export class CreateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const name = (input.name ?? '').trim();

    // Business rule: names are unique.
    const existing = await this.projects.findByName(name);
    if (existing) {
      throw new DuplicateProjectNameError(`A project named "${name}" already exists.`);
    }

    const project = Project.create({ name, client: input.client });
    await this.projects.save(project);
    return project;
  }
}
