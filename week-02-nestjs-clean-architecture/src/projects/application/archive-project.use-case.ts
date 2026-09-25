/**
 * APPLICATION LAYER, the "archive a project" use-case. ── TASK 2 ──
 *
 * This is a STUB for you to implement. Follow the shape of the worked
 * use-cases: take the repository through the constructor, do the work in
 * `execute()`, keep NestJS out of this file.
 */
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';
// [/] You will need this:
import { ProjectNotFoundError } from '../domain/project.errors';

export interface ArchiveProjectInput {
  id: string;
}

export class ArchiveProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(_input: ArchiveProjectInput): Promise<Project> {
    // ─────────────────────────────────────────────────────────────────────────
    // TODO(intern), TASK 2:
    //   1. [/] Look up the project by id (`this.projects.findById`).
    //   2. [/] If it does not exist, throw `ProjectNotFoundError`.
    //   3. [/] Ask the ENTITY to archive itself (`project.archive()`), let the
    //      domain enforce the "already archived" rule, do not re-implement it here.
    //   4. [/] Save the project and return it.
    //
    // Turns green: test/archive-project.use-case.spec.ts and the e2e
    // "PATCH /:id/archive" test.
    // ─────────────────────────────────────────────────────────────────────────
    const matchingProjectId = await this.projects.findById(_input.id);
    if(!matchingProjectId){
      throw new ProjectNotFoundError(_input.id);
    } 
    
    matchingProjectId.archive();
    await this.projects.save(matchingProjectId);
    return matchingProjectId;
  }
}
