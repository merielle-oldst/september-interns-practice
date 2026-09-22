/**
 * The NestJS module, this is the WIRING (composition root) for the feature.
 *
 * A module is a feature's box: it declares the controller and provides the
 * things the controller/use-cases need. This is also where the dependency rule
 * is satisfied in practice: we bind the PORT (PROJECT_REPOSITORY) to a concrete
 * ADAPTER (InMemoryProjectRepository), and we build each framework-free
 * use-case with a factory, handing it the repository.
 *
 * Because the use-cases have no `@Injectable()` decorator, we cannot let Nest
 * construct them by reflection, we build them ourselves with `useFactory` and
 * declare their dependency with `inject`.
 */
import { Module } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { PROJECT_REPOSITORY, ProjectRepository } from './domain/project.repository';
import { InMemoryProjectRepository } from './infrastructure/in-memory-project.repository';
import { CreateProjectUseCase } from './application/create-project.use-case';
import { ListProjectsUseCase } from './application/list-projects.use-case';
// TODO(intern), TASK 3: import { ArchiveProjectUseCase } from './application/archive-project.use-case';

@Module({
  controllers: [ProjectsController],
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

    // TODO(intern), TASK 3: provide ArchiveProjectUseCase using the SAME
    // useFactory + inject pattern as the two above.
  ],
})
export class ProjectsModule {}
