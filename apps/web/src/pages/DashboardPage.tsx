import { ArrowUpRight, ClipboardList, CreditCard, DollarSign, Package, Plus, Wallet, type LucideIcon } from 'lucide-react';
import { listDemoOperations } from '../../../../packages/data-access/json/src';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/feedback/StatusBadge';

const metrics: Array<{ label: string; value: string; change: string; icon: LucideIcon }> = [
  { label: 'Operaciones del día', value: '128', change: '+12.5%', icon: ClipboardList },
  { label: 'Ingresos del día', value: 'S/ 1,845.50', change: '+8.2%', icon: DollarSign },
  { label: 'Deudas pendientes', value: 'S/ 3,240.00', change: '18 personas', icon: Wallet },
  { label: 'Productos en kiosco', value: '246', change: '12 con stock bajo', icon: Package },
];

const weeklyActivity = [62, 94, 76, 132, 108, 168, 148];
const quickActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Registrar operación', icon: ClipboardList },
  { label: 'Registrar pago', icon: CreditCard },
  { label: 'Vender producto', icon: Package },
];

export function DashboardPage() {
  const operations = listDemoOperations();
  return <><div className="page-heading"><div><p className="eyebrow">MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026</p><h1>¡Buenos días, Jeferson! 👋</h1><p className="muted">Este es el resumen de actividad de BCE System.</p></div><Button><Plus size={17} /> Nueva operación</Button></div>
    <section className="metric-grid">{metrics.map(({ label, value, change, icon: Icon }) => <article className="metric-card" key={label}><div className="metric-icon"><Icon size={19} /></div><span>{label}</span><strong>{value}</strong><small><ArrowUpRight size={12} /> {change}</small></article>)}</section>
    <section className="dashboard-grid"><article className="panel activity-panel"><div className="panel-header"><div><h2>Actividad semanal</h2><p className="muted">Operaciones registradas</p></div><select><option>Esta semana</option><option>Este mes</option></select></div><div className="bar-chart">{weeklyActivity.map((height, index) => <div className="bar-column" key={index}><span className="bar-value">{height}</span><div className="bar" style={{ height: `${height / 2}%` }} /><small>{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}</small></div>)}</div></article><article className="panel quick-panel"><div className="panel-header"><div><h2>Accesos rápidos</h2><p className="muted">Tareas frecuentes</p></div></div>{quickActions.map(({ label, icon: Icon }) => <button className="quick-action" key={label}><Icon size={17} /><span>{label}</span><ArrowUpRight size={15} /></button>)}</article></section>
    <section className="panel"><div className="panel-header"><div><h2>Operaciones recientes</h2><p className="muted">Últimos movimientos registrados</p></div><button className="text-button">Ver todas <ArrowUpRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>REFERENCIA</th><th>SOLICITANTE</th><th>SERVICIO</th><th>IMPORTE</th><th>ESTADO</th><th>HORA</th></tr></thead><tbody>{operations.map((operation) => <tr key={operation.reference}><td>{operation.reference}</td><td>{operation.applicant}</td><td>{operation.service}</td><td>S/ {operation.amount.toFixed(2)}</td><td><StatusBadge status={operation.status} /></td><td>{operation.time}</td></tr>)}</tbody></table></div></section>
  </>;
}
