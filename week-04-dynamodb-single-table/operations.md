# Operations (Holiday) — Relational vs Single-Table

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | List holidays for one country in one week (Mon–Fri) | My Week (mark days as `holiday`) |
| A2 | List holidays for all countries in one week | Operations grid (team spans PH / ZA / GB) |
| A3 | List holidays for one country in one year, by date | HR holiday calendar |
| A4 | Get one holiday by country and date | HR add form (show the existing holiday when A5 rejects a duplicate) |
| A5 | Is there already a holiday for country X on date D? | HR add / reschedule (reject duplicates) |
| A6 | Get one holiday by id | HR edit form, My Week (`holiday` entry references a holiday by id) |
| A7 | List all holidays for all countries in one year, by date | HR holiday list |

`countryCode` is the two-letter ISO code (`PH`, `ZA`, `GB`) from Tempo's `countryCodeSchema`. A person's country must hold the same code, because the holiday key is built from it and has to match exactly.

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
  country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  date         date NOT NULL,
  name         text NOT NULL CHECK (name <> ''),
  source       holiday_source NOT NULL,
  date_created timestamptz NOT NULL,
  updated_at   timestamptz NOT NULL,
  UNIQUE (country_code, date)
);

CREATE INDEX holiday_by_date ON holiday (date);
```

| # | Query |
|---|-------|
| A1 | `SELECT * FROM holiday WHERE country_code = $1 AND date BETWEEN $2 AND $3 ORDER BY date` |
| A2 | `SELECT * FROM holiday WHERE date BETWEEN $1 AND $2 ORDER BY date, country_code` |
| A3 | `SELECT * FROM holiday WHERE country_code = $1 AND date BETWEEN '2026-01-01' AND '2026-12-31' ORDER BY date` |
| A4 | `SELECT * FROM holiday WHERE country_code = $1 AND date = $2` |
| A5 | `INSERT INTO holiday (...) VALUES (...)`, rejected by `UNIQUE (country_code, date)` if the country already has that date |
| A6 | `SELECT * FROM holiday WHERE id = $1` |
| A7 | `SELECT * FROM holiday WHERE date BETWEEN '2026-01-01' AND '2026-12-31' ORDER BY date, country_code` |

## 3. Single-table design

`holiday` items live in the shared table next to Admin & Data's Person and Project items. GSI1 is shared too: Admin & Data uses it with `PEOPLE#…` / `PROJECTS#…`, holidays use `HOLIDAYS`, so the prefixes never collide.

**Keys per entity**

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK |
|--------|----|----|--------|--------|--------|
| Holiday | `HOLIDAYS#<countryCode>` | `DATE#<isoDate>` | `HOLIDAYS` | `DATE#<isoDate>#<countryCode>` | `HOLIDAY#<id>` |

- `PK` is the country, because every single-country read (A1, A3, A4) is scoped to one country.
- `SK` is the date. ISO dates sort correctly as strings, so `BETWEEN` returns any week or year in date order.
- `PK + SK` is (countryCode, date), so the key itself enforces one holiday per country per date (A5).
- GSI1 puts every holiday under one partition sorted by date, so the cross-country week (A2) and the year list (A7) are each a single Query. The country is appended to `GSI1SK` to keep two countries' holidays on the same date distinct.
- GSI2 is a point lookup by id (A6), the same `ENTITY#<value>` shape Tempo uses for its by-email GSI. The id never changes, so GSI2 finds the holiday even after its date (and so its main key) moves. GSI2 has no sort key: the id is unique, so each partition holds exactly one item.
- The country never changes: Tempo's `Holiday.reschedule()` only accepts a new date or name. A holiday in a different country is a new holiday, so only the `SK` can move, never the `PK`.

**Example items**

| PK | SK | GSI1PK | GSI1SK | GSI2PK | type | …attributes |
|----|----|--------|--------|--------|------|-------------|
| `HOLIDAYS#PH` | `DATE#2026-12-25` | `HOLIDAYS` | `DATE#2026-12-25#PH` | `HOLIDAY#h1` | Holiday | id=h1, name=Christmas Day, source=national |
| `HOLIDAYS#PH` | `DATE#2026-12-30` | `HOLIDAYS` | `DATE#2026-12-30#PH` | `HOLIDAY#h2` | Holiday | id=h2, name=Rizal Day, source=national |
| `HOLIDAYS#ZA` | `DATE#2026-12-16` | `HOLIDAYS` | `DATE#2026-12-16#ZA` | `HOLIDAY#h3` | Holiday | id=h3, name=Day of Reconciliation, source=national |
| `HOLIDAYS#ZA` | `DATE#2026-12-25` | `HOLIDAYS` | `DATE#2026-12-25#ZA` | `HOLIDAY#h4` | Holiday | id=h4, name=Christmas Day, source=national |

**How each access pattern is served**

| # | Operation | Key condition / index |
|---|-----------|-----------------------|
| A1 | Query | `PK = HOLIDAYS#PH`, `SK BETWEEN DATE#2026-12-21 AND DATE#2026-12-25` |
| A2 | Query on GSI1 | `GSI1PK = HOLIDAYS`, `GSI1SK BETWEEN DATE#2026-12-21 AND DATE#2026-12-25~` (`~` sorts after `#`, so every country on the last day is included) |
| A3 | Query | `PK = HOLIDAYS#PH`, `SK BETWEEN DATE#2026-01-01 AND DATE#2026-12-31` |
| A4 | GetItem | `PK = HOLIDAYS#PH`, `SK = DATE#2026-12-25` |
| A5 | PutItem with `attribute_not_exists(PK)` | Fails if `HOLIDAYS#<countryCode>` / `DATE#<date>` already exists. Rescheduling is a TransactWrite: delete the old date item and conditionally put the new one |
| A6 | Query on GSI2 | `GSI2PK = HOLIDAY#h1` (returns at most one item) |
| A7 | Query on GSI1 | `GSI1PK = HOLIDAYS`, `GSI1SK BETWEEN DATE#2026-01-01 AND DATE#2026-12-31~` |

## 4. What got easier / what got harder

**Easier**
- A1, A3: one Query on one partition, already sorted by date.
- A4: a GetItem on the main key, no extra index.
- A5: the key enforces uniqueness on write, so there is no read-then-write race.
- A7: reuses GSI1 with a year range instead of a week, so it needs no new index.

**Harder**
- A2: needs GSI1 just to read across countries. In SQL it is one `BETWEEN` on an index.
- A6: needs its own GSI2 because the main key is (countryCode, date), not the id. GSI reads are eventually consistent, so an edit form opened right after a save can briefly see the old item. In SQL it is the primary key.
- Rescheduling: the date is part of the key, so moving a holiday is a delete + put transaction instead of one `UPDATE`. The id stays the same, so A6 still finds it, but the main key changes.
- A new filter later (for example, only `company` holidays) needs a new index or a filter on read. In SQL it is one more `WHERE`.
