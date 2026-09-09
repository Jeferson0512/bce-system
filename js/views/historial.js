/* =============================================
   BCE System — View: Historial de Operaciones
   ============================================= */

const HIST = { page:1, perPage:10, query:'', tipo:'', fechaFiltro:'' };

function viewHistorial() {
  HIST.page=1; HIST.query=''; HIST.tipo=''; HIST.fechaFiltro='';
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Historial de Operaciones</h1>
      <p class="page-subtitle" id="hist-count-label">${DB.operaciones.length} operaciones registradas</p>
    </div>
    <div class="page-actions">
      <div class="export-drop-wrap" id="hist-export-drop">
        <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('hist-export-drop')">
          <i data-lucide="download"></i> Exportar <i data-lucide="chevron-down"></i>
        </button>
        <div class="export-drop-menu">
          <div class="export-drop-item" onclick="BCE.histExportCSV()"><i data-lucide="file-text"></i> CSV / Excel</div>
          <div class="export-drop-item" onclick="BCE.histExportPDF()"><i data-lucide="file"></i> PDF / Imprimir</div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="BCE.navigate('operaciones/nueva')">
        <i data-lucide="plus"></i> Nueva Operación
      </button>
    </div>
  </div>

  <div class="card mb-4">
    <div class="card-body" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <div class="search-box" style="flex:1;min-width:200px">
        <i data-lucide="search"></i>
        <input type="text" class="form-control" id="hist-search" placeholder="Buscar por solicitante, salón, servicio..."
               oninput="BCE.histSearch(this.value)">
      </div>
      <select class="form-control" style="width:150px" onchange="BCE.histSetTipo(this.value)">
        <option value="">Todos los tipos</option>
        <option value="profesor">Profesor</option>
        <option value="alumno">Alumno</option>
        <option value="direccion">Dirección</option>
      </select>
      <div class="filter-bar" id="hist-fecha-bar">
        <button class="filter-chip active" onclick="BCE.histSetFecha('',this)">Todos</button>
        <button class="filter-chip" onclick="BCE.histSetFecha('hoy',this)">Hoy</button>
        <button class="filter-chip" onclick="BCE.histSetFecha('semana',this)">Esta semana</button>
        <button class="filter-chip" onclick="BCE.histSetFecha('mes',this)">Este mes</button>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>Fecha / Hora</th><th>Tipo</th><th>Solicitante</th>
            <th>Servicios</th><th>Salones</th><th class="td-right">Total</th><th>Acciones</th>
          </tr></thead>
          <tbody id="hist-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="hist-pagination" class="pagination-bar"></div>
  </div>`;
}

function histGetFiltered() {
  const q = HIST.query.toLowerCase();
  const hoy = today();
  const hace7 = (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().split('T')[0]; })();
  const mesInicio = hoy.substring(0,7)+'-01';
  return DB.operaciones.filter(op => {
    if(HIST.tipo && op.tipo!==HIST.tipo) return false;
    const opFecha = op.fecha.split(' ')[0];
    if(HIST.fechaFiltro==='hoy'    && opFecha!==hoy)       return false;
    if(HIST.fechaFiltro==='semana' && opFecha<hace7)        return false;
    if(HIST.fechaFiltro==='mes'    && opFecha<mesInicio)    return false;
    if(q) {
      const label   = solicitanteLabel(op).toLowerCase();
      const salones = op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)).join(' ').toLowerCase();
      const svcs    = op.items.map(i=>getNombreItem(i)).join(' ').toLowerCase();
      if(!label.includes(q)&&!salones.includes(q)&&!svcs.includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>b.fecha.localeCompare(a.fecha));
}

function histRefreshTable() {
  const all=histGetFiltered(), total=all.length;
  const totalPages=Math.max(1,Math.ceil(total/HIST.perPage));
  if(HIST.page>totalPages) HIST.page=totalPages;
  const start=(HIST.page-1)*HIST.perPage;
  const slice=all.slice(start,start+HIST.perPage);
  const tbody=document.getElementById('hist-tbody');
  if(!tbody) return;
  tbody.innerHTML = slice.length ? slice.map(op=>`
    <tr>
      <td><div class="font-medium text-sm">${fmtDate(op.fecha)}</div><div class="text-xs text-muted">${fmtTime(op.fecha)}</div></td>
      <td>${tipoBadge(op.tipo)}</td>
      <td class="td-bold">${solicitanteLabel(op)}${op.notas?`<div class="text-xs text-muted truncate" style="max-width:150px">${op.notas}</div>`:''}</td>
      <td class="text-sm text-muted">${[...new Set(op.items.map(i=>getNombreItem(i)))].join(', ')}</td>
      <td class="text-sm">${[...new Set(op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)))].join(', ')||'Personal'}</td>
      <td class="td-right td-bold">${fmt(op.total)}</td>
      <td><div class="flex gap-1">
        <button class="btn-icon" title="Ver detalle" onclick="BCE.openDetalleOperacion('${op.id}')"><i data-lucide="eye"></i></button>
        <button class="btn-icon" title="Imprimir" onclick="BCE.toast('Preparando impresión…','info')"><i data-lucide="printer"></i></button>
      </div></td>
    </tr>`).join('')
  : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--t-300)">Sin resultados para la búsqueda actual</td></tr>`;
  const pag=document.getElementById('hist-pagination');
  if(pag) pag.innerHTML=makePagHTML(total,HIST.page,HIST.perPage,'histSetPage','histSetPerPage');
  const lbl=document.getElementById('hist-count-label');
  if(lbl) lbl.textContent=`${total} operación${total!==1?'es':''} ${HIST.query||HIST.tipo?'encontradas':'registradas'}`;
  lucide.createIcons();
}

