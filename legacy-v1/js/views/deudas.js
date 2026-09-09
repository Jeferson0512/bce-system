/* =============================================
   BCE System — Views: Deudas (Profesores, Alumnos, Dirección)
   ============================================= */

const DEUDAPROF = { query:'', nivel:'', estado:'' };
const DEUDAALU  = { query:'', salonId:'' };

/* ---- DEUDAS PROFESORES ---- */

function viewDeudasProfesores() {
  DEUDAPROF.query=''; DEUDAPROF.nivel=''; DEUDAPROF.estado='';
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Deudas — Profesores</h1>
      <p class="page-subtitle" id="deudaprof-count">Calculando…</p>
    </div>
    <div class="page-actions">
      <div class="export-drop-wrap" id="deudaprof-export-drop">
        <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('deudaprof-export-drop')">
          <i data-lucide="download"></i> Exportar <i data-lucide="chevron-down"></i>
        </button>
        <div class="export-drop-menu">
          <div class="export-drop-item" onclick="BCE.deudaProfExportCSV()"><i data-lucide="file-text"></i> CSV / Excel</div>
          <div class="export-drop-item" onclick="BCE.deudaProfExportPDF()"><i data-lucide="file"></i> PDF / Imprimir</div>
        </div>
      </div>
      <button class="btn btn-success btn-sm" onclick="BCE.openModalPago('profesor')">
        <i data-lucide="banknote"></i> Registrar Pago
      </button>
    </div>
  </div>

  <div class="grid-stats mb-5" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon orange"><i data-lucide="clock"></i></div>
        <div class="stat-value" id="deudaprof-stat-pendiente">—</div>
      </div>
      <div class="stat-label">Total pendiente</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon red"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-value" id="deudaprof-stat-condeuda">—</div>
      </div>
      <div class="stat-label">Con deuda pendiente</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        <div class="stat-value" id="deudaprof-stat-aldia">—</div>
      </div>
      <div class="stat-label">Al día</div>
    </div>
  </div>

  <div class="card mb-4">
    <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
      <div class="search-box" style="flex:1;min-width:180px">
        <i data-lucide="search"></i>
        <input type="text" class="form-control" id="deudaprof-search" placeholder="Buscar profesor..."
               oninput="BCE.deudaProfSearch(this.value,null,null)">
      </div>
      <select class="form-control" style="width:160px" onchange="BCE.deudaProfSearch(null,this.value,null)">
        <option value="">Todos los niveles</option>
        <option value="Primaria">Primaria</option>
        <option value="Secundaria">Secundaria</option>
      </select>
      <select class="form-control" style="width:160px" onchange="BCE.deudaProfSearch(null,null,this.value)">
        <option value="">Todos los estados</option>
        <option value="deuda">Con deuda</option>
        <option value="al-dia">Al día</option>
      </select>
    </div>
  </div>

  <div class="card">
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>Profesor</th><th>Tutor de</th><th>Nivel</th>
            <th class="td-right">Copias</th><th class="td-right">Kiosco</th>
            <th class="td-right">Pagado</th><th class="td-right">Pendiente</th>
            <th>Estado</th><th>Acciones</th>
          </tr></thead>
          <tbody id="deudaprof-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function deudaProfGetFiltered() {
  const q = DEUDAPROF.query.toLowerCase();
  return DB.profesores.filter(p => {
    if(!p.tutorDe) return false;
    if(q && !p.nombre.toLowerCase().includes(q)) return false;
    const s = getSalon(p.tutorDe);
    if(DEUDAPROF.nivel && s?.nivel !== DEUDAPROF.nivel) return false;
    const d = calcDeudaProfesor(p.id);
    if(DEUDAPROF.estado==='deuda'  && d.pendiente<=0) return false;
    if(DEUDAPROF.estado==='al-dia' && d.pendiente>0)  return false;
    return true;
  });
}

