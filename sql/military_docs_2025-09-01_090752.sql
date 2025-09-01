--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: inbound_docs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inbound_docs (
    id integer NOT NULL,
    doc_reference character varying(255) NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    source_type character varying(50),
    classification character varying(50) NOT NULL,
    summary text NOT NULL,
    analyst_notes text,
    priority integer DEFAULT 3
);


ALTER TABLE public.inbound_docs OWNER TO postgres;

--
-- Name: TABLE inbound_docs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.inbound_docs IS 'Таблиця для зберігання метаданих про вхідні аналітичні документи.';


--
-- Name: inbound_docs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inbound_docs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inbound_docs_id_seq OWNER TO postgres;

--
-- Name: inbound_docs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inbound_docs_id_seq OWNED BY public.inbound_docs.id;


--
-- Name: inbound_docs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_docs ALTER COLUMN id SET DEFAULT nextval('public.inbound_docs_id_seq'::regclass);


--
-- Data for Name: inbound_docs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inbound_docs (id, doc_reference, received_at, source_type, classification, summary, analyst_notes, priority) FROM stdin;
1	OSINT-24-001	2025-08-28 15:26:29.146837+03	OSINT	UNCLASSIFIED	Аналіз активності в соціальних мережах у регіоні N. Виявлено зростання напруженості.	Потребує перехресної перевірки з іншими джерелами.	2
2	HUMINT-24-001	2025-08-28 15:26:29.146837+03	HUMINT	SECRET	Доповідь про переміщення техніки противника поблизу кордону.	Джерело надійне. Дані критичні.	1
3	SIGINT-24-001	2025-08-28 15:26:29.146837+03	SIGINT	SECRET	Перехоплення радіопереговорів, що вказують на підготовку до провокації.	\N	1
4	GEOINT-24-001	2025-08-28 15:26:29.146837+03	GEOINT	CONFIDENTIAL	Супутникові знімки показують нові фортифікаційні споруди.	Порівняти зі знімками за попередній тиждень.	2
5	OSINT-24-002	2025-08-28 15:26:29.146837+03	OSINT	UNCLASSIFIED	Стаття в іноземному виданні про економічну ситуацію в країні-агресорі.	Перекласти ключові тези.	3
6	TECH-24-001	2025-08-28 15:26:29.146837+03	TECHINT	SECRET	Аналіз уламків ворожого БПЛА. Виявлено компоненти іноземного виробництва.	Передати звіт до технічного відділу.	1
7	HUMINT-24-002	2025-08-28 15:26:29.146837+03	HUMINT	CONFIDENTIAL	Інформація про настрої серед місцевого населення на окупованих територіях.	Джерело потребує додаткової верифікації.	3
8	OSINT-24-003	2025-08-28 15:26:29.146837+03	OSINT	UNCLASSIFIED	Моніторинг державних закупівель противника. Збільшення замовлень на пально-мастильні матеріали.	\N	2
9	SIGINT-24-002	2025-08-28 15:26:29.146837+03	SIGINT	CONFIDENTIAL	Аналіз трафіку стільникового зв'язку в прикордонній зоні.	Виявлено аномальну активність.	2
10	OSINT-24-004	2025-08-28 15:26:29.146837+03	OSINT	UNCLASSIFIED	Публічний звіт міжнародної організації про гуманітарну ситуацію.	Використати для підготовки аналітичної довідки.	3
11	HUMINT-24-003	2025-08-28 15:26:29.146837+03	HUMINT	SECRET	Дані про плани противника щодо проведення інформаційно-психологічної операції.	Терміново доповісти керівництву.	1
12	GEOINT-24-002	2025-08-28 15:26:29.146837+03	GEOINT	CONFIDENTIAL	Знімки з БПЛА, що фіксують замасковані позиції артилерії.	\N	1
13	OSINT-24-005	2025-08-28 15:26:29.146837+03	OSINT	UNCLASSIFIED	Аналіз пропагандистських наративів на телебаченні противника за останній місяць.	Підготувати звіт про ключові зміни.	3
14	TECH-24-002	2025-08-28 15:26:29.146837+03	TECHINT	CONFIDENTIAL	Звіт про кібератаку на державні ресурси. Визначено вектор атаки.	Потрібен детальний технічний аналіз.	2
15	HUMINT-24-004	2025-08-28 15:26:29.146837+03	HUMINT	CONFIDENTIAL	Інформація про корупційні схеми у військовому керівництві противника.	Дані потребують ретельної перевірки.	2
\.


--
-- Name: inbound_docs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inbound_docs_id_seq', 16, true);


--
-- Name: inbound_docs inbound_docs_doc_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_docs
    ADD CONSTRAINT inbound_docs_doc_reference_key UNIQUE (doc_reference);


--
-- Name: inbound_docs inbound_docs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_docs
    ADD CONSTRAINT inbound_docs_pkey PRIMARY KEY (id);


--
-- Name: idx_received_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_received_at ON public.inbound_docs USING btree (received_at);


--
-- Name: idx_source_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_source_type ON public.inbound_docs USING btree (source_type);


--
-- PostgreSQL database dump complete
--

