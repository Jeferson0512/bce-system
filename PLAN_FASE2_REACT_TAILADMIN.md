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
| [x] | Migrar dashboard | `apps/web/src/pages/DashboardPage.tsx`; typecheck/build validados |
| [x] | Migrar operaciones | `apps/web/src/features/operaciones`; React Hook Form + Zod y typecheck/build validados |
| [x] | Migrar kiosco | `apps/web/src/features/kiosco/pages/KioscoPage.tsx`; búsqueda, filtro por categoría, límite de stock, carrito y build validados |
| [x] | Migrar pagos | `apps/web/src/features/pagos/pages/PaymentsPage.tsx`; formulario React Hook Form + Zod, referencia condicional por método y build validados |
| [x] | Migrar deudas | `apps/web/src/features/deudas/pages/DebtsPage.tsx`; estados de cuenta, saldos, vencimientos, abono visual y build validados |
| [x] | Migrar catálogos | `apps/web/src/features/catalogos/pages/CatalogsPage.tsx`; tabs de servicios, productos, categorías y métodos de pago, búsqueda y build validados |
| [x] | Migrar reportes | `apps/web/src/features/reportes/pages/ReportsPage.tsx`; filtros por tipo/estado, métricas y tabla de resumen con build validado |
| [x] | Configurar Vitest y pruebas unitarias | `apps/web/vitest.config.ts` y prueba de `operationSchema`; `npm run test` validado |
| [x] | Configurar Playwright y pruebas E2E | `apps/web/playwright.config.ts` y smoke test dashboard-operaciones; Chrome instalado, `npm run test:e2e` validado |
| [x] | Validar accesibilidad, responsive y rendimiento | Navegación E2E validada en Chrome, botón móvil con nombre accesible, CSS responsive para 1100/800/520 px y build de producción validado |

No se marcará una actividad como completada solo por crear archivos: debe
existir una validación reproducible y quedar indicada en la columna Evidencia.

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

- Indicadores diarios.
- Gráfico de actividad.
- Resumen de ingresos.
- Resumen de deudas.
- Estado del kiosco.
- Accesos rápidos.
- Operaciones recientes.
- Estados de carga y datos vacíos.

**Salida:** dashboard funcional con datos demo y navegación a los módulos.

### F2.5 — Operaciones

- Listado de operaciones.
- Búsqueda, filtros, orden y paginación.
- Formulario de nueva operación.
- Selección de solicitante.
- Selección de servicio.
- Cálculo de importes.
- Estado de operación.
- Correlativo y referencia visible.
- Detalle de operación.
- Anulación controlada.

**Salida:** se puede registrar y consultar una operación sin romper las reglas del dominio.

### F2.6 — Kiosco

- Catálogo de productos.
- Búsqueda por nombre, código y categoría.
- Vista de stock.
- Indicador de stock bajo.
- Registro de venta.
- Cantidades y subtotal.
- Total de venta.
- Estado activo/inactivo del producto.

**Salida:** el módulo deja de ser únicamente un acceso visual y permite recorrer el flujo de venta demo.

### F2.7 — Pagos

- Listado de pagos.
- Asociación con operación o entidad.
- Tipo de pago.
- Referencia de pago.
- Importe.
- Estado de validación.
- Reglas visuales de comprobante requerido/opcional.
- Registro de pago.
- Validación de campos según método.
- Consulta del detalle.

**Salida:** el usuario distingue claramente efectivo, Yape, Plin, transferencia y pagos pendientes de validación.

### F2.8 — Deudas

- Listado de personas con saldo.
- Filtros por estado y vencimiento.
- Estado de cuenta.
- Historial de operaciones y pagos.
- Registro de abono.
- Cálculo de saldo restante.
- Estados pendiente, parcial y pagado.

**Salida:** el saldo mostrado coincide con las operaciones y pagos demo.

### F2.9 — Catálogos

- Servicios.
- Productos.
- Categorías.
- Métodos de pago.
- Personas o solicitantes.
- Estados configurables cuando corresponda.
- Alta, edición, activación e inactivación.
- Confirmación antes de acciones destructivas o sensibles.

**Salida:** los catálogos utilizados por formularios se administran desde una vista común.

### F2.10 — Reportes

- Filtros por rango de fechas.
- Tipo de operación.
- Método de pago.
- Estado.
- Resumen de resultados.
- Tabla de resultados.
- Gráfico principal.
- Exportación definida para la v2.

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
