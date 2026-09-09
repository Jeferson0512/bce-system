import { Box, CircleDollarSign, ClipboardList, Wallet } from 'lucide-react';

export const stats = [
  { label: 'Operaciones del día', value: '128', change: '+12.5%', icon: ClipboardList, tone: 'blue' },
  { label: 'Ingresos del día', value: 'S/ 1,845.50', change: '+8.2%', icon: CircleDollarSign, tone: 'green' },
  { label: 'Deudas pendientes', value: 'S/ 3,240.00', change: '18 personas', icon: Wallet, tone: 'orange' },
  { label: 'Productos en kiosco', value: '246', change: '12 con stock bajo', icon: Box, tone: 'purple' },
];

export const operations = [
  ['OP-2026-00482', 'María López', 'Copias + Anillado', 'S/ 18.50', 'Pagado', '10:42 a. m.'],
  ['OP-2026-00481', 'Carlos Ramírez', 'Impresión B/N', 'S/ 6.00', 'Pendiente', '10:35 a. m.'],
  ['OP-2026-00480', 'Ana Torres', 'Kiosco', 'S/ 12.50', 'Pagado', '10:18 a. m.'],
  ['OP-2026-00479', 'José Sánchez', 'Plastificado', 'S/ 8.00', 'Pagado', '09:56 a. m.'],
  ['OP-2026-00478', 'Lucía Mendoza', 'Copias a color', 'S/ 24.00', 'Pendiente', '09:44 a. m.'],
];
