-- Optional psql verification after approved deployment in a test environment.
-- Exercises the real cable_types trigger without altering any existing row.
-- The inner exception block is a savepoint. The outer transaction never commits.
\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
    fixture uuid := gen_random_uuid();
BEGIN
    BEGIN
        INSERT INTO public.cable_types (id, code, name)
        VALUES (fixture, fixture::text, 'Audit rollback fixture');
        IF NOT EXISTS (SELECT FROM public.audit_logs WHERE entity_id = fixture AND action = 'CREATE') THEN
            RAISE EXCEPTION 'Missing audit row inside transaction';
        END IF;
        RAISE EXCEPTION USING ERRCODE = 'Z0001', MESSAGE = 'rollback fixture';
    EXCEPTION WHEN SQLSTATE 'Z0001' THEN
        NULL;
    END;
    IF EXISTS (SELECT FROM public.audit_logs WHERE entity_id = fixture)
        OR EXISTS (SELECT FROM public.cable_types WHERE id = fixture) THEN
        RAISE EXCEPTION 'Rollback left inventory or audit data';
    END IF;
END;
$$;
ROLLBACK;
