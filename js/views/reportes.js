/* =============================================
   BCE System — View: Reportes (Diario + Período)
   ============================================= */

const REPDIA  = { fecha: '' };
const REPPERI = { filtro:'mes', desde:'', hasta:'' };

/* ---- VIEW: REPORTE DIARIO ---- */
function diarioGetFecha() {
  return REPDIA.fecha || today();
}

function diarioSetFecha(fecha) {
  REPDIA.fecha = fecha;
  _doNavigate('reportes/diario');
}

function viewReporteDiario() {
  const fecha  = diarioGetFecha();
  REPDIA.fecha = fecha;
  const hoyStr = today();
  const ayerStr= (() => { const d=new Date(hoyStr+'T12:00:00'); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();
  const ops    = DB.operaciones.filter(o=>o.fecha.startsWith(fecha)).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const total  = ops.reduce((a,o)=>a+o.total,0);
  const copias = ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio.includes('copia')).reduce((b,i)=>b+i.cantidad,0),0);
  const impres = ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio.includes('impresion')).reduce((b,i)=>b+i.cantidad,0),0);
  const totalMax = total||1;
  const byTipo = [
    {label:'Profesores',tipo:'profesor',color:'fill-primary'},
    {label:'Dirección', tipo:'direccion',color:'fill-warning'},
    {label:'Alumnos',   tipo:'alumno',  color:'fill-success'},
  ].map(g=>{
    const t=ops.filter(o=>o.tipo===g.tipo).reduce((a,o)=>a+o.total,0);
    return {...g, count:ops.filter(o=>o.tipo===g.tipo).length, total:t, pct:Math.round(t/totalMax*100)};
  });
  const fechaDisp = new Date(fecha+'T12:00:00').toLocaleDateString('es-PE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});

  return `
  <div class="page-header">
    <div><h1 class="page-title">Reporte Diario</h1>
    <p class="page-subtitle">${fechaDisp.charAt(0).toUpperCase()+fechaDisp.slice(1)}</p></div>
    <div class="page-actions">
      <div class="filter-bar" id="repdia-bar">
        <button class="filter-chip${fecha===hoyStr?' active':''}" onclick="BCE.diarioSetFecha('${hoyStr}')">Hoy</button>
        <button class="filter-chip${fecha===ayerStr?' active':''}" onclick="BCE.diarioSetFecha('${ayerStr}')">Ayer</button>
        <input type="date" class="form-control form-control-sm" value="${fecha}" style="width:140px"
               onchange="BCE.diarioSetFecha(this.value)">
      </div>
      <div class="export-drop-wrap" id="repdia-export-drop">
        <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('repdia-export-drop')">
          <i data-lucide="download"></i> Exportar <i data-lucide="chevron-down"></i>
        </button>
        <div class="export-drop-menu">
          <div class="export-drop-item" onclick="BCE.diarioExportCSV()"><i data-lucide="file-text"></i> CSV / Excel</div>
          <div class="export-drop-item" onclick="BCE.diarioExportPDF()"><i data-lucide="file"></i> PDF / Imprimir</div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid-stats mb-5">
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon blue"><i data-lucide="file-text"></i></div><div class="stat-value">${ops.length}</div></div>
      <div class="stat-label">Operaciones</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon green"><i data-lucide="banknote"></i></div><div class="stat-value">${fmt(total)}</div></div>
      <div class="stat-label">Total generado</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon orange"><i data-lucide="copy"></i></div><div class="stat-value">${copias}</div></div>
      <div class="stat-label">Copias totales</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon purple"><i data-lucide="printer"></i></div><div class="stat-value">${impres}</div></div>
      <div class="stat-label">Impresiones</div>
    </div>
  </div>

  <div class="grid-2 mb-5">
    <div class="card">
      <div class="card-header mb-3"><div class="card-title">Servicios del Día</div></div>
      <div class="card-body">
        <div class="chart-container" style="height:200px"><canvas id="chartDiario"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header mb-3"><div class="card-title">Por Tipo de Solicitante</div></div>
      <div class="card-body">
        <div style="display:flex;flex-direction:column;gap:14px">
          ${byTipo.map(g=>`
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium">${g.label} <span class="text-muted">(${g.count})</span></span>
              <span class="text-sm font-bold">${fmt(g.total)}</span>
            </div>
            <div class="progress-bar-track"><div class="progress-bar-fill ${g.color}" style="width:${g.pct}%"></div></div>
          </div>`).join('')}
        </div>
        ${ops.length===0?`<div class="empty-state" style="padding:32px 0"><div class="empty-state-icon"><i data-lucide="calendar-x"></i></div><div class="empty-state-title">Sin operaciones</div><div class="empty-state-desc">No hay registros para esta fecha.</div></div>`:''}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header mb-3">
      <div class="card-title">Detalle de Operaciones</div>
      <span class="badge badge-neutral">${ops.length} operación${ops.length!==1?'es':''}</span>
    </div>
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table" id="repdia-table">
          <thead><tr><th>Hora</th><th>Tipo</th><th>Solicitante</th><th>Servicios</th><th>Salones</th><th class="td-right">Total</th></tr></thead>
          <tbody>
            ${ops.map(op=>`
            <tr style="cursor:pointer" onclick="BCE.openDetalleOperacion('${op.id}')">
              <td class="td-mono text-sm text-muted">${fmtTime(op.fecha)}</td>
              <td>${tipoBadge(op.tipo)}</td>
              <td class="td-bold">${solicitanteLabel(op)}</td>
              <td class="text-sm">${[...new Set(op.items.map(i=>servicioNombre(i.servicio)))].join(', ')}</td>
              <td class="text-sm text-muted">${[...new Set(op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)))].join(', ')||'Personal'}</td>
              <td class="td-right td-bold">${fmt(op.total)}</td>
            </tr>`).join('')||`<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--t-300)">Sin operaciones para esta fecha</td></tr>`}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-muted)">
              <td colspan="5" class="font-bold">Total del día</td>
              <td class="td-right font-bold text-primary">${fmt(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>`;
}

function initDiarioChart() {
  const ctx = document.getElementById('chartDiario');
  if(!ctx) return;
  const fecha = diarioGetFecha();
  const ops   = DB.operaciones.filter(o=>o.fecha.startsWith(fecha));
  const svcData = DB.precios.map(p=>({
    nombre: p.nombre.replace('Impresión a Color','Imp.Color').replace('Impresión B/N','Imp.B/N').replace('Copia a Color','C.Color'),
    qty: ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio===p.id).reduce((b,i)=>b+i.cantidad,0),0)
  })).filter(s=>s.qty>0);
  if(!svcData.length) return;
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: svcData.map(s=>s.nombre),
      datasets:[{ data:svcData.map(s=>s.qty),
        backgroundColor:['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#64748b'],
        borderRadius:6, borderSkipped:false }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{grid:{color:'#f1f5f9'},ticks:{font:{size:11},stepSize:1}}}}
  });
}

function diarioExportCSV() {
  const fecha = diarioGetFecha();
  const ops   = DB.operaciones.filter(o=>o.fecha.startsWith(fecha));
  exportCSV(`reporte_diario_${fecha}.csv`,
    ['Hora','Tipo','Solicitante','Servicios','Salones','Total (S/)','Notas'],
    ops.map(op=>[fmtTime(op.fecha),op.tipo,solicitanteLabel(op),
      op.items.map(i=>`${servicioNombre(i.servicio)} x${i.cantidad}`).join(' | '),
      op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)).join(' | ')||'Personal',
      parseFloat(op.total).toFixed(2), op.notas||''])
  );
}

function diarioExportPDF() {
  const fecha = diarioGetFecha();
  const ops   = DB.operaciones.filter(o=>o.fecha.startsWith(fecha));
  const total = ops.reduce((a,o)=>a+o.total,0);
  const fechaDisp = new Date(fecha+'T12:00:00').toLocaleDateString('es-PE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const rows = ops.map(op=>`<tr>
    <td>${fmtTime(op.fecha)}</td>
    <td><span class="${op.tipo==='profesor'?'badge-prof':op.tipo==='alumno'?'badge-alu':'badge-dir'}">${op.tipo==='profesor'?'Profesor':op.tipo==='alumno'?'Alumno':'Dirección'}</span></td>
    <td>${solicitanteLabel(op)}</td>
    <td>${op.items.map(i=>`${servicioNombre(i.servicio)} ×${i.cantidad}`).join('<br>')}</td>
    <td>${op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)).join(', ')||'Personal'}</td>
    <td class="td-right">${fmt(op.total)}</td>
  </tr>`).join('');
  const html = `<table>
    <thead><tr><th>Hora</th><th>Tipo</th><th>Solicitante</th><th>Servicios</th><th>Salones</th><th class="td-right">Total</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">Sin operaciones para esta fecha</td></tr>'}</tbody>
    <tfoot><tr><td colspan="5">Total del día</td><td class="td-right">${fmt(total)}</td></tr></tfoot>
  </table>`;
  printPDF('Reporte Diario', fechaDisp.charAt(0).toUpperCase()+fechaDisp.slice(1), html);
}

/* ---- VIEW: REPORTE PERÍODO ---- */
function periodoGetRange() {
  const t = today();
  switch(REPPERI.filtro) {
    case 'hoy':
      return { desde:t, hasta:t };
    case 'semana': {
      const d=new Date(t+'T12:00:00');
      const dow=d.getDay();
      const diff=dow===0?6:dow-1;
      d.setDate(d.getDate()-diff);
      return { desde:d.toISOString().split('T')[0], hasta:t };
    }
    case 'mes':
      return { desde:t.slice(0,7)+'-01', hasta:t };
    case 'anio':
      return { desde:t.slice(0,4)+'-01-01', hasta:t };
    case 'custom':
      return { desde:REPPERI.desde||t, hasta:REPPERI.hasta||t };
    default:
      return { desde:t.slice(0,7)+'-01', hasta:t };
  }
}

function periodoSetFiltro(filtro, desde, hasta) {
  REPPERI.filtro = filtro || 'mes';
  if(filtro==='custom') {
    if(desde) REPPERI.desde = desde;
    if(hasta) REPPERI.hasta = hasta;
    if(!REPPERI.desde) REPPERI.desde = today();
    if(!REPPERI.hasta) REPPERI.hasta = today();
  }
  _doNavigate('reportes/periodo');
}

function viewReportePeriodo() {
  const {desde, hasta} = periodoGetRange();
  const ops = DB.operaciones.filter(o=>{
    const d=o.fecha.split(' ')[0];
    return d>=desde && d<=hasta;
  });
  const total  = ops.reduce((a,o)=>a+o.total,0);
  const copias = ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio.includes('copia')).reduce((b,i)=>b+i.cantidad,0),0);
  const impres = ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio.includes('impresion')).reduce((b,i)=>b+i.cantidad,0),0);

  const rankingProf = DB.profesores
    .filter(p=>getRol(p.rolId)?.tipo==='docente')
    .map(p=>{
      let t=0;
      ops.forEach(op=>{
        op.items.forEach(it=>{
          const s=getSalon(it.salonId);
          if(s&&s.tutorId===p.id) t+=it.subtotal;
          if(it.esPersonal&&op.tipo==='profesor'&&op.solicitanteId===p.id) t+=it.subtotal;
        });
      });
      return {...p,total:t};
    })
    .filter(p=>p.total>0)
    .sort((a,b)=>b.total-a.total)
    .slice(0,8);

  const bySvc = DB.precios.map(p=>{
    const qty=ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio===p.id).reduce((b,i)=>b+i.cantidad,0),0);
    const tot=ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio===p.id).reduce((b,i)=>b+i.subtotal,0),0);
    return {...p,qty,tot};
  }).filter(p=>p.qty>0).sort((a,b)=>b.qty-a.qty);

  const filtros=[
    {id:'hoy',label:'Hoy'},
    {id:'semana',label:'Esta semana'},
    {id:'mes',label:'Este mes'},
    {id:'anio',label:'Año completo'},
    {id:'custom',label:'Personalizado'},
  ];

  const fechaDesdeDisp=new Date(desde+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'long'});
  const fechaHastaDisp=new Date(hasta+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const periodoLabel=desde===hasta?fechaDesdeDisp:`${fechaDesdeDisp} — ${fechaHastaDisp}`;

  return `
  <div class="page-header">
    <div><h1 class="page-title">Reporte por Período</h1>
    <p class="page-subtitle">${periodoLabel}</p></div>
    <div class="page-actions">
      <div class="export-drop-wrap" id="repperi-export-drop">
        <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('repperi-export-drop')">
          <i data-lucide="download"></i> Exportar <i data-lucide="chevron-down"></i>
        </button>
        <div class="export-drop-menu">
          <div class="export-drop-item" onclick="BCE.periodoExportCSV()"><i data-lucide="file-text"></i> CSV / Excel</div>
          <div class="export-drop-item" onclick="BCE.periodoExportPDF()"><i data-lucide="file"></i> PDF / Imprimir</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card mb-4">
    <div class="card-body" style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
      <div class="filter-bar">
        ${filtros.map(f=>`<button class="filter-chip${REPPERI.filtro===f.id?' active':''}"
          onclick="BCE.periodoSetFiltro('${f.id}')">${f.label}</button>`).join('')}
      </div>
      <div class="flex gap-2 items-center" style="${REPPERI.filtro==='custom'?'':'display:none'}">
        <div class="form-group" style="margin:0">
          <label class="form-label">Desde</label>
          <input type="date" class="form-control form-control-sm" id="peri-desde" value="${desde}"
                 onchange="BCE.periodoSetFiltro('custom',this.value,document.getElementById('peri-hasta')?.value)">
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Hasta</label>
          <input type="date" class="form-control form-control-sm" id="peri-hasta" value="${hasta}"
                 onchange="BCE.periodoSetFiltro('custom',document.getElementById('peri-desde')?.value,this.value)">
        </div>
      </div>
    </div>
  </div>

  <div class="grid-stats mb-5">
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon blue"><i data-lucide="file-text"></i></div><div class="stat-value">${ops.length}</div></div>
      <div class="stat-label">Operaciones</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon green"><i data-lucide="banknote"></i></div><div class="stat-value">${fmt(total)}</div></div>
      <div class="stat-label">Total generado</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon orange"><i data-lucide="copy"></i></div><div class="stat-value">${copias}</div></div>
      <div class="stat-label">Copias</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon purple"><i data-lucide="printer"></i></div><div class="stat-value">${impres}</div></div>
      <div class="stat-label">Impresiones</div>
    </div>
  </div>

  <div class="card mb-5">
    <div class="card-header mb-3"><div class="card-title">Tendencia del período</div></div>
    <div class="card-body">
      <div class="chart-container" style="height:220px"><canvas id="chartPeriodo"></canvas></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header mb-3"><div class="card-title">Ranking de Profesores</div></div>
      <div class="card-body-flush">
        ${rankingProf.length?`<table class="table">
          <thead><tr><th>#</th><th>Profesor</th><th>Salón</th><th class="td-right">Total</th></tr></thead>
          <tbody>
            ${rankingProf.map((p,i)=>`<tr>
              <td class="text-muted font-bold">${i+1}</td>
              <td><div class="flex items-center gap-2">
                <div class="avatar avatar-sm ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
                <span class="td-bold">${p.nombre}</span>
              </div></td>
              <td class="text-sm text-muted">${p.tutorDe?salonLabel(p.tutorDe):'—'}</td>
              <td class="td-right font-bold">${fmt(p.total)}</td>
            </tr>`).join('')}
          </tbody>
        </table>`:`<div class="empty-state" style="padding:32px 0">
          <div class="empty-state-icon"><i data-lucide="users"></i></div>
          <div class="empty-state-title">Sin datos en este período</div>
        </div>`}
      </div>
    </div>
    <div class="card">
      <div class="card-header mb-3"><div class="card-title">Por Servicio</div></div>
      <div class="card-body-flush">
        ${bySvc.length?`<table class="table">
          <thead><tr><th>Servicio</th><th class="td-right">Cantidad</th><th class="td-right">Total</th></tr></thead>
          <tbody>
            ${bySvc.map(p=>`<tr>
              <td class="text-sm font-medium">${p.nombre}</td>
              <td class="td-right td-mono">${p.qty}</td>
              <td class="td-right font-bold">${fmt(p.tot)}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-muted)">
              <td class="font-bold">Total</td>
              <td class="td-right font-bold">${bySvc.reduce((a,p)=>a+p.qty,0)}</td>
              <td class="td-right font-bold">${fmt(bySvc.reduce((a,p)=>a+p.tot,0))}</td>
            </tr>
          </tfoot>
        </table>`:`<div class="empty-state" style="padding:32px 0">
          <div class="empty-state-icon"><i data-lucide="layers"></i></div>
          <div class="empty-state-title">Sin datos en este período</div>
        </div>`}
      </div>
    </div>
  </div>`;
}

