import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Plus } from 'lucide-react';
import { operationSchema, type OperationFormValues } from '../schemas/operationSchema';
import { operationRepository } from '../../../../../../packages/data-access/json/src/index';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/tables/DataTable';
import { StatusBadge } from '../../../components/feedback/StatusBadge';

const services = [{ name: 'Copias B/N', price: 0.2 }, { name: 'Impresión a color', price: 1.5 }, { name: 'Plastificado', price: 4 }];

export function OperationsPage() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<OperationFormValues>({ resolver: zodResolver(operationSchema), defaultValues: { quantity: 1 } });
  const service = services.find((option) => option.name === watch('service'));
  const total = (service?.price ?? 0) * (watch('quantity') || 0);
  const onSubmit = async () => { setSaved(true); reset({ quantity: 1 }); };
  const operations = operationRepository.list();
  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · OPERACIONES</p><h1>Operaciones</h1><p className="muted">Registra servicios de copias, impresiones y acabados.</p></div><Button onClick={() => document.getElementById('operation-form')?.scrollIntoView({ behavior: 'smooth' })}><Plus size={17} /> Nueva operación</Button></div>{saved && <div className="success-alert"><CheckCircle2 size={17} /> Operación validada y agregada al flujo local de demostración.</div>}<section className="panel operation-form-panel" id="operation-form"><div className="panel-header"><div><h2>Nueva operación</h2><p className="muted">Los datos se validan antes de guardar.</p></div><strong className="form-total">Total: S/ {total.toFixed(2)}</strong></div><form onSubmit={handleSubmit(onSubmit)} className="operation-form"><label>Solicitante<input {...register('applicant')} placeholder="Nombre completo" />{errors.applicant && <small className="field-error">{errors.applicant.message}</small>}</label><label>Servicio<select {...register('service')}><option value="">Seleccionar servicio</option>{services.map((option) => <option key={option.name}>{option.name}</option>)}</select>{errors.service && <small className="field-error">{errors.service.message}</small>}</label>  <label>Cantidad<input type="number" min="1" {...register('quantity', { valueAsNumber: true })} />{errors.quantity && <small className="field-error">{errors.quantity.message}</small>}</label><div className="form-submit"><Button type="submit" disabled={isSubmitting}>Guardar operación</Button></div></form></section><section className="panel"><div className="panel-header"><div><h2>Operaciones recientes</h2><p className="muted">Historial local de demostración</p></div></div><DataTable headers={['REFERENCIA', 'SOLICITANTE', 'SERVICIO', 'IMPORTE', 'ESTADO']} rows={operations.map((operation) => ({ id: operation.reference, cells: [operation.reference, operation.applicant, operation.service, `S/ ${operation.amount.toFixed(2)}`, <StatusBadge key={operation.reference} status={operation.status} />] }))} /></section></>;
}
