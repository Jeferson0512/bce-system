/* =============================================
   BCE System — View: Configuración
   ============================================= */

function viewConfigSistema() {
  const raw = localStorage.getItem(LS_KEY);
  const lsKB = raw ? (new Blob([raw]).size / 1024).toFixed(1) : '0';
  const lsPct = raw ? Math.min(100, (parseFloat(lsKB) / 5120 * 100)).toFixed(2) : '0';
  const totalRec = DB.operaciones.length + DB.pagos.length + DB.salones.length + DB.profesores.length + DB.alumnos.length + DB.precios.length;

  const dbRow = (icon, label, count, color) => `
    <div class="sys-db-row">
      <div class="sys-db-icon ${color}"><i data-lucide="${icon}"></i></div>
      <span class="sys-db-label">${label}</span>
      <span class="sys-db-count">${count}</span>
    </div>`;

  return `
  <div class="page-header">
    <div><h1 class="page-title">Configuración del Sistema</h1>
    <p class="page-subtitle">Base de datos local — todos los datos persisten en este navegador</p></div>
  </div>

  <div class="sys-status-banner ${raw?'sys-status-ok':'sys-status-warn'}">
    <div class="sys-status-dot"></div>
    <div>
      <div class="sys-status-title">${raw?'Base de datos activa':'Inicializando base de datos…'}</div>
      <div class="sys-status-sub">${raw?`localStorage · ${lsKB} KB usados · ${totalRec} registros en total`:'Los datos se guardarán automáticamente al realizar cualquier operación.'}</div>
    </div>
    <span class="badge ${raw?'badge-success':'badge-warning'}" style="margin-left:auto">${raw?'Sincronizado':'Pendiente'}</span>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:960px;margin-top:20px">

    <div class="card">
      <div class="card-header" style="padding-bottom:14px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="stat-icon blue" style="width:34px;height:34px;border-radius:9px"><i data-lucide="database"></i></div>
          <div>
            <div class="card-title">Registros almacenados</div>
            <div class="text-xs text-muted">${totalRec} registros en total · Año ${DB.year}</div>
          </div>
        </div>
      </div>
      <div class="sys-db-rows">
        ${dbRow('file-text',   'Operaciones',          DB.operaciones.length, 'blue'  )}
        ${dbRow('banknote',    'Pagos',                 DB.pagos.length,       'green' )}
        ${dbRow('school',      'Salones',               DB.salones.length,     'orange')}
        ${dbRow('users',       'Profesores / Personal', DB.profesores.length,  'purple')}
        ${dbRow('user-check',  'Alumnos',               DB.alumnos.length,     'teal'  )}
        ${dbRow('tag',         'Servicios / Precios',   DB.precios.length,     'slate' )}
      </div>
      <div class="sys-db-footer">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="text-xs text-muted">Espacio en localStorage</span>
          <span class="text-xs font-bold">${lsKB} KB <span class="text-muted font-normal">/ ~5,000 KB</span></span>
        </div>
        <div style="height:5px;background:var(--border);border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${lsPct}%;background:var(--brand);border-radius:99px"></div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">

      <div class="card" style="flex:1">
        <div class="card-header" style="padding-bottom:14px;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="stat-icon teal" style="width:34px;height:34px;border-radius:9px"><i data-lucide="rotate-ccw"></i></div>
            <div class="card-title">Restaurar datos demo</div>
          </div>
        </div>
        <div class="card-body">
          <p class="text-sm text-muted mb-4">Borra el almacenamiento local y recarga la página. Vuelven todos los datos de ejemplo originales (profesores, alumnos, operaciones y pagos).</p>
          <button class="btn btn-secondary btn-sm" onclick="BCE.resetDemoData()">
            <i data-lucide="rotate-ccw"></i> Restaurar demo
          </button>
        </div>
      </div>

      <div class="card" style="flex:1;border-color:var(--danger-border)">
        <div class="card-header" style="padding-bottom:14px;border-bottom:1px solid var(--danger-border)">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="stat-icon red" style="width:34px;height:34px;border-radius:9px"><i data-lucide="trash-2"></i></div>
            <div class="card-title" style="color:var(--danger)">Limpiar transacciones</div>
          </div>
        </div>
        <div class="card-body">
          <p class="text-sm text-muted mb-4">Elimina operaciones y pagos. Los catálogos (profesores, alumnos, salones, precios) se conservan intactos.</p>
          <button class="btn btn-danger btn-sm" onclick="BCE.clearDB()">
            <i data-lucide="trash-2"></i> Limpiar transacciones
          </button>
        </div>
      </div>

    </div>

    <div class="card mt-4" style="border-color:var(--danger-border);max-width:960px">
      <div class="card-header" style="padding-bottom:14px;border-bottom:1px solid var(--danger-border)">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="stat-icon red" style="width:34px;height:34px;border-radius:9px"><i data-lucide="circle-alert"></i></div>
          <div>
            <div class="card-title" style="color:var(--danger)">Iniciar desde cero</div>
            <div class="text-xs text-muted">Para entrega o instalación en una computadora nueva</div>
          </div>
        </div>
      </div>
      <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <p class="text-sm text-muted" style="margin:0;max-width:560px">
          Borra <strong>absolutamente todo</strong> — operaciones, pagos, salones, profesores, alumnos y usuarios.
          Deja el sistema completamente vacío, listo para configurarse desde el inicio.
          Los <strong>precios de servicios</strong> se conservan. Esta acción <strong>no se puede deshacer</strong>.
        </p>
        <button class="btn btn-danger" onclick="BCE.iniciarDesdeCero()" style="white-space:nowrap;flex-shrink:0">
          <i data-lucide="circle-alert"></i> Iniciar desde cero
        </button>
      </div>
    </div>

  </div>`;
}

