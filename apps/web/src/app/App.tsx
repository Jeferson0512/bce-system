import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ModulePage } from '../pages/ModulePage';
import { DashboardPage } from '../pages/DashboardPage';
import { OperationsPage } from '../features/operaciones/pages/OperationsPage';
import { KioscoPage } from '../features/kiosco/pages/KioscoPage';
import { PaymentsPage } from '../features/pagos/pages/PaymentsPage';
import { DebtsPage } from '../features/deudas/pages/DebtsPage';

const modules = ['operaciones', 'kiosco', 'pagos', 'deudas', 'catalogos', 'reportes'];

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        {modules.map((module) => (
          <Route key={module} path={module} element={module === 'operaciones' ? <OperationsPage /> : module === 'kiosco' ? <KioscoPage /> : module === 'pagos' ? <PaymentsPage /> : module === 'deudas' ? <DebtsPage /> : <ModulePage module={module} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
