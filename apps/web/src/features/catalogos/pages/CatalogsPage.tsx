import { useMemo, useState } from 'react';
import { CheckCircle2, Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/tables/DataTable';

type CatalogKey = 'Servicios' | 'Productos' | 'Categorías' | 'Métodos de pago';

const catalogData: Record<CatalogKey, Array<[string, string, string, string]>> = {
  Servicios: [
    ['Impresión A4 blanco y negro', 'Impresión', 'S/ 0.20', 'Activo'],
    ['Copia A4 a color', 'Copias', 'S/ 1.00', 'Activo'],
    ['Escaneo de documento', 'Digitalización', 'S/ 1.50', 'Inactivo'],
  ],
  Productos: [
    ['Cuaderno A4', 'Útiles', 'S/ 8.50', 'Activo'],
    ['Lapicero azul', 'Útiles', 'S/ 1.50', 'Activo'],
    ['USB 32 GB', 'Tecnología', 'S/ 28.00', 'Activo'],
  ],
  Categorías: [
    ['Impresión', 'Servicios', '12 registros', 'Activo'],
    ['Útiles', 'Productos', '8 registros', 'Activo'],
    ['Tecnología', 'Productos', '5 registros', 'Inactivo'],
  ],
  'Métodos de pago': [
    ['Efectivo', 'Presencial', 'Sin referencia', 'Activo'],
    ['Yape', 'Digital', 'Con referencia', 'Activo'],
    ['Transferencia', 'Digital', 'Con referencia', 'Activo'],
  ],
};

const catalogKeys = Object.keys(catalogData) as CatalogKey[];

export function CatalogsPage() {
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogKey>('Servicios');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const rows = useMemo(
    () => catalogData[selectedCatalog].filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase())),
    [query, selectedCatalog],
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BCE SYSTEM · CATÁLOGOS</p>
          <h1>Catálogos</h1>
          <p className="muted">Administra los servicios, productos y opciones disponibles en BCE.</p>
        </div>
        <Button onClick={() => setSaved(true)}><Plus size={17} /> Nuevo registro</Button>
      </div>
      {saved && <div className="success-alert"><CheckCircle2 size={17} /> Registro preparado en el flujo local de demostración.</div>}
      <section className="panel">
        <div className="catalog-tabs" role="tablist" aria-label="Tipos de catálogo">
          {catalogKeys.map((catalog) => (
            <button
              className={`catalog-tab ${selectedCatalog === catalog ? 'active' : ''}`}
              key={catalog}
              onClick={() => setSelectedCatalog(catalog)}
              role="tab"
              aria-selected={selectedCatalog === catalog}
            >
              {catalog}
            </button>
          ))}
        </div>
        <div className="panel-header">
          <div><h2>{selectedCatalog}</h2><p className="muted">Registros configurados para la operación diaria.</p></div>
          <Button variant="secondary">Exportar</Button>
        </div>
        <div className="toolbar">
          <label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar en ${selectedCatalog.toLowerCase()}...`} /></label>
          <select aria-label="Filtrar estado"><option>Todos los estados</option><option>Activo</option><option>Inactivo</option></select>
        </div>
        <DataTable
          headers={['NOMBRE', 'TIPO', 'DETALLE', 'ESTADO', 'ACCIÓN']}
          rows={rows.map((row) => ({
            id: row[0],
            cells: [...row.slice(0, 3), <span key={`${row[0]}-status`} className={`status ${row[3] === 'Activo' ? 'paid' : 'pending'}`}>{row[3]}</span>, <button className="row-action" key={`${row[0]}-action`}>Editar</button>],
          }))}
        />
      </section>
    </>
  );
}
