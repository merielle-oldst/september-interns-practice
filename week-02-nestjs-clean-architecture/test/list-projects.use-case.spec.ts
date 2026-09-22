/**
 * Unit tests for ListProjectsUseCase (application layer). Passes on the starter.
 */
import { ListProjectsUseCase } from '../src/projects/application/list-projects.use-case';
import { InMemoryProjectRepository } from '../src/projects/infrastructure/in-memory-project.repository';
import { Project } from '../src/projects/domain/project';

describe('ListProjectsUseCase', () => {
  it('returns all projects, sorted by name', async () => {
    const repo = new InMemoryProjectRepository();
    await repo.save(Project.create({ name: 'Zephyr' }));
    await repo.save(Project.create({ name: 'Apollo' }));

    const listProjects = new ListProjectsUseCase(repo);
    const names = (await listProjects.execute()).map((p) => p.name);

    expect(names).toEqual(['Apollo', 'Zephyr']);
  });

  it('returns an empty list when there are no projects', async () => {
    const listProjects = new ListProjectsUseCase(new InMemoryProjectRepository());
    expect(await listProjects.execute()).toEqual([]);
  });
});
