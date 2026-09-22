/**
 * INFRASTRUCTURE LAYER, an in-memory adapter for the ProjectRepository port.
 *
 * This is the OUTER layer. It is allowed to depend on the domain (it implements
 * the domain's interface) and on NestJS (`@Injectable`). The domain, however,
 * knows nothing about this file, that is the dependency rule pointing inward.
 *
 * In Week 4 you will write a DynamoDB adapter that implements the SAME
 * `ProjectRepository` interface. Because the use-cases only know the interface,
 * swapping this for DynamoDB will not touch a single line of domain or
 * application code. That is the payoff of Clean Architecture.
 */
import { Injectable } from '@nestjs/common';
import { Project } from '../domain/project';
import { ProjectRepository } from '../domain/project.repository';

@Injectable()
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly store = new Map<string, Project>();

  async save(project: Project): Promise<void> {
    this.store.set(project.id, project);
  }

  async findAll(): Promise<Project[]> {
    return [...this.store.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null;
  }

  async findByName(name: string): Promise<Project | null> {
    const target = name.trim().toLowerCase();
    return [...this.store.values()].find((p) => p.name.toLowerCase() === target) ?? null;
  }
}
