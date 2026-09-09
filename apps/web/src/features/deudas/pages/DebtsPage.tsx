import { useState } from 'react';
import { CheckCircle2, Wallet } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/tables/DataTable';

const debts = [['María López', '5 operaciones', 'S/ 84.00', 'Vence hoy', 'Pendiente'], ['Carlos Ramírez', '2 operaciones', 'S/ 26.00', '15 sep 2026', 'Pendiente'], ['Lucía Mendoza', '1 operación', 'S/ 24.00', 'Pagada', 'Pagado']];

export function DebtsPage() {
  const [settled, setSettled] = useState<string | null>(null);
  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · DEUDAS</p><h1>Deudas</h1><p className="muted">Consulta saldos, vencimientos y estados de cuenta.</p></div><Button><Wallet size={17} /> Registrar abono</Button></div>{settled && <div className="success-alert"><CheckCircle2 size={17} /> Abono preparado para {settled}.</div>}<div className="metric-grid"><div className="metric-card"><span>Saldo pendiente</span><strong>S/ 3,240.00</strong><small>18 personas</small></div><div className="metric-card"><span>Vencen hoy</span><strong>S/ 84.00</strong><small className="warning-text">1 cuenta</small></div><div className="metric-card"><span>Pagos parciales</span><strong>7</strong><small>Este mes</small></div></div><section className="panel"><div className="panel-header"><div><h2>Estados de cuenta</h2><p className="muted">Filtra y registra abonos de personas con saldo</p></div><select className="standalone-select"><option>Todos los estados</option><option>Pendiente</option><option>Pagado</option></select></div><DataTable headers={['PERSONA', 'OPERACIONES', 'SALDO', 'VENCIMIENTO', 'ESTADO', 'ACCIÓN']} rows={debts.map((debt) => ({ id: debt[0], cells: [...debt.map((cell, index) => index === 4 ? <span key={cell} className={`status ${cell === 'Pagado' ? 'paid' : 'pending'}`}>{cell}</span> : cell), <button className="row-action" key={`${debt[0]}-action`} onClick={() => setSettled(debt[0])}>Abonar</button>] }))} /></section></>;
}
