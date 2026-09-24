# Capstone Domain Drafts — Week 2 · Day 4

**Self-led / peer · mentor reviews async**

Sketch the "things" your capstone slice is about as **plain TypeScript** — fields +
types, with the **rules written as comments**. This is a *first draft for review*,
not finished code: **no NestJS, no database, no Zod** (those come in Week 3).

> These drafts are throwaway. In Week 3 you'll turn them into real entities in the
> Tempo repo. What matters now is getting the shapes and rules right, and agreeing
> the shared ones.

## What to do

1. Add one `.ts` file **per shape your slice needs**, in this folder. Prefix it with
   your slice, e.g. `admin-data.person.ts`, `my-week.work-entry.ts`.
2. Write each shape's fields + types, and its rules as comments. See
   [`_TEMPLATE.ts`](_TEMPLATE.ts) for the format.
3. Use the **Capstone Spec tab** for the fields your slice owns.

By slice:
- **Admin & Data** → `Person`, `Project`
- **My Week** → `WorkEntry`, `DayPlan`
- **Leave** → `LeaveRequest`
- **Operations** → *not a new stored thing* — describe a **summary view** computed
  from the others (e.g. one person's week: planned hours, available hours, % used)

## The one team step: agree Person + Project

`Person` and `Project` are used by **every** slice, so the whole team must use the
**same** shape.
- **Admin & Data** intern: share your `Person` + `Project` draft on Day 4.
- Team: agree on **one** version, then **write it down and pin it** (Slack canvas /
  shared doc). That pinned contract — not this file — is what the other slices build
  against in Weeks 3–4.

## Submit

Open a **Pull Request** with your draft file(s). It **won't be merged** (same as last
week) — it's for async mentor review. Note anything you're unsure about.

## Done when

- [ ] Each shape your slice needs is a `.ts` file here (fields + types).
- [ ] The rules are written as comments.
- [ ] `Person` + `Project` are agreed with the team and pinned somewhere durable.
- [ ] Your PR is open for review.

Keep it to types + comments. AI can help you *think it through*, but you write it and
must be able to explain every field and rule.
