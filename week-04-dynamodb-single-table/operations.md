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

```sql
CREATE TABLE person (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  department           TEXT NOT NULL,
  role                 TEXT NOT NULL CHECK (role IN ('employee', 'hr_manager', 'operations_manager')),
  hours_per_week       NUMERIC NOT NULL CHECK (hours_per_week >= 0),
  active               BOOLEAN NOT NULL,
  leave_allowance_days NUMERIC NOT NULL CHECK (leave_allowance_days >= 0),
  country_code         CHAR(2) NOT NULL
);

CREATE TABLE project (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  client TEXT,
  active BOOLEAN NOT NULL
);

CREATE TABLE holiday (
  id           TEXT PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  date         DATE NOT NULL,
  name         TEXT NOT NULL,
  source       TEXT NOT NULL CHECK (source IN ('national', 'company')),
  date_created TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL,
  UNIQUE (country_code, date)
);

CREATE INDEX holiday_by_date ON holiday (date);
```

| # | Query |
|---|-------|
| A1 | `SELECT id, name, department, country_code, hours_per_week FROM person WHERE active = true ORDER BY name` |
| A2 | `SELECT * FROM person WHERE id = $1` |
| A3 | `SELECT * FROM holiday WHERE country_code = $1 AND date BETWEEN $2 AND $3 ORDER BY date` |
| A4 | `SELECT * FROM holiday WHERE date BETWEEN $1 AND $2 ORDER BY date, country_code` |
| A5 | `SELECT * FROM holiday WHERE country_code = $1 AND date BETWEEN '2026-01-01' AND '2026-12-31' ORDER BY date` |
| A6 | `SELECT * FROM holiday WHERE id = $1` |
| A7 | `INSERT INTO holiday (...) VALUES (...)`, rejected by `UNIQUE (country_code, date)` if the country already has that date |
