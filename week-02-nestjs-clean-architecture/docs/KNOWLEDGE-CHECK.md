# Week 2 Knowledge Check — NestJS + Clean Architecture

**Written · AI-free · ~30–45 min.** Shared at the start of the week so you know
the target. A mentor reviews your answers async and flags anything to re-teach.

This is not about grading harshly — it's to confirm the week's core ideas landed.
Answer in plain words. The Projects exercise in this folder is direct practice for
questions 4 and 5.

---

1. In your own words, what is the job of a **Module**, a **Controller**, and a
   **Service / use-case** in NestJS?

2. Clean Architecture has four layers. **Name them in order** and show **which way
   dependencies point.**

3. Why shouldn't the **Domain** layer import anything from NestJS or from the
   database?

4. For **"add a project"**, which layer holds:
   (a) the HTTP route,
   (b) the rule *"no duplicate project names"*,
   (c) the DynamoDB write?

5. **Code smell:** a controller runs a database query directly inside it. What's
   wrong under Clean Architecture, and how would you rearrange it?
