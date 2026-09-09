# BCE System — Plan completo de la Fase 2

## 1. Propósito del documento

Este documento define el alcance total de la **Fase 2: migración del frontend a React + TypeScript como SPA web**, usando TailAdmin Free como dirección visual.

El documento de análisis general `PLAN_ANALISIS_Y_MIGRACION_FRONTEND.md` se conserva como historial, alcance global y referencia arquitectónica del proyecto. No se modificará durante la ejecución de esta fase.

La Fase 3, correspondiente a Electron + SQLite, tendrá su propio plan independiente cuando la Fase 2 haya sido terminada y validada.

## 2. Punto de partida

La Fase 2 parte de:

```text
v1.0.0: prototipo HTML/CSS/JavaScript original congelado
v2.0.0: base React/TailAdmin inicial
Rama de trabajo: feature/v2-react-foundation
```

La v1 no se sobrescribe ni se modifica. El frontend de Fase 2 se implementará dentro del repositorio principal, en la aplicación web `apps/web`:

```text
D:\Trabajos\Propios\bce-system\apps\web
```

La carpeta `prototipo-react` se mantiene solo como prototipo visual de consulta.

## 3. Objetivo de la Fase 2

Construir una SPA web funcional, mantenible y navegable que reemplace progresivamente la presentación vanilla de la v1, conservando las reglas funcionales definidas para BCE System.

Al finalizar esta fase el usuario podrá:

- Abrir BCE System desde un navegador.
- Navegar mediante URLs reales.
- Consultar el dashboard.
- Registrar y consultar operaciones.
- Gestionar servicios y productos del kiosco.
- Registrar y consultar pagos.
- Consultar deudas y estados de cuenta.
- Gestionar catálogos.
- Consultar reportes.
- Validar formularios y recibir mensajes claros.
- Buscar, filtrar, paginar y ordenar tablas.
- Exportar información en los módulos definidos.
- Usar datos JSON versionados mediante un adaptador local.

## 4. Tecnologías aprobadas

| Necesidad | Tecnología |
|---|---|
| Framework | React |
| Lenguaje | TypeScript |
| Build | Vite |
| Navegación | React Router |
| Estilos y template | Tailwind CSS + TailAdmin Free |
| Componentes accesibles | shadcn/ui y Radix UI cuando aporten valor |
| Estado local/global | Zustand |
| Formularios | React Hook Form |
| Validación | Zod |
| Tablas | TanStack Table |
| Gráficos | Recharts inicialmente |
| Pruebas unitarias | Vitest |
| Pruebas de interfaz | Playwright |
| Fuente de datos de esta fase | JSON local mediante adaptadores |

## 5. Fuera del alcance

No se implementará en Fase 2:

- Electron.
- SQLite.
- MySQL o PostgreSQL.
- API o backend.
- Autenticación real multiusuario.
- Sincronización entre equipos.
- Almacenamiento productivo de imágenes.
- Aplicación móvil.
- Infraestructura de producción multiusuario.

TanStack Query quedará preparado conceptualmente para la API futura, pero no se utilizará para fingir un backend inexistente. El acceso de esta fase será mediante repositorios/adaptadores locales.

## 6. Principios de implementación

1. Mantener la v1 intacta y ejecutable.
2. No mezclar lógica de negocio con componentes visuales.
3. Usar TypeScript sin introducir `any` innecesario.
4. Validar entradas en el formulario y en el dominio.
5. No borrar registros funcionales físicamente cuando el negocio requiera anulación.
6. Mantener identificadores, correlativos, estados y reglas definidos en el plan general.
7. Mostrar errores explícitos; no usar datos silenciosamente vacíos ante fallos.
8. Reutilizar componentes comunes antes de duplicar código.
9. Hacer commits pequeños, verificables y descriptivos.
10. No integrar directamente a `main`; toda modificación pasará por rama y revisión.

## 7. Arquitectura de carpetas de la Fase 2

La arquitectura general del plan inicial se respeta. Todo permanece dentro del repositorio `bce-system`, pero la aplicación web se ubicará en `apps/web`, tal como establece la arquitectura objetivo. Electron, móvil, SQLite, backend y sus implementaciones se reservan para fases posteriores. `prototipo-react` se conserva únicamente como referencia visual y no forma parte de la aplicación de Fase 2.

### 7.1. Estructura real durante la Fase 2

El proyecto contiene los archivos históricos de la v1, la aplicación web React en `apps/web` y los paquetes compartidos definidos por la arquitectura. Esta es la estructura objetivo del repositorio:

```text
bce-system/
├── apps/
│   ├── web/                    # aplicación React real de Fase 2
│   │   ├── src/
│   │   ├── public/
│   │   └── vite.config.ts
│   ├── desktop/                # reservado para Fase 3
│   └── mobile/                 # reservado para fase móvil futura
├── packages/
│   ├── domain/                 # reglas y entidades compartibles
│   ├── application/            # casos de uso y puertos
│   ├── contracts/              # esquemas y contratos
│   ├── ui/                     # componentes y theme compartidos
│   ├── data-access/            # adaptadores JSON, SQLite y API
│   └── config/                 # configuración compartida
├── database/                   # reservado para SQLite de Fase 3
├── legacy-v1/                  # v1 original congelada en v1.0.0
│   ├── index.html
│   ├── css/
│   └── js/
├── docs/
├── tests/
├── PLAN_ANALISIS_Y_MIGRACION_FRONTEND.md
├── PLAN_FASE2_REACT_TAILADMIN.md
├── package.json
├── pnpm-workspace.yaml
└── prototipo-react/            # referencia visual; no modificar para Fase 2
```

