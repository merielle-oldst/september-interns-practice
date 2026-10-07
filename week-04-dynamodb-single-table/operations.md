# Operations (Holiday) — Relational vs Single-Table

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | List all active people, with name, department, country and hoursPerWeek, sorted by name | Operations grid (one row per person) |
| A2 | Get one person by id (to know their country) | My Week (which holidays apply to me) |
| A3 | List holidays for one country in one week (Mon–Fri) | My Week (mark days as `holiday`) |
| A4 | List holidays for all countries in one week | Operations grid (team spans PH / ZA / GB) |
| A5 | List holidays for one country in one year, by date | HR holiday calendar |
| A6 | Get one holiday by id | My Week holiday entry, HR edit form |
| A7 | Is there already a holiday for country X on date D? | HR add / reschedule (reject duplicates) |

## 2. Relational design

`person` is owned by Admin & Data (`admin-data.md`). Operations only reads `id`, `name`, `department`, `country`, `hours_per_week` and `active` from it. `holiday` is the only table this slice creates.

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
| A1 | `SELECT id, name, department, country, hours_per_week FROM person WHERE active = TRUE ORDER BY name ASC` |
| A2 | `SELECT * FROM person WHERE id = $1` |
| A3 | `SELECT * FROM holiday WHERE country = $1 AND date BETWEEN $2 AND $3 ORDER BY date` |
| A4 | `SELECT * FROM holiday WHERE date BETWEEN $1 AND $2 ORDER BY date, country` |
| A5 | `SELECT * FROM holiday WHERE country = $1 AND date BETWEEN '2026-01-01' AND '2026-12-31' ORDER BY date` |
| A6 | `SELECT * FROM holiday WHERE id = $1` |
| A7 | `INSERT INTO holiday (...) VALUES (...)`, rejected by `UNIQUE (country, date)` if the country already has that date |