function viewConfigPrecios() {
  return `
  <div class="page-header">
    <div><h1 class="page-title">Configuración — Precios</h1>
    <p class="page-subtitle">Los precios se guardan por año escolar. Cada operación registra el precio vigente al momento.</p></div>
    <div class="page-actions">
      <span class="badge badge-warning">Año ${DB.year}</span>
      <button class="btn btn-primary" onclick="BCE.toast('Precios guardados correctamente','success')"><i data-lucide="save"></i> Guardar Cambios</button>
    </div>
  </div>

  <div class="alert alert-warning mb-4">
    <i data-lucide="alert-triangle"></i>
    <span>Cambiar los precios no afecta operaciones anteriores. El precio aplicado queda guardado en cada transacción.</span>
  </div>

  <div class="card mb-5">
    <div class="card-header">
      <div class="card-title">Tarifario por Servicio</div>
    </div>
    <div style="padding:4px 0">
      <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:0;padding:10px 20px;background:var(--bg-muted);border-bottom:1px solid var(--border)">
        <span class="text-xs font-semibold text-muted" style="text-transform:uppercase;letter-spacing:.5px">Servicio</span>
        <span class="text-xs font-semibold text-muted text-center" style="text-transform:uppercase;letter-spacing:.5px;width:120px">Precio Profesor</span>
        <span class="text-xs font-semibold text-muted text-center" style="text-transform:uppercase;letter-spacing:.5px;width:120px">Precio Alumno</span>
        <span class="text-xs font-semibold text-muted text-center" style="text-transform:uppercase;letter-spacing:.5px;width:120px">Dirección</span>
      </div>
      ${DB.precios.map(p=>`
      <div class="price-row">
        <div class="price-service">
          <div class="price-service-name">${p.nombre}
            ${p.variable?`<span class="badge badge-warning badge-sm" style="margin-left:6px"><i data-lucide="zap"></i> Variable</span>`:''}
          </div>
          <div class="price-service-desc">${p.desc}</div>
        </div>
        <div class="price-input-wrap">
          <div class="price-input-label">Profesor</div>
          <div class="input-group" style="width:110px">
            <span class="input-addon input-addon-left" style="padding:4px 8px;font-size:12px">S/</span>
            <input type="number" class="price-field" value="${p.prof.toFixed(2)}" step="0.05" style="border-radius:0 var(--r) var(--r) 0">
          </div>
        </div>
        <div class="price-input-wrap">
          <div class="price-input-label">Alumno</div>
          <div class="input-group" style="width:110px">
            <span class="input-addon input-addon-left" style="padding:4px 8px;font-size:12px">S/</span>
            <input type="number" class="price-field" value="${p.alumno.toFixed(2)}" step="0.05" style="border-radius:0 var(--r) var(--r) 0">
          </div>
        </div>
        <div class="price-input-wrap">
          <div class="price-input-label">Dirección</div>
          <div class="input-group" style="width:110px">
            <span class="input-addon input-addon-left" style="padding:4px 8px;font-size:12px">S/</span>
            <input type="number" class="price-field" value="${p.dir.toFixed(2)}" step="0.05" style="border-radius:0 var(--r) var(--r) 0">
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">Historial de Precios</div></div>
    <div class="card-body-flush">
      <table class="table">
        <thead><tr><th>Año</th><th>Copia B/N Prof.</th><th>Copia B/N Alum.</th><th>Impresión B/N</th><th>Estado</th></tr></thead>
        <tbody>
          <tr><td class="font-bold">2026</td><td>S/ 0.10</td><td>S/ 0.20</td><td>S/ 0.20</td><td><span class="badge badge-success">Activo</span></td></tr>
          <tr><td>2025</td><td>S/ 0.10</td><td>S/ 0.20</td><td>S/ 0.20</td><td><span class="badge badge-neutral">Cerrado</span></td></tr>
          <tr><td>2024</td><td>S/ 0.10</td><td>S/ 0.15</td><td>S/ 0.20</td><td><span class="badge badge-neutral">Cerrado</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function viewComingSoon() {
  return `
  <div class="coming-soon">
    <div class="coming-soon-icon"><i data-lucide="construction"></i></div>
    <h2>Próximamente</h2>
    <p>Esta sección está en desarrollo. Vuelve pronto para ver el contenido completo.</p>
    <button class="btn btn-primary" onclick="BCE.navigate('dashboard')"><i data-lucide="home"></i> Volver al Dashboard</button>
  </div>`;
}