La v1 original se conserva físicamente en `legacy-v1/` con sus rutas relativas
intactas (`index.html`, `css/`, `js/` y `database/`). La etiqueta Git `v1.0.0`
también permanece disponible como punto de reversión.

Durante Fase 2 se implementarán principalmente `apps/web`, `packages/domain`, `packages/application`, `packages/contracts`, `packages/ui`, `packages/data-access/json`, `packages/config`, `tests/unit` y `tests/e2e`. Las carpetas de Electron, móvil, SQLite y cliente API se reservan sin funcionalidad hasta sus fases correspondientes.

Dentro de `apps/web/src/` se completará la siguiente estructura:

```text
apps/web/src/
├── app/                        # composición, providers y router
├── pages/                      # páginas asociadas a rutas
├── routes/                     # definición de rutas SPA
├── components/                 # layout, UI, tablas, formularios y feedback
├── features/                   # una carpeta por módulo de negocio
│   ├── dashboard/
│   ├── operaciones/
│   ├── kiosco/
│   ├── pagos/
│   ├── deudas/
│   ├── catalogos/
│   └── reportes/
├── stores/                     # Zustand para estado de interfaz
├── styles/                     # tokens y estilos globales Tailwind
└── main.tsx                    # punto de entrada
```

### 7.2. Regla de organización de cada feature

Cada módulo debe encapsular su presentación, tipos específicos, validaciones y acceso al repositorio:

```text
src/features/pagos/
├── components/                 # PaymentTable, PaymentForm, PaymentStatus
├── pages/                      # PaymentsPage
├── schemas/                    # esquemas Zod
├── services/                   # casos de uso del módulo
├── types/                      # tipos propios del módulo
└── index.ts                    # API pública del feature
```

Las reglas compartidas o puramente de dominio irán en `src/types` y `src/lib`; no se deben importar componentes de una feature directamente desde otra. La comunicación entre módulos se hará mediante tipos, servicios o navegación.

### 7.3. Relación con la arquitectura futura

La estructura general prevista en el plan inicial (`apps/web`, `apps/desktop`, `apps/mobile` y `packages`) es la evolución posterior del repositorio. No se debe crear artificialmente esa estructura durante Fase 2 porque todavía existe un único cliente web y no hay workspace monorepo.

Cuando se prepare la Fase 3, `apps/desktop` reutilizará la SPA de `apps/web`, el móvil será `apps/mobile` y los adaptadores SQLite/API se habilitarán en `packages/data-access` o en sus aplicaciones correspondientes. No se requiere trasladar la aplicación web nuevamente.

Durante la Fase 2 se podrán mantener archivos puente temporales, pero cada uno deberá tener una tarea de reemplazo antes del cierre de la fase. Se pueden crear las carpetas reservadas para documentar la arquitectura, pero no se implementarán Electron, móvil, SQLite ni API hasta que comiencen sus planes respectivos. La carpeta `prototipo-react` no se utilizará para implementar funcionalidades nuevas.

## 8. Fases internas de trabajo

## 8.0. Seguimiento de ejecución

Este recuadro se actualizará únicamente cuando una actividad haya sido
implementada y verificada:

| Estado | Actividad | Evidencia |
|---|---|---|
| [x] | Definir arquitectura de Fase 2 en `apps/web` y `packages` | Sección 7 de este documento |
| [x] | Crear workspace base y entrada Vite de `apps/web` | Compilación inicial validada |
| [x] | Configurar React Router con rutas de módulos | `apps/web/src/app/App.tsx` |
| [x] | Crear shell visual inicial TailAdmin | `apps/web/src/components/layout/AppLayout.tsx` |
| [x] | Crear tipos y adaptador JSON local | `packages/domain/src/index.ts` y `packages/data-access/json/src/demoData.ts`; typecheck/build validados |
| [x] | Crear puerto y repositorio local de operaciones | `packages/application/src/ports/OperationRepository.ts` y `packages/data-access/json/src/operationRepository.ts`; Dashboard y Operaciones consumen el repositorio, pruebas Vitest validadas |
| [x] | Crear componentes UI reutilizables | `apps/web/src/components/ui`, `feedback` y `tables`; typecheck/build validados |
| [~] | Crear dashboard inicial | `apps/web/src/pages/DashboardPage.tsx`; shell, métricas demo y tabla visual validados. Falta paridad de datos y reglas con v1 |
| [~] | Reconstruir operaciones v1 en React | `apps/web/src/features/operaciones`; solicitante por tipo, persona, pedido multiítem, salón, fecha, notas, pago, repositorio y E2E de guardado implementados. Falta detalle, historial completo, anulación y registro por lote |
| [~] | Crear kiosco inicial | `apps/web/src/features/kiosco/pages/KioscoPage.tsx`; búsqueda, filtro, stock visual y carrito validados. Falta persistencia, pago y descuento real de stock |
| [~] | Crear pagos iniciales | `apps/web/src/features/pagos/pages/PaymentsPage.tsx`; formulario y referencia condicional validados. Falta asociación persistente, importe, comprobante, detalle e historial |
| [~] | Crear deudas iniciales | `apps/web/src/features/deudas/pages/DebtsPage.tsx`; estados y abono visual validados. Falta cálculo conectado a operaciones/pagos e historial por persona |
| [~] | Crear catálogos iniciales | `apps/web/src/features/catalogos/pages/CatalogsPage.tsx`; tabs y búsqueda validados. Falta CRUD, personas, activación/inactivación y conexión con formularios |
| [~] | Crear reportes iniciales | `apps/web/src/features/reportes/pages/ReportsPage.tsx`; filtros y tabla demo validados. Falta rango de fechas real, método de pago, gráfico y exportación |
| [x] | Configurar Vitest y pruebas unitarias | `apps/web/vitest.config.ts` y prueba de `operationSchema`; `npm run test` validado |
| [x] | Configurar Playwright y pruebas E2E | `apps/web/playwright.config.ts` y smoke test dashboard-operaciones; Chrome instalado, `npm run test:e2e` validado |
| [x] | Validar accesibilidad, responsive y rendimiento | Navegación E2E validada en Chrome, botón móvil con nombre accesible, CSS responsive para 1100/800/520 px y build de producción validado |

