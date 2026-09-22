/**
 * Unit tests for UpdateProjectUseCase (application layer). RED until TASK 3.
 */
import { UpdateProjectUseCase } from '../src/projects/application/update-project.use-case';
import { InMemoryProjectRepository } from '../src/projects/infrastructure/in-memory-project.repository';
import { Project } from '../src/projects/domain/project';
import {
  ArchivedProjectError,
  DuplicateProjectNameError,
  ProjectNotFoundError,
} from '../src/projects/domain/project.errors';

describe('UpdateProjectUseCase', () => {
  let repo: InMemoryProjectRepository;
  let updateProject: UpdateProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    updateProject = new UpdateProjectUseCase(repo);
  });

  it('renames a project', async () => {
    const project = Project.create({ name: 'Apollo' });
    await repo.save(project);

    const result = await updateProject.execute({ id: project.id, name: 'Artemis' });

    expect(result.name).toBe('Artemis');
    expect((await repo.findById(project.id))?.name).toBe('Artemis');
  });

  it('allows renaming a project to the name it already has', async () => {
    const project = Project.create({ name: 'Apollo', client: 'Acme' });
    await repo.save(project);

    const result = await updateProject.execute({ id: project.id, name: 'Apollo', client: 'Globex' });

    expect(result.name).toBe('Apollo');
    expect(result.client).toBe('Globex');
  });

  it('rejects renaming to a name used by a DIFFERENT project', async () => {
    const apollo = Project.create({ name: 'Apollo' });
    const artemis = Project.create({ name: 'Artemis' });
    await repo.save(apollo);
    await repo.save(artemis);

    await expect(updateProject.execute({ id: artemis.id, name: 'Apollo' })).rejects.toBeInstanceOf(
      DuplicateProjectNameError,
    );
  });

  it('throws ProjectNotFoundError for an unknown id', async () => {
    await expect(updateProject.execute({ id: 'nope', name: 'X' })).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
  });

  it('refuses to update an archived project (rule enforced by the entity)', async () => {
    const project = Project.create({ name: 'Apollo', active: false });
    await repo.save(project);

    await expect(updateProject.execute({ id: project.id, name: 'Artemis' })).rejects.toBeInstanceOf(
      ArchivedProjectError,
    );
  });
});
