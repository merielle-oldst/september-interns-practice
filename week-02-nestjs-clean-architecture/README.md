# Week 2 Exercise — NestJS + Clean Architecture

**Project Tempo internship · Backend I · Sep 21–25**

> Self-led. Reference: [docs.nestjs.com](https://docs.nestjs.com) ·
> [Uncle Bob, The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) ·
> [Clean Architecture in NestJS](https://dev.to/kubabuilds/clean-architecture-in-nestjs-a-practical-guide-101p)

You just did the **Clean Architecture masterclass** and the **NestJS crash course**.
This exercise makes both of them concrete: you finish a small **Projects API** that
is already split into the four Clean Architecture layers. You will feel the
dependency rule instead of just hearing about it.

This is the same `Project` feature from the capstone (Intern 4, *Admin & Data*),
including the rule **"no two projects share a name."** What you practise here is
exactly what you'll build for real in Weeks 3–4.

> ⚠️ It's normal for several tests to be **red** when you start. Turning them
> green is the exercise.

---

## The one rule you're proving you understand

**Code only points inward. The Domain depends on nothing.**

```
        Presentation            (HTTP: controllers, DTOs, error → status)
             │   depends on
             ▼
        Application             (use-cases: orchestrate one job)
             │   depends on
             ▼
          Domain                (entities + rules + repository PORT) ── depends on NOTHING
             ▲
             │   implements the port (points inward)
        Infrastructure          (adapters: the in-memory / DynamoDB repo)
```

- **Domain** (`src/projects/domain/`) — the `Project` entity, its rules, the
  repository **interface** (port), the errors. No `@nestjs/...`. No database.
- **Application** (`src/projects/application/`) — the use-cases. They orchestrate
  the domain. Still **no NestJS**.
- **Infrastructure** (`src/projects/infrastructure/`) — the in-memory repository
  that *implements* the domain's port. In Week 4 this becomes DynamoDB, and
  nothing inward will change.
- **Presentation** (`src/projects/presentation/`) — the controller, DTOs, and the
  filter that maps domain errors to HTTP codes.

`test/architecture.spec.ts` **enforces** this rule automatically. If it goes red,
you broke the direction of a dependency.

---

## Setup

Requires **Node 18+** (the entity uses `crypto.randomUUID`) and **pnpm**.

```bash
cd week-02-nestjs-clean-architecture
pnpm install      # or: npm install
pnpm test         # run the whole suite (watch the red/green)
```

Other commands:

```bash
pnpm start:dev    # run the API locally on http://localhost:3000
pnpm lint         # type-check without emitting
```

Try it by hand once it runs:

```bash
curl -X POST http://localhost:3000/projects -H "content-type: application/json" -d '{"name":"Apollo","client":"Acme"}'
curl http://localhost:3000/projects
```

---

## Your tasks

**Before writing anything, spend ~15 minutes reading the existing code** so the
tasks make sense. Read it from the inside out — the core first, then the layers
that wrap it:

1. **`domain/project.ts`** — the `Project` entity and the rules it protects.
   This is the centre; everything else exists to serve it.
2. **`domain/project.repository.ts`** — the repository *port* (an interface).
   The use-cases depend on this, never on a real database.
3. **`application/list-projects.use-case.ts`**, then
   **`application/create-project.use-case.ts`** — two finished use-cases. Notice
   the shape: each takes the repository in its constructor and does its work in
   `execute()`, with no NestJS in the file.
4. **`presentation/projects.controller.ts`** — see how the finished `POST` and
   `GET` handlers just call a use-case and map the result. No rules, no DB.
5. **`infrastructure/in-memory-project.repository.ts`** — the adapter that
   actually stores data, implementing the port from step 2.

`ListProjectsUseCase` and the `POST`/`GET` endpoints are your **worked
examples** — the three tasks below are the same patterns applied to new
behaviour. So when a task says *"write a use-case,"* model it on the use-cases in
step 3; when it says *"add an endpoint,"* model it on the controller handlers in
step 4. You're copying the structure, not the logic.

### TASK 1 — the business rule: no duplicate names
`src/projects/application/create-project.use-case.ts`. Before saving, reject a
name that already exists (`DuplicateProjectNameError`).
- First answer in your own words: **which layer does this rule belong to, and why
  not the entity?**
- Turns green: `create-project.use-case.spec.ts` ("rejects a duplicate name") and
  the e2e `409` test.

### TASK 2 — a new use-case: archive a project
`src/projects/application/archive-project.use-case.ts`. Find the project, throw
`ProjectNotFoundError` if missing, ask the **entity** to `archive()` itself, save.
- Do **not** re-implement the "already archived" rule here — that lives in the
  entity. Let the domain own it.
- Turns green: `archive-project.use-case.spec.ts`.

### TASK 3 — expose it over HTTP
Wire `ArchiveProjectUseCase` into `projects.module.ts` (same `useFactory` +
`inject` pattern as the others), inject it into `projects.controller.ts`, and add
the route **`PATCH /projects/:id/archive`**.
- Turns green: the e2e `PATCH /projects/:id/archive` test.
- **Do the module wiring and the controller injection together.** If you inject
  `ArchiveProjectUseCase` into the controller but forget to provide it in the
  module, NestJS can't build the app and *every* e2e test fails with a
  dependency-resolution error, not just the archive one. Read that error — it
  names the provider it couldn't resolve.

### Keep the guard green
`test/architecture.spec.ts` must stay green the whole time. If it breaks, some
business logic started importing NestJS or an outer layer — move it back.

---

## Done when

- [ ] `pnpm test` — **all green**, including the architecture guard.
- [ ] `pnpm build` compiles with no errors.
- [ ] You did **not** put any business rule or DB call inside the controller.
- [ ] You can explain, without notes, every line you wrote (the Week 1 guardrail
      still holds: *can't explain it, don't ship it*).

## Submitting

Open a **Pull Request** (it won't be merged — same as last week). In the
description, answer:

1. Which layer did you put the duplicate-name rule in, and why?
2. If we swap the in-memory repository for DynamoDB in Week 4, which files change?
3. Where would a "can't archive an already-archived project" error be thrown, and
   which layer decides it becomes HTTP `409`?

A mentor reviews async and picks one line for you to explain back.

---

## Stuck?

Ask a peer first, then post in Slack — never sit blocked. You may use AI to
*explain* an error or a concept, but **you** write the task code, and you must be
able to explain every line. This exercise is also good prep for the written,
AI-free **Week 2 Knowledge Check** (`docs/KNOWLEDGE-CHECK.md`).