function deudaProfRefresh() {
  const filtered = deudaProfGetFiltered();
  const allTutores = DB.profesores.filter(p=>p.tutorDe).map(p=>({...p,...calcDeudaProfesor(p.id)}));
  const totalPend  = allTutores.reduce((a,p)=>a+p.pendiente,0);
  const conDeuda   = allTutores.filter(p=>p.pendiente>0).length;
  const alDia      = allTutores.filter(p=>p.pendiente<=0).length;

  const sp=document.getElementById('deudaprof-stat-pendiente');
  const sc=document.getElementById('deudaprof-stat-condeuda');
  const sa=document.getElementById('deudaprof-stat-aldia');
  if(sp) sp.textContent=fmt(totalPend);
  if(sc) sc.textContent=conDeuda;
  if(sa) sa.textContent=alDia;

  const lbl=document.getElementById('deudaprof-count');
  if(lbl) lbl.textContent=`${filtered.length} profesor${filtered.length!==1?'es':''} ${DEUDAPROF.query||DEUDAPROF.nivel||DEUDAPROF.estado?'encontrados':'registrados'}`;

  const tbody=document.getElementById('deudaprof-tbody');
  if(!tbody) return;
  tbody.innerHTML=filtered.map(p=>{
    const d=calcDeudaProfesor(p.id), s=getSalon(p.tutorDe);
    const estado=d.pendiente<=0?'al-dia':d.pendiente>20?'alto':'medio';
    const badge=estado==='al-dia'
      ?`<span class="badge badge-success">Al día</span>`
      :estado==='alto'
      ?`<span class="badge badge-danger">Deuda alta</span>`
      :`<span class="badge badge-warning">Pendiente</span>`;
    return `<tr>
      <td><div class="flex items-center gap-2">
        <div class="avatar avatar-sm ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
        <span class="td-bold">${p.nombre}</span>
      </div></td>
      <td><span class="badge ${s?.nivel==='Primaria'?'nivel-primaria':'nivel-secundaria'}">${salonFull(p.tutorDe)}</span></td>
      <td class="text-sm text-muted">${s?.nivel||'—'}</td>
      <td class="td-right td-mono">${fmt(d.copias)}</td>
      <td class="td-right td-mono">${d.kiosko>0?`<span style="color:var(--warning)">${fmt(d.kiosko)}</span>`:'<span class="text-muted">—</span>'}</td>
      <td class="td-right td-mono text-success">${fmt(d.pagado)}</td>
      <td class="td-right td-mono font-bold ${d.pendiente>0?'text-danger':''}">${fmt(d.pendiente)}</td>
      <td>${badge}</td>
      <td><div class="flex gap-2">
        <button class="btn btn-sm btn-secondary" onclick="BCE.openDetalleProfesor('${p.id}')"><i data-lucide="eye"></i> Ver</button>
        ${d.pendiente>0?`<button class="btn btn-sm btn-success" onclick="BCE.openModalPago('profesor','${p.id}')"><i data-lucide="banknote"></i></button>`:''}
        <div class="export-drop-wrap" id="print-prof-${p.id}">
          <button class="btn btn-sm btn-secondary" onclick="BCE.toggleExportDrop('print-prof-${p.id}')"><i data-lucide="printer"></i></button>
          <div class="export-drop-menu">
            <div class="export-drop-item" onclick="BCE.printResumenProfesor('${p.id}')"><i data-lucide="file-text"></i> Resumen</div>
            <div class="export-drop-item" onclick="BCE.printDetalleProfesor('${p.id}')"><i data-lucide="scroll-text"></i> Estado de cuenta — Copias</div>
            ${d.kiosko>0?`<div class="export-drop-item" onclick="BCE.printKioskoProfesor('${p.id}')"><i data-lucide="shopping-bag"></i> Estado de cuenta — Kiosco</div>`:''}
          </div>
        </div>
      </div></td>
    </tr>`;
  }).join('')||`<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--t-300)">Sin resultados</td></tr>`;
  lucide.createIcons();
}

function deudaProfSearch(q, nivel, estado) {
  if(q!==null) DEUDAPROF.query=(q||'').toLowerCase();
  if(nivel!==null&&nivel!==undefined) DEUDAPROF.nivel=nivel||'';
  if(estado!==null&&estado!==undefined) DEUDAPROF.estado=estado||'';
  deudaProfRefresh();
}

function deudaProfExportCSV() {
  const rows = deudaProfGetFiltered().map(p=>{
    const d=calcDeudaProfesor(p.id), s=getSalon(p.tutorDe);
    return [p.nombre, salonFull(p.tutorDe), s?.nivel||'', parseFloat(d.total).toFixed(2), parseFloat(d.pagado).toFixed(2), parseFloat(d.pendiente).toFixed(2), d.pendiente<=0?'Al día':'Con deuda'];
  });
  exportCSV(`deudas_profesores_${today()}.csv`, ['Nombre','Salón Tutor','Nivel','Total (S/)','Pagado (S/)','Pendiente (S/)','Estado'], rows);
}

function deudaProfExportPDF() {
  const profes = deudaProfGetFiltered().map(p=>{
    const d=calcDeudaProfesor(p.id), s=getSalon(p.tutorDe);
    return {...p,...d, salon:salonFull(p.tutorDe), nivel:s?.nivel||''};
  });
  const totalPend = profes.reduce((a,p)=>a+p.pendiente,0);
  const rows = profes.map(p=>`<tr>
    <td>${p.nombre}</td><td>${p.salon}</td><td>${p.nivel}</td>
    <td class="td-right">${fmt(p.total)}</td>
    <td class="td-right">${fmt(p.pagado)}</td>
    <td class="td-right">${fmt(p.pendiente)}</td>
    <td>${p.pendiente<=0?'Al día':'Con deuda'}</td>
  </tr>`).join('');
  const html=`<table>
    <thead><tr><th>Profesor</th><th>Salón Tutor</th><th>Nivel</th><th class="td-right">Total</th><th class="td-right">Pagado</th><th class="td-right">Pendiente</th><th>Estado</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="5">Total pendiente</td><td class="td-right">${fmt(totalPend)}</td><td></td></tr></tfoot>
  </table>`;
  printPDF('Deudas — Profesores', `Año ${DB.year} · ${profes.length} profesores`, html);
}

