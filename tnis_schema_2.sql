--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg110+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger;


--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger_data;


--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA topology;


--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: fiber_cable_connections_connection_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_cable_connections_connection_role_enum AS ENUM (
    'START',
    'MIDDLE',
    'END'
);


--
-- Name: fiber_cable_connections_target_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_cable_connections_target_type_enum AS ENUM (
    'ASSET',
    'SITE'
);


--
-- Name: fiber_core_occ_port_connections_fiber_core_side_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_core_occ_port_connections_fiber_core_side_enum AS ENUM (
    'START',
    'END'
);


--
-- Name: fiber_core_onu_connections_fiber_core_side_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_core_onu_connections_fiber_core_side_enum AS ENUM (
    'START',
    'END'
);


--
-- Name: fiber_core_router_port_connections_fiber_core_side_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_core_router_port_connections_fiber_core_side_enum AS ENUM (
    'START',
    'END'
);


--
-- Name: fiber_core_side_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_core_side_enum AS ENUM (
    'START',
    'END'
);


--
-- Name: fiber_core_splitter_connections_fiber_core_side_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fiber_core_splitter_connections_fiber_core_side_enum AS ENUM (
    'START',
    'END'
);


--
-- Name: field_observations_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.field_observations_status_enum AS ENUM (
    'OPEN',
    'CONVERTED',
    'CANCELLED'
);


--
-- Name: optical_splitter_ports_port_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.optical_splitter_ports_port_type_enum AS ENUM (
    'INPUT',
    'OUTPUT'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_code_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_code_sequences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    region_code character varying(4) NOT NULL,
    last_sequence integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    asset_type_id uuid NOT NULL
);


--
-- Name: asset_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    qualifier character varying(20) NOT NULL,
    description text,
    geometry_type character varying(20) NOT NULL,
    topology_mode character varying(20) DEFAULT 'PHYSICAL'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    asset_tag character varying(100),
    serial_number character varying(100),
    purchase_date date,
    installation_date date,
    warrenty_start date,
    warrenty_end date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    site_id uuid NOT NULL,
    asset_type_id uuid NOT NULL,
    status_id uuid NOT NULL,
    geometry public.geometry(Geometry,4326),
    created_by uuid,
    updated_by uuid
);


--
-- Name: buildings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buildings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(200) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    site_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cable_core_counts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cable_core_counts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    core_count integer NOT NULL,
    display_code character varying(10) NOT NULL,
    suggested_color_name character varying(50) NOT NULL,
    suggested_hex character varying(7) NOT NULL,
    confirm_required boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cable_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cable_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    province_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_code character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    phone character varying(50),
    email character varying(150),
    address text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_cable_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_cable_connections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_cable_id uuid NOT NULL,
    asset_id uuid,
    site_id uuid,
    target_type public.fiber_cable_connections_target_type_enum,
    connection_role public.fiber_cable_connections_connection_role_enum NOT NULL,
    sequence integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_cable_installation_segments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_cable_installation_segments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_cable_id uuid NOT NULL,
    from_connection_id uuid NOT NULL,
    to_connection_id uuid NOT NULL,
    installation_method_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_cables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_cables (
    asset_id uuid NOT NULL,
    cable_type_id uuid NOT NULL,
    core_count_id uuid NOT NULL,
    installation_method_id uuid NOT NULL,
    segment_type_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_occ_port_connection_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_occ_port_connection_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_occ_port_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_occ_port_connections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_core_id uuid NOT NULL,
    fiber_core_side public.fiber_core_occ_port_connections_fiber_core_side_enum NOT NULL,
    occ_port_id uuid NOT NULL,
    status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_onu_connection_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_onu_connection_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_onu_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_onu_connections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_core_id uuid NOT NULL,
    fiber_core_side public.fiber_core_onu_connections_fiber_core_side_enum NOT NULL,
    onu_asset_id uuid NOT NULL,
    status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_router_port_connection_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_router_port_connection_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_router_port_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_router_port_connections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_core_id uuid NOT NULL,
    fiber_core_side public.fiber_core_router_port_connections_fiber_core_side_enum NOT NULL,
    router_port_id uuid NOT NULL,
    status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_splice_closure_port_connection_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_splice_closure_port_connection_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: fiber_core_splice_closure_port_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_splice_closure_port_connections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_core_id uuid NOT NULL,
    fiber_core_side public.fiber_core_side_enum NOT NULL,
    splice_closure_port_id uuid NOT NULL,
    status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_splitter_connection_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_splitter_connection_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_splitter_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_splitter_connections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_core_id uuid NOT NULL,
    fiber_core_side public.fiber_core_splitter_connections_fiber_core_side_enum NOT NULL,
    optical_splitter_port_id uuid NOT NULL,
    status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_core_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(50) NOT NULL,
    color_name character varying(50) NOT NULL,
    color_hex character varying(7) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_cores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_cores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fiber_cable_id uuid NOT NULL,
    status_id uuid NOT NULL,
    core_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_segment_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_segment_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_splice_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_splice_statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: fiber_splices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiber_splices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    splice_closure_port_a_id uuid NOT NULL,
    splice_closure_port_b_id uuid NOT NULL,
    status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: field_observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_observations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    geometry public.geometry(Point,4326) NOT NULL,
    status public.field_observations_status_enum DEFAULT 'OPEN'::public.field_observations_status_enum NOT NULL,
    converted_asset_id uuid,
    created_by uuid NOT NULL,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: handholes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.handholes (
    asset_id uuid NOT NULL,
    size character varying(100),
    material character varying(100),
    cover_type character varying(100)
);


--
-- Name: hierarchy_code_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hierarchy_code_sequences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parent_code character varying(255) NOT NULL,
    prefix character varying(10) NOT NULL,
    last_number integer DEFAULT 0 NOT NULL
);


