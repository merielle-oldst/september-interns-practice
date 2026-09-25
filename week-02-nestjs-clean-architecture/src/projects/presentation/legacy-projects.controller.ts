import { Controller, Get } from '@nestjs/common';
import { CountActiveProjectsUseCase } from '../application/count-active-projects.use-case';

@Controller('legacy/projects')
export class LegacyProjectsController {
  constructor(
    private readonly countActiveProjects: CountActiveProjectsUseCase
  ) {}

  @Get('active-count')
  async activeCount() {
    return {count: await this.countActiveProjects.execute()}
  }
}
