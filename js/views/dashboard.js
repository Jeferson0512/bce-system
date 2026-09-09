/* =============================================
   BCE System — View: Dashboard
   ============================================= */

function viewDashboard() {
  const dashDate  = today();
  const ayerDate  = (() => { const d=new Date(dashDate+'T12:00:00'); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();
  const hoy       = DB.operaciones.filter(o=>o.fecha.startsWith(dashDate));
  const ayer      = DB.operaciones.filter(o=>o.fecha.startsWith(ayerDate));
  const totalHoy  = hoy.reduce((a,o)=>a+o.total, 0);
  const totalAyer = ayer.reduce((a,o)=>a+o.total, 0);
  const opsHoy    = hoy.length;
  const opsAyer   = ayer.length;
  const copiasHoy = hoy.reduce((a,o)=>a+o.items.filter(i=>i.servicio.includes('copia')).reduce((b,i)=>b+i.cantidad,0),0);
  const impresHoy = hoy.reduce((a,o)=>a+o.items.filter(i=>i.servicio.includes('impresion')).reduce((b,i)=>b+i.cantidad,0),0);
  const especCount= hoy.reduce((a,o)=>a+o.items.filter(i=>['anillado','escaneo','plastificado'].includes(i.servicio)).reduce((b,i)=>b+i.cantidad,0),0);
  const especTotal= hoy.reduce((a,o)=>a+o.items.filter(i=>['anillado','escaneo','plastificado'].includes(i.servicio)).reduce((b,i)=>b+i.subtotal,0),0);
  const pagosHoy    = DB.pagos.filter(p=>p.fecha===dashDate);
  const cobradoHoy  = pagosHoy.reduce((a,p)=>a+p.monto, 0);
  const pagosAyer   = DB.pagos.filter(p=>p.fecha===ayerDate);
  const cobradoAyer = pagosAyer.reduce((a,p)=>a+p.monto, 0);
  const allTutores= DB.profesores.filter(p=>p.tutorDe);
  let conDeuda=0, pendienteTotal=0;
  allTutores.forEach(p=>{ const d=calcDeudaProfesor(p.id); if(d.pendiente>0){conDeuda++;pendienteTotal+=d.pendiente;} });
  const dirTotal   = DB.operaciones.filter(o=>o.tipo==='direccion').reduce((a,o)=>a+o.total,0);
  const dirPagado  = DB.pagos.filter(p=>p.tipo==='direccion').reduce((a,p)=>a+p.monto,0);
  const dirPend    = dirTotal - dirPagado;

  const diffOps    = opsHoy - opsAyer;
  const diffTotal  = totalHoy - totalAyer;
  const diffCobrado= cobradoHoy - cobradoAyer;
  const diffBadge = (diff, pfx='') => {
    if(diff===0) return '';
    const sign = diff>0?'+':'';
    const cls  = diff>0?'badge-success':'badge-danger';
    const val = pfx ? Math.abs(diff).toFixed(2) : Math.abs(diff);
    return `<span class="badge ${cls} badge-sm">${sign}${pfx}${val} vs ayer</span>`;
  };

  const recientes = [...DB.operaciones].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,8);
  const topDeudores = allTutores
    .map(p=>({...p,...calcDeudaProfesor(p.id)}))
    .filter(p=>p.pendiente>0)
    .sort((a,b)=>b.pendiente-a.pendiente)
    .slice(0,6);

  const fechaDisp = new Date(dashDate+'T12:00:00').toLocaleDateString('es-PE',{weekday:'long',day:'2-digit',month:'long'});

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Año ${DB.year} — ${fechaDisp.charAt(0).toUpperCase()+fechaDisp.slice(1)}</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-primary" onclick="BCE.navigate('operaciones/nueva')">
        <i data-lucide="plus"></i> Nueva Operación
      </button>
    </div>
  </div>

  <div class="stats-group-label mb-2">Actividad del día</div>
  <div class="grid-stats mb-3">
    <div class="stat-card stat-card-link" onclick="BCE.navigate('operaciones/historial')" title="Ver historial">
      <div class="stat-card-top">
        <div class="stat-icon blue"><i data-lucide="file-text"></i></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div class="stat-value">${opsHoy}</div>${diffBadge(diffOps)}
        </div>
      </div>
      <div class="stat-label">Operaciones hoy</div>
    </div>
    <div class="stat-card stat-card-link" onclick="BCE.navigate('operaciones/historial')" title="Ver historial">
      <div class="stat-card-top">
        <div class="stat-icon teal"><i data-lucide="copy"></i></div>
        <div class="stat-value">${copiasHoy}</div>
      </div>
      <div class="stat-label">Copias realizadas</div>
    </div>
    <div class="stat-card stat-card-link" onclick="BCE.navigate('operaciones/historial')" title="Ver historial">
      <div class="stat-card-top">
        <div class="stat-icon purple"><i data-lucide="printer"></i></div>
        <div class="stat-value">${impresHoy}</div>
      </div>
      <div class="stat-label">Impresiones realizadas</div>
    </div>
    <div class="stat-card stat-card-link" onclick="BCE.navigate('reportes/diario')" title="Ver reporte diario">
      <div class="stat-card-top">
        <div class="stat-icon amber"><i data-lucide="layers"></i></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div class="stat-value">${fmt(especTotal)}</div>
          ${especCount>0?`<span class="badge badge-warning badge-sm">${especCount} und.</span>`:''}
        </div>
      </div>
      <div class="stat-label">Servicios especiales</div>
    </div>
  </div>

  <div class="stats-group-label mb-2">Estado financiero</div>
  <div class="grid-stats mb-5">
    <div class="stat-card stat-card-link" onclick="BCE.navigate('reportes/diario')" title="Ver reporte diario">
      <div class="stat-card-top">
        <div class="stat-icon green"><i data-lucide="banknote"></i></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div class="stat-value">${fmt(cobradoHoy)}</div>${diffBadge(parseFloat((diffCobrado).toFixed(2)),'S/')}
        </div>
      </div>
      <div class="stat-label">Cobrado hoy</div>
      ${pagosHoy.length>0?`<div class="text-xs text-muted mt-1">${pagosHoy.length} pago${pagosHoy.length!==1?'s':''} recibido${pagosHoy.length!==1?'s':''}</div>`:''}
    </div>
    <div class="stat-card stat-card-link" onclick="BCE.navigate('deudas/profesores')" title="Ver deudas de profesores">
      <div class="stat-card-top">
        <div class="stat-icon orange"><i data-lucide="clock"></i></div>
        <div class="stat-value">${fmt(pendienteTotal)}</div>
      </div>
      <div class="stat-label">Pendiente profesores</div>
    </div>
    <div class="stat-card stat-card-link" onclick="BCE.navigate('deudas/profesores')" title="Ver deudas de profesores">
      <div class="stat-card-top">
        <div class="stat-icon red"><i data-lucide="users"></i></div>
        <div class="stat-value">${conDeuda}</div>
      </div>
      <div class="stat-label">Profesores con deuda</div>
    </div>
    <div class="stat-card stat-card-link" onclick="BCE.navigate('deudas/direccion')" title="Ver cuenta de dirección">
      <div class="stat-card-top">
        <div class="stat-icon slate"><i data-lucide="building-2"></i></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div class="stat-value">${fmt(dirPend)}</div>
          ${dirPend>0?`<span class="badge badge-danger badge-sm">Pend.</span>`:`<span class="badge badge-success badge-sm">Al día</span>`}
        </div>
      </div>
      <div class="stat-label">Dirección pendiente</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-header mb-3">
        <div>
          <div class="card-title">Operaciones Recientes</div>
          <div class="card-subtitle">Últimas 8 operaciones</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="BCE.navigate('operaciones/historial')">Ver todo <i data-lucide="arrow-right"></i></button>
      </div>
      <div class="card-body-flush">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Fecha</th><th>Solicitante</th><th>Tipo</th><th>Items</th><th class="td-right">Total</th></tr></thead>
            <tbody>
              ${recientes.map(op=>`
              <tr class="table-row-link" onclick="BCE.openDetalleOperacion('${op.id}')">
                <td class="td-mono text-muted text-xs">${fmtDate(op.fecha)}<br><span style="font-size:10px">${fmtTime(op.fecha)}</span></td>
                <td class="td-bold">${solicitanteLabel(op)}</td>
                <td>${tipoBadge(op.tipo)}</td>
                <td class="text-muted text-sm">${op.items.length} svc</td>
                <td class="td-right td-bold">${fmt(op.total)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header mb-3">
        <div class="card-title">Top Deudores</div>
        <button class="btn btn-ghost btn-sm" onclick="BCE.navigate('deudas/profesores')">Ver todos</button>
      </div>
      <div class="card-body" style="overflow-y:auto;max-height:clamp(180px,40vh,480px)">
        ${topDeudores.length ? topDeudores.map(p=>{
          const pct = Math.min(100,Math.round((p.pagado/p.total)*100));
          return `<div class="mb-3" style="cursor:pointer" onclick="BCE.openDetalleProfesor('${p.id}')">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <div class="avatar avatar-xs ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
                <div>
                  <div class="text-xs font-semibold" style="line-height:1.3">${p.nombre}</div>
                  <div class="text-xs text-muted">${salonLabel(p.tutorDe)}</div>
                </div>
              </div>
              <span class="text-sm font-bold text-danger">${fmt(p.pendiente)}</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill ${pct>=100?'fill-success':p.pendiente>10?'fill-danger':'fill-warning'}" style="width:${pct}%"></div>
            </div>
          </div>`;
        }).join('')
        : `<div class="empty-state" style="padding:24px 0">
            <div class="empty-state-icon"><i data-lucide="check-circle"></i></div>
            <div class="empty-state-title">Sin deudas pendientes</div>
          </div>`}
      </div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-header mb-2"><div class="card-title">Servicios del Día</div><span class="text-xs text-muted">${new Date(dashDate+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'short'})}</span></div>
      <div class="card-body">
        <div class="chart-container" style="height:190px"><canvas id="chartDash"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header mb-2"><div class="card-title">Formas de Pago</div><span class="text-xs text-muted">Todos los pagos registrados</span></div>
      <div class="card-body">
        <div class="chart-container" style="height:190px"><canvas id="chartFormasPago"></canvas></div>
      </div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-header mb-2"><div class="card-title">Últimos 7 días</div><span class="text-xs text-muted">Total generado por día</span></div>
      <div class="card-body">
        <div class="chart-container" style="height:190px"><canvas id="chartSemana"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header mb-3">
        <div class="card-title">Resumen del Mes</div>
        <span class="badge badge-neutral">${new Date(today()+'T12:00:00').toLocaleDateString('es-PE',{month:'long',year:'numeric'})}</span>
      </div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
        ${(()=>{
          const mesInicio=today().slice(0,7)+'-01';
          const opsMes=DB.operaciones.filter(o=>o.fecha.split(' ')[0]>=mesInicio);
          const totalMes=opsMes.reduce((a,o)=>a+o.total,0);
          const byTipo={profesor:0,alumno:0,direccion:0};
          opsMes.forEach(o=>{ byTipo[o.tipo]=(byTipo[o.tipo]||0)+o.total; });
          const mx=totalMes||1;
          const rows=[
            {label:'Profesores',val:byTipo.profesor,cls:'fill-primary',color:'var(--brand)'},
            {label:'Alumnos',val:byTipo.alumno,cls:'fill-success',color:'var(--success)'},
            {label:'Dirección',val:byTipo.direccion,cls:'fill-warning',color:'var(--warning)'},
          ];
          return `
          <div class="flex justify-between items-center pb-2" style="border-bottom:1px solid var(--border)">
            <div>
              <div class="text-xs text-muted">Total generado</div>
              <div class="text-xl font-bold text-primary">${fmt(totalMes)}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-muted">Operaciones</div>
              <div class="text-xl font-bold">${opsMes.length}</div>
            </div>
          </div>
          ${rows.map(r=>`
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm text-muted">${r.label}</span>
              <span class="text-sm font-bold">${fmt(r.val)}</span>
            </div>
            <div class="progress-bar-track"><div class="progress-bar-fill ${r.cls}" style="width:${Math.round(r.val/mx*100)}%"></div></div>
          </div>`).join('')}`;
        })()}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header mb-3"><div class="card-title">Accesos Rápidos</div></div>
    <div class="card-body" style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">
      ${[
        {icon:'plus-circle',label:'Nueva Operación',route:'operaciones/nueva'},
        {icon:'graduation-cap',label:'Deudas Profesores',route:'deudas/profesores'},
        {icon:'user',label:'Deudas Alumnos',route:'deudas/alumnos'},
        {icon:'calendar-days',label:'Reporte Diario',route:'reportes/diario'},
        {icon:'bar-chart-3',label:'Por Período',route:'reportes/periodo'},
        {icon:'tag',label:'Precios',route:'config/precios'},
      ].map(a=>`
        <button class="btn btn-secondary" style="flex-direction:column;gap:6px;padding:12px 8px;height:auto" onclick="BCE.navigate('${a.route}')">
          <i data-lucide="${a.icon}" style="width:20px;height:20px"></i>
          <span style="font-size:11px;white-space:normal;text-align:center;line-height:1.3">${a.label}</span>
        </button>
      `).join('')}
    </div>
  </div>`;
}

function initDashboardChart() {
  const dashDate = today();

  const ctx1 = document.getElementById('chartDash');
  if(ctx1) {
    const ops = DB.operaciones.filter(o=>o.fecha.startsWith(dashDate));
    const svcData = DB.precios.map(p=>({
      nombre: p.nombre.replace('Impresión a Color','Imp.Color').replace('Impresión B/N','Imp.B/N').replace('Copia a Color','C.Color'),
      qty: ops.reduce((a,o)=>a+o.items.filter(i=>i.servicio===p.id).reduce((b,i)=>b+i.cantidad,0),0)
    })).filter(s=>s.qty>0);
    if(svcData.length) {
      new Chart(ctx1, {
        type:'doughnut',
        data:{
          labels: svcData.map(s=>s.nombre),
          datasets:[{ data:svcData.map(s=>s.qty),
            backgroundColor:['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#64748b'],
            borderWidth:2, borderColor:'#fff', hoverOffset:4 }]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{position:'bottom',labels:{font:{size:11},usePointStyle:true,boxWidth:8}},
            tooltip:{callbacks:{label:c=>`${c.label}: ${c.parsed} und.`}} },
          cutout:'60%'
        }
      });
    }
  }

  const ctx2 = document.getElementById('chartFormasPago');
  if(ctx2) {
    const fp = {efectivo:0, yape:0, transferencia:0};
    DB.pagos.forEach(p=>{ if(fp[p.tipoPago]!=null) fp[p.tipoPago]+=p.monto; });
    const labels=['Efectivo','Yape / Plin','Transferencia'];
    const data=[fp.efectivo, fp.yape, fp.transferencia];
    if(data.some(v=>v>0)) {
      new Chart(ctx2, {
        type:'doughnut',
        data:{ labels, datasets:[{ data,
          backgroundColor:['#10b981','#8b5cf6','#2563eb'],
          borderWidth:2, borderColor:'#fff', hoverOffset:4 }]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{position:'bottom',labels:{font:{size:11},usePointStyle:true,boxWidth:8}},
            tooltip:{callbacks:{label:c=>`S/ ${c.parsed.toFixed(2)}`}} },
          cutout:'60%'
        }
      });
    }
  }

  const ctx3 = document.getElementById('chartSemana');
  if(ctx3) {
    const base = new Date(dashDate+'T12:00:00');
    const refDays = [];
    for(let i=6; i>=0; i--) {
      const d=new Date(base); d.setDate(d.getDate()-i);
      refDays.push(d.toISOString().split('T')[0]);
    }
    const labels = refDays.map(d=>new Date(d+'T12:00:00').toLocaleDateString('es-PE',{weekday:'short',day:'2-digit'}));
    const data   = refDays.map(d=>DB.pagos.filter(p=>p.fecha===d).reduce((a,p)=>a+p.monto,0));
    new Chart(ctx3, {
      type:'line',
      data:{ labels, datasets:[{
        label:'Total (S/)', data,
        borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,0.10)',
        tension:0.4, fill:true,
        pointBackgroundColor:'#2563eb', pointBorderColor:'#fff', pointBorderWidth:2,
        pointRadius:5, pointHoverRadius:7,
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>`S/ ${c.parsed.y.toFixed(2)}`}} },
        scales:{
          x:{grid:{display:false}, ticks:{font:{size:11}}},
          y:{grid:{color:'#f1f5f9'}, ticks:{font:{size:11},callback:v=>`S/${v}`}, beginAtZero:true}
        }
      }
    });
  }
}
