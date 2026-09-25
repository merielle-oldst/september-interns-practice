/**
 * PRESENTATION LAYER, a controller that BREAKS Clean Architecture. ── TASK 4 ──
 *
 * ⚠️ This is deliberately wrong. It is here for you to FIX.
 *
 * What's wrong: the controller reaches straight into the repository 
 *  and does business logic (the counting) itself. That
 * points the presentation layer at the data layer and buries a rule in an
 * endpoint, exactly the mistake the dependency rule forbids (and exactly Week 2
 * Knowledge Check Q5).
 *
 * TASK 4 — refactor it so the dependency points the right way:
 *   1. Implement `CountActiveProjectsUseCase` (application layer).
 *   2. Provide it in projects.module.ts (useFactory + inject, like the others).
 *   3. Here, inject `CountActiveProjectsUseCase` INSTEAD of the repository, and
 *      have the handler just call `execute()`. Remove the repository import and
 *      the `@Inject()`.
 *
 * The endpoint's behaviour must not change (its e2e test stays green). The guard
 * in test/dependency-rule.controllers.spec.ts is RED until the controller no
 * longer touches the repository, that's what tells you the refactor is done.
 */
import { Controller, Get } from '@nestjs/common';
import { CountActiveProjectsUseCase } from '../application/count-active-projects.use-case';

@Controller('legacy/projects')
export class LegacyProjectsController {
  constructor(
    private readonly countActiveProjects: CountActiveProjectsUseCase,
  ) {}

  @Get('active-count')
  async activeCount() {
    const activeProjectCount = await this.countActiveProjects.execute();
    return {count : activeProjectCount};
  }
}