No se marcará una actividad como completada solo por crear archivos: debe
existir una validación reproducible y quedar indicada en la columna Evidencia.

`[~]` indica una base visual o funcional parcial. Solo `[x]` significa que
existe paridad suficiente con la lógica de la v1 y que el flujo está conectado
a datos, reglas y pruebas. Las pantallas actuales de módulos no se consideran
la migración terminada mientras permanezcan en estado `[~]`.

### 8.1 — Brecha de paridad v1 → v2

La v1 congelada en `legacy-v1/` contiene reglas que no deben perderse en la
reconstrucción React. La v2 actual conserva el shell y una primera representación
visual, pero todavía debe recuperar estas capacidades:

| Área de v1 | Situación actual en v2 | Trabajo necesario |
|---|---|---|
| Nueva operación | Formulario simplificado | Solicitante por tipo, persona, pedido multiítem, salones, fecha, notas, cobro, pago y guardado |
| Registro por lote | No migrado | Flujo por lote y cálculo por ítems |
| Historial | Tabla demo de operaciones | Filtros, detalle, ordenamiento, paginación y anulación controlada |
| Deudas por persona | Vista general demo | Profesores, alumnos y dirección con saldo derivado |
| Kiosco | Carrito local | Venta persistente, pago y descuento de stock |
| Reportes | Tabla demo | Fuentes compartidas, fechas, gráficos y exportación |
| Catálogos | Tabs visuales | CRUD y conexión con operaciones, pagos y kiosco |
| Configuración | Sin módulo real | Precios, sistema, usuarios y permisos |

La estrategia de migración será vertical: primero se reconstruye una capacidad
completa de la v1 en dominio, repositorio, caso de uso, formulario, detalle y
pruebas; después se marca `[x]`. Crear una ruta o una pantalla no constituye
por sí solo una migración.

### 8.2 — Especificación funcional del Dashboard

El Dashboard de Fase 2 no se considerará migrado por tener únicamente una
ruta, cuatro métricas o una tabla demo. Debe recuperar la estructura de
información y los cálculos que existen en el Dashboard de la v1, conservando
la dirección visual TailAdmin de la v2.

#### 8.2.1 — Cabecera

La cabecera debe mostrar:

- Título `Dashboard`.
- Año activo.
- Fecha actual.
- Botón principal `Nueva operación`.
- Selector de período únicamente si modifica los datos de todo el dashboard.

El botón `Nueva operación` debe navegar al flujo React real de operaciones.

#### 8.2.2 — KPIs de actividad del día

El primer grupo debe titularse `Actividad del día` y contener cuatro cards:

| Card | Cálculo | Acción |
|---|---|---|
| Operaciones hoy | Conteo de operaciones cuya fecha corresponde al día actual | Historial filtrado por fecha actual |
| Copias realizadas | Suma de cantidades de ítems clasificados como copias | Operaciones o reporte filtrado por copias |
| Impresiones realizadas | Suma de cantidades de ítems clasificados como impresiones | Operaciones o reporte filtrado por impresiones |
| Servicios especiales | Importe y unidades de anillado, escaneo y plastificado | Reporte diario filtrado por servicios especiales |

Cuando corresponda, los cards deben mostrar comparación contra ayer, por
ejemplo `+3 vs ayer`. Un card que navega debe tener estado hover/focus,
etiqueta accesible y comportamiento semántico de enlace o botón.

#### 8.2.3 — KPIs de estado financiero

El segundo grupo debe titularse `Estado financiero` y contener:

| Card | Cálculo | Acción |
|---|---|---|
| Cobrado hoy | Suma de pagos recibidos en la fecha actual y cantidad de pagos | Pagos filtrados por fecha |
| Pendiente profesores | Suma de saldos pendientes de profesores | Deudas de profesores |
| Profesores con deuda | Conteo de profesores con saldo mayor que cero | Deudas de profesores |
| Dirección pendiente | Operaciones de dirección menos pagos aplicados | Cuenta de dirección |

Dirección debe mostrar un estado contextual `Pendiente` o `Al día`. Los
valores no pueden permanecer hardcodeados cuando existan repositorios de
operaciones, pagos y deudas.

#### 8.2.4 — Card de operaciones recientes

Debe mostrar únicamente las últimas ocho operaciones, ordenadas de forma
descendente por fecha y hora.

| Columna | Contenido |
|---|---|
| Fecha | Fecha y hora de la operación |
| Solicitante | Profesor, alumno o dirección |
| Tipo | Badge del tipo de solicitante |
| Ítems | Cantidad de servicios/productos del pedido |
| Total | Importe total |

Cada fila debe poder abrir el detalle de la operación. El botón `Ver todo`
debe navegar al historial. Debe existir estado vacío cuando no haya registros.

#### 8.2.5 — Card de top deudores

Debe mostrar hasta seis deudores ordenados por saldo pendiente descendente.
Cada fila debe incluir:

- Avatar o iniciales.
- Nombre.
- Salón o contexto relacionado.
- Saldo pendiente.
- Barra de progreso de pago.
- Color de riesgo: verde, amarillo o rojo.

