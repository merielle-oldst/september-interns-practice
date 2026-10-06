# <Slice name> — Relational vs Single-Table

Entities, as drafted in Week 3:
 
- **`Week`** (aggregate root): `personId`, `weekStart` (a Monday), exactly five `DayPlan`s (Mon–Fri), and an optional `submittedAt` (UTC). Identity is `(personId, weekStart)`. It is checked and saved as a unit.
- **`DayPlan`**: a `date` (a weekday) plus its entries.
- **`WorkEntry`**: nine kinds. Six are logged by the person: `project`, `meeting`, `blocked`, `bench`, `learning`, `admin`. Three are day statuses supplied by other slices: `leave`, `half-day-leave`, `holiday`.
- **Day statuses are never stored by My Week.** `Week.fromStorage` and `Week.fromSubmission` rebuild them from the current leave and holidays on every load and save. `toPersistence()` returns only what the person logged, as `days: [{ date, workEntries }]`.
- `Person` and `Project` are the pinned contract (Admin & Data). `LeaveRequest` (Leave) and `Holiday` (Operations' draft) are read-only here.

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | Get one person's week for a given `weekStart` (or any date range) | My Week page load (defaults to the coming week) |
| A2 | Save one person's week, as a draft or submitted | My Week save and submit |
| A3 | Get a person's approved leave that covers any weekday of a week | Every load and save (builds the day statuses) |
| A4 | Get the holidays that apply to a person in a week | Every load and save (builds the day statuses) |
| A5 | List active projects | Entry type dropdown |
| A6 | Check a `projectId` exists and is active | My Week save (validation) |
| A7 | Get everyone's days for a given week: hours, and submitted or not | Operations view (reads my data) |
| A8 | Who is blocked, and on what | Operations view (reads my data) |

## 2. Relational design

```sql
-- Admin & Data's tables, shown only as foreign-key targets
CREATE TABLE person (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
  -- other fields per the pinned contract
);
 
CREATE TABLE project (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  client TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
 
-- Leave's and Operations' tables, shown because A3 and A4 read them (field names are guesses)
CREATE TABLE leave_request (
  id            TEXT PRIMARY KEY,
  person_id     TEXT NOT NULL REFERENCES person(id),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  half_day_date DATE,                 -- the one day that is only half leave, if any
  status        TEXT NOT NULL,
  CHECK (start_date <= end_date)
);
 
CREATE TABLE holiday (
  id   TEXT PRIMARY KEY,
  date DATE NOT NULL
  -- who it applies to (everyone or by location) and single day vs range are still open
);
 
-- Mine. The Week is the aggregate: one row per (person, Monday).
CREATE TABLE week (
  person_id    TEXT NOT NULL REFERENCES person(id),
  week_start   DATE NOT NULL,
  submitted_at TIMESTAMPTZ,                          -- NULL until submitted
  PRIMARY KEY (person_id, week_start),
  CHECK (EXTRACT(ISODOW FROM week_start) = 1)        -- a Monday
);
 
-- A DayPlan is only a date plus entries, so it has no table: a day is the group of rows
-- sharing (person_id, week_start, date). A day with no rows is an empty day. The week
-- always has exactly five days, so the loader fills in the missing ones.
CREATE TABLE work_entry (
  id         BIGSERIAL PRIMARY KEY,
  person_id  TEXT NOT NULL,
  week_start DATE NOT NULL,
  date       DATE NOT NULL,
  position   INT  NOT NULL,                          -- keeps the order the person entered entries in
  kind       TEXT NOT NULL CHECK (kind IN            -- only the six logged kinds;
               ('project','meeting','blocked',         -- leave, half-day-leave and holiday
                'bench','learning','admin')),          -- are never stored here
  hours      NUMERIC NOT NULL CHECK (hours > 0 AND hours <= 8),   -- DAILY_HOURS_CAP
  project_id TEXT REFERENCES project(id),
  waiting_on TEXT CHECK (waiting_on IN ('client','teammate','other')),
  note       TEXT CHECK (note IS NULL OR btrim(note) <> ''),
  FOREIGN KEY (person_id, week_start) REFERENCES week(person_id, week_start) ON DELETE CASCADE,
  UNIQUE (person_id, week_start, date, position),
  CHECK (date BETWEEN week_start AND week_start + 4),           -- Mon–Fri of that week
  CHECK (kind <> 'project' OR project_id IS NOT NULL),
  CHECK (kind IN ('project','blocked') OR project_id IS NULL),
  CHECK (kind <> 'blocked' OR waiting_on IS NOT NULL),
  CHECK (kind = 'blocked' OR waiting_on IS NULL),
  CHECK (kind IN ('blocked','admin') OR note IS NULL)
);
 
CREATE INDEX work_entry_week ON work_entry (week_start);   -- for A7 and A8
```

| # | Query |
|---|-------|
| A1 | `SELECT w.submitted_at, e.date, e.position, e.kind, e.hours, e.project_id, e.waiting_on, e.note FROM week w LEFT JOIN work_entry e ON e.person_id = w.person_id AND e.week_start = w.week_start WHERE w.person_id = $1 AND w.week_start = $2 ORDER BY e.date, e.position` (no `week` row means nothing saved yet, so the service builds five empty days) |
| A2 | `BEGIN; INSERT INTO week (person_id, week_start, submitted_at) VALUES ($1, $2, $3) ON CONFLICT (person_id, week_start) DO UPDATE SET submitted_at = EXCLUDED.submitted_at; DELETE FROM work_entry WHERE person_id = $1 AND week_start = $2; INSERT INTO work_entry (...) VALUES (...), (...); COMMIT;` |
| A3 | `SELECT id, start_date, end_date, half_day_date FROM leave_request WHERE person_id = $1 AND status = 'approved' AND start_date <= $3 AND end_date >= $2` (`$2` is the Monday, `$3` the Friday) |
| A4 | `SELECT id, date FROM holiday WHERE date BETWEEN $1 AND $2` (plus the "applies to this person" condition, once Operations decides it) |
| A5 | `SELECT id, name FROM project WHERE active ORDER BY name` |
| A6 | `SELECT active FROM project WHERE id = $1` (the foreign key already rejects an unknown id on insert; `active` is still checked by the app) |
| A7 | `SELECT w.person_id, w.submitted_at, SUM(e.hours) FROM week w LEFT JOIN work_entry e ON e.person_id = w.person_id AND e.week_start = w.week_start WHERE w.week_start = $1 GROUP BY w.person_id, w.submitted_at` |
| A8 | `SELECT person_id, date, waiting_on, project_id, note, hours FROM work_entry WHERE kind = 'blocked' AND week_start = $1` |

## 3. Single-table design

**Keys per entity**

| Entity | PK | SK | GSI1PK | GSI1SK |
|--------|----|----|--------|--------|
| Person (Admin & Data) | `PEOPLE` | `PERSON#<id>` | | |
| Project (Admin & Data) | `PROJECTS` | `PROJECT#<id>` | | |
| Work day (one `DayPlan` of a `Week`) | `WORK#<personId>` | `DAY#<isoDate>` | `WEEK#<weekStart>` | `PERSON#<personId>#DAY#<isoDate>` |
| LeaveRequest (Leave) | `LEAVE` | `REQUEST#<id>` | `LEAVE#<personId>` | `START#<startDate>#<id>` |
| Holiday (Operations' draft) | `HOLIDAYS` | `HOLIDAY#<isoDate>#<id>` | | |

**Example items** (a few rows, as they'd sit in the table)

| PK | SK | GSI1PK | GSI1SK | type | attributes |
|----|----|--------|--------|------|------------|
| `PEOPLE` | `PERSON#p1` | | | Person | name=… |
| `PROJECTS` | `PROJECT#proj-apollo` | | | Project | name=Apollo, active=true |
| `WORK#p1` | `DAY#2026-10-12` | `WEEK#2026-10-12` | `PERSON#p1#DAY#2026-10-12` | DayPlan | weekStart=2026-10-12, submittedAt=2026-10-08T03:15:00.000Z, hasBlocked=false, workEntries=[{kind:project, projectId:proj-apollo, hours:6}, {kind:admin, hours:2}] |
| `WORK#p1` | `DAY#2026-10-13` | `WEEK#2026-10-12` | `PERSON#p1#DAY#2026-10-13` | DayPlan | weekStart=2026-10-12, submittedAt=(same), hasBlocked=true, workEntries=[{kind:blocked, waitingOn:client, projectId:proj-apollo, note:"waiting on API keys", hours:3}, {kind:meeting, hours:1}, {kind:project, projectId:proj-apollo, hours:4}] |
| `WORK#p1` | `DAY#2026-10-14` | `WEEK#2026-10-12` | `PERSON#p1#DAY#2026-10-14` | DayPlan | weekStart=2026-10-12, submittedAt=(same), hasBlocked=false, workEntries=[] (holiday) |
| `WORK#p1` | `DAY#2026-10-15` | `WEEK#2026-10-12` | `PERSON#p1#DAY#2026-10-15` | DayPlan | weekStart=2026-10-12, submittedAt=(same), hasBlocked=false, workEntries=[{kind:learning, hours:8}] |
| `WORK#p1` | `DAY#2026-10-16` | `WEEK#2026-10-12` | `PERSON#p1#DAY#2026-10-16` | DayPlan | weekStart=2026-10-12, submittedAt=(same), hasBlocked=false, workEntries=[] (approved leave) |
| `LEAVE` | `REQUEST#r1` | `LEAVE#p1` | `START#2026-10-16#r1` | LeaveRequest | personId=p1, startDate=2026-10-16, endDate=2026-10-16, status=approved |
| `HOLIDAYS` | `HOLIDAY#2026-10-14#h1` | | | Holiday | name=Sample holiday |

**How each access pattern is served**

| # | Operation | Key condition / index |
|---|-----------|-----------------------|
| A1 | Query | `PK = WORK#p1`, `SK BETWEEN DAY#2026-10-12 AND DAY#2026-10-16`. A wider range returns several weeks. Then the service runs A3 and A4 and calls `Week.fromStorage`. |
| A2 | TransactWriteItems | Five `Put`s, all five days including empty ones, each with the week's `submittedAt`. It is preceded by reads: A3, A4 and A6 (for `Week.fromSubmission`). |
| A3 | Query on GSI1, then filter | `GSI1PK = LEAVE#p1`, `GSI1SK < START#2026-10-17`, filter `status = approved AND endDate >= 2026-10-12`. The start date can only be bounded from above, because a long leave may have started long ago. The filter runs after the read, which is acceptable because one person has few leave requests. The service then works out each weekday's status, including `half-day-leave` on `halfDayDate`. |
| A4 | Query | `PK = HOLIDAYS`, `SK BETWEEN HOLIDAY#2026-10-12 AND HOLIDAY#2026-10-17`, then drop any holiday that doesn't apply to this person (if Operations scopes holidays by location). |
| A5 | Query | `PK = PROJECTS`, `SK begins_with PROJECT#`, filter `active = true` |
| A6 | GetItem (or BatchGetItem) | `PK = PROJECTS`, `SK = PROJECT#<id>`; BatchGetItem for the week's distinct project ids |
| A7 | Query on GSI1 | `GSI1PK = WEEK#2026-10-12` returns every person's five days, already grouped by person because of the sort key. The hours are summed in the app. |
| A8 | Query on GSI1, then filter | Same query as A7, filtered on `hasBlocked = true` |

## 4. What got easier / what got harder

**Easier**
- **A1.** One `Query` on one partition returns the days in date order with their entries already nested. There is no join and no reassembling rows into days. A wider range gives several weeks of history for free.
- **The `WorkEntry` union.** Each kind stores only its own fields, in order. The relational table needs `position`, nullable `project_id`, `waiting_on` and `note` columns, and five `CHECK`s to say which kinds may use them.
- **A7.** A key lookup on one index, with no `GROUP BY` over a growing table.

**Harder**
- **A2.** A save is a five-item transaction that must always write all five days. `submittedAt` is copied five times and has to be written together. Relational updates one `week` row. A transactional write also costs twice the write capacity of a normal one, which is negligible here.
- **The entity is one thing and the storage is another.** The repository has to group and ungroup, and it has to cope with a week that has fewer than five items, which a transaction should make impossible. A plain `Query` is not serializable with a transaction as I read the docs, so a load could in principle see some of the five items updated and the rest not. `TransactGetItems` on the five known keys avoids that.
- **Composing the week.** Every load and save needs leave (A3), holidays (A4) and, on save, projects (A6), from other slices' partitions. That is separate requests with no joins and no transaction across them. In SQL the leave and holiday reads could be one statement. In both designs a leave approved between the read and the write can slip past `fromSubmission`, which is why `fromStorage` is lenient.
- **Nothing is enforced by the database.** A `CHECK` can enforce `hours > 0 AND hours <= 8` in SQL, but DynamoDB can enforce none of it. The day-total cap depends on leave and holidays from other slices, and "submit only when all five days are filled" spans rows, so neither design can enforce them without triggers. The `Week` entity is the only guard in both. Hardcoding `8` in a `CHECK` would also put that constant in two places.
- **A3.** A leave range can't be written as a key condition, so the filter runs after the read.

**Still unsure about**
- Whether Operations really has no date-based reads. I assumed it doesn't.
- Per-day items versus one item per week. The layout in `keys.ts` is tailored for day plans and is shared across entities so I am not sure if it can be modified.
- Whether `weekStart` and `submittedAt` should be copied onto each day or kept in a separate week item. I chose the copy because it needs no extra read and can't drift when all five are written together. A week item would put them in one place but make every load two reads.
