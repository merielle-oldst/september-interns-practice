# Admin & Data — Relational vs Single-Table

## 1. Access patterns

| #  | Question the app asks | Used by (screen / action)       |
| -- | --------------------- | ------------------------------- |
| A1 | Get one person by ID | Admin screen — Edit person |
| A2 | List all active people, alphabetically by name | Admin screen — People list |
| A3 | List all active regular employees, alphabetically by name | Admin screen — People list |
| A4 | Get one project by ID | Admin screen — Edit project |
| A5 | List all active projects, alphabetically by name | Admin screen — Project list |
| A6 | List all archived projects, alphabetically by name | Admin screen — Project list |
| A7 | List all projects, newest first | Admin screen — Project list |
| A8 |  Get people data for CSV export | Admin screen — Export CSV |


**## 2. Relational design**

```sql
CREATE TYPE employee_type AS ENUM (
  'regular',
  'probationary',
  'part-time',
  'contractor'
);

CREATE TYPE person_role AS ENUM (
  'employee',
  'hr_manager',
  'operations_manager'
);

CREATE TABLE person (
  id              uuid PRIMARY KEY,
  name            text NOT NULL CHECK (name <> ''),
  birth_date      date NOT NULL,
  email           text NOT NULL UNIQUE,
  country         text NOT NULL CHECK (country <> ''),
  start_date      date NOT NULL,
  employee_type   employee_type NOT NULL,
  regularized_at  date,
  department      text NOT NULL CHECK (department <> ''),
  role            person_role NOT NULL,
  hours_per_week  numeric(4,1) NOT NULL CHECK (hours_per_week > 0),
  active          boolean NOT NULL,
  date_created    timestamptz NOT NULL,
  updated_at      timestamptz NOT NULL 
);

CREATE TABLE project (
  id            uuid PRIMARY KEY,
  name          text NOT NULL CHECK (name <> ''),
  client        text,
  active        boolean NOT NULL,
  date_created  timestamptz NOT NULL,
  updated_at    timestamptz NOT NULL
);
```

| #  | Query                                                                                      |
| -- | ------------------------------------------------------------------------------------------ |
| A1 | `SELECT * FROM person WHERE id = $1` |
| A2 | `SELECT * FROM person WHERE active = TRUE ORDER BY name ASC` |
| A3 | `SELECT * FROM person WHERE active = TRUE AND employee_type = 'regular' ORDER BY name ASC` |
| A4 | `SELECT * FROM project WHERE id = $1` |
| A5 | `SELECT * FROM project WHERE active = TRUE ORDER BY name ASC` |
| A6 | `SELECT * FROM project WHERE active = FALSE ORDER BY name ASC` |
| A7 | `SELECT * FROM project ORDER BY date_created DESC` |
| A8 | `SELECT * FROM person ORDER BY name ASC` |


**## 3. Single-table design**

**Keys per entity**


| Entity  | PK           | SK             | GSI1PK              | GSI1SK             |
| ------- | ------------ | -------------- | ------------------- | ------------------ |
| Person  | `PEOPLE`     | `PERSON#<id>`  | `PEOPLE#<active>`   | `NAME#<name>#<id>` |
| Project | `PROJECTS`   | `PROJECT#<id>` | `PROJECTS#<active>` | `NAME#<name>#<id>` |

**Example items** (a few rows, as they'd sit in the table)

| PK       | SK            | GSI1PK           | GSI1SK          | type    | …attributes                       |
| -------- | ------------- | ---------------- | --------------- | ------- | --------------------------------- |
| `PEOPLE` | `PERSON#p1` | `PEOPLE#true` | `NAME#Ana Cruz#p1` | Person | employeeType=regular, active=true |
| `PEOPLE` | `PERSON#p2` | `PEOPLE#true` | `NAME#Ben Santos#p2` | Person | employeeType=probationary, active=true |
| `PROJECTS` | `PROJECT#pr1` | `PROJECTS#true` | `NAME#Apollo#pr1` | Project | active=true |
| `PROJECTS` | `PROJECT#pr2` | `PROJECTS#false` | `NAME#Mercury#pr2` | Project | active=false |

**How each access pattern is served**

| #  | Operation | Key condition / index                                 |
| -- | --------- | ----------------------------------------------------- |
| A1 | GetItem | `PK = PEOPLE`, `SK = PERSON#<id>`   |
| A2 | Query  | GSI1: `GSI1PK = PEOPLE#true`, ordered by `GSI1SK`  |
| A3 | Query  | GSI1: `GSI1PK = PEOPLE#true`, filter `employeeType = regular` |
| A4 | GetItem | `PK = PROJECTS`, `SK = PROJECT#<id>`       |
| A5 | Query  | GSI1: `GSI1PK = PROJECTS#true`, ordered by `GSI1SK`   |
| A6 | Query  | GSI1: `GSI1PK = PROJECTS#false`, ordered by `GSI1SK`  |
| A7 | Query  | Requires a GSI with `dateCreated` as the sort key    |
| A8 | Query     | `PK = PEOPLE`, retrieving all person items     |

## 4. What got easier / what got harder

**Easier**

* In A1 and A4, getting one person or project by ID is straightforward in both designs because the ID can be used directly as the primary key in SQL or as the PK/SK in DynamoDB.
* In A2, A5, and A6, DynamoDB can return people or projects in alphabetical order using the `GSI1SK`, so the sort order is built into the key design.

**Harder**

* In A3, SQL can filter active regular employees directly with `WHERE`, whereas DynamoDB either needs a filter or a separate key/index designed specifically for active regular employees.
* In A7, SQL can list projects newest first with `ORDER BY date_created DESC`, whereas DynamoDB needs a separate GSI with `dateCreated` as the sort key.
* In A8, SQL can retrieve all people directly from the `person` table, while DynamoDB can query the `PEOPLE` partition to retrieve all person items. If CSV export requires alphabetical order, the existing GSI would need to be redesigned to support that requirement.

**Still unsure about**

* I'm unsure whether A3 should use a filter on the active people query or have its own GSI for active regular employees.
* I'm unsure whether the application actually needs A7, since supporting it in DynamoDB may require an additional GSI.
* I'm unsure whether the CSV export functionality still needs its own access pattern or can reuse an existing one.