function initPeriodoChart() {
  const ctx = document.getElementById('chartPeriodo');
  if(!ctx) return;
  const {desde, hasta} = periodoGetRange();
  const ops = DB.operaciones.filter(o=>{
    const d=o.fecha.split(' ')[0];
    return d>=desde && d<=hasta;
  });
  const byDate = {};
  ops.forEach(o=>{ const d=o.fecha.split(' ')[0]; byDate[d]=(byDate[d]||0)+o.total; });
  const diffDays=Math.round((new Date(hasta+'T12:00:00')-new Date(desde+'T12:00:00'))/(1000*60*60*24));
  const dateRange = [];
  if(diffDays<=31) {
    let cur=new Date(desde+'T12:00:00');
    while(cur.toISOString().split('T')[0]<=hasta) {
      dateRange.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate()+1);
    }
  } else {
    Object.keys(byDate).sort().forEach(d=>dateRange.push(d));
  }
  if(!dateRange.length) return;
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: dateRange.map(d=>new Date(d+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'short'})),
      datasets:[{
        label:'Total (S/)', data:dateRange.map(d=>byDate[d]||0),
        backgroundColor:'rgba(37,99,235,0.72)', borderColor:'#2563eb',
        borderRadius:5, borderSkipped:false,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`S/ ${c.parsed.y.toFixed(2)}`}}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:11},maxRotation:45,minRotation:0}},
        y:{grid:{color:'#f1f5f9'},ticks:{font:{size:11},callback:v=>`S/${v}`}}
      }
    }
  });
}

