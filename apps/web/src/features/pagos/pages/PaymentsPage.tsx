import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, CreditCard, Plus } from 'lucide-react';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/tables/DataTable';

const paymentSchema = z.object({
  operationReference: z.string().min(1, 'Selecciona una operación'),
  method: z.enum(['Efectivo', 'Yape', 'Plin', 'Transferencia']),
  reference: z.string().trim(),
}).superRefine((values, context) => {
  if (values.method !== 'Efectivo' && !values.reference) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['reference'], message: 'La referencia es obligatoria para pagos digitales' });
  }
});
type PaymentFormValues = z.infer<typeof paymentSchema>;
const payments = [['PAG-2026-0091', 'OP-2026-00482', 'S/ 18.50', 'Yape', 'Validado'], ['PAG-2026-0090', 'OP-2026-00481', 'S/ 6.00', 'Efectivo', 'Validado'], ['PAG-2026-0089', 'OP-2026-00480', 'S/ 12.50', 'Plin', 'Pendiente']];

export function PaymentsPage() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) });
  const onSubmit = () => { setSaved(true); reset(); };
  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · PAGOS</p><h1>Pagos</h1><p className="muted">Asocia pagos a operaciones y valida sus referencias.</p></div><Button onClick={() => document.getElementById('payment-form')?.scrollIntoView({ behavior: 'smooth' })}><Plus size={17} /> Registrar pago</Button></div>{saved && <div className="success-alert"><CheckCircle2 size={17} /> Pago registrado en el flujo local de demostración.</div>}<section className="panel operation-form-panel" id="payment-form"><div className="panel-header"><div><h2>Registrar pago</h2><p className="muted">Las referencias permiten identificar pagos digitales.</p></div><CreditCard className="metric-icon" size={21} /></div><form onSubmit={handleSubmit(onSubmit)} className="operation-form payment-form"><label>Operación<select {...register('operationReference')}><option value="">Seleccionar operación</option><option>OP-2026-00482 · María López</option><option>OP-2026-00481 · Carlos Ramírez</option></select>{errors.operationReference && <small className="field-error">{errors.operationReference.message}</small>}</label><label>Método<select {...register('method')}><option value="">Seleccionar método</option><option>Efectivo</option><option>Yape</option><option>Plin</option><option>Transferencia</option></select>{errors.method && <small className="field-error">{errors.method.message}</small>}</label><label>Referencia<input {...register('reference')} placeholder="N.º de operación o voucher" />{errors.reference && <small className="field-error">{errors.reference.message}</small>}</label><div className="form-submit"><Button type="submit">Validar pago</Button></div></form></section><section className="panel"><div className="panel-header"><div><h2>Pagos recientes</h2><p className="muted">Estado de validación y método utilizado</p></div></div><DataTable headers={['REFERENCIA', 'OPERACIÓN', 'IMPORTE', 'MÉTODO', 'ESTADO']} rows={payments.map((payment) => ({ id: payment[0], cells: payment.map((cell, index) => index === 4 ? <span key={cell} className={`status ${cell === 'Validado' ? 'paid' : 'pending'}`}>{cell}</span> : cell) }))} /></section></>;
}
