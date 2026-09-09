# BCE System — Plan de análisis y migración del frontend

## Versionado del proyecto y punto de partida

El proyecto actual de la carpeta principal `D:\Trabajos\Propios\bce-system` se considerará:

```text
BCE System v1 — Prototipo funcional terminado entre comillas
```

La expresión “terminado entre comillas” significa que la versión actual ya permite demostrar y probar los flujos principales, pero todavía tiene limitaciones importantes:

- Utiliza JavaScript vanilla.
- Utiliza datos demo y `localStorage`.
- No tiene SQLite.
- No tiene API.
- No tiene autenticación real.
- No tiene auditoría productiva.
- No tiene instalador Electron.
- No debe considerarse todavía una versión productiva definitiva.

### Regla de versionado

- **v1:** versión actual congelada como referencia funcional.
- **v2:** migración del frontend a React + TypeScript como SPA web, todavía sin Electron.
- **v3:** misma SPA React empaquetada como escritorio con Electron y almacenamiento local SQLite.
- **v4:** versión conectada a API, autenticación y base online.
- **v5:** versión multiusuario endurecida para producción, con auditoría, actualizaciones y operación centralizada.

Electron no se considera parte obligatoria de la migración a React. React construye la aplicación; Electron la empaqueta y le permite ejecutarse como escritorio. Por eso v2 debe validar primero la SPA web y v3 debe reutilizar ese mismo frontend para crear la versión de escritorio, sin duplicar la aplicación.

### Variantes visuales de la v2

La migración a React se implementará con dos variantes visuales comparables, sin duplicar la lógica del sistema:

```text
v2-base: React + TypeScript + Vite + módulos funcionales BCE
v2-tailadmin: v2-base con TailAdmin Free, Tailwind y shadcn/ui/Radix
v2-mantis: v2-base con Mantis Free y MUI
```

TailAdmin será la variante principal. Mantis Free se conservará como prototipo visual alternativo para comparar la apariencia, densidad, tablas, formularios, navegación y experiencia general antes de elegir definitivamente el diseño.

Estas variantes no representan dos versiones funcionales distintas. Ambas deben reutilizar los mismos datos demo, contratos, reglas de negocio, rutas, pruebas y componentes de dominio. Solo debe cambiar la capa de presentación y los adaptadores visuales. La comparación se realizará sobre las pantallas principales: dashboard, operaciones, kiosco, pagos, deudas, catálogos y reportes.

No será necesario regresar manualmente al código vanilla de v1 para construir la alternativa. La v1 se conservará congelada como referencia y cada variante se guardará mediante etiquetas o ramas Git independientes. En la misma carpeta de trabajo solo se cambiará de rama cuando sea necesario visualizar una opción.

Las versiones no deben sobrescribir silenciosamente la anterior. Cada versión debe tener:

- Código etiquetado en Git.
- Registro de cambios.
- Datos de migración.
- Instrucciones de instalación.
- Respaldo compatible.
- Criterios de aceptación.
- Plan de reversión.

### Congelamiento de v1

Antes de iniciar v2 se debe:

1. Crear una etiqueta Git, por ejemplo `v1.0.0`.
2. Crear una copia comprimida del proyecto actual.
3. Exportar los datos demo actuales.
4. Documentar los flujos que funcionan en v1.
5. Registrar defectos conocidos sin corregirlos dentro de v1 salvo que impidan continuar.
6. No mezclar cambios de la migración con la rama de referencia v1.

La v1 se conserva como referencia visual y funcional. Las mejoras posteriores se desarrollan en ramas y versiones nuevas.

## Orden de lectura

