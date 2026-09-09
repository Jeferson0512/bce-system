import type { Operation } from '../../../domain/src/index';

export const demoOperations: Operation[] = [
  { reference: 'OP-2026-00482', applicant: 'María López', service: 'Copias + Anillado', amount: 18.5, status: 'Pagado', time: '10:42 a. m.' },
  { reference: 'OP-2026-00481', applicant: 'Carlos Ramírez', service: 'Impresión B/N', amount: 6, status: 'Pendiente', time: '10:35 a. m.' },
  { reference: 'OP-2026-00480', applicant: 'Ana Torres', service: 'Kiosco', amount: 12.5, status: 'Pagado', time: '10:18 a. m.' },
];

export function listDemoOperations(): Operation[] {
  return demoOperations.map((operation) => ({ ...operation }));
}
