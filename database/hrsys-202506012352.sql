--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3
-- Dumped by pg_dump version 17.3

-- Started on 2025-06-01 23:52:26 WIB

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3656 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16774)
-- Name: attendance_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_details (
    id uuid NOT NULL,
    attendance_id uuid,
    employee_id uuid,
    employee_code character varying(50),
    employee_name character varying(255),
    presence_time time without time zone,
    out_time time without time zone,
    reason text,
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.attendance_details OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16766)
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id uuid NOT NULL,
    attendance_date date,
    total_present integer DEFAULT 0,
    total_absent integer DEFAULT 0,
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16758)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    employee_code character varying(50),
    name character varying(255),
    "position" character varying(255),
    department character varying(255),
    supervisor character varying(255),
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16782)
-- Name: global_params; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_params (
    id uuid NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    split_code character varying(50),
    is_editable boolean DEFAULT false,
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.global_params OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16744)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(255),
    description text,
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16752)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid NOT NULL,
    user_id uuid,
    role_id uuid,
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16706)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255),
    username character varying(255),
    email character varying(255),
    password character varying(255),
    created_at timestamp without time zone,
    created_by character varying(100),
    updated_at timestamp without time zone,
    updated_by character varying(100),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3649 (class 0 OID 16774)
-- Dependencies: 222
-- Data for Name: attendance_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.attendance_details VALUES ('9cdd52f7-9c54-4e3e-9a00-619749661232', 'a9cf4fc3-91d3-447a-93fa-4b4dea8ced8f', 'e21a475b-f7a6-4305-81e9-efbe9d9c13f5', 'EMP-0001', 'John Doe', '08:45:00', NULL, 'Present', NULL, NULL, '2025-06-01 14:51:29.247', NULL, false);
INSERT INTO public.attendance_details VALUES ('cf878082-ffdd-4fbd-8124-267b8bb62930', '2ec1833f-2359-4f2f-a46d-9301e29eee9c', 'e21a475b-f7a6-4305-81e9-efbe9d9c13f5', 'EMP-0001', 'John Doe', '08:59:00', NULL, 'Present', '2025-06-01 14:57:51.55', NULL, '2025-06-01 14:57:51.55', NULL, false);
INSERT INTO public.attendance_details VALUES ('46010da2-d798-4994-812c-492ce262e18b', 'a9cf4fc3-91d3-447a-93fa-4b4dea8ced8f', '8e239be9-12f1-4ce0-89e8-02f819f882c3', 'EMP-0003', 'Jane', '09:31:00', NULL, 'Late-Present', '2025-06-01 14:51:29.247', NULL, '2025-06-01 14:51:29.247', NULL, false);
INSERT INTO public.attendance_details VALUES ('a9f93fcc-faa2-4268-bc3a-7c7b7658c343', '2ec1833f-2359-4f2f-a46d-9301e29eee9c', '8e239be9-12f1-4ce0-89e8-02f819f882c3', 'EMP-0003', 'Jane', '08:59:00', NULL, 'Present', '2025-06-01 14:57:51.55', NULL, '2025-06-01 14:57:51.55', NULL, false);
INSERT INTO public.attendance_details VALUES ('86623e05-dd8a-4b6a-889a-2b02ebcf622b', 'f52eed7e-a39d-4440-8a54-c6e447ea36a2', '8e239be9-12f1-4ce0-89e8-02f819f882c3', 'EMP-0003', 'Jane', '09:00:00', NULL, 'Present', '2025-06-01 15:14:56.324', NULL, '2025-06-01 15:14:56.324', NULL, false);
INSERT INTO public.attendance_details VALUES ('29b9f9f0-73e0-415a-886c-47988a0ba868', 'f52eed7e-a39d-4440-8a54-c6e447ea36a2', 'e21a475b-f7a6-4305-81e9-efbe9d9c13f5', 'EMP-0001', 'John Doe', '08:00:00', NULL, 'Present', '2025-06-01 15:14:56.325', NULL, '2025-06-01 15:14:56.325', NULL, false);
INSERT INTO public.attendance_details VALUES ('698ab7e4-d383-4d67-a97b-d100e0207fe2', 'f52eed7e-a39d-4440-8a54-c6e447ea36a2', 'fbb66f90-c39d-426d-a827-1deb15df8158', 'EMP-0004', 'Rifqy', '08:00:00', NULL, 'Present', '2025-06-01 15:14:56.325', NULL, '2025-06-01 15:14:56.325', NULL, false);
INSERT INTO public.attendance_details VALUES ('907cf1ca-4278-455e-ab38-63a8893e2111', 'd9f143d0-ed50-4d25-b4fd-3e05ca025ef9', '8e239be9-12f1-4ce0-89e8-02f819f882c3', 'EMP-0003', 'Jane', '08:50:00', NULL, 'Present', '2025-06-01 15:32:21.855', NULL, '2025-06-01 15:59:03.051', NULL, false);
INSERT INTO public.attendance_details VALUES ('b2e49934-628c-4e7a-8a13-bbcdcbad9b5f', 'd9f143d0-ed50-4d25-b4fd-3e05ca025ef9', 'e21a475b-f7a6-4305-81e9-efbe9d9c13f5', 'EMP-0001', 'John Doe', '08:59:00', NULL, 'Present', '2025-06-01 15:32:21.855', NULL, '2025-06-01 15:59:03.054', NULL, false);
INSERT INTO public.attendance_details VALUES ('5a26afa3-d48a-4979-8465-049ce0270a54', 'd9f143d0-ed50-4d25-b4fd-3e05ca025ef9', 'fbb66f90-c39d-426d-a827-1deb15df8158', 'EMP-0004', 'Rifqy', '09:00:00', NULL, 'Present', '2025-06-01 15:32:21.856', NULL, '2025-06-01 15:59:03.054', NULL, false);


