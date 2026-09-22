/**
 * PRESENTATION LAYER, the response view.
 *
 * We do NOT hand the domain entity straight back to the client (it has methods
 * and private fields). We map it to a plain, predictable JSON shape. This keeps
 * the wire format under our control and separate from the entity's internals.
 */
import { Project } from '../domain/project';

export interface ProjectView {
  id: string;
  name: string;
  client?: string;
  active: boolean;
}

export function toProjectView(project: Project): ProjectView {
  return {
    id: project.id,
    name: project.name,
    client: project.client,
    active: project.active,
  };
}