`Ver todos` debe abrir el listado de deudas. Cada fila debe poder abrir el
estado de cuenta individual. Cuando no existan deudas debe aparecer
`Sin deudas pendientes`.

#### 8.2.6 — Card de servicios del día

Debe ser un gráfico circular tipo doughnut alimentado por cantidades del día.
Las categorías mínimas son:

- Copia B/N.
- Impresión B/N.
- Copia a color.
- Impresión a color.
- Anillado.
- Escaneo.
- Plastificado.

Debe incluir leyenda, colores consistentes, total de unidades, estado sin
datos y una alternativa textual accesible. La implementación objetivo es
Recharts; las barras CSS temporales no cumplen este requisito.

#### 8.2.7 — Card de formas de pago

Debe ser un gráfico circular que agrupe el importe cobrado por:

- Efectivo.
- Yape.
- Plin.
- Transferencia.

Debe mostrar leyenda, total, porcentaje o importe por método, estado vacío y
acción para abrir pagos filtrados.

#### 8.2.8 — Card de últimos siete días

Debe mostrar la evolución diaria de los últimos siete días con:

- Fecha en el eje X.
- Importe en soles en el eje Y.
- Tooltip con fecha y total.
- Estado sin datos.
- Fuente común con Reportes.

La primera versión debe mostrar el total generado por día. Podrá añadir una
segunda serie de total cobrado cuando el repositorio de pagos esté conectado.

#### 8.2.9 — Card de resumen del mes

Debe mostrar:

- Total generado durante el mes.
- Cantidad de operaciones.
- Mes y año.
- Distribución por profesores, alumnos y dirección.
- Barra de progreso para cada tipo.

El resumen debe calcularse desde las mismas operaciones usadas por el resto de
la aplicación y no desde constantes independientes.

#### 8.2.10 — Card de accesos rápidos

Debe contener acciones reales, no botones decorativos:

- Nueva operación.
- Deudas de profesores.
- Deudas de alumnos.
- Reporte diario.
- Reporte por período.
- Precios.

Cada acceso debe tener icono, texto, navegación a una ruta existente y estados
hover/focus. Si una ruta aún no existe, debe permanecer identificada como
pendiente y no presentarse como funcional.

#### 8.2.11 — Contrato común de cards

La implementación debe poder describir cada card con un contrato equivalente
al siguiente:

```ts
interface DashboardCardDefinition {
  id: string;
  title: string;
  value?: string;
  description?: string;
  tone: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'slate';
  interactive: boolean;
  href?: string;
  source: string;
  emptyState?: string;
}
```

No todos los cards serán botones:

- Los KPIs con navegación serán interactivos.
- Las filas de operaciones y deudores serán seleccionables.
- Los gráficos serán principalmente informativos, con acceso opcional al
  reporte correspondiente.
- El resumen mensual será informativo.
- Los accesos rápidos serán botones de navegación.

#### 8.2.12 — Estructura visual objetivo

```text
Dashboard
├── Cabecera + Nueva operación
├── Actividad del día
│   ├── Operaciones hoy
│   ├── Copias realizadas
│   ├── Impresiones realizadas
│   └── Servicios especiales
├── Estado financiero
│   ├── Cobrado hoy
│   ├── Pendiente profesores
│   ├── Profesores con deuda
│   └── Dirección pendiente
├── Operaciones recientes + Top deudores
├── Servicios del día + Formas de pago
├── Últimos 7 días + Resumen del mes
└── Accesos rápidos
```

#### 8.2.13 — Criterios de aceptación del Dashboard

El Dashboard podrá marcarse como `[x]` únicamente cuando:

- Todos los cards definidos estén presentes.
- Las métricas provengan de repositorios compartidos.
- Operaciones recientes muestre como máximo ocho filas y cinco columnas.
- Los top deudores se calculen desde operaciones y pagos.
- Servicios del día y formas de pago tengan gráficos y estados vacíos.
- Últimos siete días y resumen mensual compartan fuente con Reportes.
- Los accesos rápidos naveguen a rutas funcionales.
- Existan pruebas unitarias para los cálculos principales.
- Exista una prueba E2E de navegación y consulta del Dashboard.
- Se valide escritorio, pantalla reducida y navegación por teclado.

### 8.3 — Especificaciones funcionales de las demás pantallas

Esta sección centraliza el contrato funcional de las pantallas que deben
reconstruirse desde `legacy-v1/` hacia React. La v2 puede modernizar el
layout, los componentes y la navegación, pero no puede eliminar campos,
cálculos, filtros, acciones o relaciones de negocio existentes en la v1.

Una pantalla solo podrá marcarse como migrada cuando cumpla su contrato de
datos, comportamiento, estados y pruebas. Crear una ruta o mostrar una tabla
demo no equivale a completar la migración.

#### 8.3.1 — Nueva operación

**Referencia v1:** `legacy-v1/js/views/operaciones.js`, `DB.precios`,
`DB.salones`, `DB.profesores`, `DB.alumnos`, `DB.operaciones` y `DB.pagos`.

**Objetivo:** registrar una operación completa, no solamente calcular un
importe simple.

Debe incluir:

- Tipo de solicitante: profesor, alumno o dirección.
- Selección de la persona concreta según el tipo.
- Para alumnos:
  - alumno registrado o nombre.
  - encargo del profesor o uso personal.
  - salón de destino.
  - profesor que lo envió como referencia.
- Para dirección:
  - persona que ordena.
  - persona que recoge.
  - opción de usar la misma persona.
