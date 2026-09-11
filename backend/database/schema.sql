--
-- PostgreSQL database dump
--

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: area_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.area_enum AS ENUM (
    'Sistemas',
    'Recursos Humanos',
    'Contabilidad',
    'Sala de ventas',
    'Gerencia',
    'Revisoria',
    'Mercadeo',
    'Juridica',
    'Comercial',
    'Arrendamientos'
);


--
-- Name: tipo_etiqueta; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_etiqueta AS ENUM (
    'Importante',
    'Reciente',
    'Mantenimiento',
    'Actualización',
    'Aviso'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: archivos_adjuntos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.archivos_adjuntos (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    nombre_archivo character varying(255),
    ruta_archivo text,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    contenido bytea,
    tipo character varying(255)
);


--
-- Name: archivos_adjuntos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.archivos_adjuntos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: archivos_adjuntos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.archivos_adjuntos_id_seq OWNED BY public.archivos_adjuntos.id;


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: areas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.areas_id_seq OWNED BY public.areas.id;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    prioridad_id integer NOT NULL
);


--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: categorias_tecnicos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias_tecnicos (
    id integer NOT NULL,
    categoria_id integer NOT NULL,
    tecnico_id integer NOT NULL
);


--
-- Name: categorias_tecnicos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorias_tecnicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorias_tecnicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorias_tecnicos_id_seq OWNED BY public.categorias_tecnicos.id;


--
-- Name: comentarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    usuario_id integer NOT NULL,
    comentario text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    leido boolean DEFAULT false
);


--
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- Name: estado_noticia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_noticia (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    color_estado character varying(7) NOT NULL
);


--
-- Name: estado_noticia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estado_noticia ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.estado_noticia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estados (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    color character varying(50)
);


--
-- Name: estados_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estados_id_seq OWNED BY public.estados.id;


--
-- Name: etiquetas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.etiquetas (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    color character varying(20) NOT NULL
);


--
-- Name: etiquetas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.etiquetas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: etiquetas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.etiquetas_id_seq OWNED BY public.etiquetas.id;


--
-- Name: historial_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial_tickets (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    estado_anterior integer,
    estado_nuevo integer,
    usuario_id integer,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: historial_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historial_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historial_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historial_tickets_id_seq OWNED BY public.historial_tickets.id;


--
-- Name: noticias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.noticias (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text NOT NULL,
    usuario_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    etiqueta_id integer,
    fecha_modificacion timestamp with time zone,
    modificado_por_id integer,
    estado_id integer NOT NULL
);


--
-- Name: noticias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.noticias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: noticias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.noticias_id_seq OWNED BY public.noticias.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    id bigint NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    titulo character varying(150) NOT NULL,
    mensaje text NOT NULL,
    enlace character varying(300),
    leida boolean DEFAULT false NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: preferencias_notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preferencias_notificaciones (
    usuario_id integer NOT NULL,
    activas boolean DEFAULT true NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prioridades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prioridades (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    color character varying,
    nivel integer DEFAULT 1 NOT NULL
);


--
-- Name: prioridades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prioridades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prioridades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prioridades_id_seq OWNED BY public.prioridades.id;


--
-- Name: procedimiento_archivos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedimiento_archivos (
    id integer NOT NULL,
    procedimiento_id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    nombre_original character varying(255) NOT NULL,
    ruta character varying(500) NOT NULL,
    tipo character varying(100) NOT NULL,
    tamano bigint,
    descripcion text,
    es_principal boolean DEFAULT false,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_recurso character varying(20) DEFAULT 'DOCUMENTO'::character varying,
    contenido bytea,
    CONSTRAINT procedimiento_archivos_tipo_recurso_check CHECK (((tipo_recurso)::text = ANY ((ARRAY['IMAGEN'::character varying, 'DOCUMENTO'::character varying, 'SCRIPT'::character varying, 'OTRO'::character varying])::text[])))
);


--
-- Name: procedimiento_archivos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.procedimiento_archivos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: procedimiento_archivos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.procedimiento_archivos_id_seq OWNED BY public.procedimiento_archivos.id;


--
-- Name: procedimiento_notas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedimiento_notas (
    id integer NOT NULL,
    procedimiento_id integer NOT NULL,
    usuario_id integer NOT NULL,
    nota text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: procedimiento_notas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.procedimiento_notas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: procedimiento_notas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.procedimiento_notas_id_seq OWNED BY public.procedimiento_notas.id;


--
-- Name: procedimientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedimientos (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    categoria_id integer NOT NULL,
    autor_id integer NOT NULL,
    estado character varying(20) DEFAULT 'PUBLICADO'::character varying NOT NULL,
    vistas integer DEFAULT 0,
    fecha_publicacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    descripcion text NOT NULL,
    activo boolean DEFAULT true,
    solucion text,
    notas text,
    version integer DEFAULT 1,
    ticket_referencia_id integer,
    CONSTRAINT procedimientos_estado_check CHECK (((estado)::text = ANY ((ARRAY['BORRADOR'::character varying, 'PUBLICADO'::character varying, 'ARCHIVADO'::character varying])::text[])))
);


--
-- Name: procedimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.procedimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: procedimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.procedimientos_id_seq OWNED BY public.procedimientos.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: solicitudes_reapertura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_reapertura (
    id bigint NOT NULL,
    ticket_id integer NOT NULL,
    solicitante_id integer NOT NULL,
    tecnico_id integer,
    respondido_por_id integer,
    motivo text NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    fecha_solicitud timestamp with time zone DEFAULT now() NOT NULL,
    fecha_respuesta timestamp with time zone,
    CONSTRAINT solicitudes_reapertura_estado_check CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'ACEPTADA'::character varying, 'RECHAZADA'::character varying])::text[])))
);


