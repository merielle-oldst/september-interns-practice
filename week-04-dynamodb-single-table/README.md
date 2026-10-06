# Relational vs DynamoDB Single-Table — Week 4 · Day 2

**Self-led · mentor reviews async**

**Goal:** feel the difference between *relational thinking* and *DynamoDB thinking*.

**Reference:** the AWS single-table design docs, plus the **Tempo** repo
(look at how it names keys, prefixes entity types and uses GSIs — follow that house
style, not just the AWS examples).

> This is a design-on-paper exercise. **No code, and nothing goes into the Tempo
> repo.** Tempo has *one* table shared by every slice, so its real key design is a
> team decision. This draft is what you bring to that conversation.

## The model: your own slice

Don't invent a toy model. Use the shapes you drafted in
[`capstone-domain-drafts/`](../capstone-domain-drafts/), plus the pinned
**Person + Project** contract (every slice depends on those two).

By slice:
- **Admin & Data** → `Person`, `Project`
- **My Week** → `Person`, `Project`, `WorkEntry`, `DayPlan`
- **Leave** → `Person`, `Project`, `LeaveRequest`
- **Operations** → model the new **Holiday** slice: `Person`, `Project`, `Holiday`.
  Holiday isn't in the Capstone Spec yet and has no Day 4 draft, so add a
  **step 0** to your file: sketch the `Holiday` shape (fields + types, rules as
  comments, like Day 4). Decide things like whether a holiday applies to everyone
  or only some people (e.g. by location), and whether it's a single day or a range.
  Get a quick thumbs-up from your mentor before moving on to access patterns.

## What to do

Copy [`_TEMPLATE.md`](_TEMPLATE.md) to `<slice>.md` (e.g. `my-week.md`) and fill in
the four sections **in order**:

1. **Access patterns first.** List the questions your slice's screens ask the data,
   e.g. "all WorkEntries for one person in a given week". Aim for 4–8.
2. **Relational design.** Tables, columns, primary/foreign keys, and the SQL query
   that answers each access pattern.
3. **Single-table design.** One table. For each entity: its `PK` / `SK` (and any
   GSI keys), a small table of example items, and which key/index answers each
   access pattern.
4. **What got easier / what got harder.** Be specific — name the access pattern or
   the change that would hurt.

## Submit

Open a **draft Pull Request** with your `<slice>.md`. It **won't be merged** — it's
for async mentor review. Note anything you're unsure about.

## Done when

- [ ] Access patterns are listed *before* either design.
- [ ] Every access pattern is answered in **both** designs.
- [ ] The single-table design follows the Tempo repo's key conventions.
- [ ] The easier/harder section names concrete patterns, not generalities.
- [ ] Your PR is open for review.

AI can help you *think it through*, but you write it and must be able to explain
every key choice.
