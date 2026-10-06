# <Slice name> — Relational vs Single-Table

<!--
FORMAT EXAMPLE — copy this file to `<slice>.md` and replace everything.
The "Gadget / Order" rows below are made up to show the shape; don't reuse them.
-->

## 1. Access patterns

| # | Question the app asks | Used by (screen / action) |
|---|-----------------------|---------------------------|
| A1 | Get one gadget by id | Gadget detail page |
| A2 | List all orders for a customer, newest first | Customer history |
| … | | |

## 2. Relational design

```sql
-- tables, columns, primary + foreign keys
CREATE TABLE gadget (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL
);
```

| # | Query |
|---|-------|
| A1 | `SELECT * FROM gadget WHERE id = $1` |
| A2 | `SELECT … ORDER BY created_at DESC` |

## 3. Single-table design

**Keys per entity**

| Entity | PK | SK | GSI1PK | GSI1SK |
|--------|----|----|--------|--------|
| Gadget | `GADGET#<id>` | `GADGET#<id>` | | |
| Order  | `CUSTOMER#<id>` | `ORDER#<createdAt>` | | |

**Example items** (a few rows, as they'd sit in the table)

| PK | SK | type | …attributes |
|----|----|------|-------------|
| `CUSTOMER#c1` | `ORDER#2026-10-01` | Order | total=40 |

**How each access pattern is served**

| # | Operation | Key condition / index |
|---|-----------|-----------------------|
| A1 | GetItem | `PK = GADGET#<id>`, `SK = GADGET#<id>` |
| A2 | Query (descending) | `PK = CUSTOMER#<id>`, `SK begins_with ORDER#` |

## 4. What got easier / what got harder

**Easier**
- …

**Harder**
- …

**Still unsure about**
- …
