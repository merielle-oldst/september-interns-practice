# <Slice name> — Relational vs Single-Table

<!--
FORMAT EXAMPLE — copy this file to `<slice>.md` and replace everything.
The "Gadget / Order" rows below are made up to show the shape; don't reuse them.
-->

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | Get one leave request by id | Leave detail page |
| A2 | List a person's leave request, newest first | My leave page; HR manager viewing one person's leave |
| A3 | List a person's vacation leave allowance a year (allowance, approved, pending) | Balance card on My leave page |
| A4 | List all pending requests, oldest first, including the name of the person | Approvals queue (HR manager) |
| A5 | List everyone's pending/approved leave requests that overlap a week or month | Team view (Operations manager, HR manager) |


## 2. Relational design

```sql
CREATE TYPE leave_type      AS ENUM ('sick','emergency','vacation','maternity','paternity','birthday','bereavement');
CREATE TYPE leave_status    AS ENUM ('pending','approved','declined','cancelled');
CREATE TYPE half_day_period AS ENUM ('am','pm');
CREATE TYPE relationship    AS ENUM ('spouse','child','parent','sibling','partner');

-- Owned by the People slice; shown because leave reads it.
CREATE TABLE person (
  id              uuid PRIMARY KEY,
  name            text NOT NULL CHECK (name <> ''),
  email           text NOT NULL UNIQUE,
  country         text NOT NULL CHECK (country <> ''),
  start_date      date NOT NULL,
  birth_date      date NOT NULL,
  employee_type   text NOT NULL DEFAULT 'probationary'
                       CHECK (employee_type IN ('regular','probationary')),
  regularized_at  date,
  department      text NOT NULL CHECK (department <> ''),
  role            text NOT NULL CHECK (role IN ('employee','hr_manager','operations_manager')),
  hours_per_week  numeric(4,1) NOT NULL CHECK (hours_per_week > 0),
  active          boolean NOT NULL,

  CONSTRAINT born_before_start       CHECK (birth_date < start_date),
  CONSTRAINT regularized_iff_regular CHECK ((employee_type = 'regular') = (regularized_at IS NOT NULL)),
  CONSTRAINT regularized_after_start CHECK (regularized_at >= start_date)
);

CREATE TABLE leave_request (
  id               uuid PRIMARY KEY,
  person_id        uuid NOT NULL REFERENCES person(id),   -- whose leave it is
  filed_by         uuid NOT NULL REFERENCES person(id),   -- person_id, or the HR manager filing for them
  type             leave_type   NOT NULL,
  status           leave_status NOT NULL,
  start_date       date NOT NULL,
  end_date         date NOT NULL,
  half_day_date    date,
  half_day_period  half_day_period,
  reason           varchar(500),
  relationship     relationship,
  leave_days       numeric(4,1) NOT NULL,                 -- entity.leaveDays
  decided_by       uuid REFERENCES person(id),
  decided_at       timestamptz,
  date_created     timestamptz NOT NULL,
  updated_at       timestamptz NOT NULL,
  version          integer NOT NULL DEFAULT 0,            -- optimistic lock

  CONSTRAINT end_not_before_start CHECK (end_date >= start_date),
  CONSTRAINT half_day_pair        CHECK ((half_day_date IS NULL) = (half_day_period IS NULL)),
  CONSTRAINT half_day_in_range    CHECK (half_day_date BETWEEN start_date AND end_date),
  CONSTRAINT relationship_only_for_bereavement
                                  CHECK ((type = 'bereavement') = (relationship IS NOT NULL)),
  CONSTRAINT decision_pair        CHECK ((decided_by IS NULL) = (decided_at IS NULL))
);
```

| # | Query |
|---|-------|
| A1 | `SELECT * FROM leave_request WHERE id = $1` |
| A2 | `SELECT * FROM leave_request WHERE person_id = $1 ORDER BY date_created DESC LIMIT 20` |
| A3 | `SELECT p.employee_type, p.regularized_at, COALESCE(SUM(lr.leave_days) FILTER (WHERE lr.status = 'approved'), 0) AS approved, COALESCE(SUM(lr.leave_days) FILTER (WHERE lr.status = 'pending'),  0) AS pending FROM person p LEFT JOIN leave_request lr ON lr.person_id = p.id AND lr.type = 'vacation' AND lr.start_date >= make_date($2, 1, 1) AND lr.start_date <  make_date($2 + 1, 1, 1) WHERE p.id = $1 GROUP BY p.id;` |
| A4 | `SELECT lr.*, p.name AS person_name FROM leave_request lr JOIN person p ON p.id = lr.person_id WHERE lr.status = 'pending' ORDER BY lr.date_created ASC` |
| A5 | `SELECT lr.*, p.name AS person_name FROM leave_request lr JOIN person p ON p.id = lr.person_id WHERE lr.status IN ('pending', 'approved') AND lr.end_date >= $1 AND lr.start_date <= $2 ORDER BY lr.start_date` |


