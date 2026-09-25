/**
 * PRESENTATION LAYER, the HTTP controller.
 *
 * The controller's ONLY jobs: receive the request, hand the work to the
 * application service, map the result to a response. There is NO business logic
 * here and NO database code here.
 *
 * It depends on ProjectsService rather than on the use-cases directly, so it has
 * one dependency instead of six and does not change when a use-case is added.
 * The service is the application layer's front door.
 */
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { toProjectView } from './project.view';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.projects.create({ name: dto.name, client: dto.client });
    return toProjectView(project);
  }

  @Get()
  async list() {
    const projects = await this.projects.list();
    return projects.map(toProjectView);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const project = await this.projects.getById(id);
    return toProjectView(project);
  }

  // Declared BEFORE the PATCH /:id route: Nest matches in declaration order, so
  // the more specific path has to come first or ':id' swallows it.
  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    const project = await this.projects.archive(id);
    return toProjectView(project);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.projects.update({ id, name: dto.name, client: dto.client });
    return toProjectView(project);
  }
}
