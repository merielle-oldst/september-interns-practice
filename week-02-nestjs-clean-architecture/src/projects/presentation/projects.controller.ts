/**
 * PRESENTATION LAYER, the HTTP controller.
 *
 * The controller's ONLY jobs: receive the request, hand the work to a use-case,
 * map the result to a response. There is NO business logic here and NO database
 * code here, if you find yourself writing an `if` about business rules or a
 * query in this file, it belongs in a use-case or the repository instead.
 *
 * The controller depends INWARD on the application use-cases. It never imports
 * the InMemoryProjectRepository directly.
 */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProjectUseCase } from '../application/create-project.use-case';
import { ListProjectsUseCase } from '../application/list-projects.use-case';
import { CreateProjectDto } from './dto/create-project.dto';
import { toProjectView } from './project.view';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly listProjects: ListProjectsUseCase,
    // TODO(intern), TASK 3: inject ArchiveProjectUseCase here once it exists and
    // is provided in projects.module.ts.
    // private readonly archiveProject: ArchiveProjectUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.createProject.execute({ name: dto.name, client: dto.client });
    return toProjectView(project);
  }

  @Get()
  async list() {
    const projects = await this.listProjects.execute();
    return projects.map(toProjectView);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TODO(intern), TASK 3: add the archive endpoint.
  //   Route:  PATCH /projects/:id/archive
  //   Read the id with @Param('id'), call the archive use-case, return the view.
  //   Hints: import { Param, Patch } from '@nestjs/common'.
  //
  //   @Patch(':id/archive')
  //   async archive(@Param('id') id: string) { ... }
  //
  // The e2e test ("PATCH /projects/:id/archive") turns green once this route
  // and the wiring in projects.module.ts are done.
  // ───────────────────────────────────────────────────────────────────────────
}
