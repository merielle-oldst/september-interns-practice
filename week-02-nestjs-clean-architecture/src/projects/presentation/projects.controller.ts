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
import { Body, Controller, Get, Post, Param, Patch } from '@nestjs/common';
import { CreateProjectUseCase } from '../application/create-project.use-case';
import { ListProjectsUseCase } from '../application/list-projects.use-case';
import { CreateProjectDto } from './dto/create-project.dto';
import { toProjectView } from './project.view';
import { GetProjectUseCase } from '../application/get-project.use-case';
import { ArchiveProjectUseCase } from '../application/archive-project.use-case';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectUseCase } from '../application/update-project.use-case';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly listProjects: ListProjectsUseCase,
    // As you do each task, inject the use-case you built, e.g.:
    private readonly getProject: GetProjectUseCase,      // TASK 1
    private readonly archiveProject: ArchiveProjectUseCase, // TASK 2
    private readonly updateProject: UpdateProjectUseCase,   // TASK 3
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
  // TODO(intern), TASK 1: GET /projects/:id
  //   Read the id with @Param('id'), call the get use-case, return the view.
  //   Hint: import { Param } from '@nestjs/common'.
  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    const project = await this.getProject.execute({ id });
    return toProjectView(project);
  }
  //
  // TODO(intern), TASK 2: PATCH /projects/:id/archive
  //   Call the archive use-case, return the view.
  //   Hint: import { Patch } from '@nestjs/common'.
  //
  @Patch(':id/archive')
  async archiveByID(@Param('id') id: string) {
    const projectToArchive = await this.archiveProject.execute({ id });
    return toProjectView(projectToArchive);
  }

  // TODO(intern), TASK 3: PATCH /projects/:id
  //   Take an UpdateProjectDto body + the id, call the update use-case.
  //
  @Patch(':id')
  async updateProjectByID(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const projectToUpdate = await this.updateProject.execute({
      id, name: updateProjectDto.name, client: updateProjectDto.client
    });
    return toProjectView(projectToUpdate);
  }
  // Remember to WIRE each use-case in projects.module.ts (do the module provider
  // and the controller injection together, or the app will not boot).
  // ───────────────────────────────────────────────────────────────────────────
}
