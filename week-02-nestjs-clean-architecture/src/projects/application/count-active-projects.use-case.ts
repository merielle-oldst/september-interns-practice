/**
 * APPLICATION LAYER, "count active projects". ── TASK 4 (the refactor target) ──
 *
 * This use-case is where the logic that is CURRENTLY sitting wrongly inside
 * `presentation/legacy-projects.controller.ts` should move to. Right now it is a
 * stub. In TASK 4 you implement it, then rewire the legacy controller to call it
 * instead of touching the repository and doing the counting itself.
 */
import { ProjectRepository } from '../domain/project.repository';

export class CountActiveProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(): Promise<number> {
   
    const all = await this.projects.findAll();
    const count = all.filter((project) => project.active).length;
    
    return count;

  }
}
