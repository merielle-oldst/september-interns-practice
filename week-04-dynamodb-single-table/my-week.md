# My Week — Relational vs Single-Table

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
| A3 | Get everyone's days for a given week: hours, and submitted or not | Operations grid |
| A4 | Who is blocked, and on what | Operations grid |
 
**Read from other slices**
 
| Needed by | Data | Served by |
|-----------|------|-----------|
| My Week load and save | The person's country | Admin & Data A1 |
| My Week load and save | Holidays for that country, Mon–Fri of the week | Operations A1 |
| My Week load and save | The person's approved leave covering the week | Leave A2, then filtered in the service to approved and overlapping |
| My Week entry dropdown | Active projects, by name | Admin & Data A5 |
| My Week save (validation) | One project: does it exist, and is it active | Admin & Data A4 |

## 2. Relational design

```sql
-- Owned by Admin & Data; shown only as foreign-key targets.
CREATE TABLE person (
  id uuid PRIMARY KEY
  -- other fields per Admin & Data's design
);
 
CREATE TABLE project (
  id uuid PRIMARY KEY
  -- other fields per Admin & Data's design
);
 
-- Mine. The Week is the aggregate: one row per (person, Monday).
CREATE TABLE week (
  person_id    uuid NOT NULL REFERENCES person(id),
  week_start   date NOT NULL,
  submitted_at timestamptz,                          -- NULL until submitted
  PRIMARY KEY (person_id, week_start),
  CHECK (EXTRACT(ISODOW FROM week_start) = 1)        -- a Monday
);
 
-- A DayPlan is only a date plus entries, so it has no table: a day is the group of rows
-- sharing (person_id, week_start, date). A day with no rows is an empty day. The week
-- always has exactly five days, so the loader fills in the missing ones.
CREATE TABLE work_entry (
  id         bigserial PRIMARY KEY,
  person_id  uuid NOT NULL,
  week_start date NOT NULL,
  date       date NOT NULL,
  position   int  NOT NULL,                          -- keeps the order the person entered entries in
  kind       text NOT NULL CHECK (kind IN            -- only the six logged kinds;
               ('project','meeting','blocked',         -- leave, half-day-leave and holiday
                'bench','learning','admin')),          -- are never stored here
  hours      numeric NOT NULL CHECK (hours > 0 AND hours <= 8),   -- DAILY_HOURS_CAP
  project_id uuid REFERENCES project(id),
  waiting_on text CHECK (waiting_on IN ('client','teammate','other')),
  note       text CHECK (note IS NULL OR btrim(note) <> ''),
  FOREIGN KEY (person_id, week_start) REFERENCES week(person_id, week_start) ON DELETE CASCADE,
  UNIQUE (person_id, week_start, date, position),
  CHECK (date BETWEEN week_start AND week_start + 4),           -- Mon–Fri of that week
  CHECK (kind <> 'project' OR project_id IS NOT NULL),
  CHECK (kind IN ('project','blocked') OR project_id IS NULL),
  CHECK (kind <> 'blocked' OR waiting_on IS NOT NULL),
  CHECK (kind = 'blocked' OR waiting_on IS NULL),
  CHECK (kind IN ('blocked','admin') OR note IS NULL)
);
 
CREATE INDEX work_entry_week ON work_entry (week_start);   -- for A3 and A4
```
 
| # | Query |
|---|-------|
| A1 | `SELECT w.submitted_at, e.date, e.position, e.kind, e.hours, e.project_id, e.waiting_on, e.note FROM week w LEFT JOIN work_entry e ON e.person_id = w.person_id AND e.week_start = w.week_start WHERE w.person_id = $1 AND w.week_start = $2 ORDER BY e.date, e.position` (no `week` row means nothing saved yet, so the service builds five empty days) |
| A2 | `BEGIN; INSERT INTO week (person_id, week_start, submitted_at) VALUES ($1, $2, $3) ON CONFLICT (person_id, week_start) DO UPDATE SET submitted_at = EXCLUDED.submitted_at; DELETE FROM work_entry WHERE person_id = $1 AND week_start = $2; INSERT INTO work_entry (...) VALUES (...), (...); COMMIT;` |
| A3 | `SELECT w.person_id, w.submitted_at, SUM(e.hours) FROM week w LEFT JOIN work_entry e ON e.person_id = w.person_id AND e.week_start = w.week_start WHERE w.week_start = $1 GROUP BY w.person_id, w.submitted_at` |
| A4 | `SELECT person_id, date, waiting_on, project_id, note, hours FROM work_entry WHERE kind = 'blocked' AND week_start = $1` |

## 3. Single-table design

**Keys per entity**

| Entity | PK | SK | GSI1PK | GSI1SK |
|--------|----|----|--------|--------|
| Work day (one `DayPlan` of a `Week`) | `WORK#<personId>` | `DAY#<isoDate>` | `WEEK#<weekStart>` | `PERSON#<personId>#DAY#<isoDate>` |

