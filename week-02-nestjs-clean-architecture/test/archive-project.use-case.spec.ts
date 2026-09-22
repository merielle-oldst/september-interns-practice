/**
 * Unit tests for ArchiveProjectUseCase (application layer).
 *
 * These are RED until you finish TASK 2 in archive-project.use-case.ts.
 */
import { ArchiveProjectUseCase } from '../src/projects/application/archive-project.use-case';
import { InMemoryProjectRepository } from '../src/projects/infrastructure/in-memory-project.repository';
import { Project } from '../src/projects/domain/project';
import { ProjectNotFoundError } from '../src/projects/domain/project.errors';

describe('ArchiveProjectUseCase', () => {
  let repo: InMemoryProjectRepository;
  let archiveProject: ArchiveProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    archiveProject = new ArchiveProjectUseCase(repo);
  });

  it('archives an existing project', async () => {
    const project = Project.create({ name: 'Apollo' });
    await repo.save(project);

    const result = await archiveProject.execute({ id: project.id });

    expect(result.active).toBe(false);
    expect((await repo.findById(project.id))?.active).toBe(false);
  });

  it('throws ProjectNotFoundError for an unknown id', async () => {
    await expect(archiveProject.execute({ id: 'does-not-exist' })).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
  });
});
