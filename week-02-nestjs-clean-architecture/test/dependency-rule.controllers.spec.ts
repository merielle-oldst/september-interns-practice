/**
 * A second dependency-rule guard, aimed at the PRESENTATION layer.
 *
 * Controllers may depend on application use-cases, but they must NOT reach into
 * the data layer: no importing the repository port and no injecting
 * PROJECT_REPOSITORY, and no importing the infrastructure adapter. Data access
 * belongs behind a use-case.
 *
 * This is RED on the starter because legacy-projects.controller.ts breaks the
 * rule on purpose. TASK 4 is to refactor it until this test goes green. You
 * should not edit this test.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function controllerFilesIn(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...controllerFilesIn(full));
    } else if (full.endsWith('.controller.ts')) {
      out.push(full);
    }
  }
  return out;
}

const PRESENTATION = join(__dirname, '..', 'src', 'projects', 'presentation');

describe('Dependency rule, controllers do not touch the data layer', () => {
  it('no controller imports the repository port or injects PROJECT_REPOSITORY', () => {
    for (const file of controllerFilesIn(PRESENTATION)) {
      const code = readFileSync(file, 'utf8');
      expect(code).not.toMatch(/project\.repository/);
      expect(code).not.toMatch(/PROJECT_REPOSITORY/);
      expect(code).not.toMatch(/\.\.\/infrastructure/);
    }
  });
});