function openDetalleProfesor(profId) {
  const p = getProfesor(profId);
  if(!p) return;
  const d = calcDeudaProfesor(profId);
  const salon = getSalon(p.tutorDe);
  const opsRelacionadas = DB.operaciones.filter(op=>
    op.items.some(it=>{ const s=getSalon(it.salonId); return s&&s.tutorId===profId; })
    || (op.tipo==='profesor'&&op.solicitanteId===profId&&op.items.some(it=>it.esPersonal))
  );

  const body = `
    <div class="flex items-center gap-14 mb-5" style="padding:16px;background:var(--bg-muted);border-radius:var(--r-lg)">
      <div class="avatar avatar-xl ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
      <div class="flex-1">
        <div class="text-xl font-bold">${p.nombre}</div>
        <div class="text-sm text-muted mt-1">Tutor de ${salonFull(p.tutorDe)}</div>
        <div class="flex gap-2 mt-2">
          <span class="badge ${salon?.nivel==='Primaria'?'nivel-primaria':'nivel-secundaria'}">${salon?.nivel}</span>
          <span class="badge badge-neutral">Año ${DB.year}</span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-muted">Pendiente total</div>
        <div class="text-2xl font-bold ${d.pendiente>0?'text-danger':'text-success'}">${fmt(d.pendiente)}</div>
        <div class="text-xs text-muted" style="margin-top:3px">Copias: ${fmt(d.copias)} · Kiosco: ${fmt(d.kiosko)}</div>
      </div>
    </div>

    <!-- SECCIÓN: COPIAS Y SERVICIOS -->
    <h4 class="font-semibold text-sm mb-3" style="color:var(--t-500);text-transform:uppercase;letter-spacing:.5px">
      <i data-lucide="copy" style="width:13px;height:13px;vertical-align:middle;margin-right:4px"></i>Copias y Servicios
    </h4>
    <div class="table-wrap" style="margin-bottom:20px">
      <table class="table">
        <thead><tr><th>Fecha</th><th>Solicitante</th><th>Servicio</th><th>Salón</th><th>Cant.</th><th class="td-right">Precio</th><th class="td-right">Subtotal</th></tr></thead>
        <tbody>
          ${(()=>{
            const filasCopias = opsRelacionadas.flatMap(op=>
              op.items.filter(it=> it.servicio!=='kiosko' && ((getSalon(it.salonId)?.tutorId===profId)||(!it.esPersonal===false && it.esPersonal && op.tipo==='profesor' && op.solicitanteId===profId)) ).map(it=>`
              <tr>
                <td class="text-sm text-muted">${fmtDate(op.fecha)}</td>
                <td class="td-bold">${solicitanteLabel(op)}</td>
                <td class="text-sm">${getNombreItem(it)}</td>
                <td class="text-sm text-muted">${it.salonId?salonLabel(it.salonId):'<em>Personal</em>'}</td>
                <td class="td-center">${it.cantidad}</td>
                <td class="td-right td-mono">${fmt(it.precio)}</td>
                <td class="td-right td-bold">${fmt(it.subtotal)}</td>
              </tr>`));
            return filasCopias.join('') || '<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--t-300)">Sin cargos de copias</td></tr>';
          })()}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-muted)">
            <td colspan="6" class="font-semibold">Subtotal copias</td>
            <td class="td-right font-bold">${fmt(d.copias)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- SECCIÓN: KIOSCO -->
    <h4 class="font-semibold text-sm mb-3" style="color:var(--t-500);text-transform:uppercase;letter-spacing:.5px">
      <i data-lucide="shopping-bag" style="width:13px;height:13px;vertical-align:middle;margin-right:4px"></i>Consumo Kiosco
    </h4>
    <div class="table-wrap" style="margin-bottom:20px">
      <table class="table">
        <thead><tr><th>Fecha</th><th>Producto</th><th>Cant.</th><th class="td-right">Precio</th><th class="td-right">Subtotal</th></tr></thead>
        <tbody>
          ${(()=>{
            const opsPersonales = DB.operaciones.filter(op=> op.tipo==='profesor' && op.solicitanteId===profId && op.items.some(it=>it.servicio==='kiosko'));
            const filasKiosko = opsPersonales.flatMap(op=>
              op.items.filter(it=>it.servicio==='kiosko').map(it=>`
              <tr>
                <td class="text-sm text-muted">${fmtDate(op.fecha)}</td>
                <td class="font-medium text-sm">${getNombreItem(it)}</td>
                <td class="td-center">${it.cantidad}</td>
                <td class="td-right td-mono">${fmt(it.precio)}</td>
                <td class="td-right td-bold">${fmt(it.subtotal)}</td>
              </tr>`));
            return filasKiosko.join('') || '<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--t-300)">Sin consumo de kiosco</td></tr>';
          })()}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-muted)">
            <td colspan="4" class="font-semibold">Subtotal kiosco</td>
            <td class="td-right font-bold">${fmt(d.kiosko)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- TOTALES GENERALES -->
    <div class="table-wrap">
      <table class="table">
        <tfoot>
          <tr style="background:var(--bg-muted)">
            <td colspan="1" class="font-semibold">Total general</td>
            <td class="td-right font-bold">${fmt(d.total)}</td>
          </tr>
          <tr style="background:var(--success-subtle)">
            <td colspan="1" class="font-semibold text-success">Pagado</td>
            <td class="td-right font-bold text-success">${fmt(d.pagado)}</td>
          </tr>
          <tr style="background:var(--danger-subtle)">
            <td colspan="1" class="font-semibold text-danger">Pendiente</td>
            <td class="td-right font-bold text-danger">${fmt(d.pendiente)}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cerrar</button>
    ${d.pendiente>0?`<button class="btn btn-success" onclick="BCE.closeModal();BCE.openModalPago('profesor','${profId}')"><i data-lucide="banknote"></i> Registrar Pago</button>`:''}
    <button class="btn btn-secondary" onclick="BCE.printDetalleProfesor('${profId}')"><i data-lucide="printer"></i> Copias</button>
    ${d.kiosko>0?`<button class="btn btn-secondary" onclick="BCE.printKioskoProfesor('${profId}')"><i data-lucide="shopping-bag"></i> Kiosco</button>`:''}`;

  openModal(`Cuenta: ${p.nombre}`, body, footer, 'modal-xl');
}

