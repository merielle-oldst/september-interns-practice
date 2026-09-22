# Week 2 Exercise — NestJS + Clean Architecture

**Project Tempo internship · Backend I · Sep 21–25**

> Self-led. Reference: [docs.nestjs.com](https://docs.nestjs.com) ·
> [Uncle Bob, The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) ·
> [Clean Architecture in NestJS](https://dev.to/kubabuilds/clean-architecture-in-nestjs-a-practical-guide-101p)

You just did the **Clean Architecture masterclass** and the **NestJS crash course**.
This exercise makes both of them concrete. You're given a small **Projects API**
already split into the four Clean Architecture layers, with **one feature fully
built as a worked example** (create + list). You extend it — building more
endpoints yourself, each in the right layer — and you finish by fixing a piece of
code that breaks the rules on purpose. You'll *feel* the dependency rule instead
of just hearing about it.

This is the same `Project` feature from the capstone (Intern 4, *Admin & Data*),
including the rule **"no two projects share a name."** What you practise here is
exactly what you'll build for real in Weeks 3–4.

> ⚠️ Lots of tests are **red** when you start (about 17 of 36) — that's the
> to-do list. Turning them green, and keeping the green ones green, is the
> exercise. Do the tasks in order; they get harder.

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
- **Presentation** (`src/projects/presentation/`) — the controllers, DTOs, and the
  filter that maps domain errors to HTTP codes.

Two tests **enforce** this rule automatically, so you can't drift out of the
layers by accident:
- `test/architecture.spec.ts` — the domain and application layers import no
  NestJS and no outer layer.
- `test/dependency-rule.controllers.spec.ts` — controllers never reach into the
  data layer (that one is **red** on purpose until you finish Task 4).

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

`CreateProjectUseCase` + `POST /projects` and `ListProjectsUseCase` +
`GET /projects` are your **worked examples** — a complete vertical slice through
every layer. Each task below is the same three moves applied to new behaviour:
**(1)** write a use-case in `application/` (model it on `create`/`list`), **(2)**
add a provider for it in `projects.module.ts`, **(3)** add a handler in the
controller that calls it. You're copying the *structure*, not the logic.

Every task adds one endpoint end-to-end. **Do the module provider and the
controller injection together** — if the controller asks for a use-case the
module doesn't provide, NestJS refuses to boot and *every* e2e test fails with a
dependency-resolution error (read it; it names the missing provider).

### TASK 1 — read one project (warm-up)
`get-project.use-case.ts` → `GET /projects/:id`. Look the project up; throw
`ProjectNotFoundError` if it's missing. Wire it, add the route with `@Param('id')`.
- Turns green: `get-project.use-case.spec.ts` and the two e2e `GET /:id` tests.

### TASK 2 — archive a project
`archive-project.use-case.ts` → `PATCH /projects/:id/archive`. Find it (404 if
missing), ask the **entity** to `archive()` itself, save.
- Do **not** re-implement the "already archived" rule here — that's the entity's
  job. Let the domain own it.
- Turns green: `archive-project.use-case.spec.ts` and the e2e archive test.

### TASK 3 — rename / update a project (the meaty one)
`update-project.use-case.ts` + `update-project.dto.ts` → `PATCH /projects/:id`.
Find it (404 if missing), **reuse** the no-duplicate-name rule — but a project
may keep its *own* name, so only a clash with a **different** id is a duplicate —
then call `project.rename(name, client)` and save. Build the DTO by modelling it
on `create-project.dto.ts`.
- The "can't rename an archived project" rule is the **entity's** job, not yours.
- Turns green: `update-project.use-case.spec.ts` and the e2e `PATCH /:id` tests.

### TASK 4 — fix the broken controller (refactor)
`presentation/legacy-projects.controller.ts` breaks the dependency rule on
purpose: it reaches into the repository and does the counting itself. Refactor it:
implement `count-active-projects.use-case.ts`, provide it, and make the controller
call the use-case instead of the repository (remove the repo import).
- Behaviour must not change — the `active-count` e2e test stays green throughout.
- Turns green: `count-active-projects.use-case.spec.ts` and
  `dependency-rule.controllers.spec.ts`.

### Keep the guards green
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

1. The no-duplicate-name rule lives in a use-case, not the entity. Why can't the
   entity enforce it on its own?
2. If we swap the in-memory repository for DynamoDB in Week 4, which files change
   — and which definitely don't?
3. In Task 4, what exactly was wrong with the original `legacy` controller, and
   which way was its dependency pointing?
4. A domain error like `ArchivedProjectError` becomes HTTP `409`. Where does that
   translation happen, and why not in the use-case?

A mentor reviews async and picks one line for you to explain back.

---

## Stuck?

Ask a peer first, then post in Slack — never sit blocked. You may use AI to
*explain* an error or a concept, but **you** write the task code, and you must be
able to explain every line. This exercise is also good prep for the written,
AI-free **Week 2 Knowledge Check** (`docs/KNOWLEDGE-CHECK.md`).
