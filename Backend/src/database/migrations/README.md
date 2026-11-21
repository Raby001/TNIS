# Apply the TNIS inventory audit migration

Run this migration once, after approval, against an **existing TNIS PostgreSQL database**. It creates `public.audit_logs` and attaches triggers to 31 inventory tables so future changes are recorded. A fresh Git clone contains the SQL file. You still need access to a database with the TNIS base schema.

## 1. Confirm the target and credentials

Ask the database owner for the host, port, database name, migration login and any required SSL settings. The target needs PostGIS and the 31 `public` tables named in [001_inventory_audit.sql](001_inventory_audit.sql). The migration login needs permission to create tables and functions in `public` and install triggers on those inventory tables. Have the PostgreSQL `psql` client available.

TNIS reads `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD`. Set the port explicitly when configuring the backend. Its default is `5433`, while the repository's Docker Compose file publishes `5431` on the host.

From the **repository root**, set the matching connection settings for `psql` in your shell. Replace every placeholder. Use the approved migration login, which may differ from the backend login. Let `psql` prompt for its password or use your local PostgreSQL password file.

```bash
export PGHOST='<confirmed-host>'
export PGPORT='<confirmed-port>'
export PGDATABASE='<existing-tnis-database>'
export PGUSER='<migration-login>'
```

Check the connection and schema with this read-only command:

```bash
psql -X -v ON_ERROR_STOP=1 <<'SQL'
\conninfo
SELECT current_database(), current_user,
       (SELECT extversion FROM pg_extension WHERE extname = 'postgis') AS postgis,
       to_regclass('public.sites') AS sites,
       to_regclass('public.assets') AS assets,
       to_regclass('public.audit_logs') AS existing_audit_table;
SQL
```

Confirm the database and login with the owner. Expect a PostGIS version, both inventory tables, and an empty `existing_audit_table` value. The two inventory tables are a quick check. If the base schema is incomplete or the audit table already exists, review the database state before proceeding.

## 2. Apply once

Use a deployment window that allows brief locks on the inventory tables. With the same shell settings and the owner's approval, run:

```bash
psql -X -v ON_ERROR_STOP=1 -f Backend/src/database/migrations/001_inventory_audit.sql
```

A successful run ends with `COMMIT`. The script uses one transaction and a five-second lock timeout. If it fails, the transaction rolls back. Resolve the reported error before retrying.

## 3. Verify the installation

Run these read-only checks in the same shell:

```bash
psql -X -v ON_ERROR_STOP=1 <<'SQL'
SELECT to_regclass('public.audit_logs') AS audit_table;

SELECT count(*) AS enabled_inventory_triggers
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND t.tgname = 'tnis_inventory_audit'
  AND t.tgfoid = 'public.tnis_audit_inventory()'::regprocedure
  AND t.tgenabled IN ('O', 'A');

SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.audit_logs'::regclass
  AND tgname = 'audit_logs_immutable'
  AND tgenabled IN ('O', 'A');
SQL
```

Expect `audit_logs`, **31** enabled inventory triggers, and one `audit_logs_immutable` trigger. If the backend uses a separate database login, have the owner grant it `SELECT` on `public.audit_logs` before deploying the updated backend. An empty history is expected until the first audited inventory change.
