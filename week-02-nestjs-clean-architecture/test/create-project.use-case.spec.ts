/**
 * Unit tests for CreateProjectUseCase (application layer). ── worked reference ──
 *
 * Both tests pass on the starter, this use-case is your template. Note the test
 * double: we hand the use-case the real InMemoryProjectRepository. Because the
 * use-case depends only on the PORT, we could just as easily pass a fake, that
 * is what ports buy you.
 */
import { CreateProjectUseCase } from '../src/projects/application/create-project.use-case';
import { InMemoryProjectRepository } from '../src/projects/infrastructure/in-memory-project.repository';
import { DuplicateProjectNameError } from '../src/projects/domain/project.errors';

describe('CreateProjectUseCase', () => {
  let repo: InMemoryProjectRepository;
  let createProject: CreateProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    createProject = new CreateProjectUseCase(repo);
  });

  it('creates and persists a project', async () => {
    const project = await createProject.execute({ name: 'Apollo', client: 'Acme' });

    expect(project.name).toBe('Apollo');
    expect(project.client).toBe('Acme');
    expect(await repo.findById(project.id)).not.toBeNull();
  });

  it('rejects a duplicate name (case-insensitive)', async () => {
    await createProject.execute({ name: 'Apollo' });

    await expect(createProject.execute({ name: 'apollo' })).rejects.toBeInstanceOf(
      DuplicateProjectNameError,
    );

    expect(await repo.findAll()).toHaveLength(1);
  });
});