- Modo de servicio y modo Kiosco.
- Servicio o producto desde un catálogo activo.
- Salón de destino o uso personal.
- Cantidad.
- Juegos/originales cuando aplique.
- Precio unitario según tipo de solicitante.
- Precio variable editable con validación.
- Subtotal por ítem.
- Pedido con múltiples ítems.
- Modo de varios salones para repetir un servicio.
- Fecha de operación.
- Notas.
- Pago inmediato, pago pendiente o sin pago.
- Total del pedido.
- Guardar operación.
- Guardar y continuar.
- Resumen del pedido antes de confirmar.

Reglas:

- No permitir guardar sin solicitante válido.
- No permitir guardar sin al menos un ítem.
- Cantidades enteras mayores que cero.
- Precio mayor que cero.
- No permitir servicios o productos inactivos.
- Aplicar tarifa correspondiente a profesor, alumno o dirección.
- El cobro debe conservar el contexto salón/tutor/persona.
- La referencia debe generarse desde un correlativo.
- La operación guardada debe quedar disponible para historial, pagos,
  deudas y reportes.

#### 8.3.2 — Registro por lote

**Referencia v1:** `legacy-v1/js/views/lote.js`.

**Objetivo:** registrar muchas operaciones de una misma fecha en una sola
vista.

Debe incluir pestañas para:

- Profesores.
- Alumnos.
- Dirección.

Cada fila debe permitir, según el tipo:

- Persona.
- Salón o uso personal.
- Servicio.
- Cantidad.
- Precio.
- Total de fila.
- Eliminar fila.

Debe incluir:

- Fecha común del registro.
- Agregar fila.
- Contadores por pestaña.
- Vista previa de operaciones que se crearán.
- Total de operaciones.
- Total monetario.
- Guardar todo.
- Mensajes de filas incompletas.
- Prevención de duplicados o confirmación explícita cuando corresponda.

El guardado debe crear operaciones individuales reutilizando el mismo caso de
uso de Nueva operación; no debe duplicar reglas de cálculo.

#### 8.3.3 — Historial y detalle de operación

**Referencia v1:** `legacy-v1/js/views/historial.js`.

La pantalla de historial debe incluir:

- Búsqueda por solicitante, salón y servicio.
- Filtro por tipo: profesor, alumno y dirección.
- Filtros de fecha: todos, hoy, esta semana y este mes.
- Tabla paginada.
- Selector de cantidad por página.
- Conteo de resultados.
- Exportación CSV/Excel.
- Exportación PDF/impresión.
- Acción para ver detalle.
- Acción para imprimir.
- Estado vacío y estado sin resultados.

Las columnas mínimas son:

| Fecha/hora | Tipo | Solicitante | Servicios | Salones | Total | Acciones |
|---|---|---|---|---|---|---|

El detalle debe mostrar:

- Referencia.
- Fecha y hora.
- Tipo y solicitante.
- Profesor que envió, cuando aplique.
- Quién ordena y quién recoge, para dirección.
- Notas.
- Tabla de ítems con servicio, salón, cantidad, precio unitario y subtotal.
- Total.
- Pagos asociados.
- Estado de la operación.
- Acción de impresión.
- Anulación controlada con confirmación y motivo, si la regla lo permite.

#### 8.3.4 — Pagos

La v2 debe conservar el flujo de pago que la v1 usa desde operaciones y
deudas, aunque lo exponga también como módulo independiente.

Debe incluir:

- Selección de operación o entidad.
- Tipo de solicitante.
- Importe.
- Fecha.
- Método: efectivo, Yape, Plin o transferencia.
- Referencia o comprobante cuando corresponda.
- Notas.
- Estado: pendiente, validado o anulado.
- Registro de pago.
- Historial de pagos.
- Detalle de pago.

Reglas:

- No aceptar importe cero o negativo.
- No permitir pagar más que el saldo sin confirmación explícita.
- Efectivo no requiere referencia.
- Métodos digitales requieren referencia según configuración.
- El pago debe actualizar el saldo de la persona y los indicadores del
  Dashboard.
- Dirección, profesor y alumno deben conservarse como entidades separadas.

#### 8.3.5 — Deudas de profesores

**Referencia v1:** `legacy-v1/js/views/deudas.js`, vista de profesores.

Debe incluir:

- Resumen de total generado.
- Total pagado.
- Saldo pendiente.
- Conteo de profesores con deuda.
- Filtros por estado y nivel.
- Búsqueda.
- Tabla de profesores.
- Acción para abrir cuenta individual.
- Acción para registrar pago.
- Exportación.

Columnas mínimas:

| Profesor | Salón tutor | Nivel | Total | Pagado | Pendiente | Estado | Acción |
|---|---|---|---:|---:|---:|---|---|

El estado individual debe ser pendiente, parcial o pagado.

El estado de cuenta debe mostrar operaciones, servicios, salones, pagos,
saldo restante y acción de abono.

#### 8.3.6 — Deudas de alumnos

Debe conservar la misma lógica financiera de profesores, pero asociada al
alumno y su salón:

- Total generado.
- Total pagado.
- Pendiente.
- Estado.
- Nivel y salón.
- Búsqueda y filtros.
- Estado de cuenta.
- Historial de operaciones.
- Historial de pagos.
- Registro de abono.
- Exportación.

No se debe mezclar el saldo de alumno con el del tutor o profesor. La regla
de cobro debe quedar explícita en el dominio.

#### 8.3.7 — Deudas de dirección

Debe mostrar una cuenta consolidada de dirección con:

- Operaciones de dirección.
- Quién ordenó.
- Quién recogió.
- Fecha.
- Servicios.
- Notas.
- Total generado.
- Total pagado.
- Saldo pendiente.
- Historial de pagos.
- Registro de pago.

