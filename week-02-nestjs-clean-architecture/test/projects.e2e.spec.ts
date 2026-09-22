/**
 * End-to-end tests, the real HTTP surface, through the whole stack.
 *
 * We boot the actual AppModule with the same global ValidationPipe and
 * DomainExceptionFilter as production (main.ts), then hit it with HTTP requests.
 *
 * Green on the starter:  create (201), validation (400), duplicate (409),
 *                        list (200), and the legacy active-count behaviour.
 * Red until your tasks:  GET /:id (TASK 1), PATCH /:id/archive (TASK 2),
 *                        PATCH /:id (TASK 3).
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/projects/presentation/domain-exception.filter';

describe('Projects API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const create = (body: object) => request(app.getHttpServer()).post('/projects').send(body);

  // ── worked reference endpoints (green) ──────────────────────────────────────
  it('POST /projects creates a project (201)', async () => {
    const res = await create({ name: 'Apollo', client: 'Acme' }).expect(201);
    expect(res.body).toMatchObject({ name: 'Apollo', client: 'Acme', active: true });
    expect(res.body.id).toBeTruthy();
  });

  it('POST /projects rejects an invalid body (400)', async () => {
    await create({ name: '' }).expect(400);
  });

  it('POST /projects rejects a duplicate name (409)', async () => {
    await create({ name: 'Apollo' }).expect(201);
    await create({ name: 'Apollo' }).expect(409);
  });

  it('GET /projects lists projects (200)', async () => {
    await create({ name: 'Apollo' }).expect(201);
    const res = await request(app.getHttpServer()).get('/projects').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Apollo');
  });

  // ── TASK 1: GET /projects/:id ───────────────────────────────────────────────
  it('GET /projects/:id returns one project (200)', async () => {
    const created = await create({ name: 'Apollo' }).expect(201);
    const res = await request(app.getHttpServer()).get(`/projects/${created.body.id}`).expect(200);
    expect(res.body.name).toBe('Apollo');
  });

  it('GET /projects/:id returns 404 for an unknown id', async () => {
    const res = await request(app.getHttpServer()).get('/projects/nope').expect(404);
    // Must be OUR domain 404 (via the filter), not Nest's default route-miss 404.
    expect(res.body.error).toBe('ProjectNotFoundError');
  });

  // ── TASK 2: PATCH /projects/:id/archive ─────────────────────────────────────
  it('PATCH /projects/:id/archive archives a project', async () => {
    const created = await create({ name: 'Apollo' }).expect(201);
    const res = await request(app.getHttpServer())
      .patch(`/projects/${created.body.id}/archive`)
      .expect(200);
    expect(res.body.active).toBe(false);
  });

  // ── TASK 3: PATCH /projects/:id (rename) ────────────────────────────────────
  it('PATCH /projects/:id renames a project (200)', async () => {
    const created = await create({ name: 'Apollo' }).expect(201);
    const res = await request(app.getHttpServer())
      .patch(`/projects/${created.body.id}`)
      .send({ name: 'Artemis' })
      .expect(200);
    expect(res.body.name).toBe('Artemis');
  });

  it('PATCH /projects/:id rejects a name used by another project (409)', async () => {
    await create({ name: 'Apollo' }).expect(201);
    const artemis = await create({ name: 'Artemis' }).expect(201);
    await request(app.getHttpServer())
      .patch(`/projects/${artemis.body.id}`)
      .send({ name: 'Apollo' })
      .expect(409);
  });

  // ── TASK 4: behaviour of the legacy endpoint (stays green through the refactor) ──
  it('GET /legacy/projects/active-count returns the active count', async () => {
    await create({ name: 'Apollo' }).expect(201);
    await create({ name: 'Artemis' }).expect(201);
    const res = await request(app.getHttpServer())
      .get('/legacy/projects/active-count')
      .expect(200);
    expect(res.body).toEqual({ count: 2 });
  });
});