function openModalPago(tipo, entidadId) {
  tipo = tipo || 'profesor';
  const p = (tipo==='profesor'&&entidadId) ? getProfesor(entidadId) : null;
  const a = (tipo==='alumno'&&entidadId)   ? getAlumno(entidadId)   : null;
  const d = p ? calcDeudaProfesor(entidadId) : a ? calcDeudaAlumno(entidadId, a.nombre) : null;

  if (d && d.pendiente <= 0) {
    const body = `
      <div class="alert alert-success">
        <i data-lucide="check-circle"></i>
        <span><strong>${p?.nombre||a?.nombre}</strong> está al día — no tiene saldo pendiente.</span>
      </div>`;
    const footer = `<button class="btn btn-secondary" onclick="BCE.closeModal()">Cerrar</button>`;
    openModal('Sin deuda pendiente', body, footer);
    return;
  }

  const radioCard = (val, icon, label, sel) =>
    `<label class="radio-card${sel?' selected':''}" data-tipopago="${val}"
      onclick="document.querySelectorAll('#modal-body .radio-card').forEach(r=>r.classList.remove('selected'));this.classList.add('selected')">
      <i data-lucide="${icon}"></i><span class="radio-card-label">${label}</span>
    </label>`;

  let entityBlock = '';
  if (!entidadId) {
    if (tipo === 'profesor') {
      const conDeuda = DB.profesores.filter(pr => pr.tutorDe && calcDeudaProfesor(pr.id).pendiente > 0);
      entityBlock = `
      <div class="form-group" id="pago-entidad-grp">
        <label class="form-label">Seleccionar profesor <span class="required">*</span></label>
        <select class="form-control" id="pago-entidad-select">
          <option value="">— Seleccione —</option>
          ${conDeuda.map(pr=>`<option value="${pr.id}">${pr.nombre} · ${salonLabel(pr.tutorDe)} · debe ${fmt(calcDeudaProfesor(pr.id).pendiente)}</option>`).join('')}
        </select>
        ${conDeuda.length===0?'<p class="text-sm text-success mt-1">✓ Todos los profesores están al día.</p>':''}
      </div>`;
    } else if (tipo === 'alumno') {
      const conDeuda = DB.alumnos.filter(al => calcDeudaAlumno(al.id, al.nombre).pendiente > 0);
      entityBlock = `
      <div class="form-group" id="pago-entidad-grp">
        <label class="form-label">Seleccionar alumno <span class="required">*</span></label>
        <select class="form-control" id="pago-entidad-select">
          <option value="">— Seleccione —</option>
          ${conDeuda.map(al=>`<option value="${al.id}">${al.nombre} · ${salonLabel(al.salonId)} · debe ${fmt(calcDeudaAlumno(al.id, al.nombre).pendiente)}</option>`).join('')}
        </select>
        ${conDeuda.length===0?'<p class="text-sm text-success mt-1">✓ Todos los alumnos están al día.</p>':''}
      </div>`;
    }
  }

  const body = `
    <div class="flex flex-col gap-4">
      ${d?`<div class="alert alert-info"><i data-lucide="user"></i><span>Registrando pago para <strong>${p?.nombre||a?.nombre}</strong> — Pendiente: <strong>${fmt(d.pendiente)}</strong></span></div>`:''}
      ${entityBlock}
      <div class="form-group">
        <label class="form-label">Monto a pagar <span class="required">*</span></label>
        <div class="input-group">
          <span class="input-addon input-addon-left">S/</span>
          <input type="number" class="form-control" id="pago-monto" step="0.10" min="0.10"
                 placeholder="0.00" value="${d&&d.pendiente>0?d.pendiente.toFixed(2):''}">
        </div>
        ${d?`<p class="text-xs text-muted mt-1">Máximo: ${fmt(d.pendiente)}</p>`:''}
      </div>
      <div class="form-group">
        <label class="form-label">Forma de pago</label>
        <div class="radio-group">
          ${radioCard('efectivo','banknote','Efectivo',true)}
          ${radioCard('yape','smartphone','Yape / Plin',false)}
          ${radioCard('transferencia','credit-card','Transferencia',false)}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notas</label>
        <input type="text" class="form-control" id="pago-notas" placeholder="Referencia, observaciones...">
      </div>
    </div>`;
  const footer = `
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cancelar</button>
    <button class="btn btn-success" onclick="BCE.pagoConfirmar('${tipo}','${entidadId||''}')">
      <i data-lucide="check"></i> Confirmar Pago
    </button>`;
  openModal('Registrar Pago', body, footer);
}

