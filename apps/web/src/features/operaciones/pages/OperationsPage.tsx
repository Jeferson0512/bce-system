import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/tables/DataTable';
import { StatusBadge } from '../../../components/feedback/StatusBadge';
import { operationRepository } from '../../../../../../packages/data-access/json/src';
import type { OperationItem, Operation } from '../../../../../../packages/domain/src';

type RequesterType = 'profesor' | 'alumno' | 'direccion';

const professors = [
  { id: 'T03', name: 'Rosa Vargas' }, { id: 'T09', name: 'Sofía Paredes' },
  { id: 'T15', name: 'Gabriela Núñez' }, { id: 'T17', name: 'Mónica Aguilar' },
];
const students = ['Camila Vega', 'Luciana Torres', 'Rodrigo Alva', 'María Condori'];
const staff = ['Pedro Ramírez', 'Laura Gutiérrez', 'Silvia Castro'];
const rooms = [
  { id: 'P2A', label: '2°A Primaria' }, { id: 'P5A', label: '5°A Primaria' },
  { id: 'S2A', label: '2°A Secundaria' }, { id: 'S3A', label: '3°A Secundaria' },
  { id: 'S5A', label: '5°A Secundaria' },
];
const services = [
  { id: 'copia_bn', name: 'Copia B/N', prices: { profesor: 0.1, alumno: 0.2, direccion: 0.1 } },
  { id: 'impresion_bn', name: 'Impresión B/N', prices: { profesor: 0.2, alumno: 0.5, direccion: 0.2 } },
  { id: 'copia_color', name: 'Copia a Color', prices: { profesor: 0.5, alumno: 0.8, direccion: 0.5 } },
  { id: 'impresion_color', name: 'Impresión a Color', prices: { profesor: 0.5, alumno: 1, direccion: 0.5 } },
  { id: 'anillado', name: 'Anillado', prices: { profesor: 3, alumno: 4, direccion: 3 } },
  { id: 'escaneo', name: 'Escaneo', prices: { profesor: 0.5, alumno: 1, direccion: 0.5 } },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function OperationsPage() {
  const [requesterType, setRequesterType] = useState<RequesterType>('profesor');
  const [professorId, setProfessorId] = useState('');
  const [student, setStudent] = useState('');
  const [staffMember, setStaffMember] = useState('');
  const [serviceId, setServiceId] = useState(services[0].id);
  const [roomId, setRoomId] = useState('');
  const [personal, setPersonal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copies, setCopies] = useState(1);
  const [unitPrice, setUnitPrice] = useState(services[0].prices.profesor);
  const [items, setItems] = useState<OperationItem[]>([]);
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Sin pago' | 'Pendiente' | 'Pagado'>('Sin pago');
  const [saved, setSaved] = useState(false);
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const subtotal = quantity * copies * unitPrice;
  const total = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);
  const applicant = requesterType === 'profesor' ? professors.find((item) => item.id === professorId)?.name ?? '' : requesterType === 'alumno' ? student : staffMember;

  const changeRequesterType = (type: RequesterType) => {
    setRequesterType(type); setProfessorId(''); setStudent(''); setStaffMember(''); setItems([]);
    setUnitPrice(services.find((item) => item.id === serviceId)?.prices[type] ?? 0);
  };
  const changeService = (id: string) => {
    setServiceId(id);
    const selected = services.find((item) => item.id === id);
    setUnitPrice(selected?.prices[requesterType] ?? 0);
  };
  const addItem = () => {
    if (!applicant || quantity < 1 || unitPrice <= 0) return;
    const room = rooms.find((item) => item.id === roomId);
    setItems((current) => [...current, { serviceId, service: service.name, salonId: roomId || undefined, salon: room?.label, quantity, copies, unitPrice, subtotal, personal }]);
    setQuantity(1); setCopies(1);
  };
  const saveOperation = () => {
    if (!applicant || items.length === 0) return;
    const operation: Operation = {
      reference: `OP-${new Date().getFullYear()}-${String(operationRepository.list().length + 483).padStart(5, '0')}`,
      applicant, service: items.length === 1 ? items[0].service : `${items.length} servicios`,
      amount: total, status: paymentStatus === 'Pagado' ? 'Pagado' : 'Pendiente', time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      date, requesterType, requesterId: requesterType === 'profesor' ? professorId : undefined, notes, items, paymentStatus,
    };
    operationRepository.save(operation); setSaved(true); setItems([]); setNotes(''); setPaymentStatus('Sin pago');
  };

  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · OPERACIONES</p><h1>Nueva operación</h1><p className="muted">Registra copias, impresiones y otros servicios con la lógica de la v1.</p></div><div className="history-actions"><Link className="secondary-button" to="/operaciones/historial">Ver historial</Link><Button onClick={() => document.getElementById('operation-form')?.scrollIntoView({ behavior: 'smooth' })}><Plus size={17} /> Nueva operación</Button></div></div>
    {saved && <div className="success-alert"><CheckCircle2 size={17} /> Operación guardada correctamente en el repositorio local.</div>}
    <div className="operation-workspace">
      <div className="operation-builder">
        <section className="panel"><div className="panel-header"><div><h2>1. ¿Quién solicita?</h2><p className="muted">El tipo de solicitante define el contexto del cobro.</p></div><ClipboardList className="metric-icon" size={21} /></div><div className="requester-tabs">{(['profesor', 'alumno', 'direccion'] as RequesterType[]).map((type) => <button key={type} className={requesterType === type ? 'requester-tab active' : 'requester-tab'} onClick={() => changeRequesterType(type)}>{type === 'profesor' ? 'Profesor' : type === 'alumno' ? 'Alumno' : 'Dirección'}</button>)}</div>
          {requesterType === 'profesor' && <label className="operation-field">Profesor<select value={professorId} onChange={(event) => setProfessorId(event.target.value)}><option value="">— Seleccione un profesor —</option>{professors.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label>}
          {requesterType === 'alumno' && <label className="operation-field">Alumno<select value={student} onChange={(event) => setStudent(event.target.value)}><option value="">— Seleccione un alumno —</option>{students.map((person) => <option key={person}>{person}</option>)}</select></label>}
          {requesterType === 'direccion' && <label className="operation-field">Responsable que ordena<select value={staffMember} onChange={(event) => setStaffMember(event.target.value)}><option value="">— Seleccione personal —</option>{staff.map((person) => <option key={person}>{person}</option>)}</select></label>}
        </section>
        <section className="panel operation-form-panel" id="operation-form"><div className="panel-header"><div><h2>2. Agregar servicio</h2><p className="muted">Puedes agregar varios ítems al mismo pedido.</p></div></div>
          <div className="operation-fields-grid"><label className="operation-field">Tipo de servicio<select value={serviceId} onChange={(event) => changeService(event.target.value)}>{services.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="operation-field">Salón<select value={roomId} onChange={(event) => setRoomId(event.target.value)} disabled={personal}><option value="">— Personal del solicitante —</option>{rooms.map((room) => <option value={room.id} key={room.id}>{room.label}</option>)}</select></label><label className="operation-field">Cantidad<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label><label className="operation-field">Juegos<input type="number" min="1" value={copies} onChange={(event) => setCopies(Number(event.target.value))} /></label><label className="operation-field">Precio unitario<input type="number" min="0.01" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} /></label></div>
          <label className="operation-check"><input type="checkbox" checked={personal} onChange={(event) => setPersonal(event.target.checked)} /> Uso personal del solicitante</label><div className="item-preview"><span>Subtotal del ítem</span><strong>S/ {subtotal.toFixed(2)}</strong></div><Button type="button" onClick={addItem}><Plus size={16} /> Agregar al pedido</Button>
        </section>
        <section className="panel"><div className="panel-header"><div><h2>3. Datos de la operación</h2><p className="muted">Completa el contexto antes de guardar.</p></div></div><div className="operation-fields-grid"><label className="operation-field">Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="operation-field operation-field-wide">Notas<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej. Examen de Matemáticas, 3er bimestre..." /></label><label className="operation-field">Pago<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as typeof paymentStatus)}><option>Sin pago</option><option>Pendiente</option><option>Pagado</option></select></label></div></section>
      </div>
      <aside className="panel order-panel"><div className="panel-header"><div><h2>Pedido actual</h2><p className="muted">{applicant || 'Sin solicitante'} · {items.length} ítems</p></div><strong className="form-total">S/ {total.toFixed(2)}</strong></div>{items.length === 0 ? <div className="cart-empty">Agrega servicios usando el formulario.</div> : items.map((item, index) => <div className="operation-item" key={`${item.serviceId}-${index}`}><div><strong>{item.service}</strong><small>{item.quantity} × {item.copies} juegos · {item.personal ? 'Personal' : item.salon ?? 'Sin salón'}</small></div><b>S/ {item.subtotal.toFixed(2)}</b><button onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Eliminar ${item.service}`}><Trash2 size={15} /></button></div>)}<div className="order-total"><span>Total</span><strong>S/ {total.toFixed(2)}</strong></div><Button type="button" disabled={!applicant || items.length === 0} onClick={saveOperation}>Guardar operación</Button></aside>
    </div>
    <section className="panel"><div className="panel-header"><div><h2>Operaciones recientes</h2><p className="muted">Historial local conectado al repositorio tipado</p></div></div><DataTable headers={['REFERENCIA', 'SOLICITANTE', 'SERVICIO', 'IMPORTE', 'ESTADO']} rows={operationRepository.list().map((operation) => ({ id: operation.reference, cells: [operation.reference, operation.applicant, operation.service, `S/ ${operation.amount.toFixed(2)}`, <StatusBadge key={operation.reference} status={operation.status} />] }))} /></section>
  </>;
}
