-- ============================================================
--  BCE SYSTEM — Schema MySQL Completo
--  Bitácora de Copias Escolares
--
--  Versión  : 1.0.0
--  Fecha    : 2026-05-25
--  Motor    : MySQL 8.0.13+  (requiere soporte de DEFAULT expressions
--             y CTEs. Probado en MySQL 8.0 y MariaDB 10.6+)
--
--  Bloques:
--    1. Autenticación  — roles, módulos, usuarios, sesiones
--    2. Año escolar    — anios_escolares, configuracion
--    3. Personal       — personal (profesores + staff)
--    4. Alumnos        — salones, alumnos, matriculas
--    5. Servicios      — servicios, servicio_precios, tipos_pago
--    6. Transacciones  — operaciones, operacion_items
--    7. Pagos          — pagos + vistas de saldos
--    8. Anulaciones    — anulaciones
--    9. Auditoría      — audit_log, activity_log, triggers
--
--  21 tablas · 8 vistas · 6 triggers
--
--  INSTRUCCIONES:
--    mysql -u root -p < bce_schema_mysql.sql
--    o ejecutar bloque a bloque desde tu cliente SQL.
-- ============================================================

SET NAMES utf8mb4;
SET time_zone             = '-05:00';   -- UTC-5 (Perú)
SET foreign_key_checks    = 0;
SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,'
                            'ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
--  BASE DE DATOS
-- ============================================================

CREATE DATABASE IF NOT EXISTS bce_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bce_system;


-- ============================================================
--  BLOQUE 1 — AUTENTICACIÓN
--  Orden: roles_sistema → modulos → (personal) → usuarios
--         → sesiones → rol_modulos
-- ============================================================

