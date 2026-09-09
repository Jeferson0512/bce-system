import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { listDemoOperations } from '../../../../packages/data-access/json/src/demoData';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { DataTable } from '../components/tables/DataTable';

const labels: Record<string, string> = { dashboard: 'Dashboard', operaciones: 'Operaciones', kiosco: 'Kiosco', pagos: 'Pagos', deudas: 'Deudas', catalogos: 'Catálogos', reportes: 'Reportes' };

export function ModulePage({ module }: { module: string }) {
  const [query, setQuery] = useState('');
  const title = labels[module] ?? 'Módulo';
  const rows = listDemoOperations().map((operation) => [operation.reference, operation.applicant, operation.service, `S/ ${operation.amount.toFixed(2)}`, operation.status]);
  const filtered = rows.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()));
  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · FASE 2</p><h1>{title}</h1><p className="muted">SPA React con TailAdmin y datos locales versionados.</p></div><Button><Plus size={17} /> Nueva operación</Button></div><div className="metric-grid">{[['Operaciones del día', '128'], ['Ingresos del día', 'S/ 1,845.50'], ['Deudas pendientes', 'S/ 3,240.00'], ['Productos en kiosco', '246']].map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong><small>Actualizado hoy</small></div>)}</div><section className="panel"><div className="panel-header"><div><h2>{title} recientes</h2><p className="muted">Consulta, filtra y administra registros</p></div><Button variant="secondary">Exportar</Button></div><div className="toolbar"><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar registro..." /></label><select><option>Todos los estados</option><option>Pagado</option><option>Pendiente</option></select></div><DataTable headers={['REFERENCIA', 'SOLICITANTE', 'SERVICIO', 'IMPORTE', 'ESTADO']} rows={filtered.map((row) => ({ id: row[0], cells: [...row.slice(0, 4), <StatusBadge key={`${row[0]}-status`} status={row[4] as 'Pagado' | 'Pendiente'} />] }))} /></section></>;
}