Debe distinguir entre operaciones pendientes, pagadas y anuladas.

#### 8.3.8 — Kiosco y ventas

El Kiosco debe funcionar como catálogo y como flujo de venta:

- Productos activos.
- Búsqueda por nombre, código y categoría.
- Stock disponible.
- Indicador de stock bajo.
- Precio.
- Cantidad.
- Subtotal.
- Carrito.
- Total.
- Asociación opcional a solicitante.
- Pago.
- Confirmación de venta.
- Descuento de stock.
- Historial de ventas.

Reglas:

- No vender más unidades que el stock.
- No vender productos inactivos.
- No completar una venta vacía.
- Descontar stock únicamente al confirmar.
- La venta debe ser visible en pagos y reportes.

#### 8.3.9 — Reporte diario

**Referencia v1:** `legacy-v1/js/views/reportes.js`, `viewReporteDiario`.

Debe permitir seleccionar al menos hoy y ayer, además de una fecha concreta.

Debe mostrar:

- Total generado.
- Total cobrado.
- Saldo pendiente.
- Cantidad de operaciones.
- Servicios del día.
- Distribución por tipo de solicitante.
- Gráfico o resumen de servicios.
- Tabla de detalle.

Columnas mínimas:

| Hora | Tipo | Solicitante | Servicios | Salones | Total |
|---|---|---|---|---|---:|

Debe permitir abrir el detalle de cada operación y exportar el resultado.

#### 8.3.10 — Reporte por período

Debe permitir:

- Fecha inicial.
- Fecha final.
- Atajos: hoy, semana, mes y período anterior.
- Tipo de solicitante.
- Servicio.
- Método de pago.
- Estado.

Debe mostrar:

- Tendencia del período.
- Total generado.
- Total cobrado.
- Pendiente.
- Ranking de profesores.
- Resumen por servicio con cantidad e importe.
- Tabla completa de operaciones.
- Exportación.

Todos los cálculos deben utilizar los mismos repositorios que Dashboard,
Historial, Pagos y Deudas.

#### 8.3.11 — Catálogo de salones

Debe incluir:

- Listado de salones.
- Nivel.
- Grado.
- Sección.
- Tutor.
- Estado.
- Crear.
- Editar.
- Activar/inactivar.
- Confirmar acciones sensibles.
- Filtros por nivel.

Los salones activos deben alimentar Nueva operación, Registro por lote,
Deudas y reportes.

#### 8.3.12 — Catálogo de profesores

Debe incluir:

- Nombre.
- Rol.
- Salón tutor.
- Nivel.
- Estado.
- Deuda resumida.
- Crear.
- Editar.
- Activar/inactivar.
- Detalle de cuenta.

Los profesores activos deben alimentar las operaciones y los reportes.

#### 8.3.13 — Catálogo de personal

Debe incluir:

- Nombre.
- Rol.
- Tipo administrativo/docente.
- Salón tutor cuando aplique.
- Estado.
- Crear.
- Editar.
- Activar/inactivar.

Debe alimentar los campos de dirección y autorización.

#### 8.3.14 — Catálogo de alumnos

Debe incluir:

- Nombre.
- Salón.
- Grado.
- Sección.
- Nivel.
- Estado.
- Filtros por nivel y salón.
- Crear.
- Editar.
- Activar/inactivar.
- Consulta de deuda.

#### 8.3.15 — Catálogo de usuarios

Debe incluir:

- Usuario.
- Persona asociada.
- Nivel de acceso.
- Estado.
- Crear.
- Editar.
- Activar/inactivar.
- Confirmación antes de eliminar o desactivar.

Los niveles mínimos son administrador, operador y consulta. La autorización
de acciones sensibles debe prepararse aunque el login completo pertenezca a
una fase posterior.

#### 8.3.16 — Configuración de precios

Debe incluir un tarifario por servicio con:

- Nombre.
- Descripción.
- Precio para profesor.
- Precio para alumno.
- Precio para dirección.
- Precio variable cuando aplique.
- Estado.
- Crear y editar.
- Activar/inactivar.
- Historial de precios por año.

Los precios activos deben ser la fuente de Nueva operación, Registro por lote,
Kiosco y reportes.

#### 8.3.17 — Configuración del sistema

Debe incluir acciones explícitas y confirmadas para:

- Ver cantidad de registros almacenados.
- Restaurar datos demo.
- Limpiar transacciones.
- Iniciar desde cero.
- Mantener catálogos cuando una limpieza solo afecte transacciones.

Las acciones destructivas deben mostrar advertencia, resumen del alcance y
confirmación. No se debe borrar información silenciosamente.

#### 8.3.18 — Matriz de pantallas y estado de paridad

