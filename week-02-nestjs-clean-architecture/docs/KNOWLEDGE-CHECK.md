# Week 2 Knowledge Check — NestJS + Clean Architecture

**Written · AI-free · ~30–45 min.** Shared at the start of the week so you know
the target. A mentor reviews your answers async and flags anything to re-teach.

This is not about grading harshly — it's to confirm the week's core ideas landed.
Answer in plain words. The Projects exercise in this folder is direct practice for
questions 4 and 5.

---

1. In your own words, what is the job of a **Module**, a **Controller**, and a
   **Service / use-case** in NestJS?

   After reading the NestJS documentation, watching crash courses, and implementing my own practice codes, I must say that the module's job is to group the different components or parts of the application and making sure that components are properly connected to whichever other component it should be available to. Meanwhile, controllers act like traffic enforcers which receives requests and directs these request to which route it should take to reach the appropriate process. Lastly, the services or the use cases handle what should happen in response to certain situations that may arise or simply, it provides what the system is capable of doing.

2. Clean Architecture has four layers. **Name them in order** and show **which way
   dependencies point.**

   The clean architecture is usually illustrated through concentric circles having the domain as the innermost layer, application next, then interface adapters, and lastly infrastucture and networks as the outermost layers. The dependency among these layers point inward which means those in the inner layers cannot depend on those outside of them.

3. Why shouldn't the **Domain** layer import anything from NestJS or from the
   database?

   Domain layer should not import anything from NestJS or the database because it should only house the core business logic and rules and it should not have any technical details about how these infrastucture should operate for it not to be tied to any of those. This allows the architecture to easily change the frameworks to be implemented without having to reconstruct the domain layer as well because it is independent.

4. For **"add a project"**, which layer holds:
   (a) the HTTP route,
   (b) the rule *"no duplicate project names"*,
   (c) the DynamoDB write?

   The HTTP route should be under the interface adapters layer because it includes the controllers where routing is implemented. The rule for no duplicates, meanwhile, should be written on the domain layer as it is a business logic. However, its implementation could fall under the application layer as it can be a use case that tells the application how to function to check whether another existing project entity already has the same name. Lastly, the DynamoDB should be in the infrasturctue and networks because it involves a technical implementation of a framework.

5. **Code smell:** a controller runs a database query directly inside it. What's
   wrong under Clean Architecture, and how would you rearrange it?

   Under clean architecture, the role of the routing should only include the handling and routing of requests but not the actual operations. It should not know anything about the database infrastucture because it would now destroy the dependency rule that inner layers should not depend on outer layers. The way to fix this is to remove the query from the controller and then routing the request through a service or use case that depends on an interface to the repository. The database infrastructure then implements that interface.
