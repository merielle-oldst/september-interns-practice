/**
 * APPLICATION LAYER, the "create a project" use-case.
 *
 * A use-case orchestrates ONE piece of work. It depends on the domain (the
 * Project entity, the repository PORT, the domain errors) but NOT on NestJS and
 * NOT on the database implementation. Notice there is no `@Injectable()` here,
 * this class stays framework-free on purpose. It is wired into NestJS in
 * projects.module.ts using a factory.
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

    // ─────────────────────────────────────────────────────────────────────────
    // TODO(intern), TASK 1: enforce the business rule "no two projects may share
    // a name" (see the capstone spec, Intern 4).
    //
    // Think first: WHICH layer does this rule belong to? (It needs to look at
    // OTHER projects, so it cannot live inside a single Project entity, it
    // belongs to a use-case, right here.)
    //
    // Use `this.projects.findByName(name)` and throw `DuplicateProjectNameError`
    // if a project with that name already exists. Do it BEFORE creating/saving.
    //
    // The test `test/create-project.use-case.spec.ts` ("rejects a duplicate
    // name") and the e2e test ("409 on duplicate") will pass once you do.
    // ─────────────────────────────────────────────────────────────────────────

    const project = Project.create({ name, client: input.client });
    await this.projects.save(project);
    return project;
  }
}