## 3. Single-table design

### Keys per entity

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|---|---|---|---|---|---|---|
| Person | `PEOPLE` | `PERSON#<personId>` | | | | |
| LeaveRequest | `LEAVE#<personId>` | `REQ#<dateCreated>#<id>` | `LEAVEREQ#<id>` | | `LEAVE#PENDING` (only while pending) | `<dateCreated>#<id>` (only while pending) |
| CalendarMarker (one per month a pending/approved request touches) | `CAL#<yyyy-mm>` | `<start>#<id>` | | | | |

### Example items (a few rows, as they'd sit in the table)

| PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK | entity type | …attributes |
|---|---|---|---|---|---|---|---|
| `PEOPLE` | `PERSON#p-ben` | | | | | Person | name=Ben Carter, employeeType=regular, regularizedAt=2024-08-01 |
| `PEOPLE` | `PERSON#p-chloe` | | | | | Person | name=Chloe Kim, employeeType=regular, regularizedAt=2025-03-01 |
| `LEAVE#p-ben` | `REQ#2026-09-01T09:00Z#lr-1` | `LEAVEREQ#lr-1` | `LEAVEREQ#lr-1` | | | LeaveRequest | type=vacation, status=approved, start=2026-09-21, end=2026-09-25, leaveDays=5 |
| `LEAVE#p-ben` | `REQ#2026-10-01T08:30Z#lr-6` | `LEAVEREQ#lr-6` | `LEAVEREQ#lr-6` | `LEAVE#PENDING` | `2026-10-01T08:30Z#lr-6` | LeaveRequest | type=vacation, status=pending, start=2026-12-22, end=2026-12-31, leaveDays=8 |
| `LEAVE#p-chloe` | `REQ#2026-10-06T08:00Z#lr-5` | `LEAVEREQ#lr-5` | `LEAVEREQ#lr-5` | `LEAVE#PENDING` | `2026-10-06T08:00Z#lr-5` | LeaveRequest | type=maternity, status=pending, start=2026-11-16, end=2027-03-15, leaveDays=120 |
| `CAL#2026-09` | `2026-09-21#lr-1` | | | | | CalendarMarker | personId=p-ben, status=approved, start=2026-09-21, end=2026-09-25 |
| `CAL#2026-11` | `2026-11-16#lr-5` | | | | | CalendarMarker | personId=p-chloe, status=pending, start=2026-11-16, end=2027-03-15 |
| `CAL#2026-12` | `2026-11-16#lr-5` | | | | | CalendarMarker | personId=p-chloe, status=pending, start=2026-11-16, end=2027-03-15 |
| `CAL#2026-12` | `2026-12-22#lr-6` | | | | | CalendarMarker | personId=p-ben, status=pending, start=2026-12-22, end=2026-12-31 |

Chloe's maternity leave also has markers in `CAL#2027-01`, `CAL#2027-02` and `CAL#2027-03`.

### How each access pattern is served

| # | Operation | Key condition / index |
|---|---|---|
| A1 | Query GSI1 | `GSI1PK = LEAVEREQ#<id>` |
| A2 | Query (descending) | `PK = LEAVE#<personId>`, `SK begins_with REQ#` |
| A3 | GetItem + Query, base table | GetItem `PK = PEOPLE, SK = PERSON#<personId>`. Query `PK = LEAVE#<personId> AND begins_with(SK, "REQ#")`, filter `type = vacation AND start` within the year | The Person item gives `employeeType` and `regularizedAt` for the allowance. The service adds up `leaveDays` by status. |
| A4 | Query GSI2 (ascending) + Query | GSI2: `GSI2PK = LEAVE#PENDING`; names: `PK = PEOPLE` |
| A5 | Query per month in the window + Query | `PK = CAL#<yyyy-mm>`, filter `start <= :to AND end >= :from`; names: `PK = PEOPLE` |

## 4. What got easier / what got harder

**Easier**
- In A2, all of a person's leave requests are stored together under `LEAVE#<personId>`, and DynamoDB already sorts them newest first by the sort key.
- In A5, each month has its own PK (e.g. `CAL#2026-12`) that holds only the pending and approved leave requests in that month.

**Harder**
- In A1, SQL uses a primary-key lookup, whereas DynamoDB needs a GSI on the leave request id because the leave requests are grouped by person.
- In A3, DynamoDB needs two reads (the person, then their requests) and the code adds up the approved and pending days, whereas SQL does it in one query with `JOIN` and `SUM`.

- In A4, DynamoDB has no `JOIN` operation, so the person's name comes from a second read of the people list, whereas SQL only needs a `JOIN`.
- In A5, every approve, decline, cancel or date edit must also update the month copies in DynamoDB, whereas SQL has only one row per request, so there is nothing else to update.

**Still unsure about**
- I'm unsure whether the birthday check needs its own access pattern.
- In DynamoDB, a leave request only stores the person's id, not their name. To show names, should the name be looked up from the people list every time, or saved on the request when it is created?
