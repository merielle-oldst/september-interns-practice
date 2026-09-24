/**
 * FORMAT EXAMPLE — not part of Tempo, don't copy the fields.
 *
 * This just shows the SHAPE of a good draft: fields with types, and the business
 * rules written as comments. Make one file per shape your slice needs, named like
 * `<slice>.<thing>.ts` (e.g. admin-data.person.ts, leave.leave-request.ts).
 *
 * Keep it to plain types + comments. No NestJS, no database, no Zod yet.
 */

// A made-up example to show the format:
export type Gadget = {
  id: string;
  name: string; // required, non-empty
  weightKg: number; // must be > 0
  color?: string; // optional
  inStock: boolean; // a new gadget starts in stock (true)
};

// For a value that is "one of a few kinds", write a discriminated union and note
// the rule for each kind (this is exactly how My Week's WorkEntry will look):
export type GadgetEvent =
  | { kind: 'built'; at: string } // at = ISO date
  | { kind: 'shipped'; to: string } // to = customer id
  | { kind: 'scrapped'; reason: string };
