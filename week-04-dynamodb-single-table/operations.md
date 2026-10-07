# Operations (Holiday) — Relational vs Single-Table

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | List holidays for one country in one week (Mon–Fri) | My Week (mark days as `holiday`) |
| A2 | List holidays for all countries in one week | Operations grid (team spans PH / ZA / GB) |
| A3 | List holidays for one country in one year, by date | HR holiday calendar |
| A4 | Get one holiday by country and date | HR edit form |
| A5 | Is there already a holiday for country X on date D? | HR add / reschedule (reject duplicates) |

**Read from other slices (not designed here)**

| Needed by | Data | Served by |
|---|---|---|
| Operations grid | Active people with name, department, country, hoursPerWeek | Admin & Data A2 |
| My Week, Operations grid | One person's country | Admin & Data A1 |

## 2. Relational design

`holiday` is the only table this slice creates. `person` belongs to Admin & Data and is only read.

```sql
CREATE TYPE holiday_source AS ENUM ('national', 'company');

CREATE TABLE holiday (
  id           uuid PRIMARY KEY,
  country      text NOT NULL CHECK (country <> ''),
  date         date NOT NULL,
  name         text NOT NULL CHECK (name <> ''),
  source       holiday_source NOT NULL,
  date_created timestamptz NOT NULL,
  updated_at   timestamptz NOT NULL,
  UNIQUE (country, date)
);

CREATE INDEX holiday_by_date ON holiday (date);
```

| # | Query |
|---|-------|
| A1 | `SELECT * FROM holiday WHERE country = $1 AND date BETWEEN $2 AND $3 ORDER BY date` |
| A2 | `SELECT * FROM holiday WHERE date BETWEEN $1 AND $2 ORDER BY date, country` |
| A3 | `SELECT * FROM holiday WHERE country = $1 AND date BETWEEN '2026-01-01' AND '2026-12-31' ORDER BY date` |
| A4 | `SELECT * FROM holiday WHERE country = $1 AND date = $2` |
| A5 | `INSERT INTO holiday (...) VALUES (...)`, rejected by `UNIQUE (country, date)` if the country already has that date |

## 3. Single-table design

`holiday` items live in the shared table next to Admin & Data's Person and Project items. GSI1 is shared too: Admin & Data uses it with `PEOPLE#…` / `PROJECTS#…`, holidays use `HOLIDAYS`, so the prefixes never collide.

**Keys per entity**

| Entity | PK | SK | GSI1PK | GSI1SK |
|--------|----|----|--------|--------|
| Holiday | `HOLIDAYS#<country>` | `DATE#<isoDate>` | `HOLIDAYS` | `DATE#<isoDate>#<country>` |

- `PK` is the country, because every single-country read (A1, A3, A4) is scoped to one country.
- `SK` is the date. ISO dates sort correctly as strings, so `BETWEEN` returns any week or year in date order.
- `PK + SK` is (country, date), so the key itself enforces one holiday per country per date (A5).
- GSI1 puts every holiday under one partition sorted by date, so the cross-country week (A2) is a single Query. The country is appended to `GSI1SK` to keep two countries' holidays on the same date distinct.

**Example items**

| PK | SK | GSI1PK | GSI1SK | type | …attributes |
|----|----|--------|--------|------|-------------|
| `HOLIDAYS#PH` | `DATE#2026-12-25` | `HOLIDAYS` | `DATE#2026-12-25#PH` | Holiday | id=h1, name=Christmas Day, source=national |
| `HOLIDAYS#PH` | `DATE#2026-12-30` | `HOLIDAYS` | `DATE#2026-12-30#PH` | Holiday | id=h2, name=Rizal Day, source=national |
| `HOLIDAYS#ZA` | `DATE#2026-12-16` | `HOLIDAYS` | `DATE#2026-12-16#ZA` | Holiday | id=h3, name=Day of Reconciliation, source=national |
| `HOLIDAYS#ZA` | `DATE#2026-12-25` | `HOLIDAYS` | `DATE#2026-12-25#ZA` | Holiday | id=h4, name=Christmas Day, source=national |

**How each access pattern is served**

| # | Operation | Key condition / index |
|---|-----------|-----------------------|
| A1 | Query | `PK = HOLIDAYS#PH`, `SK BETWEEN DATE#2026-12-21 AND DATE#2026-12-25` |
| A2 | Query on GSI1 | `GSI1PK = HOLIDAYS`, `GSI1SK BETWEEN DATE#2026-12-21 AND DATE#2026-12-25~` (`~` sorts after `#`, so every country on the last day is included) |
| A3 | Query | `PK = HOLIDAYS#PH`, `SK BETWEEN DATE#2026-01-01 AND DATE#2026-12-31` |
| A4 | GetItem | `PK = HOLIDAYS#PH`, `SK = DATE#2026-12-25` |
| A5 | PutItem with `attribute_not_exists(PK)` | Fails if `HOLIDAYS#<country>` / `DATE#<date>` already exists. Rescheduling is a TransactWrite: delete the old date item and conditionally put the new one |

## 4. What got easier / what got harder

**Easier**
- A1, A3: one Query on one partition, already sorted by date.
- A4: a GetItem on the main key, no extra index.
- A5: the key enforces uniqueness on write, so there is no read-then-write race.

**Harder**
- A2: needs GSI1 just to read across countries. In SQL it is one `BETWEEN` on an index.
- Rescheduling: the date is part of the key, so moving a holiday is a delete + put transaction instead of one `UPDATE`, and the holiday's identity (country + date) changes.
- A new filter later (for example, only `company` holidays) needs a new index or a filter on read. In SQL it is one more `WHERE`.

**Still unsure about**
- Whether `GSI1PK = HOLIDAYS` (one partition for all holidays) is acceptable long-term. It is small today (about 20 holidays per country per year).