--
-- TOC entry 3648 (class 0 OID 16766)
-- Dependencies: 221
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.attendances VALUES ('a9cf4fc3-91d3-447a-93fa-4b4dea8ced8f', '2025-05-30', 2, 0, NULL, NULL, '2025-06-01 14:51:29.249', NULL, false);
INSERT INTO public.attendances VALUES ('2ec1833f-2359-4f2f-a46d-9301e29eee9c', '2025-05-29', 1, 1, '2025-06-01 14:57:51.549', NULL, '2025-06-01 14:57:51.551', NULL, false);
INSERT INTO public.attendances VALUES ('f52eed7e-a39d-4440-8a54-c6e447ea36a2', '2025-05-28', 3, 0, '2025-06-01 15:14:56.323', NULL, '2025-06-01 15:14:56.325', NULL, false);
INSERT INTO public.attendances VALUES ('d9f143d0-ed50-4d25-b4fd-3e05ca025ef9', '2025-06-01', 3, 0, '2025-06-01 15:32:21.853', NULL, '2025-06-01 15:32:21.857', NULL, false);


--
-- TOC entry 3647 (class 0 OID 16758)
-- Dependencies: 220
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employees VALUES ('16fce3a2-e93b-48ed-84bd-016f754dc34c', 'EMP-0002', 'Jona', 'Backend Dev', 'IT', 'Chief', '2025-05-31 16:41:12.707', 'root', '2025-05-31 16:46:03.454', 'root', true);
INSERT INTO public.employees VALUES ('e21a475b-f7a6-4305-81e9-efbe9d9c13f5', 'EMP-0001', 'John Doe', 'Marketing Manager', 'Marketing', 'Chief', '2025-05-31 11:31:44.324', 'root', '2025-05-31 16:44:31.475', 'root', false);
INSERT INTO public.employees VALUES ('8e239be9-12f1-4ce0-89e8-02f819f882c3', 'EMP-0003', 'Jane', 'Developer', 'IT', 'Chief', '2025-05-31 16:46:15.541', 'root', '2025-05-31 16:46:15.541', NULL, false);
INSERT INTO public.employees VALUES ('fbb66f90-c39d-426d-a827-1deb15df8158', 'EMP-0004', 'Rifqy', 'Software Engineer', 'IT', 'Chief', '2025-06-01 15:13:48.971', 'root', '2025-06-01 15:13:48.971', NULL, false);


--
-- TOC entry 3650 (class 0 OID 16782)
-- Dependencies: 223
-- Data for Name: global_params; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.global_params VALUES ('ce9a12e3-0a5d-4d69-b50a-f7da34f32274', 'BASE_SALARY', '10000000', '', true, '2025-05-31 07:51:40.578', NULL, '2025-05-31 07:51:40.578', NULL, false);
INSERT INTO public.global_params VALUES ('15d62688-2baf-4e01-9909-b60ccb40f4c8', 'LAST_TIME_PRESENT', '09:00', '', true, '2025-05-31 07:51:40.579', NULL, '2025-05-31 07:51:40.579', NULL, false);
INSERT INTO public.global_params VALUES ('02ffb301-38ac-4506-b370-0a6789bf370d', 'LAST_EMPLOYEE_CODE', 'EMP-0004', 'EMP-', false, '2025-05-31 11:31:44.32', NULL, '2025-06-01 15:13:48.969', 'root', false);


--
-- TOC entry 3645 (class 0 OID 16744)
-- Dependencies: 218
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles VALUES ('fa1aafc7-eb76-4da5-b07a-8d09960b83a8', 'Admin', 'Full Access', NULL, 'sys', NULL, NULL, false);


--
-- TOC entry 3646 (class 0 OID 16752)
-- Dependencies: 219
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_roles VALUES ('398b0389-c83f-419b-bf3e-5d0eff2b5e57', '1bc14f26-6e63-4bb1-94b0-a17d075b7042', 'fa1aafc7-eb76-4da5-b07a-8d09960b83a8', NULL, 'sys', NULL, NULL, false);


--
-- TOC entry 3644 (class 0 OID 16706)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('1bc14f26-6e63-4bb1-94b0-a17d075b7042', 'Rifqy H.', 'root', 'admin@ams.co.ltd', '$bcrypt$v=98$r=12$XNbe/BXnBLYWhNCA8GOLlA$ivJp6UJNuoADoRgB13+IjbT3voUSMF4', NULL, 'sys', NULL, NULL, false);


--
-- TOC entry 3494 (class 2606 OID 16781)
-- Name: attendance_details attendance_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_details
    ADD CONSTRAINT attendance_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3492 (class 2606 OID 16773)
-- Name: attendances attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 16765)
-- Name: employees employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employee_pkey PRIMARY KEY (id);


--
-- TOC entry 3496 (class 2606 OID 16792)
-- Name: global_params global_params_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_params
    ADD CONSTRAINT global_params_key_key UNIQUE (key);


--
-- TOC entry 3498 (class 2606 OID 16790)
-- Name: global_params global_params_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_params
    ADD CONSTRAINT global_params_pkey PRIMARY KEY (id);


--
-- TOC entry 3486 (class 2606 OID 16751)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 16757)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3484 (class 2606 OID 16713)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


-- Completed on 2025-06-01 23:52:26 WIB

--
-- PostgreSQL database dump complete
--