CREATE TABLE IF NOT EXISTS roles_sistema (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(64)      NOT NULL UNIQUE,
  descripcion VARCHAR(255)     NULL,
  activo      TINYINT(1)       NOT NULL DEFAULT 1,
  creado_en   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Roles del sistema: ADMIN, CAJERO, SOLO_LECTURA';

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS modulos (
  id      TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave   VARCHAR(64)      NOT NULL UNIQUE,
  nombre  VARCHAR(128)     NOT NULL,
  icono   VARCHAR(64)      NULL,
  orden   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  activo  TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Módulos de la aplicación para control de acceso por rol';


-- ============================================================
--  BLOQUE 2 — AÑO ESCOLAR + CONFIGURACIÓN
-- ============================================================

CREATE TABLE IF NOT EXISTS anios_escolares (
  id           SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  anio         YEAR              NOT NULL UNIQUE,
  descripcion  VARCHAR(128)      NULL,
  activo       TINYINT(1)        NOT NULL DEFAULT 0,
  fecha_inicio DATE              NULL,
  fecha_fin    DATE              NULL,
  creado_en    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_anio (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Solo un año puede tener activo=1 a la vez (enforced en Node.js)';


-- ============================================================
--  BLOQUE 3 — PERSONAL
--  Nota: personal.creado_por → usuarios (circular).
--        Se resuelve con ALTER TABLE después de crear usuarios.
-- ============================================================

CREATE TABLE IF NOT EXISTS personal (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombres    VARCHAR(128) NOT NULL,
  apellidos  VARCHAR(128) NOT NULL,
  dni        CHAR(8)      NULL UNIQUE,
  rol        ENUM('DIRECTOR','SECRETARIA','CAJERO',
                  'PERSONAL_ADMINISTRATIVO','PROFESOR')
             NOT NULL DEFAULT 'PROFESOR',
  telefono   VARCHAR(20)  NULL,
  email      VARCHAR(128) NULL,
  activo     TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_por INT UNSIGNED NULL,    -- FK agregada via ALTER después de usuarios
  PRIMARY KEY (id),
  INDEX idx_pers_apellidos (apellidos),
  INDEX idx_pers_rol       (rol),
  INDEX idx_pers_activo    (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Profesores + todo el personal de la institución';

-- ------------------------------------------------------------
--  USUARIOS (depende de roles_sistema y personal)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuarios (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  nombre_usuario VARCHAR(64)      NOT NULL UNIQUE,
  password_hash  VARCHAR(255)     NOT NULL,  -- bcrypt $2b$10$...
  id_personal    INT UNSIGNED     NULL,       -- NULL = cuenta de sistema
  id_rol         TINYINT UNSIGNED NOT NULL,
  activo         TINYINT(1)       NOT NULL DEFAULT 1,
  ultimo_acceso  DATETIME         NULL,
  creado_en      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_usu_personal FOREIGN KEY (id_personal) REFERENCES personal(id),
  CONSTRAINT fk_usu_rol      FOREIGN KEY (id_rol)      REFERENCES roles_sistema(id),
  INDEX idx_usu_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cuentas de acceso. Separado de personal para distinción de identidad vs login';

-- Resolver dependencia circular personal ↔ usuarios
ALTER TABLE personal
  ADD CONSTRAINT fk_pers_creado FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sesiones (
  id          VARCHAR(128)     NOT NULL,    -- UUID v4 generado en Node
  id_usuario  INT UNSIGNED     NOT NULL,
  ip_cliente  VARCHAR(45)      NULL,
  user_agent  VARCHAR(512)     NULL,
  creado_en   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_en   DATETIME         NOT NULL,
  cerrada_en  DATETIME         NULL,        -- NULL = sesión aún activa
  PRIMARY KEY (id),
  CONSTRAINT fk_ses_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  INDEX idx_ses_usuario (id_usuario),
  INDEX idx_ses_expira  (expira_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rol_modulos (
  id_rol        TINYINT UNSIGNED NOT NULL,
  id_modulo     TINYINT UNSIGNED NOT NULL,
  puede_ver     TINYINT(1)       NOT NULL DEFAULT 0,
  puede_crear   TINYINT(1)       NOT NULL DEFAULT 0,
  puede_editar  TINYINT(1)       NOT NULL DEFAULT 0,
  puede_anular  TINYINT(1)       NOT NULL DEFAULT 0,
  PRIMARY KEY (id_rol, id_modulo),
  CONSTRAINT fk_rm_rol    FOREIGN KEY (id_rol)    REFERENCES roles_sistema(id),
  CONSTRAINT fk_rm_modulo FOREIGN KEY (id_modulo) REFERENCES modulos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  CONFIGURACIÓN (depende de anios_escolares y usuarios)
--  Nota: id_anio NULL = configuración global.
--        MySQL trata NULL != NULL en UNIQUE, así que la unicidad
--        de claves globales se enforcea en Node.js.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS configuracion (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  clave         VARCHAR(128)      NOT NULL,
  valor         TEXT              NOT NULL,
  descripcion   VARCHAR(255)      NULL,
  id_anio       SMALLINT UNSIGNED NULL,      -- NULL = aplica a todos los años
  modificado_por INT UNSIGNED     NULL,
  modificado_en DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_config_clave_anio (clave, id_anio),
  CONSTRAINT fk_cfg_anio    FOREIGN KEY (id_anio)        REFERENCES anios_escolares(id),
  CONSTRAINT fk_cfg_usuario FOREIGN KEY (modificado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  BLOQUE 4 — SALONES + ALUMNOS + MATRÍCULAS
-- ============================================================

CREATE TABLE IF NOT EXISTS salones (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(64)  NOT NULL,
  nivel     ENUM('PRIMARIA','SECUNDARIA') NOT NULL,
  grado     TINYINT UNSIGNED NOT NULL,
  seccion   CHAR(1)          NOT NULL,
  id_tutor  INT UNSIGNED     NULL,  -- FK a personal
  activo    TINYINT(1)       NOT NULL DEFAULT 1,
  creado_en DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_salon (nivel, grado, seccion),
  CONSTRAINT fk_sal_tutor FOREIGN KEY (id_tutor) REFERENCES personal(id),
  INDEX idx_sal_nivel (nivel),
  INDEX idx_sal_tutor (id_tutor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='El tutor se asigna al salón (FK salones→personal, no al revés)';

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS alumnos (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombres            VARCHAR(128) NOT NULL,
  apellidos          VARCHAR(128) NOT NULL,
  dni                CHAR(8)      NULL UNIQUE,
  fecha_nacimiento   DATE         NULL,
  telefono_apoderado VARCHAR(20)  NULL,
  activo             TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_por         INT UNSIGNED NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_alu_creado FOREIGN KEY (creado_por) REFERENCES usuarios(id),
  INDEX idx_alu_apellidos (apellidos),
  INDEX idx_alu_activo    (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS matriculas (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  id_alumno       INT UNSIGNED      NOT NULL,
  id_salon        INT UNSIGNED      NOT NULL,
  id_anio         SMALLINT UNSIGNED NOT NULL,
  fecha_matricula DATE              NOT NULL,
  activo          TINYINT(1)        NOT NULL DEFAULT 1,
  creado_en       DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_matricula_alumno_anio (id_alumno, id_anio),
  CONSTRAINT fk_mat_alumno FOREIGN KEY (id_alumno) REFERENCES alumnos(id),
  CONSTRAINT fk_mat_salon  FOREIGN KEY (id_salon)  REFERENCES salones(id),
  CONSTRAINT fk_mat_anio   FOREIGN KEY (id_anio)   REFERENCES anios_escolares(id),
  INDEX idx_mat_salon_anio (id_salon, id_anio),
  INDEX idx_mat_anio       (id_anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Un alumno pertenece a un salón por año. Cambia cada ciclo escolar.';


-- ============================================================
--  BLOQUE 5 — SERVICIOS + PRECIOS + TIPOS DE PAGO
-- ============================================================

CREATE TABLE IF NOT EXISTS servicios (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave       VARCHAR(64)      NOT NULL UNIQUE,
  nombre      VARCHAR(128)     NOT NULL,
  descripcion VARCHAR(255)     NULL,
  es_variable TINYINT(1)       NOT NULL DEFAULT 0,
  activo      TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de servicios. es_variable=1 si el precio cambia por cantidad/tamaño';

-- ------------------------------------------------------------
--  Precio inmortalizado: 3 filas por servicio por año
--  (una por tipo de responsable: PERSONAL, ALUMNO, DIRECCION)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS servicio_precios (
  id             INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  id_servicio    TINYINT UNSIGNED  NOT NULL,
  id_anio        SMALLINT UNSIGNED NOT NULL,
  tipo_resp      ENUM('PERSONAL','ALUMNO','DIRECCION') NOT NULL,
  precio         DECIMAL(10,4)     NOT NULL,
  modificado_por INT UNSIGNED      NULL,
  modificado_en  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_precio (id_servicio, id_anio, tipo_resp),
  CONSTRAINT fk_sp_servicio FOREIGN KEY (id_servicio)    REFERENCES servicios(id),
  CONSTRAINT fk_sp_anio     FOREIGN KEY (id_anio)        REFERENCES anios_escolares(id),
  CONSTRAINT fk_sp_usuario  FOREIGN KEY (modificado_por) REFERENCES usuarios(id),
  CONSTRAINT chk_precio_pos CHECK (precio >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Precio vigente por servicio, año y tipo de responsable';

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tipos_pago (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(64)      NOT NULL UNIQUE,
  descripcion VARCHAR(255)     NULL,
  activo      TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  BLOQUE 6 — TRANSACCIONES
-- ============================================================

CREATE TABLE IF NOT EXISTS operaciones (
  id                     INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  id_anio                SMALLINT UNSIGNED NOT NULL,

  -- Quién vino físicamente (originante)
  originante_tipo        ENUM('PERSONAL','ALUMNO') NOT NULL,
  id_originante_personal INT UNSIGNED      NULL,
  id_originante_alumno   INT UNSIGNED      NULL,

  -- Quién paga (responsable del cargo)
  resp_tipo              ENUM('PERSONAL','ALUMNO','DIRECCION') NOT NULL,
  id_resp_personal       INT UNSIGNED      NULL,
  id_resp_alumno         INT UNSIGNED      NULL,

  modalidad              ENUM('CUENTA','PAGO_DIRECTO') NOT NULL DEFAULT 'CUENTA',

  -- Alumno trae encargo de un profesor (encargo)
  es_encargo             TINYINT(1)        NOT NULL DEFAULT 0,
  id_personal_encargo    INT UNSIGNED      NULL,

  fecha_operacion        DATE              NOT NULL,
  hora_operacion         TIME              NOT NULL,
  notas                  VARCHAR(500)      NULL,

  -- Auditoría fila
  creado_por             INT UNSIGNED      NOT NULL,
  creado_en              DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  anulado                TINYINT(1)        NOT NULL DEFAULT 0,
  anulado_por            INT UNSIGNED      NULL,
  anulado_en             DATETIME          NULL,
  motivo_anulacion       VARCHAR(255)      NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_op_anio          FOREIGN KEY (id_anio)               REFERENCES anios_escolares(id),
  CONSTRAINT fk_op_orig_personal FOREIGN KEY (id_originante_personal) REFERENCES personal(id),
  CONSTRAINT fk_op_orig_alumno   FOREIGN KEY (id_originante_alumno)   REFERENCES alumnos(id),
  CONSTRAINT fk_op_resp_personal FOREIGN KEY (id_resp_personal)       REFERENCES personal(id),
  CONSTRAINT fk_op_resp_alumno   FOREIGN KEY (id_resp_alumno)         REFERENCES alumnos(id),
  CONSTRAINT fk_op_encargo       FOREIGN KEY (id_personal_encargo)    REFERENCES personal(id),
  CONSTRAINT fk_op_creado        FOREIGN KEY (creado_por)             REFERENCES usuarios(id),
  CONSTRAINT fk_op_anulado       FOREIGN KEY (anulado_por)            REFERENCES usuarios(id),

  CONSTRAINT chk_op_orig CHECK (
    (originante_tipo = 'PERSONAL'
      AND id_originante_personal IS NOT NULL
      AND id_originante_alumno   IS NULL)
    OR
    (originante_tipo = 'ALUMNO'
      AND id_originante_alumno   IS NOT NULL
      AND id_originante_personal IS NULL)
  ),
  CONSTRAINT chk_op_resp CHECK (
    (resp_tipo = 'PERSONAL'
      AND id_resp_personal IS NOT NULL
      AND id_resp_alumno   IS NULL)
    OR
    (resp_tipo = 'ALUMNO'
      AND id_resp_alumno   IS NOT NULL
      AND id_resp_personal IS NULL)
    OR
    (resp_tipo = 'DIRECCION'
      AND id_resp_personal IS NULL
      AND id_resp_alumno   IS NULL)
  ),
  CONSTRAINT chk_op_encargo CHECK (
    es_encargo = 0
    OR (es_encargo = 1 AND id_personal_encargo IS NOT NULL)
  ),

  INDEX idx_op_anio_fecha  (id_anio, fecha_operacion),
  INDEX idx_op_resp_pers   (id_anio, resp_tipo, id_resp_personal),
  INDEX idx_op_resp_alu    (id_anio, resp_tipo, id_resp_alumno),
  INDEX idx_op_anulado     (anulado),
  INDEX idx_op_creado_por  (creado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS operacion_items (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  id_operacion    INT UNSIGNED      NOT NULL,
  id_servicio     TINYINT UNSIGNED  NOT NULL,
  id_salon        INT UNSIGNED      NULL,   -- NULL cuando es_personal = 1
  es_personal     TINYINT(1)        NOT NULL DEFAULT 0,
  cantidad        SMALLINT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(10,4)     NOT NULL,  -- inmortalizado al insertar
  subtotal        DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  notas           VARCHAR(255)      NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_item_operacion FOREIGN KEY (id_operacion) REFERENCES operaciones(id),
  CONSTRAINT fk_item_servicio  FOREIGN KEY (id_servicio)  REFERENCES servicios(id),
  CONSTRAINT fk_item_salon     FOREIGN KEY (id_salon)     REFERENCES salones(id),

  CONSTRAINT chk_item_personal_sin_salon CHECK (
    NOT (es_personal = 1 AND id_salon IS NOT NULL)
  ),
  CONSTRAINT chk_item_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_item_precio   CHECK (precio_unitario >= 0),

  INDEX idx_item_operacion (id_operacion),
  INDEX idx_item_salon     (id_salon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='precio_unitario inmortalizado en INSERT. subtotal = columna generada.';


-- ============================================================
--  BLOQUE 7 — PAGOS
-- ============================================================

CREATE TABLE IF NOT EXISTS pagos (
  id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  id_anio          SMALLINT UNSIGNED NOT NULL,

  resp_tipo        ENUM('PERSONAL','ALUMNO','DIRECCION') NOT NULL,
  id_resp_personal INT UNSIGNED      NULL,
  id_resp_alumno   INT UNSIGNED      NULL,

  id_tipo_pago     TINYINT UNSIGNED  NOT NULL,
  monto            DECIMAL(10,2)     NOT NULL,
  fecha_pago       DATE              NOT NULL,
  hora_pago        TIME              NOT NULL,
  notas            VARCHAR(255)      NULL,
  id_operacion     INT UNSIGNED      NULL,  -- solo para PAGO_DIRECTO (auto-generado)

  creado_por       INT UNSIGNED      NOT NULL,
  creado_en        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  anulado          TINYINT(1)        NOT NULL DEFAULT 0,
  anulado_por      INT UNSIGNED      NULL,
  anulado_en       DATETIME          NULL,
  motivo_anulacion VARCHAR(255)      NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_pago_anio      FOREIGN KEY (id_anio)          REFERENCES anios_escolares(id),
  CONSTRAINT fk_pago_personal  FOREIGN KEY (id_resp_personal)  REFERENCES personal(id),
  CONSTRAINT fk_pago_alumno    FOREIGN KEY (id_resp_alumno)    REFERENCES alumnos(id),
  CONSTRAINT fk_pago_tipo      FOREIGN KEY (id_tipo_pago)      REFERENCES tipos_pago(id),
  CONSTRAINT fk_pago_operacion FOREIGN KEY (id_operacion)      REFERENCES operaciones(id),
  CONSTRAINT fk_pago_creado    FOREIGN KEY (creado_por)        REFERENCES usuarios(id),
  CONSTRAINT fk_pago_anulado   FOREIGN KEY (anulado_por)       REFERENCES usuarios(id),

  CONSTRAINT chk_pago_resp CHECK (
    (resp_tipo = 'PERSONAL'
      AND id_resp_personal IS NOT NULL
      AND id_resp_alumno   IS NULL)
    OR
    (resp_tipo = 'ALUMNO'
      AND id_resp_alumno   IS NOT NULL
      AND id_resp_personal IS NULL)
    OR
    (resp_tipo = 'DIRECCION'
      AND id_resp_personal IS NULL
      AND id_resp_alumno   IS NULL)
  ),
  CONSTRAINT chk_pago_monto CHECK (monto > 0),

  INDEX idx_pago_anio_resp_pers (id_anio, resp_tipo, id_resp_personal),
  INDEX idx_pago_anio_resp_alu  (id_anio, resp_tipo, id_resp_alumno),
  INDEX idx_pago_fecha          (id_anio, fecha_pago),
  INDEX idx_pago_operacion      (id_operacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  BLOQUE 8 — ANULACIONES
-- ============================================================

CREATE TABLE IF NOT EXISTS anulaciones (
  id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  entidad              ENUM('OPERACION','PAGO') NOT NULL,
  id_operacion         INT UNSIGNED  NULL,
  id_pago              INT UNSIGNED  NULL,
  solicitado_por       INT UNSIGNED  NOT NULL,
  autorizado_por       INT UNSIGNED  NULL,        -- NULL = auto-aprobado
  fecha_anulacion      DATE          NOT NULL,
  hora_anulacion       TIME          NOT NULL,
  motivo               VARCHAR(500)  NOT NULL,
  monto_afectado       DECIMAL(10,2) NOT NULL,
  id_anulacion_cascada INT UNSIGNED  NULL,        -- FK a sí misma (cascada PAGO_DIRECTO)
  creado_en            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_anu_operacion  FOREIGN KEY (id_operacion)         REFERENCES operaciones(id),
  CONSTRAINT fk_anu_pago       FOREIGN KEY (id_pago)              REFERENCES pagos(id),
  CONSTRAINT fk_anu_solicitado FOREIGN KEY (solicitado_por)       REFERENCES usuarios(id),
  CONSTRAINT fk_anu_autorizado FOREIGN KEY (autorizado_por)       REFERENCES usuarios(id),
  CONSTRAINT fk_anu_cascada    FOREIGN KEY (id_anulacion_cascada) REFERENCES anulaciones(id),

  CONSTRAINT chk_anu_entidad CHECK (
    (entidad = 'OPERACION' AND id_operacion IS NOT NULL AND id_pago IS NULL)
    OR
    (entidad = 'PAGO'      AND id_pago IS NOT NULL      AND id_operacion IS NULL)
  ),

  INDEX idx_anu_operacion  (id_operacion),
  INDEX idx_anu_pago       (id_pago),
  INDEX idx_anu_fecha      (fecha_anulacion),
  INDEX idx_anu_solicitado (solicitado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro inmutable de cada anulación. El flag anulado=1 es consecuencia de esta tabla.';


-- ============================================================
--  BLOQUE 9 — AUDITORÍA
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tabla       VARCHAR(64)     NOT NULL,
  id_registro INT UNSIGNED    NOT NULL,
  accion      ENUM('INSERT','UPDATE','SOFT_DELETE') NOT NULL,
  old_values  JSON            NULL,
  new_values  JSON            NULL,
  id_usuario  INT UNSIGNED    NULL,   -- enriquecido por Node tras el trigger
  ip_cliente  VARCHAR(45)     NULL,
  creado_en   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_audit_tabla_reg (tabla, id_registro),
  INDEX idx_audit_usuario   (id_usuario),
  INDEX idx_audit_fecha     (creado_en),
  INDEX idx_audit_accion    (accion, tabla)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ROW_FORMAT=COMPRESSED
  COMMENT='Append-only. Ningún proceso hace UPDATE ni DELETE sobre esta tabla.';

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario  INT UNSIGNED    NOT NULL,
  id_sesion   VARCHAR(128)    NOT NULL,
  accion      ENUM(
                'LOGIN','LOGOUT',
                'VIEW',
                'CREAR_OPERACION','ANULAR_OPERACION',
                'REGISTRAR_PAGO','ANULAR_PAGO',
                'EXPORTAR_CSV','EXPORTAR_PDF','IMPRIMIR_FOLLETO',
                'CAMBIAR_PRECIO','CAMBIAR_CONFIG',
                'CREAR_PERSONAL','EDITAR_PERSONAL',
                'CREAR_ALUMNO','EDITAR_ALUMNO',
                'CLICK'
              ) NOT NULL,
  modulo      VARCHAR(64)     NOT NULL,
  detalle     JSON            NULL,
  ip_cliente  VARCHAR(45)     NULL,
  user_agent  VARCHAR(512)    NULL,
  creado_en   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_act_usuario (id_usuario, creado_en),
  INDEX idx_act_sesion  (id_sesion),
  INDEX idx_act_accion  (accion, creado_en),
  INDEX idx_act_modulo  (modulo, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ROW_FORMAT=COMPRESSED
  COMMENT='Tracking de comportamiento. Purgar registros > 12 meses (job nocturno).';


-- ============================================================
--  VISTAS
-- ============================================================

-- ------------------------------------------------------------
--  vw_operaciones_detalle — join completo para pantalla
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_operaciones_detalle AS
SELECT
  o.id,
  o.id_anio,
  ae.anio                                             AS anio_escolar,

  -- Originante
  o.originante_tipo,
  CONCAT(po.nombres,' ',po.apellidos)                 AS originante_nombre,
  CONCAT(ao.nombres,' ',ao.apellidos)                 AS originante_alumno_nombre,

  -- Responsable
  o.resp_tipo,
  CONCAT(pr.nombres,' ',pr.apellidos)                 AS resp_nombre,
  CONCAT(ar.nombres,' ',ar.apellidos)                 AS resp_alumno_nombre,

  o.modalidad,
  o.es_encargo,
  CONCAT(pe.nombres,' ',pe.apellidos)                 AS encargo_para_nombre,

  o.fecha_operacion,
  o.hora_operacion,
  o.notas,
  o.anulado,
  o.motivo_anulacion,

  -- Totales calculados desde items
  (SELECT SUM(i.subtotal)
   FROM operacion_items i
   WHERE i.id_operacion = o.id)                       AS total_operacion,

  -- Quién registró
  u.nombre_usuario                                    AS creado_por_usuario,
  CONCAT(pu.nombres,' ',pu.apellidos)                 AS creado_por_nombre,
  o.creado_en

FROM operaciones o
JOIN  anios_escolares ae ON ae.id = o.id_anio
LEFT JOIN personal   po  ON po.id = o.id_originante_personal
LEFT JOIN alumnos    ao  ON ao.id = o.id_originante_alumno
LEFT JOIN personal   pr  ON pr.id = o.id_resp_personal
LEFT JOIN alumnos    ar  ON ar.id = o.id_resp_alumno
LEFT JOIN personal   pe  ON pe.id = o.id_personal_encargo
LEFT JOIN usuarios   u   ON u.id  = o.creado_por
LEFT JOIN personal   pu  ON pu.id = u.id_personal;

-- ------------------------------------------------------------
--  vw_saldos — FULL OUTER JOIN emulado con UNION en CTE
--  Compatible MySQL 8.0+ (sin FULL JOIN nativo)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_saldos AS
WITH consumido AS (
  SELECT
    o.id_anio,
    o.resp_tipo,
    o.id_resp_personal,
    o.id_resp_alumno,
    SUM(i.subtotal) AS total_consumido
  FROM operaciones o
  JOIN operacion_items i ON i.id_operacion = o.id
  WHERE o.anulado = 0
  GROUP BY o.id_anio, o.resp_tipo, o.id_resp_personal, o.id_resp_alumno
),
pagado AS (
  SELECT
    p.id_anio,
    p.resp_tipo,
    p.id_resp_personal,
    p.id_resp_alumno,
    SUM(p.monto) AS total_pagado
  FROM pagos p
  WHERE p.anulado = 0
  GROUP BY p.id_anio, p.resp_tipo, p.id_resp_personal, p.id_resp_alumno
),
claves AS (
  SELECT id_anio, resp_tipo, id_resp_personal, id_resp_alumno FROM consumido
  UNION
  SELECT id_anio, resp_tipo, id_resp_personal, id_resp_alumno FROM pagado
)
SELECT
  k.id_anio,
  k.resp_tipo,
  k.id_resp_personal,
  k.id_resp_alumno,
  COALESCE(c.total_consumido, 0)                       AS total_consumido,
  COALESCE(pg.total_pagado,   0)                       AS total_pagado,
  COALESCE(c.total_consumido, 0)
    - COALESCE(pg.total_pagado, 0)                     AS saldo_pendiente
FROM claves k
LEFT JOIN consumido c
  ON  k.id_anio          = c.id_anio
  AND k.resp_tipo        = c.resp_tipo
  AND (k.id_resp_personal = c.id_resp_personal
       OR (k.id_resp_personal IS NULL AND c.id_resp_personal IS NULL))
  AND (k.id_resp_alumno   = c.id_resp_alumno
       OR (k.id_resp_alumno IS NULL AND c.id_resp_alumno IS NULL))
LEFT JOIN pagado pg
  ON  k.id_anio          = pg.id_anio
  AND k.resp_tipo        = pg.resp_tipo
  AND (k.id_resp_personal = pg.id_resp_personal
       OR (k.id_resp_personal IS NULL AND pg.id_resp_personal IS NULL))
  AND (k.id_resp_alumno   = pg.id_resp_alumno
       OR (k.id_resp_alumno IS NULL AND pg.id_resp_alumno IS NULL));

-- ------------------------------------------------------------
--  vw_saldos_personal — solo personal con saldo pendiente > 0
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_saldos_personal AS
SELECT
  s.id_anio,
  p.id                                                AS id_personal,
  p.nombres,
  p.apellidos,
  p.rol,
  s.total_consumido,
  s.total_pagado,
  s.saldo_pendiente
FROM vw_saldos s
JOIN personal p ON p.id = s.id_resp_personal
WHERE s.resp_tipo = 'PERSONAL';

-- ------------------------------------------------------------
--  vw_saldos_alumnos — solo alumnos
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_saldos_alumnos AS
SELECT
  s.id_anio,
  a.id                                                AS id_alumno,
  a.nombres,
  a.apellidos,
  s.total_consumido,
  s.total_pagado,
  s.saldo_pendiente
FROM vw_saldos s
JOIN alumnos a ON a.id = s.id_resp_alumno
WHERE s.resp_tipo = 'ALUMNO';

-- ------------------------------------------------------------
--  vw_anulaciones — detalle de cada anulación con nombres
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_anulaciones AS
SELECT
  an.id,
  an.entidad,
  an.id_operacion,
  an.id_pago,
  an.motivo,
  an.monto_afectado,
  an.fecha_anulacion,
  an.hora_anulacion,
  an.id_anulacion_cascada,
  us.nombre_usuario                                   AS solicitado_por_usuario,
  CONCAT(ps.nombres,' ',ps.apellidos)                 AS solicitado_por_nombre,
  ua.nombre_usuario                                   AS autorizado_por_usuario,
  CONCAT(pa.nombres,' ',pa.apellidos)                 AS autorizado_por_nombre,
  o.resp_tipo                                         AS op_resp_tipo,
  o.modalidad                                         AS op_modalidad,
  o.fecha_operacion                                   AS op_fecha,
  p.monto                                             AS pago_monto,
  p.fecha_pago                                        AS pago_fecha,
  tp.nombre                                           AS pago_tipo
FROM anulaciones an
LEFT JOIN usuarios  us ON us.id = an.solicitado_por
LEFT JOIN personal  ps ON ps.id = us.id_personal
LEFT JOIN usuarios  ua ON ua.id = an.autorizado_por
LEFT JOIN personal  pa ON pa.id = ua.id_personal
LEFT JOIN operaciones o  ON o.id  = an.id_operacion
LEFT JOIN pagos       p  ON p.id  = an.id_pago
LEFT JOIN tipos_pago  tp ON tp.id = p.id_tipo_pago;

-- ------------------------------------------------------------
--  vw_audit_detalle — historial de cambios con nombre de usuario
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_audit_detalle AS
SELECT
  al.id,
  al.tabla,
  al.id_registro,
  al.accion,
  al.old_values,
  al.new_values,
  al.ip_cliente,
  al.creado_en,
  u.nombre_usuario,
  CONCAT(p.nombres,' ',p.apellidos)                   AS nombre_completo
FROM audit_log al
LEFT JOIN usuarios u ON u.id = al.id_usuario
LEFT JOIN personal p ON p.id = u.id_personal;

-- ------------------------------------------------------------
--  vw_activity_reciente — actividad de los últimos 7 días
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_activity_reciente AS
SELECT
  act.id,
  act.accion,
  act.modulo,
  act.detalle,
  act.ip_cliente,
  act.creado_en,
  u.nombre_usuario,
  CONCAT(p.nombres,' ',p.apellidos)                   AS nombre_completo
FROM activity_log act
JOIN  usuarios u ON u.id = act.id_usuario
LEFT JOIN personal p ON p.id = u.id_personal
WHERE act.creado_en >= NOW() - INTERVAL 7 DAY
ORDER BY act.creado_en DESC;


-- ============================================================
--  TRIGGERS — Auditoría automática
--  Los triggers capturan cambios incluso desde clientes SQL
--  directos. Node.js complementa con id_usuario de sesión.
-- ============================================================

DELIMITER $$

-- ── operaciones: INSERT ──────────────────────────────────────
CREATE TRIGGER trg_aud_op_insert
AFTER INSERT ON operaciones FOR EACH ROW
BEGIN
  INSERT INTO audit_log (tabla, id_registro, accion, old_values, new_values)
  VALUES (
    'operaciones', NEW.id, 'INSERT', NULL,
    JSON_OBJECT(
      'resp_tipo',  NEW.resp_tipo,
      'modalidad',  NEW.modalidad,
      'id_anio',    NEW.id_anio,
      'creado_por', NEW.creado_por,
      'anulado',    NEW.anulado
    )
  );
END$$

-- ── operaciones: UPDATE (anulación) ─────────────────────────
CREATE TRIGGER trg_aud_op_update
AFTER UPDATE ON operaciones FOR EACH ROW
BEGIN
  IF NEW.anulado <> OLD.anulado THEN
    INSERT INTO audit_log (tabla, id_registro, accion, old_values, new_values)
    VALUES (
      'operaciones', NEW.id,
      IF(NEW.anulado = 1 AND OLD.anulado = 0, 'SOFT_DELETE', 'UPDATE'),
      JSON_OBJECT('anulado', OLD.anulado, 'motivo_anulacion', OLD.motivo_anulacion),
      JSON_OBJECT('anulado', NEW.anulado, 'motivo_anulacion', NEW.motivo_anulacion,
                  'anulado_por', NEW.anulado_por)
    );
  END IF;
END$$

-- ── pagos: INSERT ────────────────────────────────────────────
CREATE TRIGGER trg_aud_pago_insert
AFTER INSERT ON pagos FOR EACH ROW
BEGIN
  INSERT INTO audit_log (tabla, id_registro, accion, old_values, new_values)
  VALUES (
    'pagos', NEW.id, 'INSERT', NULL,
    JSON_OBJECT(
      'resp_tipo',   NEW.resp_tipo,
      'monto',       NEW.monto,
      'id_tipo',     NEW.id_tipo_pago,
      'id_operacion',NEW.id_operacion,
      'creado_por',  NEW.creado_por
    )
  );
END$$

-- ── pagos: UPDATE (anulación) ────────────────────────────────
CREATE TRIGGER trg_aud_pago_update
AFTER UPDATE ON pagos FOR EACH ROW
BEGIN
  IF NEW.anulado <> OLD.anulado THEN
    INSERT INTO audit_log (tabla, id_registro, accion, old_values, new_values)
    VALUES (
      'pagos', NEW.id, 'SOFT_DELETE',
      JSON_OBJECT('anulado', OLD.anulado, 'monto', OLD.monto),
      JSON_OBJECT('anulado', NEW.anulado, 'anulado_por', NEW.anulado_por,
                  'motivo', NEW.motivo_anulacion)
    );
  END IF;
END$$

-- ── servicio_precios: UPDATE (cambio de precio) ──────────────
CREATE TRIGGER trg_aud_precio_update
AFTER UPDATE ON servicio_precios FOR EACH ROW
BEGIN
  IF NEW.precio <> OLD.precio THEN
    INSERT INTO audit_log (tabla, id_registro, accion, old_values, new_values)
    VALUES (
      'servicio_precios', NEW.id, 'UPDATE',
      JSON_OBJECT('precio', OLD.precio),
      JSON_OBJECT('precio', NEW.precio, 'modificado_por', NEW.modificado_por)
    );
  END IF;
END$$

-- ── configuracion: UPDATE ────────────────────────────────────
CREATE TRIGGER trg_aud_config_update
AFTER UPDATE ON configuracion FOR EACH ROW
BEGIN
  IF NEW.valor <> OLD.valor THEN
    INSERT INTO audit_log (tabla, id_registro, accion, old_values, new_values)
    VALUES (
      'configuracion', NEW.id, 'UPDATE',
      JSON_OBJECT('clave', OLD.clave, 'valor', OLD.valor),
      JSON_OBJECT('clave', NEW.clave, 'valor', NEW.valor,
                  'modificado_por', NEW.modificado_por)
    );
  END IF;
END$$

DELIMITER ;


-- ============================================================
--  DATOS DE EJEMPLO (SEED)
--  Orden respeta todas las dependencias de FK.
-- ============================================================

-- ── 1. Roles ─────────────────────────────────────────────────
INSERT INTO roles_sistema (nombre, descripcion) VALUES
  ('ADMIN',         'Acceso total al sistema'),
  ('CAJERO',        'Registra operaciones y pagos del día'),
  ('SOLO_LECTURA',  'Solo puede consultar reportes');

-- ── 2. Módulos ───────────────────────────────────────────────
INSERT INTO modulos (clave, nombre, icono, orden) VALUES
  ('operaciones', 'Operaciones',    'file-text',    1),
  ('deudas',      'Deudas y Pagos', 'banknote',     2),
  ('reportes',    'Reportes',       'bar-chart-3',  3),
  ('catalogos',   'Catálogos',      'book-open',    4),
  ('config',      'Configuración',  'settings',     5);

-- ── 3. Año escolar ───────────────────────────────────────────
INSERT INTO anios_escolares (anio, descripcion, activo, fecha_inicio, fecha_fin) VALUES
  (2024, 'Año escolar 2024', 0, '2024-03-01', '2024-12-20'),
  (2025, 'Año escolar 2025', 0, '2025-03-03', '2025-12-19'),
  (2026, 'Año escolar 2026', 1, '2026-03-02', '2026-12-18');

-- ── 4. Personal (sin creado_por aún — usuario no existe) ─────
INSERT INTO personal (nombres, apellidos, dni, rol) VALUES
  ('Carlos',   'Mendoza Ríos',    '43210001', 'DIRECTOR'),
  ('Lucía',    'Torres Vega',     '43210002', 'SECRETARIA'),
  ('Ana',      'Huamán López',    '43210003', 'CAJERO'),
  ('Juan',     'Pérez Torres',    '43210004', 'PROFESOR'),
  ('Rosa',     'Flores Mamani',   '43210005', 'PROFESOR'),
  ('Miguel',   'Quispe Salas',    '43210006', 'PROFESOR'),
  ('Patricia', 'Vargas Cáceres',  '43210007', 'PERSONAL_ADMINISTRATIVO');

-- ── 5. Usuarios ──────────────────────────────────────────────
-- Contraseñas demo: admin123 y cajero123
-- Hash bcrypt generado con saltRounds=10 (reemplazar en producción)
INSERT INTO usuarios (nombre_usuario, password_hash, id_personal, id_rol) VALUES
  ('admin',   '$2b$10$YKdemo.admin.hash.placeholder.xxxxxxxxxxxxxxxxxxxxxxxxxxx', 1, 1),
  ('cajero1', '$2b$10$YKdemo.cajer.hash.placeholder.xxxxxxxxxxxxxxxxxxxxxxxxxxx', 3, 2);

-- Actualizar creado_por en personal (ahora sí existe usuario id=1)
UPDATE personal SET creado_por = 1;

-- ── 6. Permisos por rol ──────────────────────────────────────
-- ADMIN: acceso total a todos los módulos
INSERT INTO rol_modulos (id_rol, id_modulo, puede_ver, puede_crear, puede_editar, puede_anular)
SELECT 1, id, 1, 1, 1, 1 FROM modulos;

-- CAJERO: solo operaciones y deudas, sin editar ni anular config
INSERT INTO rol_modulos (id_rol, id_modulo, puede_ver, puede_crear, puede_editar, puede_anular)
VALUES
  (2, 1, 1, 1, 0, 1),  -- operaciones: ver, crear, anular
  (2, 2, 1, 1, 0, 0),  -- deudas: ver y crear pagos
  (2, 3, 1, 0, 0, 0),  -- reportes: solo ver
  (2, 4, 1, 0, 0, 0),  -- catálogos: solo ver
  (2, 5, 0, 0, 0, 0);  -- config: sin acceso

-- SOLO_LECTURA: solo ver reportes y catálogos
INSERT INTO rol_modulos (id_rol, id_modulo, puede_ver, puede_crear, puede_editar, puede_anular)
VALUES
  (3, 3, 1, 0, 0, 0),
  (3, 4, 1, 0, 0, 0);

-- ── 7. Configuración ─────────────────────────────────────────
INSERT INTO configuracion (clave, valor, descripcion, id_anio, modificado_por) VALUES
  ('nombre_institucion', 'I.E. San Marcos',           'Nombre del colegio',                          NULL, 1),
  ('moneda',             'PEN',                       'Moneda del sistema (ISO 4217)',                NULL, 1),
  ('anulacion_max_dias', '1',                         'Días máximos para anular (rol CAJERO)',        NULL, 1),
  ('activity_log_retension_meses', '12',              'Meses a conservar en activity_log',            NULL, 1),
  ('sesion_expiracion_horas',      '8',               'Duración de sesión en horas',                  NULL, 1);

-- ── 8. Salones ───────────────────────────────────────────────
INSERT INTO salones (nombre, nivel, grado, seccion, id_tutor) VALUES
  ('Primaria 3°A',   'PRIMARIA',   3, 'A', 4),
  ('Primaria 4°B',   'PRIMARIA',   4, 'B', 5),
  ('Secundaria 1°A', 'SECUNDARIA', 1, 'A', 6),
  ('Secundaria 2°A', 'SECUNDARIA', 2, 'A', 4),
  ('Secundaria 3°A', 'SECUNDARIA', 3, 'A', 5),
  ('Secundaria 5°B', 'SECUNDARIA', 5, 'B', 6);

-- ── 9. Alumnos ───────────────────────────────────────────────
INSERT INTO alumnos (nombres, apellidos, dni, creado_por) VALUES
  ('Camila',  'Vega Paredes',   '75000001', 1),
  ('Rodrigo', 'Luna Castillo',  '75000002', 1),
  ('Valeria', 'Soto Quispe',    '75000003', 1),
  ('Diego',   'Mamani Torres',  '75000004', 1);

-- ── 10. Matrículas ───────────────────────────────────────────
-- Año 2026 = id 3
INSERT INTO matriculas (id_alumno, id_salon, id_anio, fecha_matricula) VALUES
  (1, 3, 3, '2026-03-02'),  -- Camila → Sec 1°A
  (2, 1, 3, '2026-03-02'),  -- Rodrigo → Pri 3°A
  (3, 5, 3, '2026-03-03'),  -- Valeria → Sec 3°A
  (4, 2, 3, '2026-03-03');  -- Diego → Pri 4°B

-- ── 11. Servicios ────────────────────────────────────────────
INSERT INTO servicios (clave, nombre, descripcion, es_variable) VALUES
  ('copia_bn',       'Copia B/N',          'Fotocopia en blanco y negro',          0),
  ('copia_color',    'Copia a Color',      'Fotocopia a color',                    0),
  ('impresion_bn',   'Impresión B/N',      'Impresión láser blanco y negro',       0),
  ('impresion_color','Impresión a Color',  'Impresión láser a color',              0),
  ('anillado',       'Anillado',           'Anillado con espiral plástica',        1),
  ('plastificado',   'Plastificado',       'Plastificado en frío o caliente',      1);

-- ── 12. Precios 2026 (id_anio=3) ─────────────────────────────
INSERT INTO servicio_precios (id_servicio, id_anio, tipo_resp, precio, modificado_por) VALUES
  -- Copia B/N
  (1, 3, 'PERSONAL',  0.1000, 1),
  (1, 3, 'ALUMNO',    0.2000, 1),
  (1, 3, 'DIRECCION', 0.1000, 1),
  -- Copia a Color
  (2, 3, 'PERSONAL',  0.4000, 1),
  (2, 3, 'ALUMNO',    0.5000, 1),
  (2, 3, 'DIRECCION', 0.4000, 1),
  -- Impresión B/N
  (3, 3, 'PERSONAL',  0.2000, 1),
  (3, 3, 'ALUMNO',    0.3000, 1),
  (3, 3, 'DIRECCION', 0.2000, 1),
  -- Impresión a Color
  (4, 3, 'PERSONAL',  0.5000, 1),
  (4, 3, 'ALUMNO',    0.6000, 1),
  (4, 3, 'DIRECCION', 0.5000, 1),
  -- Anillado (precio base variable)
  (5, 3, 'PERSONAL',  3.0000, 1),
  (5, 3, 'ALUMNO',    3.5000, 1),
  (5, 3, 'DIRECCION', 3.0000, 1),
  -- Plastificado (precio base variable)
  (6, 3, 'PERSONAL',  1.5000, 1),
  (6, 3, 'ALUMNO',    2.0000, 1),
  (6, 3, 'DIRECCION', 1.5000, 1);

-- ── 13. Tipos de pago ────────────────────────────────────────
INSERT INTO tipos_pago (nombre, descripcion) VALUES
  ('Efectivo',     'Pago en efectivo en caja'),
  ('Transferencia','Transferencia bancaria'),
  ('Yape',         'Pago por Yape'),
  ('Plin',         'Pago por Plin');

-- ── 14. Operaciones de ejemplo ───────────────────────────────
-- op 1: Profesor Juan (id=4) viene en persona → copias de su salón Pri 3°A (id=1) → CUENTA
INSERT INTO operaciones
  (id_anio, originante_tipo, id_originante_personal, resp_tipo, id_resp_personal,
   modalidad, fecha_operacion, hora_operacion, creado_por)
VALUES (3, 'PERSONAL', 4, 'PERSONAL', 4, 'CUENTA', '2026-05-21', '09:15:00', 2);

-- op 2: Prof. Rosa (id=5) viene → impresión personal → CUENTA
INSERT INTO operaciones
  (id_anio, originante_tipo, id_originante_personal, resp_tipo, id_resp_personal,
   modalidad, fecha_operacion, hora_operacion, creado_por)
VALUES (3, 'PERSONAL', 5, 'PERSONAL', 5, 'CUENTA', '2026-05-21', '10:30:00', 2);

-- op 3: Alumna Camila (id=1) viene y paga directo → PAGO_DIRECTO
INSERT INTO operaciones
  (id_anio, originante_tipo, id_originante_alumno, resp_tipo, id_resp_alumno,
   modalidad, fecha_operacion, hora_operacion, creado_por)
VALUES (3, 'ALUMNO', 1, 'ALUMNO', 1, 'PAGO_DIRECTO', '2026-05-22', '10:05:00', 2);

-- op 4: Camila (id=1) trae encargo del Prof. Juan (id=4) → es_encargo=1
INSERT INTO operaciones
  (id_anio, originante_tipo, id_originante_alumno, resp_tipo, id_resp_personal,
   modalidad, es_encargo, id_personal_encargo,
   fecha_operacion, hora_operacion, creado_por)
VALUES (3, 'ALUMNO', 1, 'PERSONAL', 4, 'CUENTA', 1, 4, '2026-05-22', '11:00:00', 2);

-- op 5: Dirección solicita impresiones → CUENTA
INSERT INTO operaciones
  (id_anio, originante_tipo, id_originante_personal, resp_tipo,
   modalidad, fecha_operacion, hora_operacion, creado_por)
VALUES (3, 'PERSONAL', 2, 'DIRECCION', 'CUENTA', '2026-05-23', '08:45:00', 2);

-- ── 15. Ítems de operaciones ──────────────────────────────────
-- op 1: 50 copias B/N salón Pri 3°A (id_salon=1), precio PERSONAL=0.10
INSERT INTO operacion_items (id_operacion, id_servicio, id_salon, es_personal, cantidad, precio_unitario)
VALUES (1, 1, 1, 0, 50, 0.1000);

-- op 2: 5 impresiones B/N personales, precio PERSONAL=0.20
INSERT INTO operacion_items (id_operacion, id_servicio, id_salon, es_personal, cantidad, precio_unitario)
VALUES (2, 3, NULL, 1, 5, 0.2000);

-- op 3: alumna Camila, 22 copias B/N precio ALUMNO=0.20 y 1 anillado=3.50
INSERT INTO operacion_items (id_operacion, id_servicio, id_salon, es_personal, cantidad, precio_unitario)
VALUES
  (3, 1, NULL, 1, 22, 0.2000),
  (3, 5, NULL, 1,  1, 3.5000);

-- op 4: encargo de Juan traído por Camila → 30 copias salón Pri 3°A (id_salon=1)
INSERT INTO operacion_items (id_operacion, id_servicio, id_salon, es_personal, cantidad, precio_unitario)
VALUES (4, 1, 1, 0, 30, 0.1000);

-- op 5: dirección → 20 impresiones color, precio DIRECCION=0.50
INSERT INTO operacion_items (id_operacion, id_servicio, id_salon, es_personal, cantidad, precio_unitario)
VALUES (5, 4, NULL, 1, 20, 0.5000);

-- ── 16. Pagos ────────────────────────────────────────────────
-- Pago auto-generado por op 3 PAGO_DIRECTO (22×0.20 + 1×3.50 = 7.90)
INSERT INTO pagos
  (id_anio, resp_tipo, id_resp_alumno, id_tipo_pago, monto, fecha_pago, hora_pago,
   notas, id_operacion, creado_por)
VALUES (3, 'ALUMNO', 1, 1, 7.90, '2026-05-22', '10:05:00', 'Pago directo — auto', 3, 2);

-- Abono libre de Prof. Juan (S/ 20.00)
INSERT INTO pagos
  (id_anio, resp_tipo, id_resp_personal, id_tipo_pago, monto, fecha_pago, hora_pago,
   notas, creado_por)
VALUES (3, 'PERSONAL', 4, 1, 20.00, '2026-05-22', '11:30:00', 'Abono mensual', 2);

-- Dirección abona S/ 30.00 por transferencia
INSERT INTO pagos
  (id_anio, resp_tipo, id_tipo_pago, monto, fecha_pago, hora_pago,
   notas, creado_por)
VALUES (3, 'DIRECCION', 2, 30.00, '2026-05-23', '09:00:00', 'Transferencia BCP ref. 88821', 2);


-- ============================================================
--  PERMISOS DE BASE DE DATOS (ejecutar como root)
--  Reemplazar 'pass_seguro_aqui' con contraseñas reales.
-- ============================================================

-- Usuario de la aplicación Node.js (acceso limitado)
-- CREATE USER IF NOT EXISTS 'bce_app'@'localhost' IDENTIFIED BY 'pass_seguro_aqui';
-- GRANT SELECT, INSERT, UPDATE ON bce_system.* TO 'bce_app'@'localhost';
-- REVOKE DELETE ON bce_system.*               FROM 'bce_app'@'localhost';
-- REVOKE UPDATE  ON bce_system.audit_log      FROM 'bce_app'@'localhost';
-- REVOKE UPDATE  ON bce_system.activity_log   FROM 'bce_app'@'localhost';

-- Usuario admin para backups y consultas directas
-- CREATE USER IF NOT EXISTS 'bce_admin'@'localhost' IDENTIFIED BY 'pass_admin_aqui';
-- GRANT ALL PRIVILEGES ON bce_system.* TO 'bce_admin'@'localhost';

-- FLUSH PRIVILEGES;


-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================

SET foreign_key_checks = 1;

-- Verificación rápida al final:
SELECT
  TABLE_NAME                          AS `Tabla`,
  TABLE_ROWS                          AS `Filas_aprox`,
  ROUND(DATA_LENGTH/1024,1)           AS `Datos_KB`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'bce_system'
  AND TABLE_TYPE   = 'BASE TABLE'
ORDER BY TABLE_NAME;
