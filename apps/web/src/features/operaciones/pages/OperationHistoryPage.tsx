import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Printer, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/feedback/StatusBadge';
import { operationRepository } from '../../../../../../packages/data-access/json/src';
import type { Operation } from '../../../../../../packages/domain/src';

type RequesterFilter = 'todos' | 'profesor' | 'alumno' | 'direccion';
type DateFilter = 'todos' | 'hoy' | 'semana' | 'mes';

function formatCurrency(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function matchesDate(operation: Operation, filter: DateFilter) {
  if (filter === 'todos' || !operation.date) return true;
  const operationDate = new Date(`${operation.date}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = filter === 'semana' ? 7 : filter === 'mes' ? 31 : 0;
  if (filter === 'hoy') return operationDate.getTime() === startOfToday.getTime();
  const start = new Date(startOfToday);
  start.setDate(start.getDate() - daysAgo + 1);
  return operationDate >= start && operationDate <= startOfToday;
}

function exportCsv(operations: Operation[]) {
  const rows = [
    ['Referencia', 'Fecha', 'Tipo', 'Solicitante', 'Servicios', 'Total', 'Estado'],
    ...operations.map((operation) => [
      operation.reference,
      operation.date ?? '',
      operation.requesterType ?? '',
      operation.applicant,
      operation.service,
      operation.amount.toFixed(2),
      operation.status,
    ]),
  ];
  const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'historial-operaciones.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OperationHistoryPage() {
  const [query, setQuery] = useState('');
  const [requesterFilter, setRequesterFilter] = useState<RequesterFilter>('todos');
  const [dateFilter, setDateFilter] = useState<DateFilter>('todos');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Operation | null>(null);
  const pageSize = 8;
  const operations = operationRepository.list();
  const filtered = useMemo(() => operations.filter((operation) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [operation.reference, operation.applicant, operation.service]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesQuery && (requesterFilter === 'todos' || operation.requesterType === requesterFilter)
      && matchesDate(operation, dateFilter);
  }), [dateFilter, operations, query, requesterFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleOperations = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateFilter = (value: RequesterFilter | DateFilter, type: 'requester' | 'date') => {
    if (type === 'requester') setRequesterFilter(value as RequesterFilter);
    else setDateFilter(value as DateFilter);
    setPage(1);
  };

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">BCE SYSTEM · OPERACIONES</p>
        <h1>Historial de operaciones</h1>
        <p className="muted">Consulta, filtra e inspecciona las operaciones registradas.</p>
      </div>
      <div className="history-actions">
        <Button variant="secondary" onClick={() => exportCsv(filtered)}><Download size={16} /> Exportar CSV</Button>
        <Button variant="secondary" onClick={() => window.print()}><Printer size={16} /> Imprimir</Button>
        <Link className="primary-button" to="/operaciones">Nueva operación</Link>
      </div>
    </div>
    <section className="panel">
      <div className="history-toolbar">
        <label className="search-field">Buscar<input aria-label="Buscar operaciones" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Referencia, solicitante o servicio" /></label>
        <label className="operation-field">Tipo<select aria-label="Filtrar por tipo" value={requesterFilter} onChange={(event) => updateFilter(event.target.value as RequesterFilter, 'requester')}><option value="todos">Todos los tipos</option><option value="profesor">Profesor</option><option value="alumno">Alumno</option><option value="direccion">Dirección</option></select></label>
        <label className="operation-field">Fecha<select aria-label="Filtrar por fecha" value={dateFilter} onChange={(event) => updateFilter(event.target.value as DateFilter, 'date')}><option value="todos">Todas las fechas</option><option value="hoy">Hoy</option><option value="semana">Esta semana</option><option value="mes">Este mes</option></select></label>
      </div>
      <p className="muted history-count">{filtered.length} operaciones encontradas</p>
      {visibleOperations.length === 0 ? <div className="empty-state">No hay operaciones que coincidan con los filtros.</div> : <div className="table-wrap"><table><thead><tr><th>FECHA/HORA</th><th>TIPO</th><th>SOLICITANTE</th><th>SERVICIOS</th><th>SALONES</th><th>TOTAL</th><th>ACCIONES</th></tr></thead><tbody>{visibleOperations.map((operation) => <tr key={operation.reference}><td>{operation.date ?? '—'}<br /><small>{operation.time}</small></td><td>{operation.requesterType ?? '—'}</td><td>{operation.applicant}</td><td>{operation.service}</td><td>{operation.items?.map((item) => item.personal ? 'Personal' : item.salon ?? '—').join(', ') || '—'}</td><td><strong>{formatCurrency(operation.amount)}</strong><br /><StatusBadge status={operation.status} /></td><td><button className="text-button" onClick={() => setSelected(operation)}><Eye size={14} /> Ver detalle</button></td></tr>)}</tbody></table></div>}
      <div className="pagination"><span className="muted">Página {page} de {totalPages}</span><div><Button variant="secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button><Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Siguiente</Button></div></div>
    </section>
    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="detail-modal panel" role="dialog" aria-modal="true" aria-labelledby="operation-detail-title" onClick={(event) => event.stopPropagation()}><div className="panel-header"><div><p className="eyebrow">DETALLE DE OPERACIÓN</p><h2 id="operation-detail-title">{selected.reference}</h2><p className="muted">{selected.date ?? 'Fecha no registrada'} · {selected.time}</p></div><button className="icon-button" aria-label="Cerrar detalle" onClick={() => setSelected(null)}><X size={18} /></button></div><div className="detail-summary"><span>Solicitante<strong>{selected.applicant}</strong></span><span>Estado<strong><StatusBadge status={selected.status} /></strong></span><span>Total<strong>{formatCurrency(selected.amount)}</strong></span></div><p className="muted">{selected.notes || 'Sin notas registradas.'}</p><div className="table-wrap"><table><thead><tr><th>SERVICIO</th><th>SALÓN</th><th>CANTIDAD</th><th>JUEGOS</th><th>PRECIO</th><th>SUBTOTAL</th></tr></thead><tbody>{selected.items?.map((item, index) => <tr key={`${item.serviceId}-${index}`}><td>{item.service}</td><td>{item.personal ? 'Personal' : item.salon ?? '—'}</td><td>{item.quantity}</td><td>{item.copies ?? 1}</td><td>{formatCurrency(item.unitPrice)}</td><td>{formatCurrency(item.subtotal)}</td></tr>) ?? <tr><td colSpan={6}>{selected.service}</td></tr>}</tbody></table></div><div className="modal-actions"><Button variant="secondary" onClick={() => window.print()}><Printer size={15} /> Imprimir detalle</Button><Button onClick={() => setSelected(null)}>Cerrar</Button></div></section></div>}
  </>;
}
