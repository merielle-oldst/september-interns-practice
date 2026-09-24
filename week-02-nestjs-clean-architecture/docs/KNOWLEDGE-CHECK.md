# Week 2 Knowledge Check — NestJS + Clean Architecture

**Written · AI-free · ~30–45 min.** Shared at the start of the week so you know
the target. A mentor reviews your answers async and flags anything to re-teach.

This is not about grading harshly — it's to confirm the week's core ideas landed.
Answer in plain words. The Projects exercise in this folder is direct practice for
questions 4 and 5.

---

1. In your own words, what is the job of a **Module**, a **Controller**, and a
   **Service / use-case** in NestJS?
   
   - Module contains the parts of an application like controllers and providers. It organises the different function of an app. 
   - Controller handles the HTTP request and gives the response based on the specific route defined.
   - Services / use cases contain the logic of an operation and are injected into the constructor of the controller

2. Clean Architecture has four layers. **Name them in order** and show **which way
   dependencies point.**

   - The four layers are: domain, application, presentation, infrastructure.

      presentation -> application -> domain <- infrastructure

3. Why shouldn't the **Domain** layer import anything from NestJS or from the
   database? 

   - Because it will break the rule of clean architecture. The domain should only contain the entity and business rules. If the domain imports from the database and the database changes, then the rules or entitities inside the domain may need modification as well.  
 
4. For **"add a project"**, which layer holds:
   (a) the HTTP route, 
   Presentation layer

   (b) the rule *"no duplicate project names"*,
   Application layer

   (c) the DynamoDB write?
   Infrastructure

5. **Code smell:** a controller runs a database query directly inside it. What's
   wrong under Clean Architecture, and how would you rearrange it?
   - When a controller (presentation) runs a DB query inside it, it now depends on the (infrastructure), which breaks the rule of clean architecture. So if the database changes, the controller now has to be changed as well. 
   - To rearrange it the controller only receives a request and returns a response after calling a use-case (application). Then inside the use case is the logic of an operation, which also depends on the repo interface (domain) which is not the database. 