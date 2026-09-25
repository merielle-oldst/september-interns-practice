# Week 2 Knowledge Check — NestJS + Clean Architecture

**Written · AI-free · ~30–45 min.** Shared at the start of the week so you know
the target. A mentor reviews your answers async and flags anything to re-teach.

This is not about grading harshly — it's to confirm the week's core ideas landed.
Answer in plain words. The Projects exercise in this folder is direct practice for
questions 4 and 5.

---

1. In your own words, what is the job of a **Module**, a **Controller**, and a
   **Service / use-case** in NestJS?

   A Module is the box that groups one feature and tells Nest what to construct and inject. A Controller handles only the HTTP request and response. A Service or use case does the actual work, and the controller asks it to run.

2. Clean Architecture has four layers. **Name them in order** and show **which way
   dependencies point.**

   Presentation, Application, Domain, Infrastructure. Dependencies point inward. Presentation depends on Application, Application depends on Domain, and Infrastructure also points inward because it implements an interface the Domain owns. The Domain depends on nothing.

3. Why shouldn't the **Domain** layer import anything from NestJS or from the
   database?

   If the Domain depended on them, the business rules could not be tested or reused without booting Nest or a database, and swapping either one would force changes in the core.

4. For **"add a project"**, which layer holds:
   (a) the HTTP route,
   (b) the rule *"no duplicate project names"*,
   (c) the DynamoDB write?

   (a) HTTP route: Presentation, in the controller.
   (b) No duplicate names: Application, in the create use case, because the rule has to look at other projects and a single entity cannot see them. 
   (c) DynamoDB write: Infrastructure, in the repository that implements the Domain's port.

5. **Code smell:** a controller runs a database query directly inside it. What's
   wrong under Clean Architecture, and how would you rearrange it?
