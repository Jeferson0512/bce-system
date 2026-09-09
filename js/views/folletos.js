/* =============================================
   BCE System — View: Folletos de Estado de Cuenta
   ============================================= */

function _printFolletoWindow(html) {
  const w = window.open('', '_blank', 'width=600,height=820');
  w.document.write(`<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><title>BCE — Estado de Cuenta</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1e293b;background:#1e3a5f;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px}
.folleto{background:#fff;border-radius:20px;padding:32px;width:100%;max-width:480px;box-shadow:0 25px 60px rgba(0,0,0,.4)}
.folleto.wide{max-width:700px}
.f-brand{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.f-name{font-size:24px;font-weight:800;color:#0f172a;margin-bottom:3px;line-height:1.2}
.f-sub{font-size:12px;color:#64748b;margin-bottom:20px}
.f-balance-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
.f-balance-label{font-size:10px;color:#2563eb;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.f-balance-amount{font-size:30px;font-weight:800;color:#ef4444;line-height:1}
.f-balance-amount.ok{color:#10b981}
.f-balance-side{text-align:right;font-size:11px;color:#64748b;line-height:1.9}
.f-mini-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.f-mini{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px}
.f-mini-label{font-size:10px;color:#64748b;margin-bottom:2px}
.f-mini-val{font-size:17px;font-weight:700;color:#0f172a}
.f-sec{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin:18px 0 8px}
.f-row{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px;gap:8px}
.f-row:last-child{border-bottom:none}
.f-row.total{border-top:2px solid #0f172a;border-bottom:none;padding-top:10px;margin-top:4px;font-weight:800;font-size:14px}
.f-row-left{flex:1}
.f-row-sub{font-size:10px;color:#94a3b8;display:block}
.f-table{width:100%;border-collapse:collapse;font-size:11px}
.f-table th{text-align:left;color:#94a3b8;font-weight:600;font-size:10px;text-transform:uppercase;padding:5px 6px;border-bottom:2px solid #e2e8f0}
.f-table td{padding:7px 6px;border-bottom:1px solid #f1f5f9}
.f-table .td-r{text-align:right;font-weight:600}
.f-table tfoot td{font-weight:700;background:#f8fafc;padding:8px 6px;border-top:2px solid #e2e8f0}
hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0}
.f-footer{font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;margin-top:20px}
.btn-row{display:flex;gap:10px;margin-top:16px}
.btn-print{flex:1;background:#2563eb;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600}
.btn-print:hover{background:#1d4ed8}
.btn-png{flex:1;background:#0f172a;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600}
.btn-png:hover{background:#1e293b}
.btn-png:disabled{opacity:.6;cursor:default}
@media print{.btn-row{display:none}body{background:#fff;padding:0}.folleto{box-shadow:none;border-radius:0;max-width:100%;padding:16px}}
</style></head><body>${html}
<script>
function downloadPNG() {
  const btn = document.getElementById('btn-png');
  const nombre = (document.querySelector('.f-name')?.textContent||'estado-cuenta').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;
  html2canvas(document.querySelector('.folleto'), { scale:2, backgroundColor:'#ffffff', useCORS:true }).then(canvas => {
    const a = document.createElement('a');
    a.download = nombre + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    btn.textContent = '📥 Descargar PNG';
    btn.disabled = false;
  }).catch(() => { btn.textContent = '📥 Descargar PNG'; btn.disabled = false; });
}
<\/script></body></html>`);
  w.document.close();
}

function _groupByServicio(items) {
  const map = {};
  items.forEach(it => {
    const key = it.servicio==='kiosko' ? ('kiosko__'+(it.servicioNombre||'')) : it.servicio;
    const nombre = getNombreItem(it);
    if (!map[key]) map[key] = { nombre, cantidad:0, subtotal:0 };
    map[key].cantidad += it.cantidad;
    map[key].subtotal += it.subtotal;
  });
  return Object.values(map).sort((a,b)=>b.subtotal-a.subtotal);
}