function _pagoTipoChange(tipo) {
  const grp=document.getElementById('pago-entidad-grp');
  const sel=document.getElementById('pago-entidad-select');
  const lbl=grp?.querySelector('label');
  if(!grp||!sel) return;
  if(tipo==='profesor') {
    if(lbl) lbl.innerHTML='Seleccionar profesor <span class="required">*</span>';
    sel.innerHTML=`<option value="">— Seleccione —</option>${DB.profesores.filter(p=>p.tutorDe).map(p=>`<option value="${p.id}">${p.nombre} · ${salonLabel(p.tutorDe)}</option>`).join('')}`;
    grp.style.display='';
  } else if(tipo==='alumno') {
    if(lbl) lbl.innerHTML='Seleccionar alumno <span class="required">*</span>';
    sel.innerHTML=`<option value="">— Seleccione —</option>${DB.alumnos.map(a=>`<option value="${a.id}">${a.nombre} · ${salonLabel(a.salonId)}</option>`).join('')}`;
    grp.style.display='';
  } else {
    grp.style.display='none';
  }
}

function pagoConfirmar(tipo, entidadId) {
  const monto = parseFloat(document.getElementById('pago-monto')?.value||0);
  if(!monto||monto<=0) { toast('Ingresa un monto válido','danger'); return; }
  const tipoPagoEl = document.querySelector('#modal-body .radio-card.selected');
  const tipoPago   = tipoPagoEl?.dataset.tipopago || 'efectivo';
  const notas      = document.getElementById('pago-notas')?.value||'';
  const realId = entidadId || (tipo!=='direccion' ? document.getElementById('pago-entidad-select')?.value||'' : '');
  if(!realId && tipo!=='direccion') { toast('Selecciona a quién se registra el pago','danger'); return; }

  let pendiente = Infinity;
  if(tipo==='profesor' && realId) {
    const d = calcDeudaProfesor(realId);
    pendiente = d.pendiente;
    if(pendiente <= 0) { toast('Este profesor no tiene deuda pendiente','warning'); return; }
  } else if(tipo==='alumno' && realId) {
    const al = getAlumno(realId);
    const d  = calcDeudaAlumno(realId, al?.nombre||'');
    pendiente = d.pendiente;
    if(pendiente <= 0) { toast('Este alumno no tiene deuda pendiente','warning'); return; }
  } else if(tipo==='direccion') {
    const total  = DB.operaciones.filter(o=>o.tipo==='direccion').reduce((a,o)=>a+o.total,0);
    const pagado = DB.pagos.filter(p=>p.tipo==='direccion').reduce((a,p)=>a+p.monto,0);
    pendiente = total - pagado;
    if(pendiente <= 0) { toast('La dirección no tiene deuda pendiente','warning'); return; }
  }
  if(monto > pendiente + 0.001) {
    toast(`El monto excede el saldo pendiente (${fmt(pendiente)})`, 'danger');
    return;
  }

  DB.pagos.push({ id:'PG'+String(DB.pagos.length+1).padStart(3,'0'), fecha:today(), tipo, entidadId:realId, monto, tipoPago, notas });
  saveDB();
  closeModal();
  toast('Pago registrado correctamente','success');
  if(currentRoute==='deudas/profesores')     deudaProfRefresh();
  else if(currentRoute==='deudas/alumnos')   deudaAluRefresh();
  else if(currentRoute==='deudas/direccion') _doNavigate('deudas/direccion');
}

/* ---- DEUDAS ALUMNOS ---- */

function viewDeudasAlumnos() {
  DEUDAALU.query=''; DEUDAALU.salonId='';
  return `
  <div class="page-header">
    <div><h1 class="page-title">Deudas — Alumnos</h1>
    <p class="page-subtitle" id="deudaalu-count">Calculando…</p></div>
    <div class="page-actions">
      <div class="export-drop-wrap" id="deudaalu-export-drop">
        <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('deudaalu-export-drop')">
          <i data-lucide="download"></i> Exportar <i data-lucide="chevron-down"></i>
        </button>
        <div class="export-drop-menu">
          <div class="export-drop-item" onclick="BCE.deudaAluExportCSV()"><i data-lucide="file-text"></i> CSV / Excel</div>
          <div class="export-drop-item" onclick="BCE.deudaAluExportPDF()"><i data-lucide="file"></i> PDF / Imprimir</div>
        </div>
      </div>
      <button class="btn btn-success btn-sm" onclick="BCE.openModalPago('alumno')">
        <i data-lucide="banknote"></i> Registrar Pago
      </button>
    </div>
  </div>
  <div class="alert alert-info mb-4">
    <i data-lucide="info"></i>
    <span>Solo se muestran alumnos con <strong>servicios personales</strong> (copias/impresiones propias, no enviadas por su profesor).</span>
  </div>
  <div class="card mb-3">
    <div class="card-body" style="display:flex;gap:10px">
      <div class="search-box" style="flex:1">
        <i data-lucide="search"></i>
        <input class="form-control" id="deudaalu-search" placeholder="Buscar alumno..."
               oninput="BCE.deudaAluSearch(this.value)">
      </div>
      <select class="form-control" style="width:180px" onchange="BCE.deudaAluSetSalon(this.value)">
        <option value="">Todos los salones</option>
        ${DB.salones.map(s=>`<option value="${s.id}">${salonFull(s.id)}</option>`).join('')}
      </select>
    </div>
  </div>
  <div id="deudaalu-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px"></div>`;
}

