/**
 * APPLICATION LAYER, the application service.
 *
 * The controller used to inject every use-case and call them one by one. This
 * service sits between the two, so the controller depends on ONE thing and the
 * use-cases stay single-purpose behind it.
 *
 * Why bother, when most of these methods are a single pass-through today:
 *   - the controller stops needing to know how many use-cases a feature has, so
 *     adding one later does not change its constructor.
 *   - when a request needs two use-cases combined, or a result reshaped before
 *     it leaves, this is where that goes, instead of quietly growing inside an
 *     HTTP handler.
 *   - it gives one place to put cross-cutting work like logging later on.
 *
 * Still framework-free: no @Injectable, no NestJS import, so the architecture
 * guard stays green. It is built by a factory in projects.module.ts, the same
 * way the use-cases are.
 */
import { Project } from '../domain/project';
import { CreateProjectUseCase, CreateProjectInput } from './create-project.use-case';
import { ListProjectsUseCase } from './list-projects.use-case';
import { GetProjectUseCase } from './get-project.use-case';
import { ArchiveProjectUseCase } from './archive-project.use-case';
import { UpdateProjectUseCase, UpdateProjectInput } from './update-project.use-case';
import { CountActiveProjectsUseCase } from './count-active-projects.use-case';

export class ProjectsService {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly archiveProjectUseCase: ArchiveProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly countActiveProjectsUseCase: CountActiveProjectsUseCase,
  ) {}

  create(input: CreateProjectInput): Promise<Project> {
    return this.createProjectUseCase.execute(input);
  }

  list(): Promise<Project[]> {
    return this.listProjectsUseCase.execute();
  }

  getById(id: string): Promise<Project> {
    return this.getProjectUseCase.execute({ id });
  }

  archive(id: string): Promise<Project> {
    return this.archiveProjectUseCase.execute({ id });
  }

  update(input: UpdateProjectInput): Promise<Project> {
    return this.updateProjectUseCase.execute(input);
  }

  countActive(): Promise<number> {
    return this.countActiveProjectsUseCase.execute();
  }
}
