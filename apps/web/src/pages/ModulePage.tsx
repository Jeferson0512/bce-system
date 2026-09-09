import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

const labels: Record<string, string> = { dashboard: 'Dashboard', operaciones: 'Operaciones', kiosco: 'Kiosco', pagos: 'Pagos', deudas: 'Deudas', catalogos: 'Catálogos', reportes: 'Reportes' };

export function ModulePage({ module }: { module: string }) {
  const [query, setQuery] = useState('');
  const title = labels[module] ?? 'Módulo';
  const rows = [['OP-2026-00482', 'María López', 'Copias + Anillado', 'S/ 18.50', 'Pagado'], ['OP-2026-00481', 'Carlos Ramírez', 'Impresión B/N', 'S/ 6.00', 'Pendiente'], ['OP-2026-00480', 'Ana Torres', 'Kiosco', 'S/ 12.50', 'Pagado']];
  const filtered = rows.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()));
  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · FASE 2</p><h1>{title}</h1><p className="muted">SPA React con TailAdmin y datos locales versionados.</p></div><button className="primary-button"><Plus size={17} /> Nueva operación</button></div><div className="metric-grid">{[['Operaciones del día', '128'], ['Ingresos del día', 'S/ 1,845.50'], ['Deudas pendientes', 'S/ 3,240.00'], ['Productos en kiosco', '246']].map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong><small>Actualizado hoy</small></div>)}</div><section className="panel"><div className="panel-header"><div><h2>{title} recientes</h2><p className="muted">Consulta, filtra y administra registros</p></div><button className="secondary-button">Exportar</button></div><div className="toolbar"><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar registro..." /></label><select><option>Todos los estados</option><option>Pagado</option><option>Pendiente</option></select></div><div className="table-wrap"><table><thead><tr><th>REFERENCIA</th><th>SOLICITANTE</th><th>SERVICIO</th><th>IMPORTE</th><th>ESTADO</th></tr></thead><tbody>{filtered.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 4 ? <span className={`status ${cell === 'Pagado' ? 'paid' : 'pending'}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div></section></>;
}