--
-- Name: solicitudes_reapertura_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_reapertura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_reapertura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_reapertura_id_seq OWNED BY public.solicitudes_reapertura.id;


--
-- Name: solicitudes_reasignacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_reasignacion (
    id bigint NOT NULL,
    ticket_id integer NOT NULL,
    solicitante_id integer NOT NULL,
    tecnico_destino_id integer NOT NULL,
    respondido_por_id integer,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    fecha_solicitud timestamp with time zone DEFAULT now() NOT NULL,
    fecha_respuesta timestamp with time zone,
    CONSTRAINT solicitudes_reasignacion_estado_check CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'ACEPTADA'::character varying, 'RECHAZADA'::character varying])::text[])))
);


--
-- Name: solicitudes_reasignacion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_reasignacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_reasignacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_reasignacion_id_seq OWNED BY public.solicitudes_reasignacion.id;


--
-- Name: subcategorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcategorias (
    id integer NOT NULL,
    categoria_id integer NOT NULL,
    descripcion text NOT NULL,
    prioridad_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: subcategorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subcategorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subcategorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subcategorias_id_seq OWNED BY public.subcategorias.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text NOT NULL,
    usuario_id integer NOT NULL,
    tecnico_id integer,
    categoria_id integer NOT NULL,
    prioridad_id integer NOT NULL,
    estado_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre timestamp without time zone
);


--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    cargo character varying(100) NOT NULL,
    correo character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    rol_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    area_id integer,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    CONSTRAINT chk_usuarios_estado CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Desactivado'::character varying])::text[])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: archivos_adjuntos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archivos_adjuntos ALTER COLUMN id SET DEFAULT nextval('public.archivos_adjuntos_id_seq'::regclass);


--
-- Name: areas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas ALTER COLUMN id SET DEFAULT nextval('public.areas_id_seq'::regclass);


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: categorias_tecnicos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias_tecnicos ALTER COLUMN id SET DEFAULT nextval('public.categorias_tecnicos_id_seq'::regclass);


--
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- Name: estados id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados ALTER COLUMN id SET DEFAULT nextval('public.estados_id_seq'::regclass);


--
-- Name: etiquetas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etiquetas ALTER COLUMN id SET DEFAULT nextval('public.etiquetas_id_seq'::regclass);


--
-- Name: historial_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_tickets ALTER COLUMN id SET DEFAULT nextval('public.historial_tickets_id_seq'::regclass);