--
-- Name: installation_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installation_methods (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    line_style character varying(20) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lcps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lcps (
    asset_id uuid NOT NULL,
    splitter_capacity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: manholes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manholes (
    asset_id uuid NOT NULL,
    depth_m numeric(8,2),
    material character varying(100),
    cover_type character varying(100)
);


--
-- Name: naps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.naps (
    asset_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    capacity integer NOT NULL
);


--
-- Name: occ_ports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occ_ports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    occ_asset_id uuid NOT NULL,
    port_number integer NOT NULL
);


--
-- Name: occs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occs (
    asset_id uuid NOT NULL,
    "portCount" integer,
    "usedPortCount" integer DEFAULT 0
);


--
-- Name: onus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onus (
    asset_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    mac_address_onu character varying(17),
    mac_address_router character varying(17),
    pon_type character varying(50),
    download_speed_mbps numeric,
    upload_speed_mbps numeric,
    data_allowance_gb numeric
);


--
-- Name: optical_splitter_ports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.optical_splitter_ports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    optical_splitter_id uuid NOT NULL,
    port_type public.optical_splitter_ports_port_type_enum NOT NULL,
    port_number integer NOT NULL
);


--
-- Name: optical_splitters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.optical_splitters (
    asset_id uuid NOT NULL,
    parent_asset_id uuid,
    splitter_ratio_id uuid NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: poles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.poles (
    asset_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    height_m numeric(8,2),
    material character varying(100),
    owner character varying(150),
    foundation character varying(100)
);


--
-- Name: provinces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provinces (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    geometry public.geometry(Point,4326)
);


--
-- Name: racks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.racks (
    asset_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(250) NOT NULL,
    building_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: router_ports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.router_ports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    router_asset_id uuid NOT NULL,
    port_number integer NOT NULL
);


--
-- Name: routers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routers (
    asset_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(150) NOT NULL,
    rack_id uuid,
    port_count integer NOT NULL,
    used_port_count integer DEFAULT 0 NOT NULL
);


--
-- Name: sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sites (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    city_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    address text,
    elevation numeric(8,2),
    description text,
    geometry public.geometry(Point,4326),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: splice_closure_ports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.splice_closure_ports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    splice_closure_id uuid NOT NULL,
    port_number integer NOT NULL
);


--
-- Name: splice_closures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.splice_closures (
    asset_id uuid NOT NULL,
    closure_type character varying(50) NOT NULL,
    capacity integer
);


--
-- Name: splitter_ratios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.splitter_ratios (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ratio character varying(20) NOT NULL,
    input_count integer NOT NULL,
    output_count integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statuses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: towers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.towers (
    asset_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    height_m numeric(8,2),
    owner character varying(150),
    foundation character varying(100),
    maximum_load numeric(10,2),
    occupied_space numeric(10,2),
    available_space numeric(10,2),
    power character varying(100),
    generator boolean DEFAULT false NOT NULL,
    battery boolean DEFAULT false NOT NULL,
    gps boolean DEFAULT false NOT NULL,
    lease_expiry date
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying(150),
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    role_id uuid NOT NULL,
    province_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fiber_core_splice_closure_port_connections PK_00ed28f5e7cecc255186605f71b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connections
    ADD CONSTRAINT "PK_00ed28f5e7cecc255186605f71b" PRIMARY KEY (id);


--
-- Name: fiber_core_occ_port_connections PK_019e954c5ad44c1c96a95380f8c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_occ_port_connections
    ADD CONSTRAINT "PK_019e954c5ad44c1c96a95380f8c" PRIMARY KEY (id);


--
-- Name: fiber_core_splitter_connection_statuses PK_100a86d3c3489a66f8ef5a98412; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splitter_connection_statuses
    ADD CONSTRAINT "PK_100a86d3c3489a66f8ef5a98412" PRIMARY KEY (id);


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: role_permissions PK_25d24010f53bb80b78e412c9656; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY (role_id, permission_id);


--
-- Name: fiber_core_occ_port_connection_statuses PK_25dcf0c7881fe2c156630fddea3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_occ_port_connection_statuses
    ADD CONSTRAINT "PK_25dcf0c7881fe2c156630fddea3" PRIMARY KEY (id);


--
-- Name: optical_splitters PK_25edc5892e23994e42abd5ccd9e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitters
    ADD CONSTRAINT "PK_25edc5892e23994e42abd5ccd9e" PRIMARY KEY (asset_id);


--
-- Name: routers PK_2a14545472191c3f52160571917; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT "PK_2a14545472191c3f52160571917" PRIMARY KEY (asset_id);


--
-- Name: asset_types PK_2cf0314bcc4351b7f2827d57edb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT "PK_2cf0314bcc4351b7f2827d57edb" PRIMARY KEY (id);


--
-- Name: provinces PK_2e4260eedbcad036ec53222e0c7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT "PK_2e4260eedbcad036ec53222e0c7" PRIMARY KEY (id);


--
-- Name: statuses PK_2fd3770acdb67736f1a3e3d5399; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT "PK_2fd3770acdb67736f1a3e3d5399" PRIMARY KEY (id);


--
-- Name: splice_closure_ports PK_34739b291a34031281d4e86342d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splice_closure_ports
    ADD CONSTRAINT "PK_34739b291a34031281d4e86342d" PRIMARY KEY (id);


--
-- Name: fiber_core_onu_connection_statuses PK_3b37c5d7a143714f13ba5e13629; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_onu_connection_statuses
    ADD CONSTRAINT "PK_3b37c5d7a143714f13ba5e13629" PRIMARY KEY (id);


--
-- Name: fiber_core_splice_closure_port_connection_statuses PK_3efa1e3c6c905db3e54c7cc8afa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connection_statuses
    ADD CONSTRAINT "PK_3efa1e3c6c905db3e54c7cc8afa" PRIMARY KEY (id);


--
-- Name: splice_closures PK_403f13111d4556503ad29076129; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splice_closures
    ADD CONSTRAINT "PK_403f13111d4556503ad29076129" PRIMARY KEY (asset_id);


--
-- Name: cable_types PK_423bb5cb731d2c46d5c2f3b1055; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cable_types
    ADD CONSTRAINT "PK_423bb5cb731d2c46d5c2f3b1055" PRIMARY KEY (id);


--
-- Name: cities PK_4762ffb6e5d198cfec5606bc11e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY (id);


--
-- Name: fiber_core_splitter_connections PK_4887a53c76bfff2740503db6e2b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splitter_connections
    ADD CONSTRAINT "PK_4887a53c76bfff2740503db6e2b" PRIMARY KEY (id);


--
-- Name: sites PK_4f5eccb1dfde10c9170502595a7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY (id);


--
-- Name: naps PK_51cc8ea7da8e862acffa072f4d6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.naps
    ADD CONSTRAINT "PK_51cc8ea7da8e862acffa072f4d6" PRIMARY KEY (asset_id);


--
-- Name: occ_ports PK_57d2ff3788c46f7c0416c39b2ea; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occ_ports
    ADD CONSTRAINT "PK_57d2ff3788c46f7c0416c39b2ea" PRIMARY KEY (id);


--
-- Name: onus PK_5b6725e76952b44220faad5065e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onus
    ADD CONSTRAINT "PK_5b6725e76952b44220faad5065e" PRIMARY KEY (asset_id);


--
-- Name: occs PK_5e7757e3de49b5f0ae23d9b489d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occs
    ADD CONSTRAINT "PK_5e7757e3de49b5f0ae23d9b489d" PRIMARY KEY (asset_id);


--
-- Name: optical_splitter_ports PK_61711cf1f2b7226f45702130a5f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitter_ports
    ADD CONSTRAINT "PK_61711cf1f2b7226f45702130a5f" PRIMARY KEY (id);


--
-- Name: cable_core_counts PK_64362dd91c4fc32dcf4810ba6bd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cable_core_counts
    ADD CONSTRAINT "PK_64362dd91c4fc32dcf4810ba6bd" PRIMARY KEY (id);


--
-- Name: fiber_core_onu_connections PK_6930aa418f145da989475d26085; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_onu_connections
    ADD CONSTRAINT "PK_6930aa418f145da989475d26085" PRIMARY KEY (id);


--
-- Name: fiber_splices PK_6a11555b149c4712f29f5f2e9aa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_splices
    ADD CONSTRAINT "PK_6a11555b149c4712f29f5f2e9aa" PRIMARY KEY (id);


--
-- Name: fiber_cables PK_6d2982d1c9dd2340a553b7d6874; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cables
    ADD CONSTRAINT "PK_6d2982d1c9dd2340a553b7d6874" PRIMARY KEY (asset_id);


--
-- Name: fiber_cores PK_6ddd0d4ab80f179d85c0be7a2d1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cores
    ADD CONSTRAINT "PK_6ddd0d4ab80f179d85c0be7a2d1" PRIMARY KEY (id);


--
-- Name: fiber_cable_installation_segments PK_6e55a559daa357ecb3799be38fa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_installation_segments
    ADD CONSTRAINT "PK_6e55a559daa357ecb3799be38fa" PRIMARY KEY (id);


--
-- Name: racks PK_70dad9803ac4f74c3e0e00245e6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT "PK_70dad9803ac4f74c3e0e00245e6" PRIMARY KEY (asset_id);


--
-- Name: asset_code_sequences PK_72ef2f03e410aea4e7c2c4fd75e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_code_sequences
    ADD CONSTRAINT "PK_72ef2f03e410aea4e7c2c4fd75e" PRIMARY KEY (id);


--
-- Name: fiber_splice_statuses PK_7b3c85282ab211dd68d27903dbf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_splice_statuses
    ADD CONSTRAINT "PK_7b3c85282ab211dd68d27903dbf" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_7d8bee0204106019488c4c50ffa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);


--
-- Name: fiber_core_statuses PK_7fdfef7fa3bdc621644e4dcc151; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_statuses
    ADD CONSTRAINT "PK_7fdfef7fa3bdc621644e4dcc151" PRIMARY KEY (id);


--
-- Name: installation_methods PK_8dde566e2962bf587fea61ddca9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_methods
    ADD CONSTRAINT "PK_8dde566e2962bf587fea61ddca9" PRIMARY KEY (id);


--
-- Name: fiber_core_router_port_connection_statuses PK_8ec1224b3fe58c28b63e98a19c0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_router_port_connection_statuses
    ADD CONSTRAINT "PK_8ec1224b3fe58c28b63e98a19c0" PRIMARY KEY (id);


--
-- Name: permissions PK_920331560282b8bd21bb02290df; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY (id);


--
-- Name: field_observations PK_96e39d47fa56c087ce393e3e509; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_observations
    ADD CONSTRAINT "PK_96e39d47fa56c087ce393e3e509" PRIMARY KEY (id);


--
-- Name: towers PK_9f6305c14343ac0ab8044920672; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.towers
    ADD CONSTRAINT "PK_9f6305c14343ac0ab8044920672" PRIMARY KEY (asset_id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: poles PK_b56c09f5644a45d5b33bb684dc3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT "PK_b56c09f5644a45d5b33bb684dc3" PRIMARY KEY (asset_id);


--
-- Name: fiber_cable_connections PK_b99a79e0f6b0f3a75aff38a8c84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_connections
    ADD CONSTRAINT "PK_b99a79e0f6b0f3a75aff38a8c84" PRIMARY KEY (id);


--
-- Name: buildings PK_bc65c1acce268c383e41a69003a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT "PK_bc65c1acce268c383e41a69003a" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: handholes PK_cb5ce214d7ab33d5b036d7337e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handholes
    ADD CONSTRAINT "PK_cb5ce214d7ab33d5b036d7337e2" PRIMARY KEY (asset_id);


--
-- Name: router_ports PK_d061a918a19b747b36fb760debf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.router_ports
    ADD CONSTRAINT "PK_d061a918a19b747b36fb760debf" PRIMARY KEY (id);


--
-- Name: lcps PK_d19d80ed8ce2cbff3c8979b1e9a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lcps
    ADD CONSTRAINT "PK_d19d80ed8ce2cbff3c8979b1e9a" PRIMARY KEY (asset_id);


--
-- Name: assets PK_da96729a8b113377cfb6a62439c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY (id);


--
-- Name: fiber_segment_types PK_db5473c6bb1ea233a98d9b54f8a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_segment_types
    ADD CONSTRAINT "PK_db5473c6bb1ea233a98d9b54f8a" PRIMARY KEY (id);


--
-- Name: hierarchy_code_sequences PK_de41343c503e4b43b6a9f314da9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hierarchy_code_sequences
    ADD CONSTRAINT "PK_de41343c503e4b43b6a9f314da9" PRIMARY KEY (id);


--
-- Name: fiber_core_router_port_connections PK_e134a2e672ba8394ee41bcb8308; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_router_port_connections
    ADD CONSTRAINT "PK_e134a2e672ba8394ee41bcb8308" PRIMARY KEY (id);


--
-- Name: splitter_ratios PK_f1efd2638e5e31077d8c75e2ccc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splitter_ratios
    ADD CONSTRAINT "PK_f1efd2638e5e31077d8c75e2ccc" PRIMARY KEY (id);


--
-- Name: manholes PK_f259f74be137ce699c58c998d3c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manholes
    ADD CONSTRAINT "PK_f259f74be137ce699c58c998d3c" PRIMARY KEY (asset_id);


--
-- Name: statuses UQ_037e43ea842b18ce4e5f4dcfd06; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT "UQ_037e43ea842b18ce4e5f4dcfd06" UNIQUE (name);


--
-- Name: occ_ports UQ_18006db3f4099cbf25a82690c1a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occ_ports
    ADD CONSTRAINT "UQ_18006db3f4099cbf25a82690c1a" UNIQUE (occ_asset_id, port_number);


--
-- Name: fiber_core_splice_closure_port_connections UQ_1dad156caee5df691631082aac7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connections
    ADD CONSTRAINT "UQ_1dad156caee5df691631082aac7" UNIQUE (fiber_core_id, fiber_core_side, splice_closure_port_id);


--
-- Name: fiber_splice_statuses UQ_3062ea1976e8bc4fd8f890442b7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_splice_statuses
    ADD CONSTRAINT "UQ_3062ea1976e8bc4fd8f890442b7" UNIQUE (code);


--
-- Name: buildings UQ_314c7f29d7f9121e116ccc29b82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT "UQ_314c7f29d7f9121e116ccc29b82" UNIQUE (code);


--
-- Name: fiber_cores UQ_33b332da11c5134a9c5d790f0c2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cores
    ADD CONSTRAINT "UQ_33b332da11c5134a9c5d790f0c2" UNIQUE (fiber_cable_id, core_number);


--
-- Name: splitter_ratios UQ_3c2637753327c12c80b65451e75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splitter_ratios
    ADD CONSTRAINT "UQ_3c2637753327c12c80b65451e75" UNIQUE (ratio);


--
-- Name: fiber_segment_types UQ_3d0a6f9f4fef8fc4b3e90e9ce48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_segment_types
    ADD CONSTRAINT "UQ_3d0a6f9f4fef8fc4b3e90e9ce48" UNIQUE (code);


--
-- Name: router_ports UQ_3fddecada79f4613c645c80ac65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.router_ports
    ADD CONSTRAINT "UQ_3fddecada79f4613c645c80ac65" UNIQUE (router_asset_id, port_number);


--
-- Name: installation_methods UQ_4962b3081627ee96249edfa12c8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_methods
    ADD CONSTRAINT "UQ_4962b3081627ee96249edfa12c8" UNIQUE (name);


--
-- Name: fiber_core_statuses UQ_4983d258d6f15e1f6ca623193d2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_statuses
    ADD CONSTRAINT "UQ_4983d258d6f15e1f6ca623193d2" UNIQUE (code);


--
-- Name: cable_core_counts UQ_511c54b3ea778503dc8d4344a14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cable_core_counts
    ADD CONSTRAINT "UQ_511c54b3ea778503dc8d4344a14" UNIQUE (display_code);


--
-- Name: asset_code_sequences UQ_5147dfb99eb1663752140054f8a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_code_sequences
    ADD CONSTRAINT "UQ_5147dfb99eb1663752140054f8a" UNIQUE (asset_type_id, region_code);


--
-- Name: onus UQ_5b6725e76952b44220faad5065e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onus
    ADD CONSTRAINT "UQ_5b6725e76952b44220faad5065e" UNIQUE (asset_id);


--
-- Name: provinces UQ_5c78199072262966fb68b718095; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT "UQ_5c78199072262966fb68b718095" UNIQUE (name);


--
-- Name: asset_types UQ_637155978e16c108cd4fc721b78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT "UQ_637155978e16c108cd4fc721b78" UNIQUE (name);


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: fiber_core_splice_closure_port_connection_statuses UQ_67a22a4eca11593bbab0faa74bf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connection_statuses
    ADD CONSTRAINT "UQ_67a22a4eca11593bbab0faa74bf" UNIQUE (code);


--
-- Name: cable_core_counts UQ_6eb7f359cf814ce26299db0b05d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cable_core_counts
    ADD CONSTRAINT "UQ_6eb7f359cf814ce26299db0b05d" UNIQUE (core_count);


--
-- Name: cable_types UQ_7a21f9696caa1344d4ad32c11db; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cable_types
    ADD CONSTRAINT "UQ_7a21f9696caa1344d4ad32c11db" UNIQUE (code);


--
-- Name: routers UQ_7a332548914b0496463b50247e1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT "UQ_7a332548914b0496463b50247e1" UNIQUE (code);


--
-- Name: fiber_core_statuses UQ_7ddea15d53dcdd764680874ec3c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_statuses
    ADD CONSTRAINT "UQ_7ddea15d53dcdd764680874ec3c" UNIQUE (name);


--
-- Name: optical_splitter_ports UQ_8244f3bc61b29e4097710c3843f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitter_ports
    ADD CONSTRAINT "UQ_8244f3bc61b29e4097710c3843f" UNIQUE (optical_splitter_id, port_type, port_number);


--
-- Name: permissions UQ_8dad765629e83229da6feda1c1d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE (code);


--
-- Name: assets UQ_9da03d06e2af9f607159e884269; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "UQ_9da03d06e2af9f607159e884269" UNIQUE (serial_number);


--
-- Name: fiber_core_router_port_connection_statuses UQ_a35cc044d2bab39221a67458126; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_router_port_connection_statuses
    ADD CONSTRAINT "UQ_a35cc044d2bab39221a67458126" UNIQUE (code);


--
-- Name: splice_closure_ports UQ_a42c8021aed5cd335e955aaae07; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splice_closure_ports
    ADD CONSTRAINT "UQ_a42c8021aed5cd335e955aaae07" UNIQUE (splice_closure_id, port_number);


--
-- Name: racks UQ_a6c59100a21b0d4dfd737d9219a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT "UQ_a6c59100a21b0d4dfd737d9219a" UNIQUE (code);


--
-- Name: customers UQ_acd5656a9fa7cf04125f0848165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "UQ_acd5656a9fa7cf04125f0848165" UNIQUE (customer_code);


--
-- Name: assets UQ_bff60c1b89bff7edff592d85ea4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "UQ_bff60c1b89bff7edff592d85ea4" UNIQUE (code);


--
-- Name: fiber_core_onu_connection_statuses UQ_d09dc524331d907a4ca4484bc93; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_onu_connection_statuses
    ADD CONSTRAINT "UQ_d09dc524331d907a4ca4484bc93" UNIQUE (code);


--
-- Name: fiber_cable_installation_segments UQ_d55651037423e9bd0b5ec227b35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_installation_segments
    ADD CONSTRAINT "UQ_d55651037423e9bd0b5ec227b35" UNIQUE (fiber_cable_id, from_connection_id, to_connection_id);


--
-- Name: sites UQ_dde6621eadc0c9c9621360ec668; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT "UQ_dde6621eadc0c9c9621360ec668" UNIQUE (code);


--
-- Name: fiber_core_occ_port_connection_statuses UQ_e68534a050543b0899913209e8a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_occ_port_connection_statuses
    ADD CONSTRAINT "UQ_e68534a050543b0899913209e8a" UNIQUE (code);


--
-- Name: fiber_core_splitter_connection_statuses UQ_e9a86fa1e293430e670e7fbef07; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splitter_connection_statuses
    ADD CONSTRAINT "UQ_e9a86fa1e293430e670e7fbef07" UNIQUE (code);


--
-- Name: provinces UQ_f4b684af62d5cb3aa174f6b9b8a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT "UQ_f4b684af62d5cb3aa174f6b9b8a" UNIQUE (code);


--
-- Name: asset_types UQ_fc6f9118721dda81c68545f4496; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT "UQ_fc6f9118721dda81c68545f4496" UNIQUE (qualifier);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: fiber_cable_connections UQ_fiber_cable_connection_sequence; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_connections
    ADD CONSTRAINT "UQ_fiber_cable_connection_sequence" UNIQUE (fiber_cable_id, sequence);


--
-- Name: IDX_00137de6b6b783f9875bf621cb; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_00137de6b6b783f9875bf621cb" ON public.hierarchy_code_sequences USING btree (parent_code, prefix);


--
-- Name: asset_code_sequences FK_005fd7706c72e9fc3bc20bea845; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_code_sequences
    ADD CONSTRAINT "FK_005fd7706c72e9fc3bc20bea845" FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id);


--
-- Name: fiber_cables FK_0209206c348b9391c660aebfca1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cables
    ADD CONSTRAINT "FK_0209206c348b9391c660aebfca1" FOREIGN KEY (core_count_id) REFERENCES public.cable_core_counts(id);


--
-- Name: routers FK_06e207a747bb250dbe886c319c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT "FK_06e207a747bb250dbe886c319c2" FOREIGN KEY (rack_id) REFERENCES public.racks(asset_id) ON DELETE RESTRICT;


--
-- Name: fiber_cable_installation_segments FK_099ad9c731771c4b48cde8b47e9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_installation_segments
    ADD CONSTRAINT "FK_099ad9c731771c4b48cde8b47e9" FOREIGN KEY (fiber_cable_id) REFERENCES public.fiber_cables(asset_id) ON DELETE CASCADE;


--
-- Name: fiber_core_router_port_connections FK_0aa887a751533aab3125eb31d6a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_router_port_connections
    ADD CONSTRAINT "FK_0aa887a751533aab3125eb31d6a" FOREIGN KEY (fiber_core_id) REFERENCES public.fiber_cores(id) ON DELETE CASCADE;


--
-- Name: fiber_core_router_port_connections FK_0ce3b99cf368d6e4d312962faa0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_router_port_connections
    ADD CONSTRAINT "FK_0ce3b99cf368d6e4d312962faa0" FOREIGN KEY (router_port_id) REFERENCES public.router_ports(id) ON DELETE CASCADE;


--
-- Name: optical_splitters FK_0ce8dda3d2f7614282af4e4879c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitters
    ADD CONSTRAINT "FK_0ce8dda3d2f7614282af4e4879c" FOREIGN KEY (splitter_ratio_id) REFERENCES public.splitter_ratios(id) ON DELETE RESTRICT;


--
-- Name: role_permissions FK_17022daf3f885f7d35423e9971e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions FK_178199805b901ccd220ab7740ec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: fiber_cable_connections FK_1a328f0c36bfc35e53dcb3114ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_connections
    ADD CONSTRAINT "FK_1a328f0c36bfc35e53dcb3114ce" FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE RESTRICT;


--
-- Name: fiber_core_router_port_connections FK_1ac28bace9211acfc3a13a889b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_router_port_connections
    ADD CONSTRAINT "FK_1ac28bace9211acfc3a13a889b2" FOREIGN KEY (status_id) REFERENCES public.fiber_core_router_port_connection_statuses(id) ON DELETE RESTRICT;


--
-- Name: fiber_cores FK_1d97d55f0fd91dc054cc4df6be9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cores
    ADD CONSTRAINT "FK_1d97d55f0fd91dc054cc4df6be9" FOREIGN KEY (status_id) REFERENCES public.fiber_core_statuses(id);


--
-- Name: optical_splitters FK_25edc5892e23994e42abd5ccd9e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitters
    ADD CONSTRAINT "FK_25edc5892e23994e42abd5ccd9e" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: buildings FK_27b2a341d0991054917b33aac73; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT "FK_27b2a341d0991054917b33aac73" FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE RESTRICT;


--
-- Name: fiber_core_occ_port_connections FK_289987d3bd7c67acd771633399f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_occ_port_connections
    ADD CONSTRAINT "FK_289987d3bd7c67acd771633399f" FOREIGN KEY (fiber_core_id) REFERENCES public.fiber_cores(id) ON DELETE CASCADE;


--
-- Name: routers FK_2a14545472191c3f52160571917; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT "FK_2a14545472191c3f52160571917" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: field_observations FK_2d64fc13b18f9d475b2ca67aede; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_observations
    ADD CONSTRAINT "FK_2d64fc13b18f9d475b2ca67aede" FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: fiber_core_splitter_connections FK_33a360dad4b86d053354465c57c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splitter_connections
    ADD CONSTRAINT "FK_33a360dad4b86d053354465c57c" FOREIGN KEY (status_id) REFERENCES public.fiber_core_splitter_connection_statuses(id) ON DELETE RESTRICT;


--
-- Name: assets FK_33ccc969d319ef2cb1d7c9eb4d3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "FK_33ccc969d319ef2cb1d7c9eb4d3" FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: optical_splitter_ports FK_396b399712b516009e68ac90f4c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitter_ports
    ADD CONSTRAINT "FK_396b399712b516009e68ac90f4c" FOREIGN KEY (optical_splitter_id) REFERENCES public.optical_splitters(asset_id) ON DELETE CASCADE;


--
-- Name: fiber_cable_installation_segments FK_3b5308cc5395b743dbec87d7ba7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_installation_segments
    ADD CONSTRAINT "FK_3b5308cc5395b743dbec87d7ba7" FOREIGN KEY (to_connection_id) REFERENCES public.fiber_cable_connections(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens FK_3ddc983c5f7bcf132fd8732c3f4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: splice_closures FK_403f13111d4556503ad29076129; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splice_closures
    ADD CONSTRAINT "FK_403f13111d4556503ad29076129" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: fiber_core_splice_closure_port_connections FK_452988c5949dd644f28c1d532b1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connections
    ADD CONSTRAINT "FK_452988c5949dd644f28c1d532b1" FOREIGN KEY (splice_closure_port_id) REFERENCES public.splice_closure_ports(id) ON DELETE CASCADE;


--
-- Name: fiber_cable_installation_segments FK_47580ec6a9d0003ab5aee0f8fb8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_installation_segments
    ADD CONSTRAINT "FK_47580ec6a9d0003ab5aee0f8fb8" FOREIGN KEY (installation_method_id) REFERENCES public.installation_methods(id) ON DELETE RESTRICT;


--
-- Name: fiber_core_splice_closure_port_connections FK_4d1aa16126014cf2e9561fddb3a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connections
    ADD CONSTRAINT "FK_4d1aa16126014cf2e9561fddb3a" FOREIGN KEY (status_id) REFERENCES public.fiber_core_splice_closure_port_connection_statuses(id);


--
-- Name: fiber_cable_installation_segments FK_4d20d15a7d13f9bc93c5d88a88a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_installation_segments
    ADD CONSTRAINT "FK_4d20d15a7d13f9bc93c5d88a88a" FOREIGN KEY (from_connection_id) REFERENCES public.fiber_cable_connections(id) ON DELETE CASCADE;


--
-- Name: fiber_cores FK_4dd8b659e8ea587fdd17c212bb5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cores
    ADD CONSTRAINT "FK_4dd8b659e8ea587fdd17c212bb5" FOREIGN KEY (fiber_cable_id) REFERENCES public.fiber_cables(asset_id) ON DELETE CASCADE;


--
-- Name: naps FK_51cc8ea7da8e862acffa072f4d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.naps
    ADD CONSTRAINT "FK_51cc8ea7da8e862acffa072f4d6" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: cities FK_52af18d505515614479e5c9f5e9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT "FK_52af18d505515614479e5c9f5e9" FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- Name: router_ports FK_54aa9a5ddcee55f390f8f2eebe4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.router_ports
    ADD CONSTRAINT "FK_54aa9a5ddcee55f390f8f2eebe4" FOREIGN KEY (router_asset_id) REFERENCES public.routers(asset_id) ON DELETE CASCADE;


--
-- Name: field_observations FK_57f97dfab6a1746f4a032385d65; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_observations
    ADD CONSTRAINT "FK_57f97dfab6a1746f4a032385d65" FOREIGN KEY (converted_asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- Name: users FK_58838300035602d7b58c5e60b04; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_58838300035602d7b58c5e60b04" FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE RESTRICT;


--
-- Name: onus FK_5b6725e76952b44220faad5065e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onus
    ADD CONSTRAINT "FK_5b6725e76952b44220faad5065e" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: occs FK_5e7757e3de49b5f0ae23d9b489d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occs
    ADD CONSTRAINT "FK_5e7757e3de49b5f0ae23d9b489d" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: fiber_core_onu_connections FK_61d1c5ba4cca45ab40b85bc8611; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_onu_connections
    ADD CONSTRAINT "FK_61d1c5ba4cca45ab40b85bc8611" FOREIGN KEY (status_id) REFERENCES public.fiber_core_onu_connection_statuses(id) ON DELETE RESTRICT;


--
-- Name: fiber_cables FK_6d2982d1c9dd2340a553b7d6874; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cables
    ADD CONSTRAINT "FK_6d2982d1c9dd2340a553b7d6874" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: racks FK_70dad9803ac4f74c3e0e00245e6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT "FK_70dad9803ac4f74c3e0e00245e6" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: fiber_core_onu_connections FK_7850a8602c54e828bf166dba21d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_onu_connections
    ADD CONSTRAINT "FK_7850a8602c54e828bf166dba21d" FOREIGN KEY (onu_asset_id) REFERENCES public.onus(asset_id) ON DELETE CASCADE;


--
-- Name: sites FK_803d5f9c03629f6edd5e7bac119; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT "FK_803d5f9c03629f6edd5e7bac119" FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: fiber_splices FK_82c21e035d5fd2e45934e514518; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_splices
    ADD CONSTRAINT "FK_82c21e035d5fd2e45934e514518" FOREIGN KEY (status_id) REFERENCES public.fiber_splice_statuses(id);


--
-- Name: assets FK_87fe53e206454bc6d9b3348621a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "FK_87fe53e206454bc6d9b3348621a" FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE RESTRICT;


--
-- Name: fiber_cables FK_9054cfe00af2c41728b925180b7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cables
    ADD CONSTRAINT "FK_9054cfe00af2c41728b925180b7" FOREIGN KEY (segment_type_id) REFERENCES public.fiber_segment_types(id) ON DELETE RESTRICT;


--
-- Name: fiber_cables FK_93b51ccfb54ab389af43e100c61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cables
    ADD CONSTRAINT "FK_93b51ccfb54ab389af43e100c61" FOREIGN KEY (installation_method_id) REFERENCES public.installation_methods(id);


--
-- Name: splice_closure_ports FK_93d568b7cfdc10a87bd7ec3ea92; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.splice_closure_ports
    ADD CONSTRAINT "FK_93d568b7cfdc10a87bd7ec3ea92" FOREIGN KEY (splice_closure_id) REFERENCES public.splice_closures(asset_id) ON DELETE CASCADE;


--
-- Name: towers FK_9f6305c14343ac0ab8044920672; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.towers
    ADD CONSTRAINT "FK_9f6305c14343ac0ab8044920672" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: users FK_a2cecd1a3531c0b041e29ba46e1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: occ_ports FK_aeb0db5e895ef4cbdfdfd983e75; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occ_ports
    ADD CONSTRAINT "FK_aeb0db5e895ef4cbdfdfd983e75" FOREIGN KEY (occ_asset_id) REFERENCES public.occs(asset_id) ON DELETE CASCADE;


--
-- Name: fiber_core_splitter_connections FK_b25dbd2c31b2b26210ac10d9a5c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splitter_connections
    ADD CONSTRAINT "FK_b25dbd2c31b2b26210ac10d9a5c" FOREIGN KEY (optical_splitter_port_id) REFERENCES public.optical_splitter_ports(id) ON DELETE CASCADE;


--
-- Name: fiber_cables FK_b32f41beb25ed8197b502311646; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cables
    ADD CONSTRAINT "FK_b32f41beb25ed8197b502311646" FOREIGN KEY (cable_type_id) REFERENCES public.cable_types(id);


--
-- Name: poles FK_b56c09f5644a45d5b33bb684dc3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT "FK_b56c09f5644a45d5b33bb684dc3" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: optical_splitters FK_b9491b672ec38e538daf13cf3a4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optical_splitters
    ADD CONSTRAINT "FK_b9491b672ec38e538daf13cf3a4" FOREIGN KEY (parent_asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- Name: fiber_core_occ_port_connections FK_bc37e1b376e8b7c5130e47b9660; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_occ_port_connections
    ADD CONSTRAINT "FK_bc37e1b376e8b7c5130e47b9660" FOREIGN KEY (occ_port_id) REFERENCES public.occ_ports(id) ON DELETE CASCADE;


--
-- Name: fiber_core_occ_port_connections FK_bdf71d7e1641684de788230a9f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_occ_port_connections
    ADD CONSTRAINT "FK_bdf71d7e1641684de788230a9f9" FOREIGN KEY (status_id) REFERENCES public.fiber_core_occ_port_connection_statuses(id) ON DELETE RESTRICT;


--
-- Name: racks FK_c186336e25fee78978463bf7304; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT "FK_c186336e25fee78978463bf7304" FOREIGN KEY (building_id) REFERENCES public.buildings(id) ON DELETE RESTRICT;


--
-- Name: handholes FK_cb5ce214d7ab33d5b036d7337e2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handholes
    ADD CONSTRAINT "FK_cb5ce214d7ab33d5b036d7337e2" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: lcps FK_d19d80ed8ce2cbff3c8979b1e9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lcps
    ADD CONSTRAINT "FK_d19d80ed8ce2cbff3c8979b1e9a" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: assets FK_d43ed9e838f74bcc07b1266a8d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "FK_d43ed9e838f74bcc07b1266a8d6" FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id);


--
-- Name: fiber_splices FK_d472aef3de753a6611cad5cbda0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_splices
    ADD CONSTRAINT "FK_d472aef3de753a6611cad5cbda0" FOREIGN KEY (splice_closure_port_b_id) REFERENCES public.splice_closure_ports(id) ON DELETE CASCADE;


--
-- Name: assets FK_dccd1dbe2c036b9ab80876466b7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "FK_dccd1dbe2c036b9ab80876466b7" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: field_observations FK_df29f1c1b1da54c9f68a5b3474d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_observations
    ADD CONSTRAINT "FK_df29f1c1b1da54c9f68a5b3474d" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: onus FK_e4064b91009581410160a497de7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onus
    ADD CONSTRAINT "FK_e4064b91009581410160a497de7" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: fiber_cable_connections FK_e94d97a4a614c436d21ee866beb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_connections
    ADD CONSTRAINT "FK_e94d97a4a614c436d21ee866beb" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE RESTRICT;


--
-- Name: fiber_splices FK_e97a4d833e99cf7b255263b832c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_splices
    ADD CONSTRAINT "FK_e97a4d833e99cf7b255263b832c" FOREIGN KEY (splice_closure_port_a_id) REFERENCES public.splice_closure_ports(id) ON DELETE CASCADE;


--
-- Name: manholes FK_f259f74be137ce699c58c998d3c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manholes
    ADD CONSTRAINT "FK_f259f74be137ce699c58c998d3c" FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: fiber_core_onu_connections FK_f964a2f86fc3d9a0b612a0a71a2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_onu_connections
    ADD CONSTRAINT "FK_f964a2f86fc3d9a0b612a0a71a2" FOREIGN KEY (fiber_core_id) REFERENCES public.fiber_cores(id) ON DELETE CASCADE;


--
-- Name: fiber_cable_connections FK_fb562da72df3c5953a9749f5a79; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_cable_connections
    ADD CONSTRAINT "FK_fb562da72df3c5953a9749f5a79" FOREIGN KEY (fiber_cable_id) REFERENCES public.fiber_cables(asset_id) ON DELETE CASCADE;


--
-- Name: fiber_core_splitter_connections FK_fdf38b1ab34dfd0903b0c8eae31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splitter_connections
    ADD CONSTRAINT "FK_fdf38b1ab34dfd0903b0c8eae31" FOREIGN KEY (fiber_core_id) REFERENCES public.fiber_cores(id) ON DELETE CASCADE;


--
-- Name: assets FK_fe3ee472fb83b7c8f8a54dd3c18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "FK_fe3ee472fb83b7c8f8a54dd3c18" FOREIGN KEY (status_id) REFERENCES public.statuses(id);


--
-- Name: fiber_core_splice_closure_port_connections FK_ff9bdc64b3143b50a87b4461e99; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiber_core_splice_closure_port_connections
    ADD CONSTRAINT "FK_ff9bdc64b3143b50a87b4461e99" FOREIGN KEY (fiber_core_id) REFERENCES public.fiber_cores(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

