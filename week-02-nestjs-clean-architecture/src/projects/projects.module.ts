/**
 * The NestJS module, this is the WIRING (composition root) for the feature.
 *
 * A module is a feature's box: it declares the controllers and provides the
 * things they need. This is also where the dependency rule is satisfied in
 * practice: we bind the PORT (PROJECT_REPOSITORY) to a concrete ADAPTER
 * (InMemoryProjectRepository), and we build each framework-free use-case with a
 * factory, handing it the repository.
 *
 * Because the use-cases have no `@Injectable()` decorator, we cannot let Nest
 * construct them by reflection, we build them ourselves with `useFactory` and
 * declare their dependency with `inject`.
 *
 * The module is the ONE place allowed to know about the concrete repository,
 * that is its job as the composition root. Controllers must not.
 */
import { Module } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { LegacyProjectsController } from './presentation/legacy-projects.controller';
import { PROJECT_REPOSITORY, ProjectRepository } from './domain/project.repository';
import { InMemoryProjectRepository } from './infrastructure/in-memory-project.repository';
import { CreateProjectUseCase } from './application/create-project.use-case';
import { ListProjectsUseCase } from './application/list-projects.use-case';
import { GetProjectUseCase } from './application/get-project.use-case';
import { ArchiveProjectUseCase } from './application/archive-project.use-case';
import { UpdateProjectUseCase } from './application/update-project.use-case';
import { CountActiveProjectsUseCase } from './application/count-active-projects.use-case';

@Module({
  controllers: [ProjectsController, LegacyProjectsController],
  providers: [
    // Bind the port to the in-memory adapter. Swap this one line in Week 4 for a
    // DynamoDB adapter and nothing inward has to change.
    { provide: PROJECT_REPOSITORY, useClass: InMemoryProjectRepository },

    {
      provide: CreateProjectUseCase,
      useFactory: (repo: ProjectRepository) => new CreateProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: ListProjectsUseCase,
      useFactory: (repo: ProjectRepository) => new ListProjectsUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },

    {
      provide: GetProjectUseCase,
      useFactory: (repo: ProjectRepository) => new GetProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },

    {
      provide: ArchiveProjectUseCase,
      useFactory: (repo: ProjectRepository) => new ArchiveProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },

    {
      provide: UpdateProjectUseCase,
      useFactory: (repo: ProjectRepository) => new UpdateProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },

    // Providing this is what lets LegacyProjectsController stop injecting the
    // repository: it now asks for a use-case the module builds for it.
    {
      provide: CountActiveProjectsUseCase,
      useFactory: (repo: ProjectRepository) => new CountActiveProjectsUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
  ],
})
export class ProjectsModule {}
