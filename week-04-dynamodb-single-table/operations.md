# Operations (Holiday) — Relational vs Single-Table

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | List holidays for one country in one week (Mon–Fri) | My Week (mark days as `holiday`) |
| A2 | List holidays for all countries in one week | Operations grid (team spans PH / ZA / GB) |
| A3 | List holidays for one country in one year, by date | HR holiday calendar |
| A4 | Get one holiday by id | My Week holiday entry, HR edit form |
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
| A4 | `SELECT * FROM holiday WHERE id = $1` |
| A5 | `INSERT INTO holiday (...) VALUES (...)`, rejected by `UNIQUE (country, date)` if the country already has that date |
