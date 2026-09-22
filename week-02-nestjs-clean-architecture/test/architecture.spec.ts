/**
 * THE dependency-rule guard.
 *
 * This test is your Clean Architecture safety net. It reads the source files in
 * the domain and application layers and fails if they import something they are
 * not allowed to, NestJS, or a file from an outer layer.
 *
 * You should NOT need to edit this file. If it goes red, it means a piece of
 * business logic started depending on a tool or on the outside, exactly the
 * mistake Clean Architecture exists to prevent. Move the offending code
 * outward, or invert the dependency behind a port.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function tsFilesIn(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...tsFilesIn(full));
    } else if (full.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

const PROJECTS = join(__dirname, '..', 'src', 'projects');

describe('Clean Architecture, the dependency rule (code only points inward)', () => {
  it('the DOMAIN layer imports no framework and no outer layer', () => {
    for (const file of tsFilesIn(join(PROJECTS, 'domain'))) {
      const code = readFileSync(file, 'utf8');
      expect(code).not.toMatch(/@nestjs/);
      expect(code).not.toMatch(/\.\.\/application/);
      expect(code).not.toMatch(/\.\.\/infrastructure/);
      expect(code).not.toMatch(/\.\.\/presentation/);
    }
  });

  it('the APPLICATION layer imports no framework and no outer layer', () => {
    for (const file of tsFilesIn(join(PROJECTS, 'application'))) {
      const code = readFileSync(file, 'utf8');
      expect(code).not.toMatch(/@nestjs/);
      expect(code).not.toMatch(/\.\.\/infrastructure/);
      expect(code).not.toMatch(/\.\.\/presentation/);
    }
  });
});
