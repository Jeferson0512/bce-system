# BCE System v2 — Frontend

Base oficial de la SPA React para BCE System. La v1 permanece en la raíz del
repositorio y no debe modificarse desde este proyecto.

## Desarrollo local

```powershell
cd D:\Trabajos\Propios\bce-system\prototipo-react
npm install
npm run dev
```

Para validar una compilación de producción:

```powershell
npm run build
```

## Flujo de ramas

- `main`: versiones publicadas y revisadas.
- `feature/*`: cambios de una funcionalidad concreta.
- `release/*`: preparación de una versión candidata.
- `v1.0.0`: prototipo original congelado.
- `v2.0.0`: inicio de la base React/TailAdmin.

Cada cambio debe validarse con `npm run build`, confirmarse en su rama y
publicarse mediante revisión antes de integrarse a `main`.

## Alcance actual

- React SPA con Vite.
- React Router para navegación por URL.
- TypeScript estricto y tipos de dominio iniciales.
- TailAdmin Free como dirección visual.
- Datos demo locales para validar navegación y componentes.
- Sin SQLite, Electron ni API todavía; se incorporarán en sus fases.
