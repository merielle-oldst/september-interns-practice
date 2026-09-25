/**
 * APPLICATION LAYER, "count active projects". ── TASK 4 (the refactor target) ──
 *
 * This use-case is where the logic that WAS sitting wrongly inside
 * `presentation/legacy-projects.controller.ts` now lives. The controller asks
 * this question; it no longer answers it itself, and it no longer touches the
 * repository to do so.
 */
import { ProjectRepository } from '../domain/project.repository';

export class CountActiveProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(): Promise<number> {
    const projects = await this.projects.findAll();
    return projects.filter((project) => project.active).length;
  }
}
