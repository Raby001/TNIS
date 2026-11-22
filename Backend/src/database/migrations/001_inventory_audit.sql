-- Apply once, after approval, using psql -X -v ON_ERROR_STOP=1 -f <this-file>
-- against the existing TNIS database. Requires the existing public inventory tables.
-- Run as a trusted migration owner with TRIGGER rights. If the API uses a separate
-- login, grant that role SELECT on public.audit_logs only. Keep function/table
-- ownership and DDL rights with a trusted operator. No business rows are rewritten.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL search_path = pg_catalog;

CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    username text NOT NULL,
    action text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    description text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX audit_logs_time_idx ON public.audit_logs (created_at DESC, id DESC);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX audit_logs_user_idx ON public.audit_logs (user_id, created_at DESC);

CREATE FUNCTION public.tnis_reject_audit_change() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
    RAISE EXCEPTION 'Audit history is append-only' USING ERRCODE = '42501';
END;
$$;

CREATE TRIGGER audit_logs_immutable BEFORE UPDATE OR DELETE OR TRUNCATE
ON public.audit_logs FOR EACH STATEMENT EXECUTE FUNCTION public.tnis_reject_audit_change();

CREATE FUNCTION public.tnis_audit_inventory() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE
    actor uuid := nullif(current_setting('tnis.actor_id', true), '')::uuid;
    actor_name text;
    verb text := CASE TG_OP WHEN 'INSERT' THEN 'CREATE' ELSE TG_OP END;
    before_row jsonb;
    after_row jsonb;
    before_values jsonb := '{}';
    after_values jsonb := '{}';
    field text;
    record_id uuid;
BEGIN
    IF actor IS NULL THEN
        -- Standalone seed scripts and direct SQL have a database identity only.
        actor_name := 'db:' || session_user;
    ELSE
        actor_name := nullif(current_setting('tnis.username', true), '');
    END IF;
    IF TG_OP <> 'INSERT' THEN before_row := to_jsonb(OLD); END IF;
    IF TG_OP <> 'DELETE' THEN after_row := to_jsonb(NEW); END IF;
    IF TG_OP = 'UPDATE' AND (before_row - 'updated_at') = (after_row - 'updated_at') THEN
        RETURN NULL;
    END IF;

    record_id := (coalesce(after_row, before_row) ->> TG_ARGV[0])::uuid;
    -- Only explicitly approved fields leave this function. The primary key is
    -- already in entity_id. Updates include just the changed, permitted fields.
    FOREACH field IN ARRAY TG_ARGV[1:TG_NARGS-1] LOOP
        IF TG_OP = 'UPDATE' AND (before_row -> field) IS NOT DISTINCT FROM (after_row -> field) THEN
            CONTINUE;
        END IF;
        IF TG_OP <> 'INSERT' THEN
            before_values := before_values || jsonb_build_object(field, before_row -> field);
        END IF;
        IF TG_OP <> 'DELETE' THEN
            after_values := after_values || jsonb_build_object(field, after_row -> field);
        END IF;
    END LOOP;

    INSERT INTO public.audit_logs
        (user_id, username, action, entity_type, entity_id, description, old_values, new_values)
    VALUES
        (actor, actor_name, verb, TG_TABLE_NAME, record_id, verb || ' ' || TG_TABLE_NAME,
         CASE WHEN TG_OP <> 'INSERT' THEN before_values END,
         CASE WHEN TG_OP <> 'DELETE' THEN after_values END);
    RETURN NULL;
END;
$$;

REVOKE ALL ON public.audit_logs FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tnis_audit_inventory() FROM PUBLIC;

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.sites
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'code', 'name', 'city_id', 'elevation');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'code', 'name', 'site_id', 'asset_type_id', 'lifecycle_status_id', 'condition_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_cables
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'cable_type_id', 'core_count_id', 'installation_method_id', 'segment_type_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.cable_types
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'code', 'name');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.buildings
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'site_id', 'code', 'name');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_cores
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_cable_id', 'core_number', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_cable_connections
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_cable_id', 'site_id', 'asset_id', 'target_type', 'connection_role', 'sequence');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_cable_installation_segments
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_cable_id', 'from_connection_id', 'to_connection_id', 'installation_method_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_splices
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'splice_closure_port_a_id', 'splice_closure_port_b_id', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.field_observations
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'status', 'converted_asset_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.towers
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'height_m', 'maximum_load');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.naps
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'capacity');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.lcps
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'splitter_capacity');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.manholes
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'depth_m');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.optical_splitters
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'parent_asset_id', 'splitter_ratio_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.optical_splitter_ports
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'optical_splitter_id', 'port_number');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.occ_ports
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'occ_asset_id', 'port_number');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.router_ports
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'router_asset_id', 'port_number');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_core_occ_port_connections
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_core_id', 'fiber_core_side', 'occ_port_id', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_core_onu_connections
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_core_id', 'fiber_core_side', 'onu_asset_id', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_core_router_port_connections
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_core_id', 'fiber_core_side', 'router_port_id', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_core_splice_closure_port_connections
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_core_id', 'fiber_core_side', 'splice_closure_port_id', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.fiber_core_splitter_connections
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'fiber_core_id', 'fiber_core_side', 'optical_splitter_port_id', 'status_id');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.racks
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'building_id', 'code');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.routers
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'rack_id', 'port_count', 'used_port_count');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.occs
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'portCount', 'usedPortCount');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.splice_closures
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'capacity');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.splice_closure_ports
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('id', 'splice_closure_id', 'port_number');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.onus
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'download_speed_mbps', 'upload_speed_mbps');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.poles
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'height_m');

CREATE TRIGGER tnis_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.handholes
FOR EACH ROW EXECUTE FUNCTION public.tnis_audit_inventory('asset_id', 'cover_type');

COMMIT;