| Pantalla v1 | Ruta React objetivo | Estado inicial | Criterio para marcar `[x]` |
|---|---|---|---|
| Dashboard | `/` | `[~]` | Cards, cálculos, gráficos, navegación y pruebas completas |
| Nueva operación | `/operaciones` | `[~]` | Flujo multiítem, reglas, persistencia, detalle y pruebas |
| Registro por lote | `/operaciones/lote` | `[ ]` | Tres pestañas, preview, guardado masivo y reutilización de reglas |
| Historial | `/operaciones/historial` | `[ ]` | Filtros, paginación, exportación, detalle y anulación |
| Pagos | `/pagos` | `[~]` | Asociación, validación, saldo, historial y detalle |
| Deudas profesores | `/deudas/profesores` | `[ ]` | Cuenta, filtros, abonos y estados correctos |
| Deudas alumnos | `/deudas/alumnos` | `[ ]` | Cuenta, filtros, abonos y estados correctos |
| Deudas dirección | `/deudas/direccion` | `[ ]` | Cuenta consolidada, pagos y saldo |
| Kiosco | `/kiosco` | `[~]` | Venta, pago, stock persistente e historial |
| Reporte diario | `/reportes/diario` | `[ ]` | Fecha, métricas, servicios, tabla y exportación |
| Reporte por período | `/reportes/periodo` | `[ ]` | Rango, filtros, tendencia, rankings y exportación |
| Salones | `/catalogos/salones` | `[ ]` | CRUD conectado a operaciones |
| Profesores | `/catalogos/profesores` | `[ ]` | CRUD conectado a deudas y operaciones |
| Personal | `/catalogos/personal` | `[ ]` | CRUD conectado a dirección |
| Alumnos | `/catalogos/alumnos` | `[ ]` | CRUD conectado a operaciones y deudas |
| Usuarios | `/catalogos/usuarios` | `[ ]` | CRUD y niveles de acceso |
| Precios | `/config/precios` | `[ ]` | Tarifario conectado a cálculos |
| Sistema | `/config/sistema` | `[ ]` | Respaldos, restauración y acciones destructivas confirmadas |

#### 8.3.19 — Contrato mínimo común de cada pantalla

Antes de implementar una pantalla se debe documentar:

1. Fuente de datos y repositorios.
2. Entidades involucradas.
3. Cálculos y reglas de negocio.
4. Columnas y límites de tablas.
5. Botones y navegación.
6. Estados de carga, vacío, error y éxito.
7. Permisos o acciones sensibles.
8. Criterios de accesibilidad y responsive.
9. Pruebas unitarias.
10. Pruebas E2E.

Este contrato será la referencia para decidir si una pantalla está en
`[ ]`, `[~]` o `[x]`.

### F2.1 — Fundación técnica

- Convertir el punto de entrada a TypeScript.
- Configurar `tsconfig` estricto.
- Definir alias de importación.
- Separar configuración, tipos y datos demo.
- Configurar React Router.
- Definir layout TailAdmin.
- Crear providers de aplicación.
- Crear manejo de estados de carga, error y vacío.

**Salida:** la SPA inicia, navega por URL y compila sin errores.

### F2.2 — Sistema visual y componentes compartidos

- Convertir los tokens visuales de la v1 a Tailwind.
- Definir colores, tipografía, espaciado y estados BCE.
- Crear sidebar, navbar, breadcrumb y layout responsive.
- Crear botones, badges, alerts, modales, inputs y selects.
- Crear tabla base, paginación, filtros y estados.
- Crear confirmaciones y notificaciones.

**Salida:** los módulos utilizan componentes consistentes y no estilos aislados duplicados.

### F2.3 — Datos locales y dominio

- Definir interfaces TypeScript para operaciones, servicios, productos, pagos, deudas, personas y catálogos.
- Versionar el JSON demo.
- Crear repositorios locales tipados.
- Crear adaptadores para lectura y escritura temporal.
- Definir errores de dominio.
- Preparar interfaces de repositorio sustituibles por SQLite/API.

**Salida:** las vistas no dependen directamente de estructuras JSON sin tipado.

### F2.4 — Dashboard

- Cabecera con año, fecha y acción de nueva operación.
- KPIs de actividad del día: operaciones, copias, impresiones y servicios especiales.
- KPIs financieros: cobrado, pendientes de profesores, profesores con deuda y dirección.
- Operaciones recientes limitadas a ocho registros y cinco columnas.
- Top deudores con progreso, riesgo y navegación al estado de cuenta.
- Servicios del día como gráfico doughnut.
- Formas de pago como gráfico doughnut.
- Evolución de los últimos siete días.
- Resumen mensual por tipo de solicitante.
- Accesos rápidos con navegación funcional.
- Estados de carga, error, vacío y datos sin resultados.

**Salida:** dashboard funcional con datos demo y navegación a los módulos.

### F2.5 — Operaciones

- Nueva operación completa según 8.3.1.
- Registro por lote según 8.3.2.
- Historial, detalle y anulación según 8.3.3.
- Repositorios y casos de uso compartidos por los tres flujos.

**Salida:** se puede registrar y consultar una operación sin romper las reglas del dominio.

### F2.6 — Kiosco

- Catálogo, venta, pago, stock e historial según 8.3.8.

**Salida:** el módulo deja de ser únicamente un acceso visual y permite recorrer el flujo de venta demo.

### F2.7 — Pagos

- Asociación, validación, estados, saldo, historial y detalle según 8.3.4.

**Salida:** el usuario distingue claramente efectivo, Yape, Plin, transferencia y pagos pendientes de validación.

### F2.8 — Deudas

- Profesores, alumnos y dirección según 8.3.5, 8.3.6 y 8.3.7.

**Salida:** el saldo mostrado coincide con las operaciones y pagos demo.

### F2.9 — Catálogos

- Salones, profesores, personal, alumnos, usuarios, servicios, productos,
  categorías y métodos de pago según 8.3.11 a 8.3.15.

**Salida:** los catálogos utilizados por formularios se administran desde una vista común.

### F2.10 — Reportes

- Reporte diario y reporte por período según 8.3.9 y 8.3.10.

**Salida:** los reportes se pueden consultar con filtros y exportar con información coherente.

### F2.11 — Calidad y endurecimiento

- Revisar accesibilidad básica.
- Revisar responsive.
- Revisar estados de error, carga y vacío.
- Eliminar imports y componentes muertos.
- Eliminar archivos puente ya reemplazados.
- Revisar rendimiento del bundle.
- Revisar navegación directa por URL.
- Revisar persistencia temporal y restauración de datos demo.

