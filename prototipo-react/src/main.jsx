import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive, BarChart3, Bell, BookOpen, Box, ChevronDown, CircleDollarSign,
  ClipboardList, CreditCard, FileText, Grid2X2, LayoutDashboard, Menu,
  Package, Plus, Search, Settings, ShoppingCart, Users, Wallet, X
} from 'lucide-react';
import './styles.css';
import { navigation } from './config/navigation';
import { operations, stats } from './data/demoData';

function App() {
  const [variant, setVariant] = useState('tailadmin');
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app variant-${variant}`}>
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">B</div>
          <div><strong>BCE System</strong><small>Gestión de copias</small></div>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={18} /></button>
        </div>
        <div className="workspace-label">MENÚ PRINCIPAL</div>
        <nav>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); setSidebarOpen(false); }}>
              <Icon size={18} /><span>{label}</span>{id === 'pagos' && <span className="nav-badge">3</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-label">SISTEMA</div>
          <button className="nav-item"><Settings size={18} /><span>Configuración</span></button>
          <div className="storage-card"><div className="storage-title"><Archive size={15} /> Almacenamiento local</div><div className="progress"><span /></div><small>SQLite preparado · 64%</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Inicio</span><ChevronDown size={14} /><strong>{navigation.find(item => item.id === page)?.label}</strong></div>
          <div className="top-actions">
            <div className="variant-switcher">
              <span>Vista:</span>
              <button className={variant === 'tailadmin' ? 'selected' : ''} onClick={() => setVariant('tailadmin')}>TailAdmin</button>
              <button className={variant === 'mantis' ? 'selected' : ''} onClick={() => setVariant('mantis')}>Mantis / MUI</button>
            </div>
            <button className="icon-button notification" aria-label="Notificaciones"><Bell size={19} /><i /></button>
            <div className="user-menu"><div className="avatar">JP</div><div className="user-name"><strong>Jeferson</strong><small>Administrador</small></div><ChevronDown size={15} /></div>
          </div>
        </header>
        <div className="content">
          <div className="prototype-banner"><span className="dot" /> Prototipo visual · <strong>{variant === 'tailadmin' ? 'TailAdmin Free + Tailwind' : 'Mantis Free + MUI'}</strong><span className="banner-note">Mismos datos y funcionalidad para comparar diseño</span></div>
          {page === 'dashboard' ? <Dashboard setPage={setPage} /> : <ModulePage page={page} setPage={setPage} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ setPage }) {
  return <><div className="page-heading"><div><p className="eyebrow">MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026</p><h1>¡Buenos días, Jeferson! <span>👋</span></h1><p className="muted">Este es el resumen de actividad de tu negocio.</p></div><button className="primary-button" onClick={() => setPage('operaciones')}><Plus size={18} /> Nueva operación</button></div>
    <section className="stats-grid">{stats.map(({ label, value, change, icon: Icon, tone }) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={change.startsWith('+') ? 'positive' : 'neutral'}>{change.startsWith('+') && '↗ '}{change}</small></div></div>)}</section>
    <section className="dashboard-grid"><div className="panel chart-panel"><div className="panel-header"><div><h2>Actividad semanal</h2><p className="muted">Operaciones registradas</p></div><button className="select-button">Esta semana <ChevronDown size={15} /></button></div><div className="chart"><div className="chart-y"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="chart-body"><div className="grid-lines">{[1,2,3,4,5].map(i => <i key={i} />)}</div><svg viewBox="0 0 600 190" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".22" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs><path className="area" d="M0 150 C35 135 45 90 82 110 S145 135 170 96 S220 50 255 80 S300 125 335 76 S390 62 420 88 S480 118 510 55 S560 35 600 42 V190 H0Z" /><path className="line" d="M0 150 C35 135 45 90 82 110 S145 135 170 96 S220 50 255 80 S300 125 335 76 S390 62 420 88 S480 118 510 55 S560 35 600 42" /></svg><div className="chart-labels"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div></div></div></div><div className="panel quick-panel"><div className="panel-header"><div><h2>Accesos rápidos</h2><p className="muted">Tareas frecuentes</p></div><Grid2X2 size={19} className="subtle-icon" /></div><div className="quick-list"><Quick icon={ClipboardList} label="Registrar operación" onClick={() => setPage('operaciones')} /><Quick icon={CreditCard} label="Registrar pago" onClick={() => setPage('pagos')} /><Quick icon={ShoppingCart} label="Vender producto" onClick={() => setPage('kiosco')} /><Quick icon={FileText} label="Ver reportes" onClick={() => setPage('reportes')} /></div></div></section>
    <section className="panel recent-panel"><div className="panel-header"><div><h2>Operaciones recientes</h2><p className="muted">Últimos movimientos registrados</p></div><button className="text-button" onClick={() => setPage('operaciones')}>Ver todas <span>→</span></button></div><OperationTable /></section>
  </>;
}

function Quick({ icon: Icon, label, onClick }) { return <button className="quick-item" onClick={onClick}><span><Icon size={18} /></span>{label}<strong>→</strong></button>; }
function OperationTable() { return <div className="table-wrap"><table><thead><tr><th>REFERENCIA</th><th>SOLICITANTE</th><th>SERVICIO</th><th>IMPORTE</th><th>ESTADO</th><th>HORA</th></tr></thead><tbody>{operations.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index === 4 ? <span className={`status ${cell === 'Pagado' ? 'paid' : 'pending'}`}><i />{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>; }
function ModulePage({ page, setPage }) {
  const item = navigation.find(entry => entry.id === page);
  const Icon = item?.icon || BookOpen;
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const rows = page === 'kiosco'
    ? [['SKU-0012', 'Cuaderno A4', 'S/ 8.50', '42', 'Activo'], ['SKU-0041', 'Lapicero azul', 'S/ 1.50', '8', 'Stock bajo'], ['SKU-0088', 'USB 32 GB', 'S/ 28.00', '16', 'Activo']]
    : page === 'pagos'
      ? [['PAG-2026-0091', 'OP-2026-00482', 'S/ 18.50', 'Yape', 'Validado'], ['PAG-2026-0090', 'OP-2026-00481', 'S/ 6.00', 'Efectivo', 'Pendiente'], ['PAG-2026-0089', 'OP-2026-00480', 'S/ 12.50', 'Plin', 'Validado']]
      : page === 'deudas'
        ? [['María López', '5 operaciones', 'S/ 84.00', 'Vence hoy', 'Pendiente'], ['Carlos Ramírez', '2 operaciones', 'S/ 26.00', '15 sep 2026', 'Pendiente'], ['Lucía Mendoza', '1 operación', 'S/ 24.00', 'Pagada', 'Pagado']]
        : operations.map(row => [row[0], row[1], row[2], row[3], row[4]]);
  const filteredRows = rows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase()) && (filter === 'Todos' || row[row.length - 1] === filter));
  return <><div className="page-heading"><div><p className="eyebrow">MÓDULO BCE SYSTEM</p><h1><Icon size={28} /> {item?.label}</h1><p className="muted">Gestión de registros, filtros y acciones del módulo.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => setPage('dashboard')}><LayoutDashboard size={17} /> Dashboard</button><button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Nuevo registro</button></div></div>
    {showForm && <div className="panel form-panel"><div className="panel-header"><div><h2>Nuevo registro</h2><p className="muted">Completa los campos para agregar información.</p></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Cerrar formulario"><X size={18} /></button></div><div className="form-grid"><label>Solicitante<input placeholder="Buscar persona..." /></label><label>Servicio<select defaultValue=""><option value="" disabled>Seleccionar servicio</option><option>Copias B/N</option><option>Impresión a color</option><option>Plastificado</option></select></label><label>Importe<input placeholder="S/ 0.00" /></label><label>Tipo de pago<select defaultValue=""><option value="" disabled>Seleccionar método</option><option>Efectivo</option><option>Yape</option><option>Plin</option></select></label></div><div className="form-footer"><span className="muted">Los campos marcados son obligatorios.</span><button className="primary-button" onClick={() => setShowForm(false)}>Guardar registro</button></div></div>}
    <div className="module-summary">{[['Registros hoy', '128', ClipboardList], ['Pendientes', '12', Wallet], ['Monto acumulado', 'S/ 1,845.50', CircleDollarSign]].map(([label, value, SummaryIcon]) => <div className="summary-item" key={label}><SummaryIcon size={18} /><div><small>{label}</small><strong>{value}</strong></div></div>)}</div>
    <section className="panel data-panel"><div className="panel-header"><div><h2>{item?.label} registrados</h2><p className="muted">Consulta y administra la información del módulo</p></div><button className="export-button"><FileText size={15} /> Exportar</button></div><div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre o referencia..." /></div><select value={filter} onChange={event => setFilter(event.target.value)}><option>Todos</option><option>Pagado</option><option>Pendiente</option><option>Validado</option><option>Activo</option><option>Stock bajo</option></select><button className="filter-button"><Settings size={15} /> Más filtros</button></div><div className="table-wrap"><table><thead><tr>{(page === 'kiosco' ? ['SKU', 'PRODUCTO', 'PRECIO', 'STOCK', 'ESTADO'] : page === 'pagos' ? ['REFERENCIA', 'OPERACIÓN', 'IMPORTE', 'MÉTODO', 'ESTADO'] : page === 'deudas' ? ['PERSONA', 'OPERACIONES', 'SALDO', 'VENCIMIENTO', 'ESTADO'] : ['REFERENCIA', 'SOLICITANTE', 'SERVICIO', 'IMPORTE', 'ESTADO']).map(header => <th key={header}>{header}</th>)}<th>ACCIONES</th></tr></thead><tbody>{filteredRows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index === row.length - 1 ? <span className={`status ${['Pagado', 'Validado', 'Activo'].includes(cell) ? 'paid' : 'pending'}`}><i />{cell}</span> : cell}</td>)}<td><button className="row-action">Ver</button><button className="row-action">⋮</button></td></tr>)}</tbody></table>{filteredRows.length === 0 && <div className="empty-state">No se encontraron registros con esos filtros.</div>}</div><div className="pagination"><span>Mostrando {filteredRows.length} de {rows.length} registros</span><div><button>‹</button><button className="current">1</button><button>2</button><button>›</button></div></div></section>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
