/**
 * Unit tests for CountActiveProjectsUseCase (application layer). RED until TASK 4.
 */
import { CountActiveProjectsUseCase } from '../src/projects/application/count-active-projects.use-case';
import { InMemoryProjectRepository } from '../src/projects/infrastructure/in-memory-project.repository';
import { Project } from '../src/projects/domain/project';

describe('CountActiveProjectsUseCase', () => {
  it('counts only the active projects', async () => {
    const repo = new InMemoryProjectRepository();
    await repo.save(Project.create({ name: 'Active One' }));
    await repo.save(Project.create({ name: 'Active Two' }));
    await repo.save(Project.create({ name: 'Archived', active: false }));

    const countActive = new CountActiveProjectsUseCase(repo);

    expect(await countActive.execute()).toBe(2);
  });

  it('returns 0 when there are no projects', async () => {
    const countActive = new CountActiveProjectsUseCase(new InMemoryProjectRepository());
    expect(await countActive.execute()).toBe(0);
  });
});
