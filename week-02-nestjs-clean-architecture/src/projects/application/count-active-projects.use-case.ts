/**
 * APPLICATION LAYER, "count active projects". ── TASK 4 (the refactor target) ──
 *
 * This use-case is where the logic that WAS sitting wrongly inside
 * `presentation/legacy-projects.controller.ts` now lives. The controller asks
 * this question; it no longer answers it itself, and it no longer touches the
 * repository to do so.
 *
 * The filtering is asked of the repository rather than done here. Loading every
 * project and discarding the archived ones works, but it makes the application
 * layer do the data layer's job, and in Week 4 it would mean scanning the whole
 * table just to count a subset of it.
 */
import { ProjectRepository } from '../domain/project.repository';

export class CountActiveProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(): Promise<number> {
    const active = await this.projects.findByStatus(true);
    return active.length;
  }
}
