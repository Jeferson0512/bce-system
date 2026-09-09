import { useMemo, useState } from 'react';
import { Download, FileBarChart } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/tables/DataTable';

const reportRows = [
  ['OP-2026-00482', 'María López', 'Impresión', 'S/ 18.50', 'Pagado'],
  ['OP-2026-00481', 'Carlos Ramírez', 'Copias', 'S/ 6.00', 'Pendiente'],
  ['OP-2026-00480', 'Lucía Mendoza', 'Escaneo', 'S/ 12.50', 'Pagado'],
  ['OP-2026-00479', 'Ana Torres', 'Impresión', 'S/ 24.00', 'Pagado'],
];

export function ReportsPage() {
  const [status, setStatus] = useState('Todos');
  const [type, setType] = useState('Todos');
  const filteredRows = useMemo(
    () => reportRows.filter((row) => (status === 'Todos' || row[4] === status) && (type === 'Todos' || row[2] === type)),
    [status, type],
  );
  const paidTotal = filteredRows.filter((row) => row[4] === 'Pagado').reduce((sum, row) => sum + Number(row[3].replace('S/ ', '')), 0);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BCE SYSTEM · REPORTES</p>
          <h1>Reportes</h1>
          <p className="muted">Analiza operaciones, ingresos y estados del período seleccionado.</p>
        </div>
        <Button variant="secondary"><Download size={17} /> Exportar reporte</Button>
      </div>
      <div className="metric-grid">
        <div className="metric-card"><FileBarChart className="metric-icon" size={22} /><span>Operaciones filtradas</span><strong>{filteredRows.length}</strong><small>Datos locales</small></div>
        <div className="metric-card"><span>Ingresos validados</span><strong>S/ {paidTotal.toFixed(2)}</strong><small>Pagos confirmados</small></div>
        <div className="metric-card"><span>Ticket promedio</span><strong>S/ {filteredRows.length ? (paidTotal / filteredRows.length).toFixed(2) : '0.00'}</strong><small>Sobre el filtro actual</small></div>
        <div className="metric-card"><span>Período</span><strong>Este mes</strong><small>Actualizado hoy</small></div>
      </div>
      <section className="panel">
        <div className="panel-header"><div><h2>Resumen de operaciones</h2><p className="muted">Filtra por tipo de servicio y estado de pago.</p></div></div>
        <div className="toolbar">
          <label className="standalone-select">Desde <input type="date" aria-label="Fecha inicial" /></label>
          <label className="standalone-select">Hasta <input type="date" aria-label="Fecha final" /></label>
          <select className="standalone-select" value={type} onChange={(event) => setType(event.target.value)} aria-label="Filtrar tipo"><option>Todos</option><option>Impresión</option><option>Copias</option><option>Escaneo</option></select>
          <select className="standalone-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar estado"><option>Todos</option><option>Pagado</option><option>Pendiente</option></select>
        </div>
        <DataTable headers={['REFERENCIA', 'SOLICITANTE', 'SERVICIO', 'IMPORTE', 'ESTADO']} rows={filteredRows.map((row) => ({ id: row[0], cells: [...row.slice(0, 3), row[3], <span key={`${row[0]}-status`} className={`status ${row[4] === 'Pagado' ? 'paid' : 'pending'}`}>{row[4]}</span>] }))} />
      </section>
    </>
  );
}