function _folletoResumenHTML(titulo, sub, d, servicios, extras) {
  const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const svcs = servicios.length
    ? servicios.map(s=>`<div class="f-row"><div class="f-row-left">${s.nombre}<span class="f-row-sub">${s.cantidad} unid.</span></div><span>${fmt(s.subtotal)}</span></div>`).join('')
      + `<div class="f-row total"><span>Total de servicios</span><span>${fmt(d.total)}</span></div>`
    : '<div class="f-row" style="color:#94a3b8;justify-content:center">Sin servicios registrados</div>';
  return `
    <div class="f-brand">BCE System · Bitácora de Copias Escolares</div>
    <div class="f-name">${titulo}</div>
    <div class="f-sub">${sub} · Año ${DB.year}</div>
    <div class="f-balance-box">
      <div>
        <div class="f-balance-label">Saldo pendiente</div>
        <div class="f-balance-amount${d.pendiente<=0?' ok':''}">${fmt(d.pendiente)}</div>
      </div>
      <div class="f-balance-side">
        Total acumulado<br><strong>${fmt(d.total)}</strong><br>
        Pagado<br><strong style="color:#10b981">${fmt(d.pagado)}</strong>
      </div>
    </div>
    <div class="f-mini-row">
      <div class="f-mini"><div class="f-mini-label">Total generado</div><div class="f-mini-val">${fmt(d.total)}</div></div>
      <div class="f-mini"><div class="f-mini-label">Pagado</div><div class="f-mini-val" style="color:#10b981">${fmt(d.pagado)}</div></div>
    </div>
    <div class="f-sec">Detalle por servicio</div>
    ${svcs}
    ${extras}
    <hr>
    <div class="f-footer"><span>BCE System · Colegio</span><span>Generado el ${fecha}</span></div>
    <div class="btn-row">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / PDF</button>
      <button class="btn-png" id="btn-png" onclick="downloadPNG()">📥 Descargar PNG</button>
    </div>`;
}

function printResumenProfesor(profId) {
  const p = getProfesor(profId);
  if(!p) return;
  const d = calcDeudaProfesor(profId);
  const items = [];
  const opsRel = DB.operaciones.filter(op =>
    op.items.some(it => { const s=getSalon(it.salonId); return (!it.esPersonal&&s&&s.tutorId===profId)||(it.esPersonal&&op.tipo==='profesor'&&op.solicitanteId===profId); })
  );
  opsRel.forEach(op => op.items.forEach(it => {
    const s=getSalon(it.salonId);
    if((!it.esPersonal&&s&&s.tutorId===profId)||(it.esPersonal&&op.tipo==='profesor'&&op.solicitanteId===profId)) items.push(it);
  }));
  const recientes = [...opsRel].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,5);
  const extras = recientes.length ? `
    <div class="f-sec">Últimos encargos</div>
    ${recientes.map(op => {
      const servStr = [...new Set(op.items.map(i=>getNombreItem(i)))].join(', ');
      const portador = (op.alumnoNombre && op.tipo!=='profesor') ? op.alumnoNombre : null;
      return `<div class="f-row"><div class="f-row-left">${fmtDate(op.fecha)}<span class="f-row-sub">${servStr}${portador?' · Portador: '+portador:''}</span></div><span>${fmt(op.total)}</span></div>`;
    }).join('')}`
    + (d.kiosko>0 ? `<div class="f-sec">Kiosco</div><div class="f-row"><div class="f-row-left">Consumo personal kiosco<span class="f-row-sub">productos varios</span></div><span style="color:#f59e0b">${fmt(d.kiosko)}</span></div>` : '')
    : '';
  _printFolletoWindow(`<div class="folleto">${_folletoResumenHTML('Prof. '+p.nombre,'Docente Tutor · '+salonFull(p.tutorDe),d,_groupByServicio(items.filter(i=>i.servicio!=='kiosko')),extras)}</div>`);
}