function deudaAluGetFiltered() {
  const q = DEUDAALU.query.toLowerCase();
  return DB.alumnos.filter(a => {
    const d = calcDeudaAlumno(a.id, a.nombre);
    if(d.total===0) return false;
    if(q && !a.nombre.toLowerCase().includes(q)) return false;
    if(DEUDAALU.salonId && a.salonId!==DEUDAALU.salonId) return false;
    return true;
  });
}

function deudaAluRefresh() {
  const alumnos = deudaAluGetFiltered().map(a=>({...a,...calcDeudaAlumno(a.id,a.nombre)}));
  const lbl = document.getElementById('deudaalu-count');
  if(lbl) lbl.textContent=`${alumnos.length} alumno${alumnos.length!==1?'s':''} con servicios personales`;
  const el = document.getElementById('deudaalu-cards');
  if(!el) return;
  el.innerHTML = alumnos.length ? alumnos.map(a=>{
    const s = getSalon(a.salonId);
    const pct = a.total>0 ? Math.round((a.pagado/a.total)*100) : 100;
    return `<div class="debt-card" style="cursor:pointer" onclick="BCE.openDetalleAlumno('${a.id}')">
      <div class="avatar avatar-md av-blue">${slugAvatar(a.nombre)}</div>
      <div class="debt-info">
        <div class="debt-name">${a.nombre}</div>
        <div class="debt-sub">${salonFull(a.salonId)} · ${s?.nivel||''}</div>
        <div class="mt-2 progress-bar-track">
          <div class="progress-bar-fill ${a.pendiente>0?'fill-danger':'fill-success'}" style="width:${pct}%"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="debt-amount ${a.pendiente>0?'text-danger':'text-success'}">${fmt(a.pendiente)}</div>
        <div class="debt-paid-badge">de ${fmt(a.total)}</div>
        <div class="export-drop-wrap" id="print-alu-${a.id}">
          <button class="btn btn-sm btn-secondary" style="padding:3px 8px" onclick="event.stopPropagation();BCE.toggleExportDrop('print-alu-${a.id}')"><i data-lucide="printer"></i></button>
          <div class="export-drop-menu">
            <div class="export-drop-item" onclick="BCE.printResumenAlumno('${a.id}')"><i data-lucide="file-text"></i> Resumen</div>
            <div class="export-drop-item" onclick="BCE.printDetalleAlumno('${a.id}')"><i data-lucide="scroll-text"></i> Estado de cuenta</div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('')
  : `<div class="card" style="grid-column:1/-1"><div class="empty-state">
      <div class="empty-state-icon"><i data-lucide="check-circle"></i></div>
      <div class="empty-state-title">Sin resultados</div>
      <div class="empty-state-desc">Ningún alumno coincide con el filtro actual.</div>
    </div></div>`;
  lucide.createIcons();
}

function deudaAluSearch(q) { DEUDAALU.query=(q||'').toLowerCase(); deudaAluRefresh(); }
function deudaAluSetSalon(s) { DEUDAALU.salonId=s||''; deudaAluRefresh(); }

function deudaAluExportCSV() {
  const rows = deudaAluGetFiltered().map(a=>{
    const d = calcDeudaAlumno(a.id, a.nombre);
    return [a.nombre, salonFull(a.salonId), getSalon(a.salonId)?.nivel||'', parseFloat(d.total).toFixed(2), parseFloat(d.pagado).toFixed(2), parseFloat(d.pendiente).toFixed(2), d.pendiente<=0?'Al día':'Con deuda'];
  });
  exportCSV(`deudas_alumnos_${today()}.csv`, ['Nombre','Salón','Nivel','Total (S/)','Pagado (S/)','Pendiente (S/)','Estado'], rows);
}

function deudaAluExportPDF() {
  const alumnos = deudaAluGetFiltered().map(a=>({...a,...calcDeudaAlumno(a.id,a.nombre)}));
  const rows = alumnos.map(a=>`<tr>
    <td>${a.nombre}</td><td>${salonFull(a.salonId)}</td><td>${getSalon(a.salonId)?.nivel||''}</td>
    <td class="td-right">${fmt(a.total)}</td>
    <td class="td-right">${fmt(a.pagado)}</td>
    <td class="td-right">${fmt(a.pendiente)}</td>
    <td>${a.pendiente<=0?'Al día':'Con deuda'}</td>
  </tr>`).join('');
  const html=`<table>
    <thead><tr><th>Alumno</th><th>Salón</th><th>Nivel</th><th class="td-right">Total</th><th class="td-right">Pagado</th><th class="td-right">Pendiente</th><th>Estado</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">Sin datos</td></tr>'}</tbody>
  </table>`;
  printPDF('Deudas — Alumnos', `Año ${DB.year} · ${alumnos.length} alumnos con servicios personales`, html);
}

function openDetalleAlumno(alumnoId) {
  const a = getAlumno(alumnoId);
  if(!a) return;
  const d = calcDeudaAlumno(alumnoId, a.nombre);
  const ops = DB.operaciones.filter(op =>
    op.tipo==='alumno' && (op.solicitanteId===alumnoId || (!op.solicitanteId&&op.alumnoNombre===a.nombre))
  );
  const body = `
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:20px;padding:16px;background:var(--bg-muted);border-radius:var(--r-lg)">
      <div class="avatar avatar-xl av-blue">${slugAvatar(a.nombre)}</div>
      <div class="flex-1">
        <div class="text-xl font-bold">${a.nombre}</div>
        <div class="text-sm text-muted mt-1">${salonFull(a.salonId)} · ${getSalon(a.salonId)?.nivel||''}</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-muted">Pendiente</div>
        <div class="text-2xl font-bold ${d.pendiente>0?'text-danger':'text-success'}">${fmt(d.pendiente)}</div>
        <div class="text-xs text-muted">de ${fmt(d.total)} total</div>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Fecha</th><th>Servicio</th><th class="td-center">Cant.</th><th class="td-right">Precio</th><th class="td-right">Subtotal</th><th>Notas</th></tr></thead>
        <tbody>
          ${ops.flatMap(op=>op.items.filter(it=>it.esPersonal).map(it=>`
          <tr>
            <td class="text-sm text-muted">${fmtDate(op.fecha)}</td>
            <td class="font-medium text-sm">${servicioNombre(it.servicio)}</td>
            <td class="td-center">${it.cantidad}</td>
            <td class="td-right td-mono">${fmt(it.precio)}</td>
            <td class="td-right td-bold">${fmt(it.subtotal)}</td>
            <td class="text-sm text-muted">${op.notas||'—'}</td>
          </tr>`)).join('')}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-muted)"><td colspan="4" class="font-semibold">Total</td><td class="td-right font-bold">${fmt(d.total)}</td><td></td></tr>
          <tr style="background:var(--success-subtle)"><td colspan="4" class="font-semibold text-success">Pagado</td><td class="td-right font-bold text-success">${fmt(d.pagado)}</td><td></td></tr>
          <tr style="background:var(--danger-subtle)"><td colspan="4" class="font-semibold text-danger">Pendiente</td><td class="td-right font-bold text-danger">${fmt(d.pendiente)}</td><td></td></tr>
        </tfoot>
      </table>
    </div>`;
  const footer = `
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cerrar</button>
    ${d.pendiente>0?`<button class="btn btn-success" onclick="BCE.closeModal();BCE.openModalPago('alumno','${alumnoId}')"><i data-lucide="banknote"></i> Registrar Pago</button>`:''}`;
  openModal(`Cuenta: ${a.nombre}`, body, footer, 'modal-lg');
}

/* ---- DEUDAS DIRECCIÓN ---- */

function viewDeudasDireccion() {
  const opsDir   = DB.operaciones.filter(o=>o.tipo==='direccion');
  const pagosDir = DB.pagos.filter(p=>p.tipo==='direccion');
  const total    = opsDir.reduce((a,o)=>a+o.total,0);
  const pagado   = pagosDir.reduce((a,p)=>a+p.monto,0);
  const pendiente = Math.max(0, total - pagado);

  const tipoPagoLabel = t => t==='yape'?'Yape / Plin':t==='transferencia'?'Transferencia':'Efectivo';
  const tipoPagoColor = t => t==='yape'?'badge-purple':t==='transferencia'?'badge-info':'badge-success';

  return `
  <div class="page-header">
    <div><h1 class="page-title">Deudas — Dirección</h1>
    <p class="page-subtitle">Cuenta institucional de la dirección del colegio</p></div>
  </div>
  <div class="grid-stats mb-5" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon orange"><i data-lucide="building-2"></i></div>
        <div class="stat-value">${fmt(total)}</div>
      </div>
      <div class="stat-label">Total acumulado</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        <div class="stat-value">${fmt(pagado)}</div>
      </div>
      <div class="stat-label">Total pagado</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon red"><i data-lucide="clock"></i></div>
        <div class="stat-value ${pendiente>0?'text-danger':''}">${fmt(pendiente)}</div>
      </div>
      <div class="stat-label">Pendiente</div>
    </div>
  </div>
  <div class="card mb-5">
    <div class="card-header mb-3">
      <div class="card-title">Operaciones de Dirección</div>
      <div style="display:flex;gap:8px">
        <div class="export-drop-wrap" id="dir-export-drop">
          <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('dir-export-drop')">
            <i data-lucide="download"></i> Exportar <i data-lucide="chevron-down"></i>
          </button>
          <div class="export-drop-menu">
            <div class="export-drop-item" onclick="BCE.dirExportCSV()"><i data-lucide="file-text"></i> CSV / Excel</div>
            <div class="export-drop-item" onclick="BCE.dirExportPDF()"><i data-lucide="file"></i> PDF / Imprimir</div>
          </div>
        </div>
        <div class="export-drop-wrap" id="dir-print-drop">
          <button class="btn btn-secondary btn-sm" onclick="BCE.toggleExportDrop('dir-print-drop')">
            <i data-lucide="printer"></i> Folleto <i data-lucide="chevron-down"></i>
          </button>
          <div class="export-drop-menu">
            <div class="export-drop-item" onclick="BCE.printResumenDireccion()"><i data-lucide="file-text"></i> Resumen</div>
            <div class="export-drop-item" onclick="BCE.printDetalleDireccion()"><i data-lucide="scroll-text"></i> Estado de cuenta</div>
          </div>
        </div>
        <button class="btn btn-success btn-sm" onclick="BCE.openModalPago('direccion')"><i data-lucide="banknote"></i> Registrar Pago</button>
      </div>
    </div>
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Fecha</th><th>Servicios</th><th>Quien ordena</th><th>Quien recoge</th><th>Notas</th><th class="td-right">Total</th></tr></thead>
          <tbody>
            ${opsDir.length?opsDir.map(op=>`
            <tr>
              <td class="text-sm">${fmtDate(op.fecha)}</td>
              <td class="text-sm">${op.items.map(i=>`${servicioNombre(i.servicio)} ×${i.cantidad}`).join(', ')}</td>
              <td class="text-sm font-medium">${op.dirResponsable||'—'}</td>
              <td class="text-sm text-muted">${op.dirPortador&&op.dirPortador!==op.dirResponsable?op.dirPortador:'<em class="text-muted">Mismo</em>'}</td>
              <td class="text-sm text-muted">${op.notas||'—'}</td>
              <td class="td-right td-bold">${fmt(op.total)}</td>
            </tr>`).join(''):`<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--t-300)">Sin operaciones registradas</td></tr>`}
          </tbody>
          ${opsDir.length?`<tfoot>
            <tr style="background:var(--bg-muted)">
              <td colspan="5" class="font-bold">Total Dirección</td>
              <td class="td-right font-bold text-danger">${fmt(total)}</td>
            </tr>
          </tfoot>`:''}
        </table>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header mb-3">
      <div class="card-title">Historial de Pagos</div>
      <span class="badge badge-neutral">${pagosDir.length} pago${pagosDir.length!==1?'s':''}</span>
    </div>
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Fecha</th><th>Forma de pago</th><th>Notas</th><th class="td-right">Monto</th></tr></thead>
          <tbody>
            ${pagosDir.length?pagosDir.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(pg=>`
            <tr>
              <td class="text-sm">${fmtDate(pg.fecha)}</td>
              <td><span class="badge ${tipoPagoColor(pg.tipoPago)}">${tipoPagoLabel(pg.tipoPago)}</span></td>
              <td class="text-sm text-muted">${pg.notas||'—'}</td>
              <td class="td-right td-bold text-success">${fmt(pg.monto)}</td>
            </tr>`).join(''):`<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--t-300)">Sin pagos registrados</td></tr>`}
          </tbody>
          ${pagosDir.length?`<tfoot>
            <tr style="background:var(--bg-muted)">
              <td colspan="3" class="font-bold">Total pagado</td>
              <td class="td-right font-bold text-success">${fmt(pagado)}</td>
            </tr>
          </tfoot>`:''}
        </table>
      </div>
    </div>
  </div>`;
}

function dirExportCSV() {
  const opsDir = DB.operaciones.filter(o=>o.tipo==='direccion');
  exportCSV(`deudas_direccion_${today()}.csv`,
    ['Fecha','Servicios','Quien Ordena','Quien Recoge','Total (S/)','Notas'],
    opsDir.map(op=>[
      fmtDate(op.fecha),
      op.items.map(i=>`${servicioNombre(i.servicio)} x${i.cantidad}`).join(' | '),
      op.dirResponsable||'',
      op.dirPortador||'',
      parseFloat(op.total).toFixed(2),
      op.notas||''
    ])
  );
}

function dirExportPDF() {
  const opsDir = DB.operaciones.filter(o=>o.tipo==='direccion');
  const total = opsDir.reduce((a,o)=>a+o.total,0);
  const rows = opsDir.map(op=>`<tr>
    <td>${fmtDate(op.fecha)}</td>
    <td>${op.items.map(i=>`${servicioNombre(i.servicio)} ×${i.cantidad}`).join(', ')}</td>
    <td>${op.dirResponsable||'—'}</td>
    <td class="td-right">${fmt(op.total)}</td>
    <td>${op.notas||'—'}</td>
  </tr>`).join('');
  const html=`<table>
    <thead><tr><th>Fecha</th><th>Servicios</th><th>Quien ordena</th><th class="td-right">Total</th><th>Notas</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sin operaciones</td></tr>'}</tbody>
    <tfoot><tr><td colspan="3">Total Dirección</td><td class="td-right">${fmt(total)}</td><td></td></tr></tfoot>
  </table>`;
  printPDF('Deudas — Dirección', `Año ${DB.year} · Cuenta institucional`, html);
}
