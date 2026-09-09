import {
  BarChart3,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
} from 'lucide-react';

export const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'operaciones', label: 'Operaciones', icon: ClipboardList },
  { id: 'kiosco', label: 'Kiosco', icon: ShoppingCart },
  { id: 'pagos', label: 'Pagos', icon: CreditCard },
  { id: 'deudas', label: 'Deudas', icon: Wallet },
  { id: 'catalogos', label: 'Catálogos', icon: Package },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
];
