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
// As you build each use-case, import it here and add a provider below:
// import { GetProjectUseCase } from './application/get-project.use-case';               // TASK 1
// import { ArchiveProjectUseCase } from './application/archive-project.use-case';       // TASK 2
// import { UpdateProjectUseCase } from './application/update-project.use-case';         // TASK 3
// import { CountActiveProjectsUseCase } from './application/count-active-projects.use-case'; // TASK 4

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

    // TODO(intern): add a provider for each use-case you build, using the SAME
    // useFactory + inject pattern as the two above.
    //   TASK 1: GetProjectUseCase
    //   TASK 2: ArchiveProjectUseCase
    //   TASK 3: UpdateProjectUseCase
    //   TASK 4: CountActiveProjectsUseCase
  ],
})
export class ProjectsModule {}