function periodoExportCSV() {
  const {desde, hasta} = periodoGetRange();
  const ops = DB.operaciones.filter(o=>{ const d=o.fecha.split(' ')[0]; return d>=desde&&d<=hasta; })
    .sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const total = ops.reduce((a,o)=>a+o.total,0);
  exportCSV(`reporte_periodo_${desde}_${hasta}.csv`,
    ['Fecha','Hora','Tipo','Solicitante','Servicios','Salones','Total (S/)','Notas'],
    [
      ...ops.map(op=>[fmtDate(op.fecha),fmtTime(op.fecha),op.tipo,solicitanteLabel(op),
        op.items.map(i=>`${servicioNombre(i.servicio)} x${i.cantidad}`).join(' | '),
        op.items.filter(i=>i.salonId).map(i=>salonLabel(i.salonId)).join(' | ')||'Personal',
        parseFloat(op.total).toFixed(2),op.notas||'']),
      ['','','','','','TOTAL',total.toFixed(2),'']
    ]
  );
}

function periodoExportPDF() {
  const {desde, hasta} = periodoGetRange();
  const ops = DB.operaciones.filter(o=>{ const d=o.fecha.split(' ')[0]; return d>=desde&&d<=hasta; })
    .sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const total = ops.reduce((a,o)=>a+o.total,0);
  const fechaDesdeDisp=new Date(desde+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'long'});
  const fechaHastaDisp=new Date(hasta+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const periodoLabel=desde===hasta?fechaDesdeDisp:`${fechaDesdeDisp} — ${fechaHastaDisp}`;
  const rows=ops.map(op=>`<tr>
    <td>${fmtDate(op.fecha)}</td><td>${fmtTime(op.fecha)}</td>
    <td><span class="${op.tipo==='profesor'?'badge-prof':op.tipo==='alumno'?'badge-alu':'badge-dir'}">${op.tipo==='profesor'?'Profesor':op.tipo==='alumno'?'Alumno':'Dirección'}</span></td>
    <td>${solicitanteLabel(op)}</td>
    <td>${op.items.map(i=>`${servicioNombre(i.servicio)} ×${i.cantidad}`).join(', ')}</td>
    <td class="td-right">${fmt(op.total)}</td>
  </tr>`).join('');
  const html=`<table>
    <thead><tr><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Solicitante</th><th>Servicios</th><th class="td-right">Total</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">Sin operaciones en este período</td></tr>'}</tbody>
    <tfoot><tr><td colspan="5">Total del período (${ops.length} operaciones)</td><td class="td-right">${fmt(total)}</td></tr></tfoot>
  </table>`;
  printPDF('Reporte por Período', periodoLabel, html);
}
