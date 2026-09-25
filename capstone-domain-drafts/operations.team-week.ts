// Operations: the whole team's week.
//
// This is the screen a manager actually opens. One row per person, plus the
// totals across them. Same as the person view, nothing here is stored. It's all
// worked out from Person (Admin & Data), DayPlan and WorkEntry (My Week), and
// LeaveRequest (Leave).

import { PersonWeekSummary } from './operations.person-week';

type IsoDate = string; // "2026-09-21"

export type TeamWeekSummary = {
  weekStart: IsoDate;
  // Rule: always a Monday, and the same weekStart as every row below.

  rows: PersonWeekSummary[];
  // Rules:
  // - only people where Person.active is true. Someone who left the company
  //   doesn't show up, even if they still have old day plans lying around.
  // - sorted by name so the grid doesn't jump around between refreshes.

  notSubmitted: string[]; // names of people who haven't logged their week
  // Rules:
  // - taken from rows where submitted is false.
  // - it's its own field because "who do I need to chase?" is the first thing
  //   this screen gets opened for.

  totals: TeamTotals;
};

export type TeamTotals = {
  plannedHours: number; // sum of every row's plannedHours

  availableHours: number; // sum of every row's availableHours, leave already taken off

  percentUsed: number;
  // Rules:
  // - team plannedHours / team availableHours.
  // - not the average of everyone's percentUsed. Averaging would give a 20h a
  //   week part timer the same weight as a 40h full timer and quietly give the
  //   wrong number.
  // - 0 when availableHours is 0, e.g. the whole team is on leave.

  // How many people land in each band.
  // Rule: over + full + under has to equal rows.length.
  over: number;
  full: number;
  under: number;
};

// What this view is for, since it's why the fields are what they are.
// The manager's questions, roughly in the order they get asked:
//   1. who hasn't submitted?        -> notSubmitted
//   2. who is over capacity?        -> rows where band is 'over'
//   3. who has room for more work?  -> rows where band is 'under'
//   4. who is blocked?              -> DaySummary.kinds has 'blocked'
//   5. how loaded are we overall?   -> totals.percentUsed
// If a field doesn't answer one of those, it probably shouldn't be here.
//
// The open questions are all in operations.person-week.ts. They apply here too,
// since these totals are just built from those rows.
