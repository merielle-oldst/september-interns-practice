/**
 * PRESENTATION LAYER, the (formerly) legacy controller.TASK 4 
 *
 * What was wrong before: this controller injected the repository token directly
 * and did the counting itself. That pointed the presentation layer straight at
 * the data layer, skipping the application layer entirely, and buried a
 * business question ("how many projects are active?") inside an HTTP handler
 * where no other caller could reuse it and no unit test could reach it without
 * booting Nest.
 *
 * (The guard in test/dependency-rule.controllers.spec.ts greps the raw file, so
 * even naming that token in a comment fails it, hence the wording above.)
 *
 * What changed: the counting moved into CountActiveProjectsUseCase, and this
 * controller now goes through ProjectsService to reach it, the same way
 * ProjectsController does. Presentation to application to domain, with the
 * repository only ever touched from behind the use-case.
 *
 * The endpoint's behaviour is identical; only the direction of the dependency
 * changed. That is what makes it a refactor.
 */
import { Controller, Get } from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';

@Controller('legacy/projects')
export class LegacyProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get('active-count')
  async activeCount() {
    const count = await this.projects.countActive();
    return { count };
  }
}