**Example items** (a few rows, as they'd sit in the table)
| PK | SK | GSI1PK | GSI1SK | type | attributes |
|----|----|--------|--------|------|------------|
| `WORK#p1` | `DAY#2026-12-21` | `WEEK#2026-12-21` | `PERSON#p1#DAY#2026-12-21` | DayPlan | weekStart=2026-12-21, submittedAt=2026-12-17T03:15:00.000Z, hasBlocked=false, workEntries=[{kind:project, projectId:pr1, hours:6}, {kind:admin, hours:2}] |
| `WORK#p1` | `DAY#2026-12-22` | `WEEK#2026-12-21` | `PERSON#p1#DAY#2026-12-22` | DayPlan | weekStart=2026-12-21, submittedAt=(same), hasBlocked=true, workEntries=[{kind:blocked, waitingOn:client, projectId:pr1, note:"waiting on API keys", hours:3}, {kind:meeting, hours:1}, {kind:project, projectId:pr1, hours:4}] |
| `WORK#p1` | `DAY#2026-12-23` | `WEEK#2026-12-21` | `PERSON#p1#DAY#2026-12-23` | DayPlan | weekStart=2026-12-21, submittedAt=(same), hasBlocked=false, workEntries=[{kind:learning, hours:8}] |
| `WORK#p1` | `DAY#2026-12-24` | `WEEK#2026-12-21` | `PERSON#p1#DAY#2026-12-24` | DayPlan | weekStart=2026-12-21, submittedAt=(same), hasBlocked=false, workEntries=[{kind:project, projectId:pr1, hours:8}] |
| `WORK#p1` | `DAY#2026-12-25` | `WEEK#2026-12-21` | `PERSON#p1#DAY#2026-12-25` | DayPlan | weekStart=2026-12-21, submittedAt=(same), hasBlocked=false, workEntries=[] (holiday) |

**How each access pattern is served**

| # | Operation | Key condition / index |
|---|-----------|-----------------------|
| A1 | Query | `PK = WORK#p1`, `SK BETWEEN DAY#2026-12-21 AND DAY#2026-12-25`. A wider range returns several weeks. Then the service reads the day statuses from the other slices (see the table in section 1) and calls `Week.fromStorage`. |
| A2 | TransactWriteItems | Five `Put`s, all five days including empty ones, each with the week's `submittedAt`. It is preceded by reads from the other slices: the person's country, the holidays, the leave and the projects (for `Week.fromSubmission`). |
| A3 | Query on GSI1 | `GSI1PK = WEEK#2026-12-21` returns every person's five days, already grouped by person because of the sort key. The hours are summed in the app. |
| A4 | Query on GSI1, then filter | Same query as A3, filtered on `hasBlocked = true` |

## 4. What got easier / what got harder

**Easier**
- **A1.** One `Query` on one partition returns the days in date order with their entries already nested. There is no join and no reassembling rows into days. A wider range gives several weeks of history for free.
- **The `WorkEntry` union.** Each kind stores only its own fields, in order. The relational table needs `position`, nullable `project_id`, `waiting_on` and `note` columns, and five `CHECK`s to say which kinds may use them.
- **A7.** A key lookup on one index, with no `GROUP BY` over a growing table.

**Harder**
- **A2.** A save is a five-item transaction that must always write all five days. `submittedAt` is copied five times and has to be written together. Relational updates one `week` row. A transactional write also costs twice the write capacity of a normal one, which is negligible here.
- **The entity is one thing and the storage is another.** The repository has to group and ungroup, and it has to cope with a week that has fewer than five items, which a transaction should make impossible. A plain `Query` is not serializable with a transaction as I read the docs, so a load could in principle see some of the five items updated and the rest not. `TransactGetItems` on the five known keys avoids that.
- **Composing the week.** Every load and save needs leave (A3), holidays (A4) and, on save, projects (A6), from other slices' partitions. That is separate requests with no joins and no transaction across them. In SQL the leave and holiday reads could be one statement. In both designs a leave approved between the read and the write can slip past `fromSubmission`, which is why `fromStorage` is lenient.
- **Hours on Project X across weeks.** The entries are nested inside day items, so no key reaches them. Relational answers it with one `GROUP BY project_id`.
- **Nothing is enforced by the database.** A `CHECK` can enforce `hours > 0 AND hours <= 8` in SQL, but DynamoDB can enforce none of it. The day-total cap depends on leave and holidays from other slices, and "submit only when all five days are filled" spans rows, so neither design can enforce them without triggers. The `Week` entity is the only guard in both. Hardcoding `8` in a `CHECK` would also put that constant in two places.
- **A6 and the foreign key.** DynamoDB won't reject an unknown `projectId`, so the app must check it on every save.
- **A3.** A leave range can't be written as a key condition, so the filter runs after the read.
- **A7 and A8** need `GSI1`, which doesn't exist yet. `hasBlocked` has to be recomputed on every save or it goes stale.

**Still unsure about**
- Whether Operations really has no date-based reads. I assumed it doesn't.
- Per-day items versus one item per week. The layout in `keys.ts` is tailored for day plans and is shared across entities so I am not sure if it can be modified.
- Whether `weekStart` and `submittedAt` should be copied onto each day or kept in a separate week item. I chose the copy because it needs no extra read and can't drift when all five are written together. A week item would put them in one place but make every load two reads.
- Leave's field names other than `halfDayDate`, and the `GSI1` shape for leave.
- Concurrent saves. Writes are last-write-wins, and an operations manager can edit a locked week, so a version attribute checked in the transaction may be needed. I haven't added one.