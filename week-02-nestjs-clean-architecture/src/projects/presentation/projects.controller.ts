/**
 * PRESENTATION LAYER, the HTTP controller.
 *
 * The controller's ONLY jobs: receive the request, hand the work to a use-case,
 * map the result to a response. There is NO business logic here and NO database
 * code here, if you find yourself writing an `if` about business rules or a
 * query in this file, it belongs in a use-case or the repository instead.
 *
 * The `create` (POST) and `list` (GET) handlers below are your WORKED REFERENCE.
 * Each new endpoint you add is the same three moves: inject the use-case, call
 * `execute`, map the result with `toProjectView`.
 */
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProjectUseCase } from '../application/create-project.use-case';
import { ListProjectsUseCase } from '../application/list-projects.use-case';
import { GetProjectUseCase } from '../application/get-project.use-case';
import { ArchiveProjectUseCase } from '../application/archive-project.use-case';
import { UpdateProjectUseCase } from '../application/update-project.use-case';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { toProjectView } from './project.view';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly listProjects: ListProjectsUseCase,
    private readonly getProject: GetProjectUseCase,
    private readonly archiveProject: ArchiveProjectUseCase,
    private readonly updateProject: UpdateProjectUseCase,
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

  @Get(':id')
  async get(@Param('id') id: string) {
    const project = await this.getProject.execute({ id });
    return toProjectView(project);
  }

  // Declared BEFORE any PATCH /:id route (TASK 3): Nest matches in declaration
  // order, so the more specific path has to come first or ':id' swallows it.
  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    const project = await this.archiveProject.execute({ id });
    return toProjectView(project);
  }

  // Declared AFTER ':id/archive' so the more specific route wins.
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.updateProject.execute({
      id,
      name: dto.name,
      client: dto.client,
    });
    return toProjectView(project);
  }
}
