/**
 * Unit tests for the Project ENTITY (domain layer).
 *
 * These pass on the starter, they show you what an entity protecting its own
 * rules looks like. Read them to understand the entity before you build on it.
 */
import { Project } from '../src/projects/domain/project';
import {
  ArchivedProjectError,
  InvalidProjectError,
  ProjectAlreadyArchivedError,
} from '../src/projects/domain/project.errors';

describe('Project entity', () => {
  it('creates an active project and trims the name', () => {
    const project = Project.create({ name: '  Apollo  ' });
    expect(project.name).toBe('Apollo');
    expect(project.active).toBe(true);
    expect(project.id).toBeTruthy();
  });

  it('generates an id when none is given', () => {
    const a = Project.create({ name: 'One' });
    const b = Project.create({ name: 'Two' });
    expect(a.id).not.toBe(b.id);
  });

  it('rejects an empty (or whitespace-only) name', () => {
    expect(() => Project.create({ name: '   ' })).toThrow(InvalidProjectError);
  });

  it('archives an active project', () => {
    const project = Project.create({ name: 'Apollo' });
    project.archive();
    expect(project.active).toBe(false);
  });

  it('refuses to archive a project that is already archived', () => {
    const project = Project.create({ name: 'Apollo', active: false });
    expect(() => project.archive()).toThrow(ProjectAlreadyArchivedError);
  });

  it('renames an active project and can change its client', () => {
    const project = Project.create({ name: 'Apollo', client: 'Acme' });
    project.rename('Artemis', 'Globex');
    expect(project.name).toBe('Artemis');
    expect(project.client).toBe('Globex');
  });

  it('rejects an invalid new name on rename', () => {
    const project = Project.create({ name: 'Apollo' });
    expect(() => project.rename('   ')).toThrow(InvalidProjectError);
  });

  it('refuses to rename an archived project', () => {
    const project = Project.create({ name: 'Apollo', active: false });
    expect(() => project.rename('Artemis')).toThrow(ArchivedProjectError);
  });
});
