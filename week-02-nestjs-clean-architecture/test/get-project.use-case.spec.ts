/**
 * Unit tests for GetProjectUseCase (application layer). RED until TASK 1.
 */
import { GetProjectUseCase } from '../src/projects/application/get-project.use-case';
import { InMemoryProjectRepository } from '../src/projects/infrastructure/in-memory-project.repository';
import { Project } from '../src/projects/domain/project';
import { ProjectNotFoundError } from '../src/projects/domain/project.errors';

describe('GetProjectUseCase', () => {
  let repo: InMemoryProjectRepository;
  let getProject: GetProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    getProject = new GetProjectUseCase(repo);
  });

  it('returns an existing project', async () => {
    const project = Project.create({ name: 'Apollo' });
    await repo.save(project);

    const result = await getProject.execute({ id: project.id });

    expect(result.id).toBe(project.id);
    expect(result.name).toBe('Apollo');
  });

  it('throws ProjectNotFoundError for an unknown id', async () => {
    await expect(getProject.execute({ id: 'nope' })).rejects.toBeInstanceOf(ProjectNotFoundError);
  });
});