function histSearch(q)         { HIST.query=q; HIST.page=1; histRefreshTable(); }
function histSetTipo(t)        { HIST.tipo=t;  HIST.page=1; histRefreshTable(); }
function histSetPage(p)        { HIST.page=p;  histRefreshTable(); }
function histSetPerPage(n)     { HIST.perPage=n; HIST.page=1; histRefreshTable(); }
function histSetFecha(f, el) {
  HIST.fechaFiltro=f; HIST.page=1;
  if(el) {
    document.querySelectorAll('#hist-fecha-bar .filter-chip').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
  }
  histRefreshTable();
}

function openDetalleOperacion(opId) {
  const op = DB.operaciones.find(o=>o.id===opId);
  if(!op) return;
  const infoRows = [];
  if(op.tipo==='profesor'&&op.solicitanteId) infoRows.push(['Profesor', getProfesor(op.solicitanteId)?.nombre||op.solicitanteId]);
  if(op.tipo==='alumno') infoRows.push(['Alumno', op.alumnoNombre||(op.solicitanteId?getAlumno(op.solicitanteId)?.nombre:'—')]);
  if(op.tipo==='alumno'&&op.alumnoProfeEnvio) infoRows.push(['Enviado por', op.alumnoProfeEnvio]);
  if(op.tipo==='direccion'&&op.dirResponsable) infoRows.push(['Quien ordena', op.dirResponsable]);
  if(op.tipo==='direccion'&&op.dirPortador) infoRows.push(['Quien recoge', op.dirPortador]);
  if(op.notas) infoRows.push(['Notas', op.notas]);

  const body = `
    <div style="display:flex;gap:16px;margin-bottom:20px;padding:16px;background:var(--bg-muted);border-radius:var(--r-lg);flex-wrap:wrap">
      <div><div class="text-xs text-muted">Operación</div><div class="font-bold">${op.id}</div></div>
      <div><div class="text-xs text-muted">Fecha</div><div class="font-medium text-sm">${fmtDateTime(op.fecha)}</div></div>
      <div><div class="text-xs text-muted">Tipo</div><div>${tipoBadge(op.tipo)}</div></div>
      ${infoRows.map(r=>`<div><div class="text-xs text-muted">${r[0]}</div><div class="font-medium text-sm">${r[1]}</div></div>`).join('')}
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Servicio</th><th>Salón</th><th class="td-center">Cant.</th><th class="td-right">Precio u.</th><th class="td-right">Subtotal</th></tr></thead>
        <tbody>
          ${op.items.map(it=>`
          <tr>
            <td class="font-medium text-sm">${it.servicio==='kiosko'?`<span class="badge badge-warning" style="font-size:10px;padding:1px 5px;margin-right:4px">Kiosco</span>`:''}${getNombreItem(it)}</td>
            <td class="text-sm text-muted">${it.salonId?salonFull(it.salonId):'<em>Personal</em>'}</td>
            <td class="td-center">${it.cantidad}</td>
            <td class="td-right td-mono">${fmt(it.precio)}</td>
            <td class="td-right td-bold">${fmt(it.subtotal)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-muted)">
            <td colspan="4" class="font-bold">Total</td>
            <td class="td-right font-bold text-lg">${fmt(op.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cerrar</button>
    <button class="btn btn-secondary" onclick="BCE.toast('Preparando impresión…','info')"><i data-lucide="printer"></i> Imprimir</button>`;
  openModal(`Operación ${op.id}`, body, footer, 'modal-lg');
}

function histExportCSV() {
  const all = histGetFiltered();
  exportCSV(`historial_${today()}.csv`,
    ['ID','Fecha','Hora','Tipo','Solicitante','Servicios','Salones','Total (S/)','Notas'],
    all.map(op=>[
      op.id,
      fmtDate(op.fecha),
      fmtTime(op.fecha),
      op.tipo,
      solicitanteLabel(op),
      op.items.map(i=>`${servicioNombre(i.servicio)} x${i.cantidad}`).join(' | '),
      op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)).join(' | ')||'Personal',
      parseFloat(op.total).toFixed(2),
      op.notas||''
    ])
  );
}

function histExportPDF() {
  const all = histGetFiltered();
  const total = all.reduce((a,o)=>a+o.total,0);
  const rows = all.map(op=>`<tr>
    <td>${fmtDate(op.fecha)}</td><td>${fmtTime(op.fecha)}</td>
    <td><span class="${op.tipo==='profesor'?'badge-prof':op.tipo==='alumno'?'badge-alu':'badge-dir'}">${op.tipo==='profesor'?'Profesor':op.tipo==='alumno'?'Alumno':'Dirección'}</span></td>
    <td>${solicitanteLabel(op)}</td>
    <td>${op.items.map(i=>`${servicioNombre(i.servicio)} ×${i.cantidad}`).join(', ')}</td>
    <td class="td-right">${fmt(op.total)}</td>
  </tr>`).join('');
  const html=`<table>
    <thead><tr><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Solicitante</th><th>Servicios</th><th class="td-right">Total</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">Sin operaciones</td></tr>'}</tbody>
    <tfoot><tr><td colspan="5">Total (${all.length} operaciones)</td><td class="td-right">${fmt(total)}</td></tr></tfoot>
  </table>`;
  printPDF('Historial de Operaciones', `Año ${DB.year} · Filtros aplicados`, html);
}