--
-- Name: noticias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias ALTER COLUMN id SET DEFAULT nextval('public.noticias_id_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: prioridades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prioridades ALTER COLUMN id SET DEFAULT nextval('public.prioridades_id_seq'::regclass);


--
-- Name: procedimiento_archivos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_archivos ALTER COLUMN id SET DEFAULT nextval('public.procedimiento_archivos_id_seq'::regclass);


--
-- Name: procedimiento_notas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_notas ALTER COLUMN id SET DEFAULT nextval('public.procedimiento_notas_id_seq'::regclass);


--
-- Name: procedimientos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimientos ALTER COLUMN id SET DEFAULT nextval('public.procedimientos_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: solicitudes_reapertura id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reapertura ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_reapertura_id_seq'::regclass);


--
-- Name: solicitudes_reasignacion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reasignacion ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_reasignacion_id_seq'::regclass);


--
-- Name: subcategorias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias ALTER COLUMN id SET DEFAULT nextval('public.subcategorias_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: archivos_adjuntos archivos_adjuntos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archivos_adjuntos
    ADD CONSTRAINT archivos_adjuntos_pkey PRIMARY KEY (id);


--
-- Name: areas areas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_nombre_key UNIQUE (nombre);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: categorias_tecnicos categorias_tecnicos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias_tecnicos
    ADD CONSTRAINT categorias_tecnicos_pkey PRIMARY KEY (id);


--
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- Name: estado_noticia estado_noticia_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_noticia
    ADD CONSTRAINT estado_noticia_nombre_key UNIQUE (nombre);


--
-- Name: estado_noticia estado_noticia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_noticia
    ADD CONSTRAINT estado_noticia_pkey PRIMARY KEY (id);


--
-- Name: estados estados_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados
    ADD CONSTRAINT estados_nombre_key UNIQUE (nombre);


--
-- Name: estados estados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados
    ADD CONSTRAINT estados_pkey PRIMARY KEY (id);


--
-- Name: etiquetas etiquetas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etiquetas
    ADD CONSTRAINT etiquetas_nombre_key UNIQUE (nombre);


--
-- Name: etiquetas etiquetas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etiquetas
    ADD CONSTRAINT etiquetas_pkey PRIMARY KEY (id);


--
-- Name: historial_tickets historial_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_tickets
    ADD CONSTRAINT historial_tickets_pkey PRIMARY KEY (id);


--
-- Name: noticias noticias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: preferencias_notificaciones preferencias_notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificaciones
    ADD CONSTRAINT preferencias_notificaciones_pkey PRIMARY KEY (usuario_id);


--
-- Name: prioridades prioridades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prioridades
    ADD CONSTRAINT prioridades_nombre_key UNIQUE (nombre);


--
-- Name: prioridades prioridades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prioridades
    ADD CONSTRAINT prioridades_pkey PRIMARY KEY (id);


--
-- Name: procedimiento_archivos procedimiento_archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_archivos
    ADD CONSTRAINT procedimiento_archivos_pkey PRIMARY KEY (id);


--
-- Name: procedimiento_notas procedimiento_notas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_notas
    ADD CONSTRAINT procedimiento_notas_pkey PRIMARY KEY (id);


--
-- Name: procedimientos procedimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT procedimientos_pkey PRIMARY KEY (id);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_reapertura solicitudes_reapertura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reapertura
    ADD CONSTRAINT solicitudes_reapertura_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_reasignacion solicitudes_reasignacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reasignacion
    ADD CONSTRAINT solicitudes_reasignacion_pkey PRIMARY KEY (id);


--
-- Name: subcategorias subcategorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_noticias_modificado_por; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noticias_modificado_por ON public.noticias USING btree (modificado_por_id);


--
-- Name: idx_notificaciones_usuario_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificaciones_usuario_fecha ON public.notificaciones USING btree (usuario_id, fecha_creacion DESC);


--
-- Name: idx_notificaciones_usuario_leida; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificaciones_usuario_leida ON public.notificaciones USING btree (usuario_id, leida);


--
-- Name: idx_solicitudes_reapertura_ticket_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_reapertura_ticket_fecha ON public.solicitudes_reapertura USING btree (ticket_id, fecha_solicitud DESC);


--
-- Name: idx_solicitudes_reasignacion_destino; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_reasignacion_destino ON public.solicitudes_reasignacion USING btree (tecnico_destino_id, estado);


--
-- Name: idx_solicitudes_reasignacion_ticket_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_reasignacion_ticket_fecha ON public.solicitudes_reasignacion USING btree (ticket_id, fecha_solicitud DESC);


--
-- Name: idx_subcategorias_categoria_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subcategorias_categoria_id ON public.subcategorias USING btree (categoria_id);


--
-- Name: idx_usuarios_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_estado ON public.usuarios USING btree (estado);


--
-- Name: uq_solicitud_reapertura_pendiente; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_solicitud_reapertura_pendiente ON public.solicitudes_reapertura USING btree (ticket_id) WHERE ((estado)::text = 'PENDIENTE'::text);


--
-- Name: uq_solicitud_reasignacion_pendiente; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_solicitud_reasignacion_pendiente ON public.solicitudes_reasignacion USING btree (ticket_id) WHERE ((estado)::text = 'PENDIENTE'::text);


--
-- Name: archivos_adjuntos archivos_adjuntos_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archivos_adjuntos
    ADD CONSTRAINT archivos_adjuntos_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: categorias categorias_prioridad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_prioridad_id_fkey FOREIGN KEY (prioridad_id) REFERENCES public.prioridades(id);


--
-- Name: categorias_tecnicos categorias_tecnicos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias_tecnicos
    ADD CONSTRAINT categorias_tecnicos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- Name: categorias_tecnicos categorias_tecnicos_tecnico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias_tecnicos
    ADD CONSTRAINT categorias_tecnicos_tecnico_id_fkey FOREIGN KEY (tecnico_id) REFERENCES public.usuarios(id);


--
-- Name: comentarios comentarios_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: comentarios comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: procedimiento_archivos fk_archivo_procedimiento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_archivos
    ADD CONSTRAINT fk_archivo_procedimiento FOREIGN KEY (procedimiento_id) REFERENCES public.procedimientos(id) ON DELETE CASCADE;


--
-- Name: noticias fk_etiqueta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT fk_etiqueta FOREIGN KEY (etiqueta_id) REFERENCES public.etiquetas(id);


--
-- Name: noticias fk_noticias_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT fk_noticias_estado FOREIGN KEY (estado_id) REFERENCES public.estado_noticia(id) ON DELETE RESTRICT;


--
-- Name: noticias fk_noticias_modificado_por; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT fk_noticias_modificado_por FOREIGN KEY (modificado_por_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: procedimientos fk_procedimiento_autor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT fk_procedimiento_autor FOREIGN KEY (autor_id) REFERENCES public.usuarios(id);


--
-- Name: procedimientos fk_procedimiento_categoria; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT fk_procedimiento_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- Name: archivos_adjuntos fk_ticket_archivo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archivos_adjuntos
    ADD CONSTRAINT fk_ticket_archivo FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: usuarios fk_usuarios_area; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_area FOREIGN KEY (area_id) REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: historial_tickets historial_tickets_estado_anterior_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_tickets
    ADD CONSTRAINT historial_tickets_estado_anterior_fkey FOREIGN KEY (estado_anterior) REFERENCES public.estados(id);


--
-- Name: historial_tickets historial_tickets_estado_nuevo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_tickets
    ADD CONSTRAINT historial_tickets_estado_nuevo_fkey FOREIGN KEY (estado_nuevo) REFERENCES public.estados(id);


--
-- Name: historial_tickets historial_tickets_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_tickets
    ADD CONSTRAINT historial_tickets_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: historial_tickets historial_tickets_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_tickets
    ADD CONSTRAINT historial_tickets_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: noticias noticias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: notificaciones notificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: preferencias_notificaciones preferencias_notificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificaciones
    ADD CONSTRAINT preferencias_notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: procedimiento_notas procedimiento_notas_procedimiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_notas
    ADD CONSTRAINT procedimiento_notas_procedimiento_id_fkey FOREIGN KEY (procedimiento_id) REFERENCES public.procedimientos(id) ON DELETE CASCADE;


--
-- Name: procedimiento_notas procedimiento_notas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimiento_notas
    ADD CONSTRAINT procedimiento_notas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: procedimientos procedimientos_ticket_referencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT procedimientos_ticket_referencia_id_fkey FOREIGN KEY (ticket_referencia_id) REFERENCES public.tickets(id) ON DELETE SET NULL;


--
-- Name: solicitudes_reapertura solicitudes_reapertura_respondido_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reapertura
    ADD CONSTRAINT solicitudes_reapertura_respondido_por_id_fkey FOREIGN KEY (respondido_por_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: solicitudes_reapertura solicitudes_reapertura_solicitante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reapertura
    ADD CONSTRAINT solicitudes_reapertura_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: solicitudes_reapertura solicitudes_reapertura_tecnico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reapertura
    ADD CONSTRAINT solicitudes_reapertura_tecnico_id_fkey FOREIGN KEY (tecnico_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: solicitudes_reapertura solicitudes_reapertura_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reapertura
    ADD CONSTRAINT solicitudes_reapertura_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: solicitudes_reasignacion solicitudes_reasignacion_respondido_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reasignacion
    ADD CONSTRAINT solicitudes_reasignacion_respondido_por_id_fkey FOREIGN KEY (respondido_por_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: solicitudes_reasignacion solicitudes_reasignacion_solicitante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reasignacion
    ADD CONSTRAINT solicitudes_reasignacion_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: solicitudes_reasignacion solicitudes_reasignacion_tecnico_destino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reasignacion
    ADD CONSTRAINT solicitudes_reasignacion_tecnico_destino_id_fkey FOREIGN KEY (tecnico_destino_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: solicitudes_reasignacion solicitudes_reasignacion_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_reasignacion
    ADD CONSTRAINT solicitudes_reasignacion_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: subcategorias subcategorias_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE CASCADE;


--
-- Name: subcategorias subcategorias_prioridad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_prioridad_id_fkey FOREIGN KEY (prioridad_id) REFERENCES public.prioridades(id);


--
-- Name: tickets tickets_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- Name: tickets tickets_estado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES public.estados(id);


--
-- Name: tickets tickets_prioridad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_prioridad_id_fkey FOREIGN KEY (prioridad_id) REFERENCES public.prioridades(id);


--
-- Name: tickets tickets_tecnico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_tecnico_id_fkey FOREIGN KEY (tecnico_id) REFERENCES public.usuarios(id);


--
-- Name: tickets tickets_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