1. [Propósito del proyecto](#1-propósito-del-proyecto)
2. [Estado técnico actual](#2-estado-técnico-actual)
3. [Diagnóstico del frontend actual](#3-diagnóstico-del-frontend-actual)
4. [Mejoras visuales y de experiencia de usuario](#4-mejoras-visuales-y-de-experiencia-de-usuario)
5. [Mejoras de lógica y reglas de negocio](#5-mejoras-de-lógica-y-reglas-de-negocio)
6. [Relación con la futura base de datos](#6-relación-con-la-futura-base-de-datos)
7. [Estrategia de datos offline y online](#7-estrategia-de-datos-offline-y-online)
8. [Tecnologías que se evaluarán](#8-tecnologías-que-se-evaluarán)
9. [Frameworks CSS, UI kits y templates administrativos](#9-frameworks-css-ui-kits-y-templates-administrativos)
10. [Alternativas para escritorio](#10-alternativas-para-escritorio)
11. [Tres opciones de stack recomendadas](#11-tres-opciones-de-stack-recomendadas)
12. [Stack detallado recomendado](#12-stack-detallado-recomendado)
13. [Arquitectura objetivo](#13-arquitectura-objetivo)
14. [Alcance del MVP de escritorio](#14-alcance-del-mvp-de-escritorio)
15. [Roadmap de migración](#15-roadmap-de-migración)
16. [Recomendación final](#16-recomendación-final)
17. [Límites de esta etapa](#17-límites-de-esta-etapa)
18. [Backend y API para la siguiente etapa](#18-backend-y-api-para-la-siguiente-etapa)
19. [Stack completo recomendado con API y base de datos](#19-stack-completo-recomendado-con-api-y-base-de-datos)
20. [Implementación y salida a producción por fases](#20-implementación-y-salida-a-producción-por-fases)
21. [Instalación y levantamiento en el ordenador del usuario](#21-instalación-y-levantamiento-en-el-ordenador-del-usuario)
22. [Decisiones tecnológicas confirmadas](#22-decisiones-tecnológicas-confirmadas)

## 1. Propósito del proyecto

BCE System significa **Bitácora de Copias Escolares**. Es un sistema administrativo para una institución educativa, orientado a registrar y controlar:

- Copias e impresiones.
- Anillados, escaneos y plastificados.
- Solicitudes de profesores, alumnos y dirección.
- Consumos por salón.
- Operaciones individuales y por lote.
- Deudas y pagos.
- Historial de operaciones.
- Reportes diarios y por período.
- Catálogos de alumnos, profesores, personal y salones.
- Precios de servicios.
- Kiosco: productos, búsqueda, precios y ventas asociadas al solicitante.
- Exportación a CSV e impresión.

El proyecto actual es un prototipo funcional de frontend. Todavía no es una aplicación Electron completa, no tiene backend conectado y no utiliza MySQL desde la interfaz.

---

## 2. Estado técnico actual

### Tecnologías existentes

- HTML.
- CSS propio.
- JavaScript vanilla.
- Chart.js cargado desde CDN.
- Lucide cargado desde CDN.
- `localStorage` como almacenamiento.
- Datos demo definidos manualmente.
- Un esquema MySQL preparado para una fase futura.

### Archivos principales

- `index.html`: shell visual y carga de scripts.
- `css/theme.css`: variables de diseño.
- `css/style.css`: estilos de componentes y layout.
- `js/main.js`: navegación, inicialización y objeto global `BCE`.
- `js/db.js`: datos demo y persistencia local.
- `js/helpers.js`: búsquedas, formatos y cálculos.
- `js/ui.js`: modales, confirmaciones y notificaciones.
- `js/utils.js`: exportación CSV, impresión y menús.
- `js/views/operaciones.js`: nueva operación.
- `js/views/lote.js`: registro por lote.
- `js/views/deudas.js`: deudas y pagos.
- `js/views/reportes.js`: reportes.
- `js/views/catalogos.js`: catálogos.
- `database/bce_schema_mysql.sql`: diseño futuro de MySQL.

### Kiosco: alcance actualmente incompleto

La pantalla de nueva operación ya contempla un modo **Kiosco**, pero el proyecto todavía no tiene un catálogo ni una vista dedicada para buscar productos de kiosco. Actualmente se permite escribir o buscar de forma limitada desde la misma operación, pero no existe una administración completa de:

- Productos.
- Categorías.
- Precio de venta.
- Precio de costo, si se desea controlar inventario.
- Unidad de medida.
- Producto activo/inactivo.
- Existencias.
- Código de producto o código de barras.
- Historial de cambios de precio.
- Ventas y devoluciones.

Se recomienda incorporar posteriormente `catalogos/kiosko` o `catalogos/productos`, con búsqueda por nombre, código, categoría y estado. La operación de kiosco debe mantenerse separada conceptualmente de los servicios de copias, aunque pueda compartir operaciones, pagos y reportes.

### Tamaño observado

El frontend contiene aproximadamente:

- 5.324 líneas de JavaScript.
- 233 funciones y variables globales detectadas.
- Vistas individuales de gran tamaño.
- Estado compartido entre múltiples archivos.

---

## 3. Diagnóstico del frontend actual

### Fortalezas

- El flujo funcional principal ya está prototipado.
- Existe una interfaz visual coherente.
- Los módulos principales están identificados.
- Hay datos demo para probar la aplicación.
- Existen reportes, exportaciones y cálculos de deuda.
- El esquema MySQL futuro contempla auditoría, roles y relaciones.

### Problemas principales

#### 3.1. Estado global

El sistema depende de objetos y funciones globales como `DB`, `NOP`, `LOT` y `window.BCE`.

Esto dificulta:

- Probar la lógica.
- Saber quién modifica los datos.
- Evitar conflictos entre módulos.
- Migrar partes del sistema.
- Trabajar con varios desarrolladores.

#### 3.2. Vistas mezcladas con lógica

Las vistas contienen al mismo tiempo:

- HTML.
- Eventos.
- Validaciones.
- Cálculos.
- Persistencia.
- Mensajes de usuario.

Debe separarse la pantalla de las reglas y de la persistencia.

#### 3.3. Uso intensivo de `innerHTML`

La interfaz se construye principalmente mediante strings HTML. Esto dificulta:

- Crear componentes reutilizables.
- Controlar eventos.
- Aplicar tipado.
- Escapar correctamente datos ingresados.
- Realizar pruebas.

#### 3.4. Eventos inline

Existen muchos eventos como:

```html
onclick="BCE.saveAlumno(...)"
onchange="BCE.setYear(this.value)"
oninput="BCE.histSearch(this.value)"
```

Esto mezcla presentación con comportamiento y debe reemplazarse gradualmente por eventos controlados por componentes.

#### 3.5. Persistencia débil

`localStorage` es apropiado para una demo, pero no es suficiente para producción porque:

- Los datos están ligados al navegador o instalación.
- Se pueden borrar accidentalmente.
- No existen transacciones.
- No hay multiusuario real.
- No hay permisos confiables.
- No hay auditoría real.
- No hay respaldo automático.

Para la fase frontend se conservará almacenamiento local, pero detrás de un repositorio desacoplado.

#### 3.6. Dependencias externas

Lucide, Chart.js y Google Fonts se cargan desde Internet. Para un escritorio offline las dependencias deben empaquetarse localmente.

---

## 4. Mejoras visuales y de experiencia de usuario

### Prioridad alta

- Formularios con validación específica por campo.
- Errores visibles junto al campo correspondiente.
- Estados de carga, vacío y error.
- Confirmaciones claras antes de borrar o anular.
- Totales visibles y fáciles de verificar.
- Búsqueda rápida de alumnos y profesores.
- Menos pasos para registrar una operación.
- Atajos de teclado para recepción o caja.
- Botones consistentes.
- Tablas con filtros, ordenamiento y paginación.
- Impresión clara de comprobantes y estados de cuenta.

### Accesibilidad

- Navegación completa con teclado.
- Foco visible.
- Etiquetas correctas.
- Contraste suficiente.
- Diálogos accesibles.
- Mensajes que no dependan solo del color.
- Tamaños adecuados para pantallas táctiles o monitores pequeños.

### Diseño visual

Crear un sistema de componentes reutilizables:

- Botones.
- Campos de formulario.
- Selectores.
- Modal.
- Confirmación destructiva.
- Tabla.
- Paginación.
- Badge de estado.
- Toast.
- Empty state.
- Indicador de carga.
- Selector de fecha.

---

## 5. Mejoras de lógica y reglas de negocio

Las reglas deben dejar de estar distribuidas entre las vistas y pasar a una capa de dominio.

### Precios

Definir formalmente:

- Precio por tipo de solicitante.
- Precio por servicio.
- Precio variable.
- Redondeo.
- Precio histórico.
- Cambio de precios.
- Descuentos, si aplican.

### Operaciones

Definir:

- Estados de una operación.
- Operación pagada directamente.
- Operación a cuenta.
- Operación anulada.
- Operación modificada.
- Operación de alumno que lleva un encargo de profesor.
- Operación asociada a salón.

### Pagos

Definir:

- Pago completo.
- Pago parcial.
- Abono.
- Pago directo.
- Pago superior al saldo.
- Devolución.
- Anulación de pago.
- Asociación del pago con una operación o entidad.

### Deudas

Definir claramente si la deuda pertenece a:

- Profesor.
- Salón.
- Alumno.
- Dirección.
- Personal administrativo.

También se debe definir qué ocurre cuando:

- Un alumno cambia de salón.
- Un profesor deja de ser tutor.
- Se elimina un salón.
- Se anula una operación histórica.
- Se cambia un precio después de registrar una operación.

### Año escolar

Definir:

- Inicio y cierre del año.
- Datos que se conservan.
- Precios por año.
- Deudas arrastradas.
- Reutilización de salones.

> **Corrección de alcance:** este sistema no es un sistema académico ni registra matrículas escolares. La referencia anterior a “historial de matrículas” no corresponde a BCE System y se elimina. Si en el futuro se necesita saber a qué salón pertenecía un alumno cuando realizó una operación, debe manejarse como historial de asignación o contexto de la operación, no como matrícula escolar.

### Pagos y tipos de pago

Cada pago debe registrar obligatoriamente un tipo de pago proveniente de un catálogo controlado, por ejemplo:

- Efectivo.
- Transferencia bancaria.
- Yape.
- Plin.
- Tarjeta.
- Otro, solo si se exige una descripción.

Además del tipo, la aplicación debe permitir validar la evidencia o referencia correspondiente:

| Tipo | Datos requeridos recomendados |
|---|---|
| Efectivo | Monto recibido y vuelto, si aplica |
| Transferencia | Banco, número de operación o referencia |
| Yape/Plin | Número de operación, celular o referencia visible |
| Tarjeta | Marca, últimos cuatro dígitos o código de autorización |
| Otro | Descripción obligatoria y observación |

El pago debe tener:

- `tipoPagoId`.
- `monto`.
- `fechaHora`.
- `entidadResponsable`.
- `operacionId` opcional.
- `referenciaExterna` opcional u obligatoria según el tipo.
- `notas`.
- Usuario que registró.
- Estado: registrado, anulado o revertido.

La asociación puede ser con una operación concreta o con una entidad responsable (profesor, alumno, dirección o personal). No se debe permitir registrar un pago sin identificar quién paga, el tipo de pago y el monto. La validación final debe vivir en una función de dominio y, posteriormente, también en el backend.

### Evidencia, hora y referencia del pago

La hora de registro del sistema y la evidencia del pago cumplen funciones distintas:

- `fechaHoraRegistro`: cuándo se registró el pago en BCE.
- `fechaHoraPago`: cuándo se realizó el pago, si el usuario puede informarlo.
- `referenciaExterna`: número de operación, código de autorización o identificador entregado por el medio de pago.
- `evidenciaImagen`: captura o comprobante visual, únicamente cuando la regla del tipo de pago la requiera o el responsable decida adjuntarla.

La hora por sí sola no demuestra que el dinero haya sido enviado. La referencia tampoco siempre es suficiente: sirve para identificar la operación en el medio de pago, pero la institución puede necesitar revisar el comprobante visual antes de aceptar el pago. Por eso no deben mezclarse estos conceptos.

#### Regla recomendada por tipo de pago

| Tipo de pago | Referencia | Imagen | Validación |
|---|---|---|---|
| Efectivo | No obligatoria | No obligatoria | Monto recibido y vuelto, si corresponde |
| Transferencia bancaria | Obligatoria | Recomendada u obligatoria según política | No repetir la misma referencia para el mismo banco/cuenta |
| Yape/Plin | Obligatoria | Recomendada u obligatoria según política | Validar referencia, monto, fecha y receptor |
| Tarjeta | Código de autorización obligatorio | Normalmente no obligatoria | Validar autorización y últimos cuatro dígitos si se registran |
| Otro | Referencia o descripción obligatoria | Según configuración | Revisión manual |

Se recomienda que cada tipo de pago tenga configuración:

```text
requiere_referencia
requiere_imagen
permite_imagen
requiere_validacion_manual
```

Así no se obliga a adjuntar una imagen para efectivo, pero sí se puede exigir para una transferencia o un pago móvil. La política puede variar por institución y debe ser configurable, no codificada de forma rígida en cada pantalla.

#### Validaciones de la imagen

Cuando la imagen sea obligatoria:

- Debe existir un archivo adjunto.
- Debe ser una imagen permitida: JPG, JPEG, PNG o WebP.
- Debe respetar un tamaño máximo configurable.
- Debe validarse que no esté vacía o dañada.
- Debe mostrar estado: pendiente de revisión, validada o rechazada.
- Debe registrar quién la validó y cuándo.
- Si se rechaza, debe exigirse un motivo.
- La operación no debe marcarse como pago confirmado hasta completar la validación manual, si la política lo requiere.

El archivo no debe guardarse como una cadena Base64 dentro de una tabla de pagos. Para una primera aplicación local puede guardarse en una carpeta administrada por Electron y registrar en los datos únicamente la ruta, nombre seguro, tamaño, tipo, hash y estado. En una fase con backend, se trasladaría a almacenamiento de archivos y la base de datos conservaría sus metadatos.

La imagen es evidencia; no sustituye al tipo de pago, monto, fecha, referencia ni usuario que registra. Tampoco garantiza por sí sola que el dinero sea real: la confirmación final depende de la política de revisión.

---

## 6. Relación con la futura base de datos

El frontend actual utiliza estructuras simples:

```text
DB.profesores
DB.alumnos
DB.salones
DB.operaciones
DB.pagos
```

El modelo MySQL futuro utiliza:

```text
personal
usuarios
salones
alumnos
operaciones
operacion_items
pagos
anulaciones
audit_log
activity_log
```

Antes de conectar el frontend con MySQL se necesitará una capa de adaptación.

El frontend no debe depender directamente de nombres o detalles de MySQL. Debe trabajar con modelos y casos de uso propios, de manera que posteriormente se pueda cambiar:

```text
Repositorio local
```

por:

```text
Repositorio mediante API
```

sin reescribir todas las pantallas.

### Recomendaciones para claves, códigos y correlativos

Cada tabla debe tener una clave primaria técnica (`id`) estable. La recomendación general es:

- `BIGINT UNSIGNED AUTO_INCREMENT` para la PK interna de MySQL cuando el sistema sea centralizado.
- UUID/ULID cuando se necesite generar identificadores fuera de la base de datos o sincronizar instalaciones.
- No usar el código visible del negocio como PK.
- Mantener un código alfanumérico único para búsquedas y documentos.

Ejemplo conceptual:

```text
id: 125
codigo: OP-2026-000125
```

La PK identifica técnicamente el registro. El código es legible para el usuario y puede cambiar de formato sin romper relaciones internas.

### Correlativos por año y por tipo

Para operaciones o comprobantes que deban reiniciar el contador anualmente, se recomienda guardar:

```text
anio: 2026
numero: 1
codigo: OP-2026-000001
```

La combinación debe tener una restricción única:

```text
UNIQUE(anio, numero)
```

No se debe confiar únicamente en `MAX(numero) + 1`, porque dos usuarios podrían obtener el mismo número. El backend futuro deberá generar el correlativo dentro de una transacción o mediante una tabla de secuencias.

Para códigos como `2026-1`, se recomienda aclarar el significado:

- `2026-1`: primer registro del año 2026.
- `2027-1`: primer registro del año 2027.
- Si se requiere empezar en cero, usar explícitamente `2027-0`, pero documentarlo y no mezclarlo con numeración humana que normalmente empieza en uno.

Para BCE System se recomienda que las operaciones empiecen en `1`, salvo que exista una razón operativa para comenzar en `0`. Los identificadores de catálogo no deberían reiniciarse si eso puede confundir historiales.

#### Qué ocurre al superar seis dígitos

Un límite visual de seis dígitos no debe convertirse en un límite de almacenamiento. Si el número llega a `999999`, el siguiente debe ser `1000000` sin perder registros ni reiniciar el contador.

La columna numérica debe tener capacidad suficiente, por ejemplo:

```text
numero BIGINT UNSIGNED
```

Un `BIGINT UNSIGNED` permite cantidades extremadamente superiores a las que una institución necesitará. El formato visible debe crecer automáticamente:

```text
OP-2026-000001
OP-2026-999999
OP-2026-1000000
```

Los ceros a la izquierda solo son presentación. No deben almacenarse como un límite fijo. Si se desea conservar siempre una apariencia de seis posiciones mientras sea posible, el formato puede usar un mínimo de seis dígitos y ampliar naturalmente cuando sea necesario.

No se debe truncar, reciclar ni reiniciar un número porque superó seis dígitos. También se recomienda no reutilizar números anulados: una anulación conserva su correlativo y el siguiente registro recibe uno nuevo.

La generación segura requiere:

- Secuencia por año y tipo de documento, si corresponde.
- Restricción única sobre `(anio, numero, tipo_documento)`.
- Transacción o mecanismo de secuencia en el backend futuro.
- Manejo explícito de concurrencia.
- Pruebas con `999998`, `999999` y `1000000`.

Para la aplicación local inicial, el repositorio debe encapsular la generación del número para que posteriormente se pueda reemplazar el contador local por una secuencia transaccional del servidor.

### Auditoría

La auditoría no debe depender solo de triggers ni de una tabla genérica. Se recomiendan dos niveles:

1. **Campos de control en cada tabla**
   - `creado_en`
   - `creado_por`
   - `actualizado_en`
   - `actualizado_por`
   - `activo` o estado

2. **Bitácora central de auditoría**
   - Tabla afectada.
   - ID del registro.
   - Acción: INSERT, UPDATE, ANULAR, REVERTIR, DELETE lógico.
   - Valores anteriores.
   - Valores nuevos.
   - Usuario.
   - Fecha y hora.
   - Equipo o instalación.
   - Motivo.

Las operaciones, pagos, precios y anulaciones deberían conservar historial y evitar borrado físico. Para catálogos simples puede utilizarse baja lógica. Para pagos y operaciones se debe preferir anulación o reversión.

### Catálogos y precios

Los tipos de pago, servicios, categorías de kiosco, productos, estados y roles deben ser catálogos identificables, no textos libres repetidos en operaciones.

Los precios deben tener:

- Servicio o producto.
- Tipo de solicitante.
- Monto.
- Vigencia desde.
- Vigencia hasta opcional.
- Año o contexto, si aplica.
- Usuario que creó el precio.
- Estado.

Una operación debe guardar el precio aplicado en el momento de registrarse. No debe recalcular una operación histórica usando el precio actual.

### Compatibilidad con JSON y datos demo

El JSON actual debe conservarse inicialmente como fixture y formato de migración, no como contrato permanente de base de datos.

Se recomienda:

```text
fixtures/demo-v1.json
schemas/demo-v1.schema.json
adapters/localStorageRepository.ts
```

La estrategia será:

1. Mantener una copia del JSON actual para no perder datos demo.
2. Definir una versión explícita, por ejemplo `schemaVersion: 1`.
3. Validar el JSON al cargarlo.
4. Crear migraciones cuando cambien nombres o columnas.
5. Convertir el JSON a modelos de dominio internos.
6. No permitir que las pantallas dependan directamente del formato JSON.
7. Exportar respaldos con metadatos de versión.

Ejemplo:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-09-09T00:00:00.000Z",
  "year": 2026,
  "data": {
    "services": [],
    "products": [],
    "people": [],
    "students": [],
    "classrooms": [],
    "operations": [],
    "payments": []
  }
}
```

Si cambian columnas o nombres, se debe crear una migración `v1 -> v2`, en lugar de modificar silenciosamente todos los datos. Así se conserva compatibilidad con el prototipo sin bloquear la futura base de datos.

### Ajustes específicos de alcance

- No se agregará una entidad de matrículas escolares.
- Sí puede existir un historial de asignación de alumno a salón si el negocio lo necesita para determinar el contexto de una operación.
- Se agregará un catálogo de productos de kiosco.
- Se diferenciarán servicios de copias y productos de venta.
- Se incorporará el catálogo de tipos de pago.
- Se incorporarán códigos visibles, PK internas y correlativos controlados.

---

## 7. Estrategia de datos offline y online

### 7.1. JSON durante el prototipo

El JSON se conservará como:

- Datos demo.
- Fixture para pruebas.
- Importación y exportación.
- Formato de respaldo portable.
- Formato de migración entre versiones.

No se utilizará como base principal definitiva cuando el sistema crezca. Debe conservar `schemaVersion`, fecha de exportación, validación, migraciones y copia de seguridad previa a una restauración.

### 7.2. Base local sin servidor: SQLite

Para un ordenador sin servidor, la opción recomendada es:

```text
Electron + SQLite local
```

SQLite es un archivo de base de datos local que permite:

- Tablas y relaciones.
- Índices.
- Transacciones.
- Restricciones únicas.
- Auditoría.
- Consultas SQL.
- Funcionamiento totalmente offline.
- Copia de seguridad mediante archivo.

La aplicación debe acceder a SQLite mediante una capa de repositorio y no desde los componentes visuales.

### 7.3. Funcionamiento en línea

Cuando exista más de un equipo o se requiera información centralizada:

```text
Electron o aplicación web
        ↓
API Node.js/NestJS o Laravel
        ↓
MySQL o PostgreSQL
```

Electron no debe conectarse directamente a MySQL desde el frontend. La API debe controlar autenticación, permisos, validaciones, correlativos, auditoría y transacciones.

### 7.4. Rutas posibles

| Ruta | Uso | Evaluación |
|---|---|---|
| JSON | Demo, respaldo e intercambio | No suficiente como base productiva |
| SQLite | Un ordenador offline | Recomendación inicial |
| MySQL/PostgreSQL | Varios usuarios y equipos | Recomendación online futura |
| SQLite + sincronización | Offline y online simultáneamente | Posible, pero más complejo |
| SQLite local + API opcional | Inicio simple y crecimiento posterior | Ruta recomendada |

### 7.5. Evolución propuesta

```text
Fase 1: JSON versionado para demo
Fase 2: React SPA web
Fase 3: Electron + SQLite local para operaciones reales
Fase 4: API online + MySQL o PostgreSQL centralizado
```

No se implementará sincronización offline-online hasta que exista una necesidad real de varios equipos. Esa sincronización requiere resolver conflictos, versiones, identificadores globales y reglas de prioridad.

---

## 8. Tecnologías que se evaluarán

### Modelos de aplicación: SPA, MPA y escritorio

Los frameworks no obligan todos a utilizar el mismo modelo de navegación:

| Modelo | Cómo funciona | Ejemplo | Conveniencia para BCE |
|---|---|---|---|
| SPA | Carga una aplicación y cambia las vistas sin recargar toda la página | React, Vue, Angular, Svelte | Muy conveniente para operaciones, formularios y escritorio |
| MPA | Cada pantalla solicita una página nueva al servidor | Laravel Blade, PHP tradicional | Útil para aplicaciones web simples o centradas en servidor |
| SSR/SSG híbrido | El servidor entrega HTML inicial y luego la interfaz puede comportarse como SPA | Next.js, Nuxt | Útil para SEO y web pública; menos necesario para un escritorio interno |
| Desktop webview | Una SPA se ejecuta dentro de Electron o Tauri | React + Electron | Recomendado para el instalador de Windows |

React, Vue, Angular y Svelte pueden utilizarse como SPA. También pueden combinarse con renderizado de servidor, pero para BCE se recomienda una SPA empaquetada en Electron. Laravel no es un framework frontend: es principalmente un framework backend PHP. Puede servir como API o como aplicación web con Blade, pero no es necesario si se elige Node.js para el backend futuro.

### Cuándo conviene cada tecnología

| Tecnología | Cuándo conviene utilizarla | Cuándo evitarla en este proyecto |
|---|---|---|
| JavaScript vanilla | Prototipos pequeños, páginas simples o scripts aislados | Cuando hay muchos módulos, formularios y estado compartido |
| React | Aplicaciones modulares, equipos con ecosistema amplio y desktop con Electron | Si se busca la menor cantidad posible de decisiones y dependencias |
| Vue | Equipos que priorizan una curva de aprendizaje suave y estructura progresiva | Si se requiere maximizar disponibilidad de librerías y desarrolladores React |
| Angular | Sistemas empresariales grandes con convenciones estrictas y equipos formados en Angular | Para un equipo inicial sin experiencia, por su curva elevada |
| Svelte/SvelteKit | Interfaces modernas con bundle pequeño y equipo familiarizado con él | Si se prioriza el ecosistema empresarial más amplio |
| Next.js | Productos web con SEO, SSR, rutas backend y despliegue web | No aporta valor principal a una aplicación local de escritorio |
| Nuxt | Equivalente del ecosistema Vue para SSR/SSG y aplicaciones web | Igual que Next.js, si el destino principal es Electron offline |
| SolidJS | Interfaces muy reactivas y equipos expertos en su ecosistema | Para una migración conservadora con muchas librerías administrativas |
| Lit/Web Components | Componentes compartidos entre tecnologías o productos independientes | Como base completa de este sistema, por la mayor cantidad de trabajo manual |
| Laravel | Backend PHP, API, autenticación y aplicaciones web con Blade | No debe confundirse con un framework frontend ni mezclarse sin necesidad con Node |
| Django | Backend Python con administración y ORM maduros | No es necesario mientras el backend esté fuera de alcance |

La comparación no implica utilizar todas estas tecnologías. Se documentan para distinguir claramente frontend, backend, renderizado web y empaquetado desktop.

### Reactivo no significa necesariamente SPA

“Framework” describe la herramienta de desarrollo; “SPA” describe el modelo de navegación. Por ejemplo:

- React puede utilizarse como SPA o dentro de Next.js con SSR.
- Vue puede utilizarse como SPA o dentro de Nuxt.
- Angular normalmente se utiliza como SPA, aunque puede incorporar SSR.
- Svelte puede utilizarse como SPA o dentro de SvelteKit.
- Laravel Blade normalmente genera páginas desde el servidor, aunque puede incorporar componentes frontend.

Para este proyecto se recomienda:

```text
React + TypeScript como SPA
SPA empaquetada dentro de Electron
```

### JavaScript vanilla

Es la tecnología actual.

Ventajas:

- No requiere migración conceptual.
- Pocas dependencias.
- Buen rendimiento.

Desventajas:

- El proyecto ya creció demasiado.
- Muchas variables globales.
- Componentización limitada.
- Difícil mantenimiento.

No se recomienda como arquitectura definitiva.

### React + TypeScript

React permite construir la interfaz con componentes. TypeScript agrega tipos y ayuda a prevenir errores.

Ventajas:

- Ecosistema amplio.
- Excelente integración con Electron.
- Buena disponibilidad de librerías.
- Componentización clara.
- Buen soporte para tablas, formularios y gráficos.
- Facilita pruebas.

Desventajas:

- Hay que aprender componentes, propiedades, estado y hooks.
- Requiere disciplina arquitectónica.

Es la opción recomendada inicialmente.

### Vue + TypeScript

Ventajas:

- Curva de aprendizaje amigable.
- Sintaxis clara.
- Buen soporte para aplicaciones administrativas.

Desventajas:

- Ecosistema empresarial menor que React.
- También requiere migrar todo el frontend.

Es una alternativa válida.

### Angular

Ventajas:

- Estructura completa.
- Formularios robustos.
- TypeScript integrado.
- Convenciones empresariales claras.

Desventajas:

- Curva de aprendizaje alta.
- Más conceptos y configuración.
- Puede ser excesivo para este sistema.

No es la primera recomendación.

### Svelte

Ventajas:

- Sintaxis simple.
- Buen rendimiento.
- Menos código en los componentes.

Desventajas:

- Ecosistema empresarial menor.
- Menor disponibilidad de librerías y personal.

Es viable, pero no la opción más conservadora.

---

## 9. Frameworks CSS, UI kits y templates administrativos

Estas categorías no son equivalentes:

- **Framework frontend:** estructura la aplicación, por ejemplo React, Vue o Angular.
- **Framework CSS:** proporciona clases y utilidades para construir estilos, por ejemplo Tailwind o Bootstrap.
- **UI kit:** proporciona componentes listos, como modales, tablas y formularios, por ejemplo MUI o PrimeNG.
- **Theme:** define colores, tipografías, espaciado, bordes y apariencia.
- **Admin template:** entrega una estructura administrativa completa, con sidebar, navbar, dashboard y páginas de ejemplo.

### 10.1. Frameworks CSS

| Framework CSS | Ecosistemas | Fortalezas | Limitaciones | Mejor uso para BCE |
|---|---|---|---|---|
| Tailwind CSS | React, Vue, Angular, Svelte | Muy personalizable, rápido con tokens y responsive | Clases extensas y requiere disciplina | Primera opción para diseño propio |
| Bootstrap | Todos | Conocido, documentado y rápido | Apariencia genérica si no se personaliza | Prototipos y equipos que ya lo conocen |
| Bulma | Todos | Sintaxis sencilla y CSS limpio | Ecosistema menor y menos componentes avanzados | Aplicaciones pequeñas |
| UnoCSS | Vue, React y otros | Motor atómico flexible y rápido | Menor adopción general | Equipos expertos en CSS moderno |
| Foundation | Todos | Accesibilidad y estructura sólida | Menor actividad y ecosistema actual | Proyectos que ya lo utilizan |

### 10.2. UI kits por framework

| Ecosistema | UI kits gratuitos o con base gratuita | Cuándo conviene |
|---|---|---|
| React | MUI, Mantine, Ant Design, shadcn/ui, Radix UI, PrimeReact | Tablas, formularios y backoffice con muchas opciones |
| Vue | Vuetify, PrimeVue, Naive UI, Quasar, Element Plus | Paneles administrativos y equipos que prefieren Vue |
| Angular | Angular Material, PrimeNG, NG-ZORRO, Clarity | Aplicaciones empresariales con formularios robustos |
| Svelte | Skeleton, Flowbite Svelte, shadcn-svelte | Equipos Svelte que aceptan un ecosistema menor |
| Bootstrap | React-Bootstrap, BootstrapVue, ng-bootstrap | Equipos que quieren conservar el modelo Bootstrap |

Un UI kit puede usarse junto con un framework CSS, pero conviene evitar mezclar demasiados sistemas de estilos porque genera inconsistencias visuales.

### 10.3. Templates administrativos

| Template | Base principal | Características | Evaluación para BCE |
|---|---|---|---|
| TailAdmin | React/Vue/Next y Tailwind | Dashboard moderno, sidebar, tablas y gráficos | Muy buena referencia visual |
| Tabler | Bootstrap y CSS | Limpio, completo y administrativo | Excelente alternativa visual gratuita |
| AdminLTE | Bootstrap | Maduro y muy conocido | Útil, pero visualmente más tradicional |
| CoreUI | Bootstrap/React/Vue/Angular | Componentes y layouts administrativos | Buena opción si se acepta su sistema visual |
| Flowbite Admin | Tailwind | Dashboard moderno y componentes Tailwind | Buena base si se elige Tailwind |
| Mantis | React y MUI | Dashboard completo basado en Material | Buena opción para MUI |
| Volt | Bootstrap | Dashboard gratuito y sencillo | Adecuado para una base convencional |
| Mosaic | React/Tailwind | Panel moderno y orientado a métricas | Buena referencia, revisar licencia de cada versión |
| Sneat | Bootstrap/React/Vue/Angular | Muchas pantallas y componentes | Útil como referencia, revisar qué partes son gratuitas |

Un template no debe copiarse sin revisar licencia, mantenimiento, accesibilidad y dependencia de páginas demo. Para BCE se recomienda tomarlo como base visual y eliminar las pantallas que no correspondan.

### 10.4. Recomendación por ecosistema

| Frontend | CSS/UI recomendado | Template de referencia | Evaluación |
|---|---|---|---|
| React | Tailwind + shadcn/ui o MUI | TailAdmin, Mantis o Tabler | Mejor equilibrio general |
| Vue | Tailwind + Headless UI o Vuetify | TailAdmin Vue, Quasar o Tabler | Muy buena curva de aprendizaje |
| Angular | Angular Material o Tailwind + CDK | CoreUI, Material Dashboard o Tabler | Fuerte para equipos empresariales |
| Svelte | Tailwind + Skeleton | Skeleton o Flowbite Svelte | Moderno, pero menor ecosistema |
| Vanilla | Bootstrap o CSS propio | Tabler o AdminLTE | Solo para mantener el prototipo, no recomendado como destino |

### 10.5. Selección recomendada para BCE

La primera opción será:

```text
React + TypeScript
Tailwind CSS
shadcn/ui y Radix UI
TailAdmin Free como template administrativo
Theme propio BCE basado en TailAdmin
Electron
```

La alternativa visual se construirá para comparación:

```text
React + TypeScript
MUI
Mantis Free como template administrativo
Theme propio BCE basado en Material
Electron
```

Alternativa sencilla y conocida:

```text
React + TypeScript
Bootstrap + React-Bootstrap
Bootswatch o Tabler como referencia visual
Electron
```

El theme propio debe conservar la identidad de BCE, convertir los tokens actuales de `css/theme.css` y definir colores, tipografía, estados, densidad de tablas, componentes y modo claro/oscuro.

### 10.6. Prototipo visual comparativo

El prototipo comparativo no debe rehacer la aplicación completa. Debe implementar primero una muestra representativa con la misma información y los mismos flujos:

| Área | Qué se comparará |
|---|---|
| Layout | Sidebar, navbar, navegación, responsive y uso del espacio |
| Dashboard | Cards, indicadores, gráficos y jerarquía visual |
| Operaciones | Formularios, selección de servicios, solicitantes y validaciones |
| Pagos | Tabla, estados, referencias, comprobantes e imágenes |
| Deudas | Filtros, estados de cuenta y acciones |
| Catálogos | CRUD, tablas, modales y confirmaciones |
| Reportes | Filtros, tablas, exportación y lectura de resultados |

La información será la misma que en la variante principal y se cargará mediante el adaptador JSON temporal. Así se comparará el diseño y no diferencias de datos o de lógica. Después de elegir una variante, la otra se conservará como referencia etiquetada o se archivará, sin afectar el roadmap funcional.

## 10. Alternativas para escritorio

### Electron

Electron permite empaquetar HTML, CSS y JavaScript como una aplicación Windows.

Ventajas:

- Compatible con React.
- Funciona offline.
- Permite impresión.
- Permite trabajar con archivos.
- Ecosistema amplio.
- Instalador y acceso directo.
- Fácil conexión futura con una API.

Desventajas:

- Instalador más grande.
- Mayor consumo de memoria.
- Requiere configurar correctamente la seguridad.

Es la opción recomendada para BCE System.

### Tauri

Es una alternativa ligera a Electron.

Ventajas:

- Instaladores pequeños.
- Menor consumo.

Desventajas:

- Requiere Rust.
- Mayor complejidad para la primera migración.

Puede evaluarse más adelante.

### PWA

Una PWA sería una aplicación web instalable, pero no es la opción ideal si el equipo no tendrá servidor y se requieren respaldos, impresión y control de instalación.

### Recomendación

Para un ordenador Windows utilizado por personal sin conocimientos técnicos:

```text
React + TypeScript + Vite + Electron
```

La aplicación se entregaría como instalador `.exe`, con:

- Acceso directo.
- Ejecución sin servidor externo.
- Datos locales.
- Exportación de respaldo.
- Restauración de respaldo.
- Actualizaciones controladas.

---

## 11. Tres opciones de stack recomendadas

### Opción 1 — Recomendada

```text
React + TypeScript + Vite + Electron
React Router + Zustand + React Hook Form + Zod
TanStack Table + Chart.js/Recharts + Vitest + Playwright
```

Es la opción con mejor equilibrio entre mantenimiento, ecosistema, documentación, desktop y futura integración con API.

### Opción 2 — Alternativa equilibrada

```text
Vue 3 + TypeScript + Vite + Electron
Vue Router + Pinia + VeeValidate + Zod
TanStack Table/Vue TanStack Table + ECharts + Vitest + Playwright
```

Es adecuada si se prioriza una curva de aprendizaje más amigable y una sintaxis más cercana a HTML.

### Opción 3 — Empresarial

```text
Angular + TypeScript + Electron
Angular Router + Signals o RxJS
Angular Reactive Forms + Zod opcional
Angular Material/CDK + Vitest/Karma + Playwright
```

Es adecuada para una organización que ya tenga experiencia Angular, estándares empresariales y varios desarrolladores. Para este proyecto inicial implica más complejidad y no es la primera elección.

### Comparación de las tres opciones

| Criterio | Opción 1: React | Opción 2: Vue | Opción 3: Angular |
|---|---:|---:|---:|
| Ecosistema | Muy alto | Alto | Alto |
| Curva inicial | Media | Baja-media | Alta |
| Electron | Excelente | Excelente | Buena |
| Formularios administrativos | Excelente | Muy buena | Excelente |
| Libertad arquitectónica | Alta | Media-alta | Baja-media |
| Riesgo de mala estructura | Medio | Medio | Bajo, por convenciones |
| Recomendación | Primera | Segunda | Tercera |

## 12. Stack detallado recomendado

```text
Frontend: React + TypeScript como SPA
Build: Vite
Desktop: Electron
Navegación SPA: React Router
Estado local/global de interfaz: Zustand
Estado de datos remotos: TanStack Query
Formularios: React Hook Form
Validación: Zod
Tablas: TanStack Table
Gráficos: Chart.js o Recharts
Pruebas unitarias: Vitest
Pruebas de interfaz: Playwright
Backend futuro: Node.js + API
Base de datos futura: MySQL
```

### Explicación

- **React:** crea la interfaz con componentes.
- **TypeScript:** agrega seguridad de tipos.
- **Vite:** compila y prepara la aplicación.
- **Electron:** convierte la interfaz en programa de escritorio.
- **React Router:** administra las pantallas dentro de la SPA sin recargar toda la aplicación.
- **Zustand:** administra estado de interfaz y sesión local, como filtros, menú abierto, usuario actual o borrador de una operación.
- **TanStack Query:** administra datos obtenidos desde una API o repositorio, incluyendo consultas, caché, carga, errores, revalidación y mutaciones.
- **React Hook Form:** controla formularios.
- **Zod:** valida los datos.
- **TanStack Table:** permite tablas avanzadas.
- **Vitest:** prueba cálculos y reglas.
- **Playwright:** prueba flujos completos.

No se recomienda agregar Redux inicialmente, porque sería más complejo de lo necesario.

### 12.1. Qué significa SPA en el stack recomendado

La aplicación será una **SPA (Single Page Application)**:

```text
Electron abre una aplicación React
        ↓
React Router cambia las vistas
        ↓
La ventana no se recarga completamente
```

Por ejemplo, al pasar de Dashboard a Nueva Operación o Deudas, se cambia el contenido de la aplicación sin solicitar otra página HTML completa. Esto permite conservar estado, mostrar transiciones rápidas y trabajar bien como aplicación de escritorio.

SPA no significa que todos los datos deban estar en memoria. La interfaz puede ser SPA y utilizar:

- SQLite local.
- JSON para demo o respaldo.
- Una API online futura.
- TanStack Query para administrar datos obtenidos de esa fuente.

### 12.2. Qué es TanStack

**TanStack** es un conjunto de librerías independientes para resolver problemas comunes de aplicaciones frontend. No es un framework frontend completo como React, Vue o Angular. Se le puede llamar:

```text
Librerías de utilidades para aplicaciones frontend
```

Cada producto de TanStack resuelve un problema diferente:

| Librería | Qué resuelve | Uso posible en BCE |
|---|---|---|
| TanStack Table | Lógica de tablas | Historial, deudas, pagos, alumnos y productos |
| TanStack Query | Datos remotos y server state | Futura API online, sincronización de consultas y mutaciones |
| TanStack Router | Rutas y navegación | Alternativa a React Router; no se usarían ambos al inicio |
| TanStack Form | Formularios y validación de estado | Alternativa a React Hook Form; no se usarían ambos inicialmente |
| TanStack Virtual | Renderizado virtual | Tablas o catálogos con miles de filas |
| TanStack Devtools | Herramientas de inspección | Diagnóstico durante desarrollo |

No se debe instalar todo TanStack por defecto. Se eligen únicamente las librerías que resuelvan una necesidad real.

### 12.3. TanStack Table

TanStack Table no dibuja por sí solo una tabla completa. Proporciona la lógica para:

- Columnas.
- Ordenamiento.
- Filtros.
- Paginación.
- Selección.
- Agrupación.
- Visibilidad de columnas.
- Expansión de filas.

El diseño visual lo proporcionarían MUI, Mantine, shadcn/ui, Tailwind o un theme propio. En BCE sería útil para:

- Historial de operaciones.
- Deudas de profesores y alumnos.
- Pagos.
- Catálogo de productos de kiosco.
- Alumnos y personal.

### 12.4. TanStack Query

TanStack Query se especializa en administrar **server state**, que significa datos cuyo origen está fuera del componente y que pueden cambiar en otra fuente:

- Datos de una API.
- Datos de un backend.
- Datos que deben actualizarse.
- Resultados que deben almacenarse temporalmente en caché.

También se conoce como:

- Librería de fetching de datos.
- Cliente de datos remotos.
- Gestión de server state.
- Caché de consultas.

Una consulta conceptual sería:

```text
useQuery → obtener operaciones
useMutation → crear una operación
invalidateQueries → indicar que el historial debe actualizarse
```

TanStack Query administra automáticamente estados como:

```text
idle
loading
success
error
refetching
```

También puede controlar:

- Caché.
- Reintentos.
- Revalidación.
- Cancelación.
- Actualización después de guardar.
- Paginación.
- Consultas dependientes.

### 12.5. ¿TanStack Query sirve si BCE empieza offline?

Sí, pero su valor depende de la etapa:

| Etapa | Fuente de datos | Uso de TanStack Query |
|---|---|---|
| Prototipo JSON | Fixture local | No necesario |
| SQLite local | Repositorio local | Opcional; puede usarse para unificar estados de consulta |
| API online | Node.js/Laravel | Muy recomendable |
| Modo híbrido | SQLite + API | Recomendable, pero requiere estrategia de sincronización |

Para la primera versión local no es obligatorio. Sin embargo, si se diseña el acceso a datos mediante funciones asíncronas y repositorios, TanStack Query puede incorporarse después sin cambiar las pantallas.

### 12.6. Zustand y TanStack Query no hacen lo mismo

No se deben mezclar sus responsabilidades:

| Herramienta | Administra |
|---|---|
| Zustand | Estado de interfaz y estado local de la aplicación |
| TanStack Query | Datos provenientes de API, repositorios o fuentes externas |
| React Hook Form | Estado de formularios mientras el usuario escribe |
| TanStack Table | Estado y lógica de tablas |

Ejemplos:

```text
Zustand:
- Sidebar abierto o cerrado.
- Filtros seleccionados.
- Año actual.
- Preferencias del usuario.

TanStack Query:
- Lista de operaciones.
- Detalle de un pago.
- Catálogo de productos.
- Resultado de deudas desde la API.

React Hook Form:
- Campos de una nueva operación.
- Monto y referencia de un pago.
- Formulario de producto.
```

### 12.7. Decisión recomendada

Para BCE se recomienda:

```text
React + TypeScript como SPA
React Router
Zustand para estado local
TanStack Query preparado para datos remotos
TanStack Table para tablas
React Hook Form + Zod para formularios
```

En la fase JSON no se necesita TanStack Query obligatoriamente. En la fase SQLite puede incorporarse si se desea una interfaz uniforme. Cuando exista API online, será una pieza importante para evitar implementar manualmente estados de carga, error, caché y actualización.

### Themes, diseño y librerías gratuitas

El theme no debe elegirse solo por apariencia. Debe evaluarse por accesibilidad, soporte, consistencia, licencia y capacidad para tablas y formularios administrativos.

| Opción | Tipo | Fortalezas | Limitaciones | Recomendación |
|---|---|---|---|---|
| Material UI (MUI) | Componentes React | Muy completo, accesible y maduro | Apariencia Material reconocible y bundle mayor | Excelente opción general |
| Mantine | Componentes React | Moderna, completa y amigable para formularios | Menor ecosistema empresarial que MUI | Muy recomendable |
| Ant Design | Componentes React | Tablas, formularios y patrones empresariales | Puede sentirse visualmente pesada | Muy buena para backoffice |
| shadcn/ui | Componentes/copias basadas en Radix y Tailwind | Control visual, accesibilidad y código propio | Requiere configurar y mantener componentes | Recomendable si se quiere diseño propio |
| Radix UI | Primitivas accesibles | Diálogos, menús y controles robustos | No entrega un theme completo | Muy buena base |
| Tailwind CSS | Utilidad CSS | Rapidez y consistencia mediante tokens | Puede generar clases extensas | Recomendable con un sistema de diseño |
| Bootstrap | CSS y componentes | Fácil de aprender y muy conocido | Diseño genérico y menos flexible | Válido, pero no primera elección |
| PrimeReact | Componentes React | Gran cantidad de componentes y tablas | Revisar licencia de componentes concretos | Evaluar según licencia |
| Headless UI | Primitivas sin estilo | Control total del diseño | Hay que diseñar más elementos | Útil con Tailwind |

Recomendación visual inicial:

```text
MUI o Mantine para acelerar componentes
Tokens propios para colores, espaciado y tipografía
React Hook Form + Zod para formularios
TanStack Table para tablas complejas
Lucide React para iconos
```

Si se desea conservar la identidad actual de BCE, se recomienda no adoptar un theme completo sin personalización. Deben mantenerse los tokens de `css/theme.css` y convertirlos en variables del sistema nuevo.

### Librerías gratuitas complementarias

| Necesidad | Opciones recomendadas | Uso |
|---|---|---|
| Iconos | Lucide, Heroicons | Navegación y acciones |
| Fechas | date-fns, Day.js | Fechas, rangos y formato local |
| Moneda y números | Intl nativo, dinero.js | S/ y redondeos controlados |
| Gráficos | Chart.js, Recharts, Apache ECharts | Dashboard y reportes |
| Exportación Excel | SheetJS Community | Exportar hojas compatibles |
| CSV | Papa Parse | Importación/exportación CSV |
| PDF | pdfmake, jsPDF | Reportes imprimibles |
| Tablas | TanStack Table | Filtros, orden y paginación |
| Notificaciones | Sonner, React Hot Toast | Mensajes no bloqueantes |
| Accesibilidad | Radix UI, React Aria | Controles y foco |
| Testing | Vitest, Testing Library, Playwright | Reglas y flujos |
| Logs | Electron-log | Diagnóstico en escritorio |

Todas las librerías deben validarse por licencia, mantenimiento y compatibilidad offline antes de adoptarse.

---

## 13. Arquitectura objetivo

### 13.1. Arquitectura de carpetas del proyecto frontend

El frontend y el backend serán proyectos separados. La carpeta actual `bce-system` será el repositorio del frontend y de sus clientes web, escritorio y móvil. La API se creará más adelante en otra carpeta o repositorio independiente, con su propio ciclo de despliegue.

#### Repositorio frontend actual

```text
bce-system/
  apps/
    web/
      src/
        app/
        pages/
        routes/
        main.tsx
      public/
      vite.config.ts

    desktop/
      src/
        main/
          main.ts
          windows/
          ipc/
        preload/
          preload.ts
          bridges/
      electron-builder.yml

    mobile/
      src/
        app/
        screens/
        navigation/
        main.tsx
      app.json

  packages/
    domain/
      entities/
      value-objects/
      rules/
      services/

    application/
      use-cases/
      ports/
      dto/

    contracts/
      api/
      schemas/
      api-types/

    ui/
      components/
      theme/
      tokens/

    data-access/
      repositories/
      sqlite/
      api-client/
      json/

    config/
      eslint/
      typescript/
      prettier/

  database/
    sqlite/
    seeds/
    backups/

  docs/
    architecture/
    api/
    operations/
    deployment/

  tests/
    integration/
    e2e/
    fixtures/

  package.json
  pnpm-workspace.yaml
  README.md
```

#### Repositorio backend futuro separado

Más adelante se creará otro proyecto, fuera de la carpeta del frontend:

```text
bce-system-api/
  src/
    config/
    auth/
    modules/
      usuarios/
      personal/
      alumnos/
      salones/
      servicios/
      productos-kiosco/
      operaciones/
      pagos/
      deudas/
      reportes/
      archivos/
      auditoria/
    common/
    main.ts

  prisma/
    schema.prisma
    migrations/
    seeds/

  test/
  docs/
  Dockerfile
  package.json
```

La relación será:

```text
D:\Trabajos\Propios\bce-system
  Frontend web, desktop, móvil futuro y SQLite local

D:\Trabajos\Propios\bce-system-api
  Backend NestJS, API REST y acceso a MySQL/PostgreSQL
```

Las dos carpetas no compartirán código mediante imports directos ni rutas relativas. Se relacionarán mediante:

- Contratos HTTP versionados.
- OpenAPI/Swagger.
- Tipos generados o publicados como paquete independiente, si conviene.
- Versiones compatibles de API.
- Variables de entorno.

El backend no será necesario para ejecutar la v2 web con JSON ni la v3 de escritorio offline con SQLite. Solo se incorpora cuando se inicie la fase online.

#### Responsabilidad de cada nivel

| Carpeta | Responsabilidad |
|---|---|
| `apps/web` | Aplicación SPA para navegador |
| `apps/desktop` | Proceso Electron, ventanas, IPC, archivos e impresión |
| `apps/mobile` | Futura aplicación móvil |
| `packages/domain` | Entidades y reglas independientes de la plataforma |
| `packages/application` | Casos de uso y puertos |
| `packages/contracts` | Tipos y esquemas compartibles; no contiene el backend |
| `packages/ui` | Componentes visuales y theme compartido |
| `packages/data-access` | Adaptadores JSON, SQLite y API |
| `database` | Migraciones, seeds y recursos de base de datos |
| `docs` | Documentación técnica y operativa |

La aplicación móvil no se implementará ahora. Se reserva la carpeta y los contratos para evitar que la arquitectura web/escritorio quede acoplada a APIs exclusivas del navegador o de Electron.

#### Regla de dependencias

```text
domain
  ↑
application
  ↑
apps y adaptadores de infraestructura
```

`domain` no debe importar React, Electron, SQLite, MySQL ni APIs del navegador. Esto permite reutilizar las reglas en web, escritorio, backend y móvil.

### 13.2. Arquitectura del software

La arquitectura será modular y por capas, con principios de arquitectura limpia/hexagonal:

```text
                 ┌─────────────────────────┐
                 │ Web SPA                  │
                 │ React                    │
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │ Desktop                  │
                 │ Electron + preload       │
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │ Mobile futuro            │
                 │ Cliente móvil            │
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │ Aplicación               │
                 │ casos de uso             │
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │ Dominio                  │
                 │ reglas de negocio        │
                 └───────────┬─────────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
   ┌───────▼────────┐                 ┌────────▼───────┐
   │ Repositorio     │                 │ API backend     │
   │ SQLite/JSON     │                 │ NestJS          │
   └───────┬────────┘                 └────────┬───────┘
           │                                   │
           │                          ┌────────▼───────┐
           │                          │ MySQL/Postgres │
           │                          └────────────────┘
           └───────────────────────────────────────────
```

#### Capas

1. **Presentación**
   - React SPA para web.
   - React dentro de Electron para escritorio.
   - React Native o alternativa móvil futura.
   - Formularios, tablas, navegación y estados visuales.

2. **Aplicación**
   - Casos de uso: registrar operación, registrar pago, calcular deuda, crear producto y generar reporte.
   - Orquesta validaciones y repositorios.
   - No conoce detalles del navegador ni de la base de datos.

3. **Dominio**
   - Reglas de precios.
   - Tipos de pago.
   - Evidencias.
   - Correlativos.
   - Anulaciones.
   - Deudas.
   - Productos de kiosco.
   - Auditoría requerida.

4. **Puertos**
   - Interfaces de repositorios.
   - Interfaces de archivos.
   - Interfaces de impresión.
   - Interfaces de reloj y generación de identificadores.

5. **Infraestructura**
   - Repositorio JSON.
   - Repositorio SQLite.
   - Cliente TanStack Query/API.
   - Prisma/MySQL o PostgreSQL.
   - Sistema de archivos Electron.
   - Exportación e impresión.

#### Flujo web

```text
Usuario → React SPA → caso de uso → repositorio/API → respuesta → UI
```

#### Flujo escritorio offline

```text
Usuario → React SPA en Electron → preload seguro → servicio local → SQLite
```

#### Flujo escritorio/web online

```text
Usuario → React SPA → TanStack Query → API NestJS separada → MySQL/PostgreSQL
```

#### Flujo móvil futuro

```text
Usuario móvil → aplicación móvil → contratos API versionados → API NestJS separada
```

El móvil no debe conectarse directamente a SQLite, MySQL o PostgreSQL. Utilizará la API y los contratos compartidos.

#### Seguridad de Electron

- Activar `contextIsolation`.
- Desactivar `nodeIntegration` en el renderer.
- Exponer solo funciones mínimas mediante `preload`.
- Validar argumentos IPC.
- No exponer credenciales SQL.
- No permitir que la UI ejecute comandos arbitrarios.
- Separar archivos de datos de archivos del programa.

#### Principio de adaptadores

Las pantallas deben llamar casos de uso, no acceder directamente a una tecnología:

```text
Pantalla → use case → repository port

repository port → JSON
repository port → SQLite
repository port → API
```

Así el mismo flujo de “Registrar pago” puede funcionar primero con JSON, después con SQLite y finalmente con una API, sin reescribir la pantalla.

#### Decisión para la aplicación móvil

La aplicación móvil se considera una posibilidad posterior. Cuando se requiera, se evaluarán:

- React Native, si se desea compartir conocimientos y parte de componentes con React.
- Flutter, si se prioriza una interfaz móvil independiente.
- PWA móvil, si las funciones no requieren capacidades nativas.

La decisión móvil no debe condicionar la primera implementación web ni de escritorio. Lo que sí debe prepararse desde ahora son los contratos API, reglas de dominio y modelos compartidos.

---

## 14. Alcance del MVP de escritorio

### Incluir

1. Dashboard.
2. Nueva operación.
3. Registro por lote.
4. Historial.
5. Pagos.
6. Deudas.
7. Catálogos básicos.
8. Configuración de precios.
9. Reporte diario.
10. Exportación.
11. Impresión.
12. Persistencia local organizada.
13. Copia de seguridad manual.
14. Restauración de datos.

### Dejar para una fase posterior

- Usuarios reales.
- Autenticación.
- Roles y permisos.
- Sesiones.
- MySQL.
- Multiusuario.
- Sincronización remota.
- Auditoría centralizada.
- Actualizaciones automáticas.
- Panel web administrativo.

---

## 15. Roadmap de migración

### Fase 1 — Documentación y contratos

- Definir entidades.
- Definir reglas de precios.
- Definir reglas de pagos.
- Definir reglas de deuda.
- Definir estados.
- Crear tipos TypeScript.

### Fase 2 — Sistema visual web

- Crear proyecto React + TypeScript + Vite.
- Migrar tema visual.
- Crear layout.
- Crear navegación.
- Crear modales.
- Crear tablas y formularios reutilizables.

### Fase 3 — Persistencia local de escritorio

- Sustituir el acceso directo a `localStorage`.
- Crear repositorio local.
- Mantener datos demo.
- Crear importación y exportación de respaldo.
- Separar estado visual de datos.

### Fase 4 — Operaciones

- Nueva operación.
- Operación por lote.
- Validaciones.
- Cálculo de precios.
- Confirmación.
- Historial.

### Fase 5 — Deudas y pagos

- Cálculo centralizado.
- Pagos parciales.
- Estados de cuenta.
- Anulaciones.

### Fase 6 — Reportes y catálogos

- Reportes.
- Gráficos.
- Catálogos.
- Filtros y tablas.

### Fase 7 — Electron

- Proceso principal.
- `preload`.
- Aislamiento de contexto.
- Impresión.
- Archivos de respaldo.
- Instalador Windows.
- Icono y acceso directo.

### Fase 8 — Backend futuro

- Cliente API.
- DTOs.
- Adaptadores de entidades.
- Autenticación.
- Sustitución del repositorio local por API.

---

## 16. Recomendación final

No conviene seguir ampliando el JavaScript vanilla actual como arquitectura definitiva. El prototipo ya superó el tamaño en el que resulta cómodo mantener todo mediante variables globales, `innerHTML` y eventos inline.

La recomendación es una migración completa y ordenada a:

```text
React + TypeScript + Vite + Electron
```

La migración no debe consistir en copiar los archivos actuales a React. Primero deben definirse las reglas de negocio y los modelos; luego se deben migrar los módulos uno por uno.

El backend y MySQL se mantienen fuera de la implementación inmediata, pero la nueva arquitectura debe quedar preparada para integrarlos posteriormente sin rehacer las pantallas.

---

## 17. Límites de esta etapa

- No implementar todavía backend.
- No conectar MySQL.
- No implementar autenticación real.
- No modificar el esquema SQL en esta fase.
- No cambiar el comportamiento del prototipo antes de aprobar el diseño.
- No iniciar aún la migración de código hasta revisar y aprobar este plan.

---

## 18. Backend y API para la siguiente etapa

Esta sección se agrega después del plan del frontend para separar dos decisiones:

1. **Stack frontend SPA sin API ni base de datos**, documentado anteriormente.
2. **Stack completo con backend, API y base de datos**, evaluado en esta sección.

El stack frontend anterior se conserva visible y no se reemplaza. Esta nueva sección representa la arquitectura posterior cuando BCE deje de trabajar únicamente con JSON o SQLite local.

### 18.1. Qué es el backend

El backend será la parte que:

- Recibe solicitudes de la SPA.
- Valida datos en el servidor.
- Ejecuta reglas de negocio autoritativas.
- Controla usuarios, sesiones y permisos.
- Genera correlativos de forma segura.
- Guarda operaciones y pagos.
- Gestiona auditoría.
- Procesa archivos de comprobantes.
- Consulta MySQL o PostgreSQL.
- Expone la API que utilizará Electron o una aplicación web.

La comunicación recomendada será:

```text
React SPA dentro de Electron
          ↓ HTTPS o conexión local controlada
API backend
          ↓
ORM / consultas parametrizadas
          ↓
MySQL o PostgreSQL
```

Electron no debe contener credenciales de base de datos ni conectarse directamente al servidor SQL.

### 18.2. Qué es una API

Una API es el contrato mediante el cual el frontend solicita o modifica información del backend.

Ejemplos conceptuales:

```text
GET    /api/v1/operaciones
GET    /api/v1/operaciones/:id
POST   /api/v1/operaciones
POST   /api/v1/pagos
GET    /api/v1/deudas/profesores
GET    /api/v1/catalogos/productos
POST   /api/v1/archivos/comprobantes
```

La API debe definir rutas, métodos HTTP, formatos de entrada y salida, errores, autenticación, permisos, paginación, filtros y versionado. Se recomienda versionar desde el inicio con `/api/v1/...`.

### 18.3. Opciones de backend

| Opción | Lenguaje | Fortalezas | Limitaciones | Evaluación para BCE |
|---|---|---|---|---|
| Node.js + NestJS | TypeScript | Comparte lenguaje con React, arquitectura modular, validación y testing | Requiere aprender módulos e inyección de dependencias | Primera recomendación |
| Node.js + Fastify | TypeScript/JavaScript | Rápido y flexible | Hay que definir más convenciones manualmente | Buena opción con experiencia |
| Node.js + Express | TypeScript/JavaScript | Muy conocido y simple | Puede volver a crecer desordenado | Válido, no primera opción |
| Laravel | PHP | ORM, autenticación, migraciones y colas maduras | Introduce PHP separado del frontend | Segunda recomendación si se prefiere PHP |
| Django + DRF | Python | ORM, administración y seguridad maduros | Introduce Python | Buena alternativa empresarial |
| ASP.NET Core | C# | Robusto, rápido y empresarial | Requiere ecosistema .NET | Válido si ya se usa Microsoft |

### 18.4. Backend recomendado

La primera opción recomendada es:

```text
Node.js + NestJS + TypeScript
```

Motivos:

- React y NestJS pueden compartir TypeScript.
- Pueden compartirse tipos y contratos.
- NestJS organiza módulos, controladores, servicios y dependencias.
- Facilita autenticación, validación, testing y documentación.
- Se integra bien con Electron y con una aplicación web.

La segunda opción es:

```text
Laravel + PHP
```

Conviene si se priorizan las capacidades integradas de Laravel, se cuenta con experiencia PHP o se desea utilizar Laravel como plataforma web completa. Laravel no reemplaza al frontend React; puede servir como API para la SPA.

### 18.5. REST, GraphQL y RPC

| Estilo | Característica | Evaluación |
|---|---|---|
| REST | Rutas y recursos HTTP claros | Recomendado para BCE |
| GraphQL | El cliente solicita exactamente los campos necesarios | Potente, pero inicialmente innecesario |
| tRPC | Tipos compartidos entre cliente y servidor TypeScript | Interesante, pero más acoplado a Node |
| RPC tradicional | Operaciones expuestas como funciones remotas | Menos estándar para futuras integraciones |

Se recomienda iniciar con REST versionado y documentado con OpenAPI/Swagger.

### 18.6. MySQL frente a PostgreSQL

| Criterio | MySQL | PostgreSQL |
|---|---|---|
| Madurez | Muy alta | Muy alta |
| Administración | Muy disponible | Requiere algo más de conocimiento |
| Integridad y SQL | Buena | Excelente |
| JSON y consultas avanzadas | Buen soporte | Muy buen soporte con JSONB |
| Reportes complejos | Bueno | Muy fuerte |
| Tipos y restricciones | Buenos | Más completos |
| Compatibilidad con el proyecto | Ya existe un esquema MySQL | Requiere adaptar el esquema |

### 18.7. Recomendación de base online

#### Mantener MySQL

```text
NestJS + Prisma/TypeORM + MySQL
```

Ventajas:

- Ya existe `database/bce_schema_mysql.sql`.
- Se reduce la migración inicial.
- El esquema contempla operaciones, pagos, auditoría y vistas.

#### Migrar a PostgreSQL

```text
NestJS + Prisma/Drizzle + PostgreSQL
```

Ventajas:

- Excelente integridad relacional.
- Muy buen soporte para JSONB.
- Muy potente para reportes y consultas complejas.

Desventaja principal: hay que adaptar el esquema SQL actual.

Para reducir riesgos se recomienda iniciar con MySQL, porque ya existe un diseño avanzado. PostgreSQL queda como alternativa técnica válida si el sistema crece hacia reportes complejos, integraciones o una plataforma multiinstitución.

### 18.8. Componentes backend necesarios

```text
bce-system-api/
  src/
    auth/
    usuarios/
    personal/
    alumnos/
    salones/
    servicios/
    productos-kiosco/
    operaciones/
    pagos/
    deudas/
    reportes/
    archivos/
    auditoria/
    configuracion/
```

Cada módulo debería separar:

- Controller: recibe la petición HTTP.
- DTO: valida entrada y salida.
- Service/use case: ejecuta el caso de uso.
- Domain: aplica reglas.
- Repository: consulta o modifica datos.
- Mapper: transforma datos de DB a modelos de API.

### 18.9. Reglas que no deben quedar solo en frontend

- Validación de montos.
- Tipo de pago y referencia.
- Evidencia de pago.
- Permisos.
- Correlativos.
- Unicidad.
- Anulación de operaciones y pagos.
- Auditoría.
- Precios históricos.
- Estado de productos de kiosco.
- Control de archivos.
- Protección contra duplicados.

El frontend valida para mejorar la experiencia, pero el backend debe validar nuevamente porque es la autoridad del sistema.

---

## 19. Stack completo recomendado con API y base de datos

Esta es la versión posterior del stack, separada del stack frontend SPA anterior:

```text
Frontend:
  React + TypeScript como SPA
  Vite
  React Router
  Zustand
  TanStack Query
  TanStack Table
  React Hook Form + Zod
  Tailwind CSS + shadcn/ui/Radix UI

Desktop:
  Electron

Backend:
  Node.js
  NestJS
  REST API versionada
  OpenAPI/Swagger
  TypeScript

Acceso a datos:
  Prisma
  Repositorios y casos de uso

Base online:
  MySQL inicialmente
  PostgreSQL como alternativa evaluable

Base offline:
  SQLite local
  JSON versionado para demo, respaldo e intercambio

Pruebas:
  Vitest
  Testing Library
  Playwright
  Supertest

Operación:
  Docker para backend y base de datos
  Migraciones versionadas
  Logs estructurados
  Backups automáticos
```

### 19.1. Resumen de etapas tecnológicas

| Etapa | Frontend | Backend | Datos |
|---|---|---|---|
| Prototipo | React SPA o frontend actual | Ninguno | JSON |
| Escritorio local | React SPA + Electron | Servicios locales controlados | SQLite + JSON |
| API inicial | React SPA + Electron | NestJS REST | MySQL |
| Plataforma multiusuario | React SPA/web | NestJS escalable | MySQL o PostgreSQL |

Este stack completo no se implementa todavía. Se incorpora al plan para que las decisiones del frontend no bloqueen la futura API ni la base de datos.

---

## 20. Implementación y salida a producción por fases

La migración no debe hacerse como un cambio brusco para el usuario. Cada fase debe producir una versión instalable, probada y reversible. El usuario debe poder seguir trabajando mientras se prepara la siguiente etapa.

### Principios generales de producción

En cada fase se debe:

1. Congelar una versión candidata.
2. Crear respaldo de código y datos.
3. Ejecutar pruebas técnicas y pruebas con usuarios.
4. Instalar primero en un equipo piloto.
5. Registrar incidencias.
6. Corregir los problemas críticos.
7. Crear una versión etiquetada.
8. Preparar instrucciones de instalación y recuperación.
9. Capacitar al usuario.
10. Mantener un plan de reversión.

No se debe actualizar el único equipo de trabajo sin tener copia de seguridad, instalador anterior y datos exportados.

---

### Fase 1 — v1: prototipo funcional y línea base

#### Objetivo

Conservar el proyecto actual como referencia funcional y definir exactamente qué comportamiento se espera mantener.

#### Tecnología

```text
HTML + CSS + JavaScript vanilla
Datos demo + localStorage
```

#### Preparación

1. Congelar el código actual como `v1.0.0`.
2. Crear una rama o etiqueta de referencia.
3. Exportar los datos demo.
4. Documentar las pantallas existentes.
5. Registrar operaciones, pagos, deudas, reportes y kiosco que deben conservarse.
6. Identificar limitaciones conocidas.

#### Uso por el usuario

El usuario puede continuar utilizando el prototipo actual para validar:

- Flujo de nueva operación.
- Registro por lote.
- Pagos.
- Deudas.
- Reportes.
- Catálogos.
- Kiosco, aunque todavía no tenga un catálogo completo de productos.

#### Datos y respaldo

- Mantener el respaldo de `localStorage`.
- Exportar periódicamente el JSON de datos.
- No borrar la instalación anterior.
- Registrar la fecha del último respaldo.

#### Criterios para cerrar la fase

- Los flujos principales están documentados.
- Se identificaron errores y faltantes.
- Existe una copia restaurable de v1.
- El usuario confirma que la base funcional representa el negocio real.

#### Salida a producción

La v1 no se considera producción definitiva. Se considera una versión de validación operativa o piloto.

---

### Fase 2 — v2: migración visual a React SPA web

#### Objetivo

Recrear la funcionalidad de v1 en una aplicación React + TypeScript como SPA web, todavía sin Electron, API ni SQLite como base principal. Esta fase valida la nueva interfaz y arquitectura antes de añadir capacidades específicas de escritorio.

#### Tecnología

```text
React + TypeScript + Vite
React Router
Zustand
React Hook Form + Zod
Tailwind/shadcn o MUI
JSON demo/adaptador temporal
```

#### Preparación técnica

1. Crear un nuevo proyecto de migración separado de v1.
2. Definir tipos y modelos.
3. Crear componentes visuales.
4. Migrar primero layout y navegación.
5. Migrar operaciones.
6. Migrar pagos y deudas.
7. Migrar reportes y catálogos.
8. Mantener datos demo mediante un adaptador.
9. Implementar exportación de respaldo.
10. Crear una versión web ejecutable en desarrollo y una compilación estática de producción.

#### Validación contra v1

Se deben comparar los resultados de ambas versiones con los mismos datos:

- Totales de operaciones.
- Precios.
- Deudas.
- Pagos.
- Reportes diarios.
- Reportes por período.
- Exportaciones.
- Impresión.

#### Piloto web

1. Ejecutar v2 en un entorno de prueba.
2. No reemplazar inicialmente la v1.
3. Ejecutar operaciones de prueba.
4. Permitir al usuario comparar ambas versiones.
5. Corregir diferencias críticas.
6. Mantener v1 como respaldo de operación.

#### Salida a producción

La v2 puede utilizarse como SPA web piloto cuando:

- La compilación de producción funciona sin herramientas de desarrollo.
- La aplicación inicia correctamente en un navegador compatible.
- El usuario puede abrir, registrar, exportar e imprimir.
- Existe respaldo y restauración.
- No hay diferencias críticas con v1.

#### Reversión

Si v2 presenta problemas:

1. Cerrar el entorno web de v2.
2. Restaurar la copia de datos.
3. Volver a ejecutar v1.
4. Registrar el problema.
5. Corregir v2 sin modificar la etiqueta publicada.

---

### Fase 3 — v3: Electron, escritorio y SQLite local

#### Objetivo

Reutilizar la SPA React de v2 dentro de Electron para crear la versión de escritorio y pasar de `localStorage` a SQLite local, manteniendo la posibilidad de exportar e importar JSON.

#### Tecnología

```text
React SPA de v2 + Electron
SQLite local
Repositorio local
JSON versionado para respaldos
```

#### Preparación de datos

1. Definir el esquema SQLite.
2. Crear migraciones versionadas.
3. Crear un importador desde el JSON de v2.
4. Validar cada registro importado.
5. Informar errores de importación sin ocultarlos.
6. Crear un respaldo automático antes de migrar.
7. Verificar conteos y totales antes y después.

#### Seguridad y operación local

- Guardar la base en una ubicación administrada por la aplicación.
- No guardar la base dentro de la carpeta del código.
- Crear copias rotativas.
- Permitir respaldo manual.
- Permitir restauración con vista previa.
- Evitar sobrescribir la base sin confirmación.
- Registrar migraciones ejecutadas.

#### Pruebas de migración

Comparar:

- Cantidad de operaciones.
- Cantidad de pagos.
- Suma de operaciones.
- Suma de pagos.
- Saldos por entidad.
- Catálogos.
- Productos de kiosco.
- Precios vigentes e históricos.

#### Piloto

1. Migrar una copia de datos.
2. Instalar v3 en el equipo piloto.
3. Trabajar durante un período controlado.
4. Revisar respaldos diariamente.
5. Validar cierres y reportes.
6. Mantener la copia de v2 sin modificar.

#### Salida a producción

v3 será la primera versión recomendada para uso operativo local porque:

- No necesita servidor.
- Tiene una base de datos real.
- Puede trabajar offline.
- Puede generar respaldos.
- Tiene mejor integridad que `localStorage`.

#### Reversión

La reversión requiere:

1. Detener nuevos registros.
2. Exportar los últimos datos de SQLite.
3. Restaurar el respaldo anterior.
4. Volver a v2 web solo si se confirma compatibilidad.
5. No continuar registrando datos en dos versiones sin un procedimiento de conciliación.

---

### Fase 4 — v4/v5: API, autenticación y operación online

#### Objetivo

Permitir varios equipos, usuarios y una fuente de datos centralizada sin perder la posibilidad de trabajar con una aplicación de escritorio.

#### Tecnología

```text
React SPA + Electron o web
TanStack Query
NestJS + TypeScript
REST API /api/v1
Prisma
MySQL inicialmente
PostgreSQL como alternativa futura
```

#### Preparación del backend

1. Definir contratos OpenAPI.
2. Crear autenticación.
3. Crear usuarios, roles y permisos.
4. Implementar módulos por dominio.
5. Implementar validación server-side.
6. Implementar correlativos transaccionales.
7. Implementar auditoría.
8. Implementar archivos de comprobantes.
9. Crear migraciones de base de datos.
10. Importar datos validados desde SQLite.

#### Preparación de infraestructura

- Servidor o servicio administrado.
- Base de datos con respaldos.
- Variables de entorno seguras.
- HTTPS.
- Logs.
- Monitoreo.
- Política de recuperación.
- Usuario de base de datos con permisos mínimos.
- Migraciones controladas.

#### Pruebas antes del cambio

- Pruebas unitarias del dominio.
- Pruebas de API.
- Pruebas de permisos.
- Pruebas de concurrencia de correlativos.
- Pruebas de carga de comprobantes.
- Pruebas de importación.
- Pruebas de recuperación de backups.
- Pruebas end-to-end con Playwright.

#### Piloto online

1. Crear un entorno de prueba separado.
2. Importar una copia de los datos.
3. Crear usuarios piloto.
4. Ejecutar operaciones controladas.
5. Comparar saldos y reportes con v3.
6. Revisar auditoría.
7. Probar pérdida temporal de conexión.
8. Definir qué hará Electron cuando la API no esté disponible.

#### Salida a producción

La salida debe ser gradual:

1. Un equipo administrador.
2. Un equipo de caja o recepción.
3. Los demás usuarios.
4. Revisión diaria durante la primera semana.
5. Revisión semanal durante el primer mes.

Durante la transición se debe definir una única fuente oficial para registrar operaciones. No se deben registrar datos simultáneamente en SQLite y API sin sincronización implementada.

#### Reversión

Antes de activar producción:

- Crear backup completo de la base.
- Guardar versión anterior de la aplicación.
- Preparar scripts de reversión de migraciones.
- Definir quién autoriza volver a la versión anterior.
- Registrar operaciones realizadas durante una eventual contingencia.

---

### Matriz resumida de producción

| Fase | Versión | Fuente principal | Usuario final | Estado |
|---|---|---|---|---|
| 1 | v1 | localStorage/JSON | Validación y piloto | Referencia funcional |
| 2 | v2 | JSON/adaptador local | Piloto web | Migración visual |
| 3 | v3 | SQLite + Electron | Operación local real | Primera producción de escritorio |
| 4 | v4/v5 | API + MySQL/PostgreSQL | Varios equipos | Producción online y endurecimiento |

### Regla de avance

No se debe avanzar a la siguiente fase solo porque el código compila. Se debe avanzar cuando:

- Los datos son recuperables.
- El usuario puede ejecutar sus tareas.
- Los resultados coinciden con la fase anterior.
- Los errores críticos están resueltos.
- Existe instalación reproducible.
- Existe respaldo.
- Existe reversión.
- La nueva versión fue probada por un usuario real.

---

## 21. Instalación y levantamiento en el ordenador del usuario

Esta sección define cómo llegará BCE System al ordenador de una persona que no conoce programación. El usuario final no debería instalar Node.js, React, Electron, MySQL, PostgreSQL, SQLite CLI ni dependencias manualmente. Todo lo necesario debe entregarse mediante un instalador o un paquete controlado.

### 21.1. Principio de instalación

El usuario debe recibir:

```text
BCE-System-Setup-vX.Y.Z.exe
```

El instalador debe:

- Instalar la aplicación.
- Crear el acceso directo.
- Crear la carpeta de datos fuera de la carpeta del programa.
- Crear las carpetas de respaldos y logs.
- Registrar la versión instalada.
- Mantener los datos al actualizar.
- Permitir desinstalar el programa sin borrar automáticamente los datos.

La aplicación instalada debe funcionar sin abrir una terminal ni ejecutar comandos.

### 21.2. Qué se instala en cada fase

| Versión | Qué se instala en el ordenador | Qué necesita el usuario |
|---|---|---|
| v1 | Navegador y carpeta/servidor estático opcional | Abrir `index.html` o una dirección local |
| v2 | Navegador o paquete web servido por un entorno controlado | Acceso al navegador; no requiere Node.js en producción |
| v3 | Instalador Electron, aplicación React compilada, runtime Electron y SQLite embebido | Ejecutar el acceso directo |
| v4/v5 | Electron o navegador, más acceso a API por red | Internet o red local y usuario autenticado |

La versión recomendada para un usuario final sin conocimientos técnicos es v3: un instalador Windows con Electron y SQLite.

### 21.3. Instalación y publicación de la versión web

Una aplicación web no se instala como un `.exe` tradicional. Se compila y se publica en un servidor. El usuario accede mediante una dirección web desde Chrome, Edge u otro navegador compatible.

```text
Usuario
  ↓ navegador
https://bce.midominio.com
  ↓
Servidor web/CDN
  ↓
Archivos compilados de la SPA React
```

El usuario final solo necesita:

- Un navegador actualizado.
- Dirección web o acceso directo.
- Conexión a la red donde esté publicado el sistema.
- Usuario y contraseña cuando exista autenticación.

No necesita instalar:

- Node.js.
- npm.
- React.
- Vite.
- MySQL.
- PostgreSQL.

#### Publicación web de v2 sin backend

Para v2, que es una SPA React sin API, el flujo sería:

1. El equipo de desarrollo instala Node.js y dependencias.
2. Se ejecuta la compilación de producción (`npm run build`).
3. Se genera una carpeta de archivos estáticos, normalmente `dist/`.
4. Se copia `dist/` a un hosting, servidor web o CDN.
5. Se configura el servidor para devolver `index.html` en las rutas de React.
6. Se habilita HTTPS si se accede por red.
7. El usuario abre la URL en el navegador.

En esta etapa los datos seguirían siendo locales al navegador, por lo que v2 web no debe considerarse todavía una solución multiusuario.

#### Formas de publicar la web

| Modalidad | Infraestructura | Acceso | Uso |
|---|---|---|---|
| Hosting estático/CDN | Hosting de archivos | Internet | Demo, piloto o SPA sin backend |
| Servidor local del colegio | PC o servidor en la red local | URL como `http://bce-servidor` | Uso interno sin Internet |
| VPS o nube | Servidor Linux/Windows administrado | Dominio HTTPS | Aplicación online |
| Plataforma administrada | Servicio de despliegue | Dominio proporcionado | Menor mantenimiento operativo |

#### Publicación web con API en v4/v5

La versión online completa tendría dos despliegues:

```text
Frontend SPA
  https://bce.midominio.com

API backend
  https://api.bce.midominio.com

Base de datos
  MySQL o PostgreSQL, no expuesta directamente a Internet
```

Pasos generales:

1. Contratar o preparar un servidor.
2. Configurar dominio y DNS.
3. Instalar Docker o el runtime requerido.
4. Desplegar la API compilada.
5. Configurar variables de entorno.
6. Crear la base de datos.
7. Ejecutar migraciones.
8. Crear el usuario inicial.
9. Publicar la SPA.
10. Configurar HTTPS.
11. Configurar backups, logs y monitoreo.
12. Probar login, operaciones, pagos, reportes e impresión.

El navegador nunca debe conectarse directamente al puerto de MySQL o PostgreSQL.

#### Actualización de la versión web

Para actualizar la SPA:

1. Generar una nueva compilación.
2. Ejecutar pruebas.
3. Publicar los archivos en una carpeta o versión nueva.
4. Verificar el entorno de prueba.
5. Cambiar la versión activa.
6. Invalidar o actualizar la caché.
7. Confirmar que el usuario carga los archivos nuevos.

Para una actualización completa con API:

1. Respaldar la base de datos.
2. Publicar la nueva API.
3. Ejecutar migraciones compatibles.
4. Publicar la nueva SPA.
5. Probar endpoints y flujos principales.
6. Mantener la versión anterior disponible para reversión.

#### Web dentro de una red local

Si el colegio tiene varios equipos pero no desea Internet, se puede instalar la API y el servidor web en un equipo central de la red:

```text
PC servidor del colegio
  API + SPA + MySQL/PostgreSQL
          ↑
  Equipos de caja, dirección y administración
```

Los usuarios accederían desde una dirección local. Este modelo sí requiere mantener encendido el PC servidor, realizar backups y configurar la red. No requiere instalar el programa completo en cada equipo.

#### Diferencia entre web y Electron

| Aspecto | Web | Electron |
|---|---|---|
| Instalación del usuario | No hay `.exe`; se entrega una URL | Se instala un `.exe` |
| Actualización | Se publica una nueva compilación | Se distribuye un instalador o actualización |
| Datos locales | Limitados al navegador, salvo SQLite vía backend | SQLite local directamente |
| Internet | Necesario para servidor remoto | No necesario en v3 local |
| Impresión y archivos | Dependen del navegador | Mayor control mediante Electron |
| Multiusuario | Natural con API | Requiere API para compartir datos |
| Mantenimiento | Centralizado en el servidor | Cada equipo debe actualizarse |

La versión web es adecuada cuando existe una red o servidor central. La versión Electron + SQLite es adecuada cuando cada ordenador debe trabajar sin servidor.

### 21.4. Entorno de desarrollo frente a producción

En desarrollo sí se utilizarán herramientas como:

```text
Node.js
npm
Vite
TypeScript
Electron
```

Estas herramientas pertenecen al equipo de desarrollo. No deben ser requisitos del ordenador del usuario.

En producción se entrega:

```text
Aplicación compilada
Runtime incluido
Base SQLite administrada por la aplicación
Archivos estáticos empaquetados
```

### 21.5. Requisitos iniciales recomendados para v3

La primera versión de escritorio debe apuntar a equipos modestos:

| Recurso | Mínimo operativo objetivo | Recomendado |
|---|---:|---:|
| Sistema | Windows 10 de 64 bits | Windows 11 de 64 bits |
| RAM | 4 GB | 8 GB |
| Almacenamiento libre | 1 GB para aplicación y temporales | 5 GB para datos y respaldos |
| Procesador | Intel/AMD de 2 núcleos | Intel/AMD de 4 núcleos |
| Pantalla | 1280×720 | 1366×768 o superior |
| Internet | No requerido para v3 local | Necesario solo para actualizaciones o API |
| Impresora | Opcional | Según reportes y comprobantes |

Estos valores son objetivos iniciales y deben confirmarse con pruebas en el equipo real del usuario. No se deben prometer requisitos definitivos sin medir el instalador y el consumo de memoria.

### 21.6. Instalación de v3 paso a paso

1. Copiar el instalador al ordenador mediante descarga, USB o red.
2. Ejecutar `BCE-System-Setup-v3.x.x.exe`.
3. Aceptar la instalación.
4. Elegir la carpeta del programa si se solicita.
5. Crear el acceso directo.
6. Iniciar BCE System.
7. Ejecutar el asistente inicial.
8. Crear o seleccionar la carpeta de datos.
9. Elegir “Instalación nueva” o “Importar respaldo”.
10. Validar la configuración inicial.
11. Registrar el primer usuario local si corresponde.
12. Probar una operación, un pago, un reporte y una impresión.
13. Crear el primer respaldo.

El asistente debe mostrar mensajes claros y detener la instalación si no puede crear la carpeta de datos o realizar la migración.

### 21.7. Ubicación de archivos

El programa y los datos deben estar separados:

```text
Carpeta del programa:
C:\Program Files\BCE System\

Datos de usuario:
C:\Users\<usuario>\AppData\Roaming\BCE System\

Base local:
C:\Users\<usuario>\AppData\Roaming\BCE System\data\bce.sqlite

Respaldos:
C:\Users\<usuario>\Documents\BCE System\Backups\

Logs:
C:\Users\<usuario>\AppData\Local\BCE System\logs\
```

La ruta exacta puede configurarse, pero nunca se debe guardar la base dentro de `Program Files`, porque Windows puede impedir su escritura y las actualizaciones podrían reemplazarla.

### 21.8. Primera ejecución y configuración

El asistente inicial debe:

- Detectar si existe una base local.
- Crear la estructura SQLite.
- Ejecutar migraciones pendientes.
- Importar JSON si el usuario lo selecciona.
- Validar cantidades y totales.
- Configurar año activo.
- Configurar servicios y precios.
- Configurar productos de kiosco.
- Configurar tipos de pago.
- Configurar reglas de comprobantes.
- Crear respaldo inicial.

No debe cargar automáticamente datos demo en una instalación productiva sin preguntar. Debe diferenciar:

```text
Instalación demo
Instalación nueva vacía
Restaurar respaldo
```

### 21.9. Actualizaciones

La actualización debe:

1. Detectar la versión actual.
2. Solicitar o programar un respaldo.
3. Cerrar BCE System.
4. Instalar archivos nuevos.
5. Mantener la carpeta de datos.
6. Ejecutar migraciones SQLite.
7. Verificar la migración.
8. Registrar la versión.
9. Iniciar la nueva versión.

Nunca se debe reemplazar la base sin respaldo. Si una migración falla, la aplicación debe informar el error y conservar la copia anterior.

### 21.10. Desinstalación

El desinstalador debe preguntar por separado:

- Desinstalar solo el programa.
- Desinstalar el programa y conservar datos.
- Desinstalar y eliminar datos después de confirmar.

La opción predeterminada debe conservar datos y respaldos.

### 21.11. Copias de seguridad para usuarios no técnicos

La aplicación debe ofrecer un botón visible:

```text
Configuración → Datos → Crear respaldo
```

El respaldo debe incluir:

- SQLite.
- Metadatos de versión.
- Archivos de comprobantes, si corresponde.
- Hash o verificación de integridad.

Se deben permitir:

- Respaldo manual.
- Respaldo automático al cerrar o al iniciar una actualización.
- Restauración con vista previa.
- Exportación a una memoria USB o carpeta elegida.
- Aviso si nunca se ha creado un respaldo.

### 21.12. Operación sin servidor en v3

En v3 no se instala un servidor Windows ni un servicio de base de datos. SQLite se ejecuta como archivo local dentro de la aplicación.

```text
Usuario
  ↓
BCE System.exe
  ↓
SQLite local
```

Esto reduce mantenimiento y evita que el usuario deba:

- Instalar MySQL.
- Configurar puertos.
- Iniciar servicios.
- Crear usuarios de base de datos.
- Configurar una red.

### 21.13. Operación con servidor en v4/v5

Cuando exista API online, el usuario no debería instalar MySQL ni NestJS en su ordenador. El modelo recomendado es:

```text
Ordenador del usuario
  BCE System.exe
          ↓ red/HTTPS
Servidor de aplicación
  API NestJS
          ↓
Servidor de base de datos
  MySQL o PostgreSQL
```

En el servidor sí se necesitará preparar:

- Sistema operativo compatible.
- Node.js o contenedor Docker.
- API compilada.
- Variables de entorno.
- MySQL o PostgreSQL.
- Migraciones.
- Usuario SQL con permisos mínimos.
- HTTPS.
- Firewall.
- Backups.
- Monitoreo y logs.
- Dominio o dirección de red.

Esto se administrará como infraestructura del sistema, no por el usuario final.

### 21.14. Equipo con poca RAM

Antes de optimizar prematuramente se debe medir el rendimiento en el equipo objetivo. La primera implementación debe funcionar correctamente y luego registrar:

- RAM al iniciar.
- RAM con Dashboard abierto.
- RAM con tabla grande.
- RAM al generar reportes.
- Tiempo de arranque.
- Tiempo de abrir operaciones.
- Tiempo de búsqueda.
- Uso de disco.
- Tiempo de respaldo.

Medidas previstas si el equipo resulta limitado:

- No cargar todos los catálogos en memoria.
- Paginar consultas.
- Buscar con índices.
- Destruir gráficos cuando se cambia de vista.
- Cargar módulos bajo demanda.
- Evitar múltiples ventanas Electron.
- Reducir animaciones.
- No cargar fuentes externas.
- Comprimir recursos.
- Mantener imágenes de comprobantes con tamaño controlado.
- Limitar la retención de logs locales.
- Usar una versión de Electron compatible y actualizada.

No se debe aplicar una versión “lite” que elimine integridad o respaldos sin medir primero. La prioridad será conservar los datos y la confiabilidad.

### 21.15. Checklist de entrega al usuario

Antes de entregar una instalación:

- El instalador funciona en un equipo limpio.
- No requiere Node.js ni comandos.
- Se crea el acceso directo.
- La aplicación abre sin Internet en v3.
- Se puede crear una operación.
- Se puede registrar un pago.
- Se valida el tipo de pago.
- Se puede consultar una deuda.
- Se puede imprimir o exportar.
- Se puede crear un respaldo.
- Se puede restaurar un respaldo de prueba.
- La actualización conserva los datos.
- La desinstalación conserva los datos por defecto.
- El usuario conoce a quién reportar problemas.

---

## 22. Decisiones tecnológicas confirmadas

Esta sección registra las decisiones confirmadas hasta este momento. Las alternativas descritas en las secciones anteriores se conservan como referencia y comparación, pero no son la ruta principal mientras no se apruebe un cambio explícito.

### 22.1. Proyecto frontend confirmado

La ruta principal del frontend será:

```text
React + TypeScript como SPA
Vite
React Router
Zustand
TanStack Query preparado para datos remotos
TanStack Table
React Hook Form + Zod
TailAdmin Free + Tailwind CSS + shadcn/ui/Radix UI
```

La evolución del frontend será:

```text
v1: HTML/CSS/JavaScript actual
v2: React SPA web
v3: misma React SPA empaquetada con Electron
```

Electron no será un frontend diferente. Será el contenedor de escritorio de la misma aplicación React, evitando duplicar pantallas y lógica visual.

La variante visual definitiva confirmada es TailAdmin Free. La comparación con Mantis/MUI queda cerrada y no forma parte del desarrollo activo.

El prototipo navegable inicial se encuentra en `D:\Trabajos\Propios\bce-system\prototipo-react`. Usa TailAdmin Free como única variante activa y permite recorrer los módulos principales con datos demo. Esta carpeta es la base inicial de v2 y todavía no constituye la implementación completa.

### 22.2. Proyecto backend confirmado para una fase posterior

El backend se desarrollará en un proyecto separado del frontend:

```text
D:\Trabajos\Propios\bce-system-api
```

La ruta principal recomendada será:

```text
Node.js + NestJS + TypeScript
REST API versionada
OpenAPI/Swagger
Prisma
```

El backend se incorporará después de la fase local con SQLite. No forma parte de v1 ni de v2.

### 22.3. Base de datos confirmada por etapa

```text
v1/v2: JSON versionado para demo, pruebas y respaldo
v3: SQLite local dentro de la aplicación de escritorio
v4/v5: MySQL inicialmente mediante API
```

PostgreSQL permanece como alternativa técnica evaluada, pero no como decisión principal inicial. Si posteriormente se elige PostgreSQL, el cambio deberá documentarse como una decisión nueva y adaptar el esquema mediante migraciones.

### 22.4. Lo que permanece abierto

Todavía no se han fijado definitivamente:

- Librería final de gráficos.
- Estrategia exacta de almacenamiento de imágenes.
- Proveedor de hosting.
- Método de actualización automática de Electron.
- Framework móvil futuro.

Estas decisiones se tomarán cuando exista una necesidad concreta de implementación.

### 22.5. Regla para cambiar el stack aprobado

Cambiar React, NestJS, SQLite, MySQL o las herramientas principales no debe hacerse de forma implícita durante la implementación. Cualquier cambio debe registrar:

1. Tecnología anterior.
2. Tecnología propuesta.
3. Motivo del cambio.
4. Impacto en carpetas, datos y contratos.
5. Impacto en las fases.
6. Plan de migración o reversión.