**Salida:** aplicación lista para piloto web.

## 9. Formularios y reglas de validación

Todos los formularios nuevos usarán React Hook Form y esquemas Zod.

Las validaciones mínimas incluyen:

- Campos obligatorios.
- Importes mayores que cero cuando corresponda.
- Métodos de pago válidos.
- Referencia requerida según configuración del método.
- Imagen o comprobante señalado como requerido, opcional o no permitido según configuración.
- Cantidades enteras y positivas para kiosco.
- Fechas válidas.
- No permitir operaciones con catálogos inactivos.
- Mensajes próximos al campo con error.
- Resumen general cuando existan errores múltiples.

## 10. Estado de aplicación

Zustand se utilizará solamente para estado local/global de interfaz, por ejemplo:

- Sidebar abierto o cerrado.
- Preferencia de tema.
- Filtros persistentes de interfaz.
- Modal activo.
- Notificaciones.
- Preferencias de tabla.

Los datos de negocio se consultarán mediante repositorios locales. Cuando exista API, esos repositorios podrán reemplazarse por TanStack Query sin rediseñar las vistas.

## 11. Tablas y gráficos

Las tablas complejas usarán TanStack Table para:

- Ordenamiento.
- Filtrado.
- Columnas.
- Paginación.
- Selección cuando sea necesaria.
- Visibilidad de columnas.

Los gráficos iniciales usarán Recharts. Cada gráfico debe tener:

- Título.
- Unidad o contexto.
- Estado sin datos.
- Alternativa textual cuando sea razonable.
- Datos derivados de la misma fuente que la tabla.

## 12. Pruebas

### Pruebas unitarias con Vitest

Se cubrirán prioritariamente:

- Cálculo de totales.
- Cálculo de saldos.
- Validación de pagos.
- Reglas de referencia y comprobante.
- Correlativos.
- Filtros.
- Transformaciones de datos.
- Adaptadores JSON.

### Pruebas de interfaz con Playwright

Flujos mínimos:

1. Abrir dashboard.
2. Navegar directamente a cada URL.
3. Crear una operación válida.
4. Rechazar un formulario inválido.
5. Buscar y filtrar operaciones.
6. Registrar un pago con método y referencia.
7. Consultar una deuda.
8. Registrar una venta de kiosco.
9. Administrar un catálogo.
10. Consultar y exportar un reporte.

## 13. Ramas y commits

La rama actual es la base de la fundación:

```text
feature/v2-react-foundation
```

Para cada bloque se crearán ramas específicas desde la base actualizada:

```text
feature/v2-types-and-data
feature/v2-layout-components
feature/v2-dashboard
feature/v2-operaciones
feature/v2-kiosco
feature/v2-pagos
feature/v2-deudas
feature/v2-catalogos
feature/v2-reportes
test/v2-quality
release/v2.1.0
```

Cada rama debe:

1. Tener un objetivo único.
2. Compilar antes del commit.
3. Pasar las pruebas relacionadas.
4. Tener commits pequeños.
5. Publicarse en remoto.
6. Integrarse mediante revisión.

`main` solo recibirá cambios revisados y verificables.

## 14. Criterios de aceptación de la Fase 2

La Fase 2 se considerará completa cuando:

- La aplicación use React + TypeScript como base real.
- TailAdmin sea la única dirección visual activa.
- Todas las rutas principales funcionen.
- Los módulos definidos estén implementados y navegables.
- Las vistas no dependan de eventos inline ni variables globales de la v1.
- Los datos estén tipados y aislados detrás de adaptadores.
- Los formularios tengan validación Zod.
- Las tablas complejas usen TanStack Table.
- Los gráficos usen Recharts.
- Existan pruebas unitarias para reglas críticas.
- Existan pruebas Playwright para flujos principales.
- La compilación de producción funcione.
- La navegación directa por URL funcione.
- La aplicación sea usable en escritorio y pantallas reducidas.
- La v1 siga disponible mediante `v1.0.0`.
- Exista un tag de cierre de fase, por ejemplo `v2.1.0`.
- El plan de Fase 3 se cree como documento separado después del cierre.

## 15. Entrega y publicación web

Para el piloto web:

1. Ejecutar `npm run build`.
2. Publicar el contenido de `dist`.
3. Configurar fallback del servidor para rutas SPA.
4. Verificar que `/`, `/operaciones`, `/kiosco`, `/pagos`, `/deudas`, `/catalogos` y `/reportes` abran directamente.
5. Mantener respaldo de los JSON demo.
6. Documentar la URL y el procedimiento de reversión.

Esta publicación no se considerará todavía multiusuario ni productiva con datos reales, porque la fase no incluye API ni base online.

## 16. Orden de ejecución recomendado

```text
1. Fundación TypeScript y Router
2. Layout TailAdmin y componentes compartidos
3. Tipos, JSON y repositorios locales
4. Dashboard
5. Operaciones
6. Kiosco
7. Pagos
8. Deudas
9. Catálogos
10. Reportes
11. Vitest
12. Playwright
13. Accesibilidad, responsive y rendimiento
14. Piloto web
15. Revisión y tag de cierre de Fase 2
```

## 17. Cierre de fase

Al completar todos los criterios:

- Se congelará la entrega de Fase 2 con un tag.
- Se actualizará únicamente la documentación de estado necesaria, sin alterar el plan histórico.
- Se elaborará un nuevo documento `PLAN_FASE3_ELECTRON_SQLITE.md`.
- La Fase 3 comenzará desde la SPA React validada, sin duplicar el frontend.
