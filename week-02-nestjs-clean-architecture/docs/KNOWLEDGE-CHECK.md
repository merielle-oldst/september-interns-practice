# Week 2 Knowledge Check — NestJS + Clean Architecture

**Written · AI-free · ~30–45 min.** Shared at the start of the week so you know
the target. A mentor reviews your answers async and flags anything to re-teach.

This is not about grading harshly — it's to confirm the week's core ideas landed.
Answer in plain words. The Projects exercise in this folder is direct practice for
questions 4 and 5.

---

1. In your own words, what is the job of a **Module**, a **Controller**, and a
   **Service / use-case** in NestJS?

   - Module is the container that binds/wires/connects different parts of a feature (such as controllers and services) needed by the application so that the features works. 
   - Controller handles the request so that use cases or application layer understand them. 
   - Service/Use-Case --> defines how the data are used or implemented (by functions) 

2. Clean Architecture has four layers. **Name them in order** and show **which way
   dependencies point.**

   Presentation --> Application --> Domain <-- Infrastructure
                           ^                          |
                           |--------------------------|


3. Why shouldn't the **Domain** layer import anything from NestJS or from the
   database?
   
   Importing anything from the NestJS and database will break the clean architecture. The **Domain** layershould only contain the business rules and entities. 


4. For **"add a project"**, which layer holds:
   (a) the HTTP route,
   (b) the rule *"no duplicate project names"*
   (c) the DynamoDB write?

   (a) presentation layer 
   (b) application
   (c) infrastructure

5. **Code smell:** a controller runs a database query directly inside it. What's
   wrong under Clean Architecture, and how would you rearrange it?

  The controller shouldn't know how the implemetations are done, they just know that they will have what they need. This means that a controller shouldn't be able to directly call a database or the <ProjectRepository>. The controller needs/depends on the use case to do its implementations like get and update data. The use case then uses the database or repository to access the data and return it to the controller. 