function printDetalleProfesor(profId) {
  const p = getProfesor(profId);
  if(!p) return;
  const d = calcDeudaProfesor(profId);
  const pagosProf = DB.pagos.filter(pg=>pg.tipo==='profesor'&&pg.entidadId===profId);
  const filas = [];
  DB.operaciones.forEach(op => {
    op.items.forEach(it => {
      if(it.servicio==='kiosko') return;
      const s=getSalon(it.salonId);
      if((!it.esPersonal&&s&&s.tutorId===profId)||(it.esPersonal&&op.tipo==='profesor'&&op.solicitanteId===profId))
        filas.push({ fecha:op.fecha, servicio:getNombreItem(it), salon:it.esPersonal?'Uso personal':salonLabel(it.salonId), cantidad:it.cantidad, precio:it.precio, subtotal:it.subtotal, ref:(!it.esPersonal&&op.alumnoNombre)?op.alumnoNombre:'' });
    });
  });
  filas.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const html = `<div class="folleto wide">
    <div class="f-brand">BCE System · Bitácora de Copias Escolares</div>
    <div class="f-name">Prof. ${p.nombre}</div>
    <div class="f-sub">Docente Tutor · ${salonFull(p.tutorDe)} · Año ${DB.year}</div>
    <div class="f-balance-box">
      <div><div class="f-balance-label">Copias — Saldo pendiente</div><div class="f-balance-amount${d.copias-d.pagado<=0?' ok':''}">${fmt(Math.max(0,d.copias-d.pagado))}</div></div>
      <div class="f-balance-side">Total copias: <strong>${fmt(d.copias)}</strong><br>Total pagado: <strong style="color:#10b981">${fmt(d.pagado)}</strong></div>
    </div>
    <div class="f-sec">Cargos de copias (${filas.length} ítem${filas.length!==1?'s':''})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Servicio</th><th>Salón / Tipo</th><th style="text-align:right">Cant.</th><th class="td-r">Precio</th><th class="td-r">Total</th><th>Ref.</th></tr></thead>
      <tbody>${filas.map(f=>`<tr><td>${fmtDate(f.fecha)}</td><td>${f.servicio}</td><td>${f.salon}</td><td style="text-align:right">${f.cantidad}</td><td class="td-r">${fmt(f.precio)}</td><td class="td-r">${fmt(f.subtotal)}</td><td style="color:#64748b;font-size:10px">${f.ref}</td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;padding:16px;color:#94a3b8">Sin cargos de copias</td></tr>'}</tbody>
      <tfoot><tr><td colspan="5">Total copias</td><td class="td-r">${fmt(d.copias)}</td><td></td></tr></tfoot>
    </table>
    <div class="f-sec">Pagos recibidos (${pagosProf.length})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Método</th><th>Notas</th><th class="td-r">Monto</th></tr></thead>
      <tbody>${pagosProf.map(pg=>`<tr><td>${fmtDate(pg.fecha)}</td><td>${pg.tipoPago==='yape'?'Yape/Plin':pg.tipoPago==='transferencia'?'Transferencia':'Efectivo'}</td><td style="color:#64748b">${pg.notas||'—'}</td><td class="td-r" style="color:#10b981">${fmt(pg.monto)}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;padding:16px;color:#94a3b8">Sin pagos</td></tr>'}</tbody>
      ${pagosProf.length?`<tfoot><tr><td colspan="3">Total pagado</td><td class="td-r" style="color:#10b981">${fmt(d.pagado)}</td></tr></tfoot>`:''}
    </table>
    <hr><div class="f-footer"><span>BCE System · Estado de Cuenta — Copias</span><span>Generado el ${fecha}</span></div>
    <div class="btn-row">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / PDF</button>
      <button class="btn-png" id="btn-png" onclick="downloadPNG()">📥 Descargar PNG</button>
    </div>
  </div>`;
  _printFolletoWindow(html);
}

function printKioskoProfesor(profId) {
  const p = getProfesor(profId);
  if(!p) return;
  const d = calcDeudaProfesor(profId);
  const filas = [];
  DB.operaciones.filter(op=>op.tipo==='profesor'&&op.solicitanteId===profId).forEach(op => {
    op.items.filter(it=>it.servicio==='kiosko').forEach(it => {
      filas.push({ fecha:op.fecha, producto:getNombreItem(it), cantidad:it.cantidad, precio:it.precio, subtotal:it.subtotal });
    });
  });
  filas.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const resumen = {};
  filas.forEach(f => {
    if(!resumen[f.producto]) resumen[f.producto]={ cantidad:0, subtotal:0 };
    resumen[f.producto].cantidad += f.cantidad;
    resumen[f.producto].subtotal += f.subtotal;
  });
  const resumenRows = Object.entries(resumen).sort((a,b)=>b[1].subtotal-a[1].subtotal)
    .map(([nombre,v])=>`<tr><td>${nombre}</td><td style="text-align:right">${v.cantidad}</td><td class="td-r">${fmt(v.subtotal)}</td></tr>`).join('');
  const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const html = `<div class="folleto wide">
    <div class="f-brand">BCE System · Bitácora de Copias Escolares</div>
    <div class="f-name">Prof. ${p.nombre}</div>
    <div class="f-sub">Docente Tutor · ${salonFull(p.tutorDe)} · Año ${DB.year}</div>
    <div class="f-balance-box">
      <div><div class="f-balance-label">Kiosco — Total consumido</div><div class="f-balance-amount" style="color:#f59e0b">${fmt(d.kiosko)}</div></div>
      <div class="f-balance-side">${filas.length} compra${filas.length!==1?'s':''}<br><strong>${Object.keys(resumen).length} producto${Object.keys(resumen).length!==1?'s':''} distintos</strong></div>
    </div>
    <div class="f-sec">Resumen por producto</div>
    <table class="f-table">
      <thead><tr><th>Producto</th><th style="text-align:right">Cant. total</th><th class="td-r">Total S/</th></tr></thead>
      <tbody>${resumenRows||'<tr><td colspan="3" style="text-align:center;padding:16px;color:#94a3b8">Sin consumo</td></tr>'}</tbody>
      <tfoot><tr><td colspan="2">Total kiosco</td><td class="td-r">${fmt(d.kiosko)}</td></tr></tfoot>
    </table>
    <div class="f-sec">Detalle de compras (${filas.length})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Producto</th><th style="text-align:right">Cant.</th><th class="td-r">Precio</th><th class="td-r">Subtotal</th></tr></thead>
      <tbody>${filas.map(f=>`<tr><td>${fmtDate(f.fecha)}</td><td>${f.producto}</td><td style="text-align:right">${f.cantidad}</td><td class="td-r">${fmt(f.precio)}</td><td class="td-r">${fmt(f.subtotal)}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:16px;color:#94a3b8">Sin compras</td></tr>'}</tbody>
    </table>
    <hr><div class="f-footer"><span>BCE System · Estado de Cuenta — Kiosco</span><span>Generado el ${fecha}</span></div>
    <div class="btn-row">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / PDF</button>
      <button class="btn-png" id="btn-png" onclick="downloadPNG()">📥 Descargar PNG</button>
    </div>
  </div>`;
  _printFolletoWindow(html);
}

function printResumenAlumno(alumnoId) {
  const a = getAlumno(alumnoId);
  if(!a) return;
  const d = calcDeudaAlumno(a.id, a.nombre);
  const items = [];
  DB.operaciones.forEach(op => {
    if(op.tipo==='alumno'&&(op.solicitanteId===a.id||(!op.solicitanteId&&op.alumnoNombre===a.nombre)))
      op.items.filter(it=>it.esPersonal).forEach(it=>items.push(it));
  });
  const salon = getSalon(a.salonId);
  const sub = `Alumno · ${salonFull(a.salonId)}${salon?' · '+salon.nivel:''}`;
  _printFolletoWindow(`<div class="folleto">${_folletoResumenHTML(a.nombre,sub,d,_groupByServicio(items),'')}</div>`);
}

function printDetalleAlumno(alumnoId) {
  const a = getAlumno(alumnoId);
  if(!a) return;
  const d = calcDeudaAlumno(a.id, a.nombre);
  const pagosAlu = DB.pagos.filter(pg=>pg.tipo==='alumno'&&(pg.entidadId===a.id||pg.nombre===a.nombre));
  const filas = [];
  DB.operaciones.forEach(op => {
    if(op.tipo==='alumno'&&(op.solicitanteId===a.id||(!op.solicitanteId&&op.alumnoNombre===a.nombre)))
      op.items.filter(it=>it.esPersonal).forEach(it=>
        filas.push({ fecha:op.fecha, servicio:servicioNombre(it.servicio), cantidad:it.cantidad, precio:it.precio, subtotal:it.subtotal })
      );
  });
  filas.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const salon = getSalon(a.salonId);
  const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const html = `<div class="folleto wide">
    <div class="f-brand">BCE System · Bitácora de Copias Escolares</div>
    <div class="f-name">${a.nombre}</div>
    <div class="f-sub">Alumno · ${salonFull(a.salonId)}${salon?' · '+salon.nivel:''} · Año ${DB.year}</div>
    <div class="f-balance-box">
      <div><div class="f-balance-label">Saldo pendiente</div><div class="f-balance-amount${d.pendiente<=0?' ok':''}">${fmt(d.pendiente)}</div></div>
      <div class="f-balance-side">Total cargos: <strong>${fmt(d.total)}</strong><br>Total pagado: <strong style="color:#10b981">${fmt(d.pagado)}</strong></div>
    </div>
    <div class="f-sec">Cargos (${filas.length} ítem${filas.length!==1?'s':''})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Servicio</th><th style="text-align:right">Cant.</th><th class="td-r">Precio</th><th class="td-r">Total</th></tr></thead>
      <tbody>${filas.map(f=>`<tr><td>${fmtDate(f.fecha)}</td><td>${f.servicio}</td><td style="text-align:right">${f.cantidad}</td><td class="td-r">${fmt(f.precio)}</td><td class="td-r">${fmt(f.subtotal)}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:16px;color:#94a3b8">Sin cargos</td></tr>'}</tbody>
      <tfoot><tr><td colspan="4">Total cargos</td><td class="td-r">${fmt(d.total)}</td></tr></tfoot>
    </table>
    <div class="f-sec">Pagos recibidos (${pagosAlu.length})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Método</th><th>Notas</th><th class="td-r">Monto</th></tr></thead>
      <tbody>${pagosAlu.map(pg=>`<tr><td>${fmtDate(pg.fecha)}</td><td>${pg.tipoPago==='yape'?'Yape/Plin':pg.tipoPago==='transferencia'?'Transferencia':'Efectivo'}</td><td style="color:#64748b">${pg.notas||'—'}</td><td class="td-r" style="color:#10b981">${fmt(pg.monto)}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;padding:16px;color:#94a3b8">Sin pagos</td></tr>'}</tbody>
      ${pagosAlu.length?`<tfoot><tr><td colspan="3">Total pagado</td><td class="td-r" style="color:#10b981">${fmt(d.pagado)}</td></tr></tfoot>`:''}
    </table>
    <hr><div class="f-footer"><span>BCE System · Estado de Cuenta Detallado</span><span>Generado el ${fecha}</span></div>
    <div class="btn-row">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / PDF</button>
      <button class="btn-png" id="btn-png" onclick="downloadPNG()">📥 Descargar PNG</button>
    </div>
  </div>`;
  _printFolletoWindow(html);
}

function printResumenDireccion() {
  const opsDir = DB.operaciones.filter(o=>o.tipo==='direccion');
  const pagosDir = DB.pagos.filter(p=>p.tipo==='direccion');
  const total = opsDir.reduce((a,o)=>a+o.total,0);
  const pagado = pagosDir.reduce((a,p)=>a+p.monto,0);
  const pendiente = Math.max(0,total-pagado);
  const responsables = [...new Set(opsDir.map(op=>op.dirResponsable).filter(Boolean))];
  const extras = responsables.length ? `<div class="f-sec">Responsables</div><div class="f-row"><span>${responsables.join(' · ')}</span></div>` : '';
  _printFolletoWindow(`<div class="folleto">${_folletoResumenHTML('Dirección del Colegio','Cuenta institucional',{total,pagado,pendiente},_groupByServicio(opsDir.flatMap(op=>op.items)),extras)}</div>`);
}

function printDetalleDireccion() {
  const opsDir = DB.operaciones.filter(o=>o.tipo==='direccion').sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const pagosDir = DB.pagos.filter(p=>p.tipo==='direccion');
  const total = opsDir.reduce((a,o)=>a+o.total,0);
  const pagado = pagosDir.reduce((a,p)=>a+p.monto,0);
  const pendiente = Math.max(0,total-pagado);
  const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  const html = `<div class="folleto wide">
    <div class="f-brand">BCE System · Bitácora de Copias Escolares</div>
    <div class="f-name">Dirección del Colegio</div>
    <div class="f-sub">Cuenta institucional · Año ${DB.year}</div>
    <div class="f-balance-box">
      <div><div class="f-balance-label">Saldo pendiente</div><div class="f-balance-amount${pendiente<=0?' ok':''}">${fmt(pendiente)}</div></div>
      <div class="f-balance-side">Total cargos: <strong>${fmt(total)}</strong><br>Total pagado: <strong style="color:#10b981">${fmt(pagado)}</strong></div>
    </div>
    <div class="f-sec">Operaciones (${opsDir.length})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Servicios</th><th>Ordena</th><th>Recoge</th><th class="td-r">Total</th></tr></thead>
      <tbody>${opsDir.map(op=>`<tr><td>${fmtDate(op.fecha)}</td><td>${op.items.map(i=>servicioNombre(i.servicio)+' ×'+i.cantidad).join(', ')}</td><td>${op.dirResponsable||'—'}</td><td>${op.dirPortador&&op.dirPortador!==op.dirResponsable?op.dirPortador:'—'}</td><td class="td-r">${fmt(op.total)}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:16px;color:#94a3b8">Sin operaciones</td></tr>'}</tbody>
      <tfoot><tr><td colspan="4">Total cargos</td><td class="td-r">${fmt(total)}</td></tr></tfoot>
    </table>
    <div class="f-sec">Pagos recibidos (${pagosDir.length})</div>
    <table class="f-table">
      <thead><tr><th>Fecha</th><th>Método</th><th>Notas</th><th class="td-r">Monto</th></tr></thead>
      <tbody>${pagosDir.map(pg=>`<tr><td>${fmtDate(pg.fecha)}</td><td>${pg.tipoPago==='yape'?'Yape/Plin':pg.tipoPago==='transferencia'?'Transferencia':'Efectivo'}</td><td style="color:#64748b">${pg.notas||'—'}</td><td class="td-r" style="color:#10b981">${fmt(pg.monto)}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;padding:16px;color:#94a3b8">Sin pagos</td></tr>'}</tbody>
      ${pagosDir.length?`<tfoot><tr><td colspan="3">Total pagado</td><td class="td-r" style="color:#10b981">${fmt(pagado)}</td></tr></tfoot>`:''}
    </table>
    <hr><div class="f-footer"><span>BCE System · Estado de Cuenta Detallado</span><span>Generado el ${fecha}</span></div>
    <div class="btn-row">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / PDF</button>
      <button class="btn-png" id="btn-png" onclick="downloadPNG()">📥 Descargar PNG</button>
    </div>
  </div>`;
  _printFolletoWindow(html);
}
