// Operations: one person's week.
//
// Operations doesn't store anything. This shape is built on read from data the
// other slices own:
//   Person       from Admin & Data  (admin-data.person.ts)
//   DayPlan      from My Week       (my-week.day-plan.ts)
//   WorkEntry    from My Week       (my-week.work-entry.ts)
//   LeaveRequest from Leave         (leave.leave-request.ts)
// So if their shapes change, this one changes too.

type IsoDate = string; // "2026-09-21", always YYYY-MM-DD, not a Date object

// How a person's week looks at a glance.
// over  = planned more hours than they have available
// full  = planned close enough to available to call it a full week
// under = still has room for more work
// This is worked out every time the view is read. It's never stored on a Person,
// since it's only true for one week.
export type UtilizationBand = 'over' | 'full' | 'under';

// One day in the grid.
export type DaySummary = {
  date: IsoDate;

  hours: number; // total hours of that day's work entries
  // Rules:
  // - 0 to 24. My Week caps a day at 24, so anything higher is bad data.
  // - a 'leave' entry has no hours field, so it adds 0.
  // - 0 is fine, and means either nothing logged or on leave.

  kinds: string[]; // which kinds show up that day, e.g. ['project', 'meeting']
  // Rules:
  // - the values come from My Week's WorkEntry union. Operations doesn't make up
  //   its own kinds. Right now: project, meeting, blocked, bench, learning,
  //   admin, leave.
  // - no duplicates. Two project entries on one day still list 'project' once.
  // - My Week says a 'leave' entry has to be the only entry that day, so
  //   ['leave'] shouldn't ever turn up next to something else.
};

// One row of the Operations grid.
export type PersonWeekSummary = {
  personId: string; // Person.id
  name: string; // Person.name, copied in so the UI only needs one call
  department: string; // Person.department, used to group the grid

  weekStart: IsoDate; // the Monday of the week being shown
  // Rule: always a Monday. A week here means the 5 working days, Mon to Fri.

  plannedHours: number; // total hours logged across the week
  // Rules:
  // - add up every work entry in every day plan this person logged this week.
  // - a 'leave' entry costs 0, it has no hours field.
  // - a 'blocked' entry does count as planned, since the person can't be given
  //   other work while they're blocked. See open question 2.

  availableHours: number; // hours they could actually be given this week
  // Rules:
  // - start from Person.hoursPerWeek. Not everyone is 40, Diego is 32 in the
  //   seed data, so don't hardcode it.
  // - take off one day's worth (hoursPerWeek / 5) for every day of approved
  //   leave inside this week.
  // - only 'approved' leave counts. Pending and declined don't change anything.
  // - never below 0. Someone on leave all week has 0 available.

  leaveDays: number; // days of approved leave inside this week, 0 to 5
  // Rules:
  // - a request covers a date when start <= date <= end, both ends included.
  // - only count dates inside this week. A request that spans two weeks only
  //   contributes the days that overlap.

  percentUsed: number; // 0.85 means 85%
  // Rules:
  // - plannedHours / availableHours.
  // - if availableHours is 0 (on leave all week) this is 0, not Infinity. This
  //   is the divide by zero to watch out for.
  // - can go above 1. 44 hours planned against 40 available is 1.1.

  band: UtilizationBand;
  // Rules:
  // - 'over' when plannedHours > availableHours
  // - 'full' when percentUsed >= 0.9
  // - 'under' otherwise
  // The 0.9 is a guess for now, see open question 1.

  submitted: boolean; // did they log their week at all?
  // Rules:
  // - true when they have at least one day plan for this week.
  // - "didn't submit" and "planned 0 hours" are different things and need to
  //   stay separate. Someone who logged a full week of leave did submit.

  days: DaySummary[];
  // Rule: always 5 items, Mon to Fri, in date order, even for days with nothing
  // logged, so the grid always has 5 columns.
};

// Open questions for the mentor / the team
//
// 1. Full week threshold. I went with 90% of available or above counting as a
//    full week. That's a guess and needs agreeing on. It's one rule in one place
//    so it's cheap to change.
//
// 2. Do blocked hours count as planned? Right now yes.
//    For: the person can't take other work, so they really are busy.
//    Against: part of why Operations exists is to show blocked time, and
//    counting it as used hides it. The team could read as 100% busy when half of
//    that is waiting on a client.
//    What I did: it counts toward plannedHours, but 'blocked' still shows up in
//    DaySummary.kinds so the UI can flag it.
//
// 3. DayPlan has no personId. This is the one I most need answered.
//    my-week.day-plan.ts is { date, workEntry[] }. That works for My Week
//    because it always knows whose week it's looking at. Operations reads
//    everyone's days at once and has to group them by person, so it needs the
//    owner on the shape, or a wrapper like { personId, days: DayPlan[] }.
//    Worth settling before Week 4 since it also affects the DynamoDB keys.
//
// 4. Is approved leave already in the day plan?
//    my-week.work-entry.ts says the 'leave' kind is set by the Leave slice on
//    approval. If approved leave already shows up as a leave entry in someone's
//    day plan, then counting leave from LeaveRequest as well would subtract it
//    twice. But reading it from day plans only works for people who submitted,
//    and someone with no day plan at all still needs their leave counted. I read
//    from LeaveRequest here since that covers both, but this needs confirming
//    with Leave and My Week.
//
// 5. Public holidays. A holiday like Nov 2 isn't leave and nobody files a
//    request for it, but it still takes hours off the week. Nothing in any slice
//    models it. Do we need a holiday list, or just ignore it for the prototype?
//
// 6. Week boundaries. I'm assuming weekStart is a Monday and a week is Mon to
//    Fri. Nothing in My Week's draft actually says that, so worth checking it
//    matches how day plans get stored.
