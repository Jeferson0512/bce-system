import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ModulePage } from '../pages/ModulePage';
import { DashboardPage } from '../pages/DashboardPage';

const modules = ['operaciones', 'kiosco', 'pagos', 'deudas', 'catalogos', 'reportes'];

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        {modules.map((module) => (
          <Route key={module} path={module} element={<ModulePage module={module} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
