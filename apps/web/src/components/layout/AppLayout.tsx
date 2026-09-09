import { NavLink, Outlet } from 'react-router-dom';
import { Bell, ClipboardList, CreditCard, LayoutDashboard, Menu, Package, Settings, ShoppingCart, Wallet, type LucideIcon } from 'lucide-react';

const navigation: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/operaciones', label: 'Operaciones', icon: ClipboardList },
  { to: '/kiosco', label: 'Kiosco', icon: ShoppingCart },
  { to: '/pagos', label: 'Pagos', icon: CreditCard },
  { to: '/deudas', label: 'Deudas', icon: Wallet },
  { to: '/catalogos', label: 'Catálogos', icon: Package },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">B</span><span><strong>BCE System</strong><small>Gestión de copias</small></span></div>
        <p className="section-label">MENÚ PRINCIPAL</p>
        <nav>{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
        <div className="sidebar-footer"><p className="section-label">SISTEMA</p><button className="nav-link"><Settings size={18} />Configuración</button><small className="storage">Almacenamiento local<br /><b>JSON preparado para migración</b></small></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" aria-label="Abrir menú"><Menu size={20} /></button><span className="breadcrumb">BCE System / <b>Fase 2</b></span><div className="top-actions"><span className="template-badge">TailAdmin Free</span><Bell size={18} aria-label="Notificaciones" /><span className="avatar" aria-label="Usuario JP">JP</span></div></header>
        <div className="page-container"><Outlet /></div>
      </main>
    </div>
  );
}
