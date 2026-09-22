/**
 * End-to-end tests, the real HTTP surface, through the whole stack.
 *
 * We boot the actual AppModule with the same global ValidationPipe and
 * DomainExceptionFilter as production (main.ts), then hit it with HTTP requests.
 *
 * Green on the starter:  create (201), validation (400), list (200).
 * Red until your tasks:  duplicate name (409, TASK 1) and archive (TASK 2 & 3).
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

  it('POST /projects creates a project (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Apollo', client: 'Acme' })
      .expect(201);

    expect(res.body).toMatchObject({ name: 'Apollo', client: 'Acme', active: true });
    expect(res.body.id).toBeTruthy();
  });

  it('POST /projects rejects an invalid body (400)', async () => {
    await request(app.getHttpServer()).post('/projects').send({ name: '' }).expect(400);
  });

  it('GET /projects lists projects (200)', async () => {
    await request(app.getHttpServer()).post('/projects').send({ name: 'Apollo' }).expect(201);

    const res = await request(app.getHttpServer()).get('/projects').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Apollo');
  });

  // TASK 1 turns this green.
  it('POST /projects rejects a duplicate name (409)', async () => {
    await request(app.getHttpServer()).post('/projects').send({ name: 'Apollo' }).expect(201);
    await request(app.getHttpServer()).post('/projects').send({ name: 'Apollo' }).expect(409);
  });

  // TASK 2 + TASK 3 turn this green.
  it('PATCH /projects/:id/archive archives a project', async () => {
    const created = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Apollo' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/projects/${created.body.id}/archive`)
      .expect(200);

    expect(res.body.active).toBe(false);
  });
});
