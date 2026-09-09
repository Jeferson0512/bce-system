/* =============================================
   BCE System — View: Registro por Lote
   ============================================= */

let _lotRowId = 0;

const LOT = {
  fecha: '',
  tabActiva: 'profesores',
  profesores: [],
  alumnos:    [],
  direccion:  [],
  reset() {
    this.profesores=[]; this.alumnos=[]; this.direccion=[];
    this.tabActiva='profesores';
    this.fecha=today();
    _lotRowId=0;
  }
};

// "Apellido Nombre" display helper
function _apNombre(nombre) {
  const p = (nombre||'').trim().split(/\s+/);
  return p.length < 2 ? nombre : p.slice(1).join(' ') + ' ' + p[0];
}

// ── Vista principal ───────────────────────────────────────────

function viewRegistroLote() {
  LOT.reset();
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Registro por Lote</h1>
      <p class="page-subtitle">Ingresa operaciones de varios profesores, alumnos o dirección del mismo día en una sola pantalla</p>
    </div>
    <div class="page-actions" style="align-items:center;gap:10px">
      <label class="form-label" style="margin:0;font-size:13px;white-space:nowrap">Fecha del registro:</label>
      <input type="date" class="form-control form-control-sm" id="lot-fecha"
             value="${today()}" max="${today()}" style="width:160px"
             onchange="BCE.lotSetFecha(this.value)">
    </div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="lot-tabs" id="lot-tabs">
      <button class="lot-tab active" id="lot-tab-profesores" onclick="BCE.lotSetTab('profesores')">
        <i data-lucide="graduation-cap"></i>
        Profesores
        <span class="badge badge-neutral badge-sm" id="lot-cnt-profesores">0</span>
      </button>
      <button class="lot-tab" id="lot-tab-alumnos" onclick="BCE.lotSetTab('alumnos')">
        <i data-lucide="user"></i>
        Alumnos
        <span class="badge badge-neutral badge-sm" id="lot-cnt-alumnos">0</span>
      </button>
      <button class="lot-tab" id="lot-tab-direccion" onclick="BCE.lotSetTab('direccion')">
        <i data-lucide="building-2"></i>
        Dirección
        <span class="badge badge-neutral badge-sm" id="lot-cnt-direccion">0</span>
      </button>
    </div>
    <div id="lot-tab-body">
      ${_lotTabContent()}
    </div>
  </div>

  <div class="card" id="lot-preview-card" style="display:none">
    <div class="card-header">
      <div class="card-title">Operaciones que se crearán</div>
      <span class="badge badge-success" id="lot-ops-badge">0 operaciones</span>
    </div>
    <div id="lot-preview-body" style="padding:4px 20px 8px"></div>
    <div class="card-footer" style="justify-content:space-between;align-items:center">
      <span class="text-sm text-muted" id="lot-resumen-txt"></span>
      <button class="btn btn-success" onclick="BCE.lotSave()">
        <i data-lucide="save"></i>
        <span id="lot-save-txt">Guardar todo</span>
      </button>
    </div>
  </div>`;
}

// ── Cambio de pestaña ─────────────────────────────────────────

function lotSetTab(tab) {
  LOT.tabActiva = tab;
  document.querySelectorAll('.lot-tab').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById(`lot-tab-${tab}`);
  if(btn) btn.classList.add('active');
  const body=document.getElementById('lot-tab-body');
  if(body){ body.innerHTML=_lotTabContent(); lucide.createIcons(); }
}

function _lotTabContent() {
  if(LOT.tabActiva==='profesores') return _lotTabProfesores();
  if(LOT.tabActiva==='alumnos')    return _lotTabAlumnos();
  return _lotTabDireccion();
}

// ── Opciones de salón (con tutor) ─────────────────────────────

function _salOptsConTutor(salonIdSel) {
  const opt = (s) => {
    const t = getProfesor(s.tutorId);
    const label = `${s.grado}°${s.seccion} — ${t?.nombre||'?'}`;
    return `<option value="${s.id}"${salonIdSel===s.id?' selected':''}>${label}</option>`;
  };
  return `
    <optgroup label="Primaria">
      ${DB.salones.filter(s=>s.nivel==='Primaria').map(opt).join('')}
    </optgroup>
    <optgroup label="Secundaria">
      ${DB.salones.filter(s=>s.nivel==='Secundaria').map(opt).join('')}
    </optgroup>`;
}

// ── Tab: Profesores ───────────────────────────────────────────

function _lotTabProfesores() {
  const rows=LOT.profesores;
  return `
  <div style="overflow-x:auto">
    <table class="table" style="min-width:820px">
      <thead><tr>
        <th style="min-width:200px">Profesor <span class="required">*</span></th>
        <th style="min-width:210px">Salón / Personal</th>
        <th style="min-width:145px">Servicio</th>
        <th style="width:80px">Cant. <span class="required">*</span></th>
        <th style="width:115px">Precio</th>
        <th style="width:85px">Total</th>
        <th style="width:36px"></th>
      </tr></thead>
      <tbody id="lot-tbody">
        ${rows.length===0
          ? `<tr><td colspan="7" class="text-center text-muted" style="padding:28px">Usa el botón de abajo para agregar filas</td></tr>`
          : rows.map(_lotRowProf).join('')}
      </tbody>
    </table>
  </div>
  <div style="padding:10px 20px;border-top:1px solid var(--border)">
    <button class="btn btn-sm btn-outline-primary" onclick="BCE.lotAddRow()">
      <i data-lucide="plus"></i> Agregar fila
    </button>
  </div>`;
}

function _lotRowProf(r) {
  const profsOrdenados = DB.profesores
    .filter(p=>getRol(p.rolId)?.tipo==='docente')
    .map(p=>({...p, display:_apNombre(p.nombre)}))
    .sort((a,b)=>a.display.localeCompare(b.display,'es'));

  return `<tr id="lot-row-${r.id}">
    <td>
      <select class="form-control form-control-sm" onchange="BCE.lotField('profId',this.value,'${r.id}')">
        <option value="">— Profesor —</option>
        ${profsOrdenados.map(p=>
          `<option value="${p.id}"${r.profId===p.id?' selected':''}>${p.display}</option>`
        ).join('')}
      </select>
    </td>
    <td>
      <select class="form-control form-control-sm" onchange="BCE.lotField('salonId',this.value,'${r.id}')">
        <option value="">— Personal —</option>
        ${_salOptsConTutor(r.salonId)}
      </select>
    </td>
    <td>
      <select class="form-control form-control-sm" onchange="BCE.lotServicio(this.value,'${r.id}')">
        ${DB.precios.map((p,i)=>
          `<option value="${p.id}"${r.servicioId===p.id?' selected':(!r.servicioId&&i===0?' selected':'')}>${p.nombre}</option>`
        ).join('')}
      </select>
    </td>
    <td>
      <input type="number" class="form-control form-control-sm" min="1" placeholder="0"
             style="width:78px"
             value="${r.cantidad||''}" onchange="BCE.lotCantidad(this.value,'${r.id}')">
    </td>
    <td>
      <div class="input-group">
        <span class="input-addon input-addon-left" style="font-size:11px;padding:4px 5px">S/</span>
        <input type="number" class="form-control form-control-sm" step="0.01" placeholder="0.00"
               style="width:78px"
               value="${r.precio!==undefined?r.precio.toFixed(2):''}"
               onchange="BCE.lotPrecio(this.value,'${r.id}')">
      </div>
    </td>
    <td id="lot-total-${r.id}" class="font-bold text-sm">${r.subtotal>0?fmt(r.subtotal):'—'}</td>
    <td><button class="btn-icon" style="color:var(--danger)" onclick="BCE.lotRemove('${r.id}')">
      <i data-lucide="trash-2"></i></button></td>
  </tr>`;
}

// ── Tab: Alumnos ──────────────────────────────────────────────

function _lotTabAlumnos() {
  const rows=LOT.alumnos;
  return `
  <div style="overflow-x:auto">
    <table class="table" style="min-width:920px">
      <thead><tr>
        <th style="min-width:210px">Alumno <span class="required">*</span></th>
        <th style="width:130px">Tipo</th>
        <th style="min-width:210px">Salón</th>
        <th style="min-width:145px">Servicio</th>
        <th style="width:80px">Cant. <span class="required">*</span></th>
        <th style="width:115px">Precio</th>
        <th style="width:85px">Total</th>
        <th style="width:36px"></th>
      </tr></thead>
      <tbody id="lot-tbody">
        ${rows.length===0
          ? `<tr><td colspan="8" class="text-center text-muted" style="padding:28px">Usa el botón de abajo para agregar filas</td></tr>`
          : rows.map(_lotRowAlumno).join('')}
      </tbody>
    </table>
  </div>
  <div style="padding:10px 20px;border-top:1px solid var(--border)">
    <button class="btn btn-sm btn-outline-primary" onclick="BCE.lotAddRow()">
      <i data-lucide="plus"></i> Agregar fila
    </button>
  </div>`;
}

function _lotRowAlumno(r) {
  return `<tr id="lot-row-${r.id}">
    <td>
      <div class="autocomplete-wrap">
        <input type="text" class="form-control form-control-sm" autocomplete="off"
               id="lot-alu-input-${r.id}"
               placeholder="Buscar alumno…"
               value="${r.alumnoNombre||''}"
               oninput="BCE.lotSearchAlumno('${r.id}',this.value)"
               onfocus="BCE.lotSearchAlumno('${r.id}',this.value)"
               onblur="setTimeout(()=>BCE.lotCloseAluDrop('${r.id}'),200)">
        <div class="autocomplete-dropdown" id="lot-alu-drop-${r.id}"></div>
      </div>
    </td>
    <td>
      <select class="form-control form-control-sm" onchange="BCE.lotAluTipo(this.value==='1','${r.id}')">
        <option value="0"${!r.esPersonal?' selected':''}>Encargo prof.</option>
        <option value="1"${r.esPersonal?' selected':''}>Uso personal</option>
      </select>
    </td>
    <td>
      ${r.esPersonal
        ? `<span class="text-xs text-muted" style="display:block;padding:8px 4px">No aplica</span>`
        : `<select class="form-control form-control-sm" onchange="BCE.lotField('salonId',this.value,'${r.id}')">
             <option value="">— Salón —</option>
             ${_salOptsConTutor(r.salonId)}
           </select>`}
    </td>
    <td>
      <select class="form-control form-control-sm" onchange="BCE.lotServicio(this.value,'${r.id}')">
        ${DB.precios.map((p,i)=>
          `<option value="${p.id}"${r.servicioId===p.id?' selected':(!r.servicioId&&i===0?' selected':'')}>${p.nombre}</option>`
        ).join('')}
      </select>
    </td>
    <td>
      <input type="number" class="form-control form-control-sm" min="1" placeholder="0"
             style="width:78px"
             value="${r.cantidad||''}" onchange="BCE.lotCantidad(this.value,'${r.id}')">
    </td>
    <td>
      <div class="input-group">
        <span class="input-addon input-addon-left" style="font-size:11px;padding:4px 5px">S/</span>
        <input type="number" class="form-control form-control-sm" step="0.01" placeholder="0.00"
               style="width:78px"
               value="${r.precio!==undefined?r.precio.toFixed(2):''}"
               onchange="BCE.lotPrecio(this.value,'${r.id}')">
      </div>
    </td>
    <td id="lot-total-${r.id}" class="font-bold text-sm">${r.subtotal>0?fmt(r.subtotal):'—'}</td>
    <td><button class="btn-icon" style="color:var(--danger)" onclick="BCE.lotRemove('${r.id}')">
      <i data-lucide="trash-2"></i></button></td>
  </tr>`;
}

// ── Autocomplete: Alumnos ─────────────────────────────────────

function _lotAnchorDrop(drop, inputId) {
  const input=document.getElementById(inputId);
  if(!input||!drop) return;
  const rect=input.getBoundingClientRect();
  drop.style.position='fixed';
  drop.style.top=(rect.bottom+2)+'px';
  drop.style.left=rect.left+'px';
  drop.style.width=rect.width+'px';
  drop.style.zIndex='9999';
}

function lotSearchAlumno(rowId, query) {
  const r=_lotFindRow(rowId);
  if(r) r.alumnoNombre=query;
  const drop=document.getElementById(`lot-alu-drop-${rowId}`);
  if(!drop) return;
  const q=(query||'').trim().toLowerCase();
  if(!q){ drop.className='autocomplete-dropdown'; return; }
  const matches=DB.alumnos.filter(a=>a.nombre.toLowerCase().includes(q)).slice(0,8);
  const exactMatch=DB.alumnos.some(a=>a.nombre.toLowerCase()===q);
  let html=matches.map(a=>{
    const s=getSalon(a.salonId);
    return `<div class="autocomplete-item" onmousedown="BCE.lotSelectAlumno('${rowId}','${a.id}')">
      <div class="avatar avatar-sm av-blue">${slugAvatar(a.nombre)}</div>
      <div>
        <div class="autocomplete-item-name">${a.nombre}</div>
        ${s?`<div class="autocomplete-item-sub">${salonFull(a.salonId)}</div>`:''}
      </div>
    </div>`;
  }).join('');
  if(!exactMatch&&query.trim()){
    const safe=query.trim().replace(/'/g,"\\'");
    html+=`<div class="autocomplete-item autocomplete-item-new" onmousedown="BCE.lotSelectAlumnoNuevo('${rowId}','${safe}')">
      <i data-lucide="user-plus"></i>
      <span>Guardar "<strong>${query.trim()}</strong>" como nuevo alumno</span>
    </div>`;
  }
  drop.innerHTML=html;
  drop.className='autocomplete-dropdown open';
  _lotAnchorDrop(drop, `lot-alu-input-${rowId}`);
  lucide.createIcons();
}

function lotSelectAlumno(rowId, aluId) {
  const a=DB.alumnos.find(x=>x.id===aluId);
  if(!a) return;
  const r=_lotFindRow(rowId);
  if(r){
    r.alumnoNombre=a.nombre;
    r.alumnoId=a.id;
    if(!r.esPersonal&&a.salonId) r.salonId=a.salonId;
  }
  lotCloseAluDrop(rowId);
  const body=document.getElementById('lot-tab-body');
  if(body){ body.innerHTML=_lotTabContent(); lucide.createIcons(); }
  lotRefreshPreview();
}

function lotSelectAlumnoNuevo(rowId, nombre) {
  const r=_lotFindRow(rowId);
  if(!r) return;
  let alu=DB.alumnos.find(a=>a.nombre.toLowerCase()===nombre.toLowerCase());
  if(!alu){
    const newId='ALU'+String(DB.alumnos.length+1).padStart(3,'0');
    DB.alumnos.push({ id:newId, nombre, salonId:null });
    saveDB();
    alu=DB.alumnos[DB.alumnos.length-1];
    toast(`"${nombre}" agregado al catálogo de Alumnos`, 'success');
  }
  r.alumnoNombre=alu.nombre;
  r.alumnoId=alu.id;
  lotCloseAluDrop(rowId);
  const body=document.getElementById('lot-tab-body');
  if(body){ body.innerHTML=_lotTabContent(); lucide.createIcons(); }
  lotRefreshPreview();
}

function lotCloseAluDrop(rowId) {
  const drop=document.getElementById(`lot-alu-drop-${rowId}`);
  if(drop) drop.className='autocomplete-dropdown';
}

// ── Tab: Dirección ────────────────────────────────────────────

function _lotTabDireccion() {
  const rows=LOT.direccion;
  return `
  <div class="alert alert-warning" style="margin:16px 20px 0">
    <i data-lucide="building-2"></i>
    <span>Todos los servicios aquí se cargarán a la cuenta de <strong>Dirección</strong>. Se creará una sola operación con todas las filas.</span>
  </div>
  <div style="overflow-x:auto;margin-top:8px">
    <table class="table" style="min-width:700px">
      <thead><tr>
        <th style="min-width:220px">¿Quién ordena? <span class="required">*</span></th>
        <th style="min-width:145px">Servicio</th>
        <th style="width:80px">Cant. <span class="required">*</span></th>
        <th style="width:115px">Precio</th>
        <th style="width:85px">Total</th>
        <th style="width:36px"></th>
      </tr></thead>
      <tbody id="lot-tbody">
        ${rows.length===0
          ? `<tr><td colspan="6" class="text-center text-muted" style="padding:28px">Usa el botón de abajo para agregar filas</td></tr>`
          : rows.map(_lotRowDir).join('')}
      </tbody>
    </table>
  </div>
  <div style="padding:10px 20px;border-top:1px solid var(--border)">
    <button class="btn btn-sm btn-outline-primary" onclick="BCE.lotAddRow()">
      <i data-lucide="plus"></i> Agregar fila
    </button>
  </div>`;
}

function _lotRowDir(r) {
  return `<tr id="lot-row-${r.id}">
    <td>
      <div class="autocomplete-wrap">
        <input type="text" class="form-control form-control-sm" autocomplete="off"
               id="lot-dir-input-${r.id}"
               placeholder="Buscar en personal o escribir nombre…"
               value="${r.quienOrdena||''}"
               oninput="BCE.lotSearchDirPersonal('${r.id}',this.value)"
               onfocus="BCE.lotSearchDirPersonal('${r.id}',this.value)"
               onblur="setTimeout(()=>BCE.lotCloseDirDrop('${r.id}'),200)">
        <div class="autocomplete-dropdown" id="lot-dir-drop-${r.id}"></div>
      </div>
    </td>
    <td>
      <select class="form-control form-control-sm" onchange="BCE.lotServicio(this.value,'${r.id}')">
        ${DB.precios.map((p,i)=>
          `<option value="${p.id}"${r.servicioId===p.id?' selected':(!r.servicioId&&i===0?' selected':'')}>${p.nombre}</option>`
        ).join('')}
      </select>
    </td>
    <td>
      <input type="number" class="form-control form-control-sm" min="1" placeholder="0"
             style="width:78px"
             value="${r.cantidad||''}" onchange="BCE.lotCantidad(this.value,'${r.id}')">
    </td>
    <td>
      <div class="input-group">
        <span class="input-addon input-addon-left" style="font-size:11px;padding:4px 5px">S/</span>
        <input type="number" class="form-control form-control-sm" step="0.01" placeholder="0.00"
               style="width:78px"
               value="${r.precio!==undefined?r.precio.toFixed(2):''}"
               onchange="BCE.lotPrecio(this.value,'${r.id}')">
      </div>
    </td>
    <td id="lot-total-${r.id}" class="font-bold text-sm">${r.subtotal>0?fmt(r.subtotal):'—'}</td>
    <td><button class="btn-icon" style="color:var(--danger)" onclick="BCE.lotRemove('${r.id}')">
      <i data-lucide="trash-2"></i></button></td>
  </tr>`;
}

// ── Autocomplete: Dirección ───────────────────────────────────

function lotSearchDirPersonal(rowId, query) {
  const r=_lotFindRow(rowId);
  if(r) r.quienOrdena=query;
  const drop=document.getElementById(`lot-dir-drop-${rowId}`);
  if(!drop) return;
  const q=(query||'').trim().toLowerCase();
  if(!q){ drop.className='autocomplete-dropdown'; return; }
  const matches=DB.profesores.filter(p=>p.nombre.toLowerCase().includes(q)).slice(0,8);
  const exactMatch=DB.profesores.some(p=>p.nombre.toLowerCase()===q);
  let html=matches.map(p=>`
    <div class="autocomplete-item" onmousedown="BCE.lotSelectDirPersonal('${rowId}','${p.nombre.replace(/'/g,"\\'")}')">
      <div class="avatar avatar-sm ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
      <div>
        <div class="autocomplete-item-name">${p.nombre}</div>
        <div class="autocomplete-item-sub">${getRol(p.rolId)?.nombre||'Personal'}${p.tutorDe?' — '+salonFull(p.tutorDe):''}</div>
      </div>
    </div>`).join('');
  if(!exactMatch&&query.trim()){
    const safe=query.trim().replace(/'/g,"\\'");
    html+=`<div class="autocomplete-item autocomplete-item-new" onmousedown="BCE.lotAddDirPersonal('${rowId}','${safe}')">
      <i data-lucide="user-plus"></i>
      <span>Registrar "<strong>${query.trim()}</strong>" en Personal</span>
    </div>`;
  }
  drop.innerHTML=html;
  drop.className='autocomplete-dropdown open';
  _lotAnchorDrop(drop, `lot-dir-input-${rowId}`);
  lucide.createIcons();
}

function lotSelectDirPersonal(rowId, nombre) {
  const r=_lotFindRow(rowId);
  if(r) r.quienOrdena=nombre;
  const input=document.getElementById(`lot-dir-input-${rowId}`);
  if(input) input.value=nombre;
  lotCloseDirDrop(rowId);
  lotRefreshPreview();
}

function lotAddDirPersonal(rowId, nombre) {
  const existe=DB.profesores.find(p=>p.nombre.toLowerCase()===nombre.toLowerCase());
  if(!existe){
    const colors=['av-blue','av-green','av-orange','av-purple','av-teal','av-red'];
    let h=0; for(const c of nombre) h=c.charCodeAt(0)+((h<<5)-h);
    const newId='P'+String(DB.profesores.filter(p=>p.id.startsWith('P')).length+1).padStart(3,'0');
    DB.profesores.push({ id:newId, nombre, rolId:'ROL05', tutorDe:null, avatarColor:colors[Math.abs(h)%colors.length] });
    saveDB();
    toast(`"${nombre}" agregado a Personal — ajusta su rol en Catálogos → Personal`, 'info');
  }
  lotSelectDirPersonal(rowId, nombre);
}

function lotCloseDirDrop(rowId) {
  const drop=document.getElementById(`lot-dir-drop-${rowId}`);
  if(drop) drop.className='autocomplete-dropdown';
}

// ── Gestión de estado ─────────────────────────────────────────

function _lotFindRow(id) {
  return [...LOT.profesores,...LOT.alumnos,...LOT.direccion].find(r=>r.id===id);
}

function _lotPriceFor(svc) {
  if(!svc) return 0;
  if(LOT.tabActiva==='alumnos')    return svc.alumno;
  if(LOT.tabActiva==='direccion')  return svc.dir;
  return svc.prof;
}

function lotSetFecha(v) { LOT.fecha=v; }

function lotAddRow() {
  const id='LR'+(++_lotRowId);
  const firstSvc=DB.precios[0];
  const precio=_lotPriceFor(firstSvc);
  const base={ id, servicioId:firstSvc?.id||'', servicioNombre:firstSvc?.nombre||'', cantidad:0, precio, subtotal:0 };
  if(LOT.tabActiva==='profesores') LOT.profesores.push({...base, profId:'', salonId:''});
  else if(LOT.tabActiva==='alumnos') LOT.alumnos.push({...base, alumnoNombre:'', alumnoId:'', esPersonal:false, salonId:''});
  else LOT.direccion.push({...base, quienOrdena:''});
  const body=document.getElementById('lot-tab-body');
  if(body){ body.innerHTML=_lotTabContent(); lucide.createIcons(); }
  lotRefreshBadges();
  lotRefreshPreview();
}

function lotRemove(id) {
  LOT.profesores=LOT.profesores.filter(r=>r.id!==id);
  LOT.alumnos=LOT.alumnos.filter(r=>r.id!==id);
  LOT.direccion=LOT.direccion.filter(r=>r.id!==id);
  const body=document.getElementById('lot-tab-body');
  if(body){ body.innerHTML=_lotTabContent(); lucide.createIcons(); }
  lotRefreshBadges();
  lotRefreshPreview();
}

function lotField(field, value, id) {
  const r=_lotFindRow(id);
  if(r) r[field]=value;
  lotRefreshPreview();
}

function lotServicio(servicioId, id) {
  const r=_lotFindRow(id);
  if(!r) return;
  const svc=DB.precios.find(p=>p.id===servicioId);
  if(!svc) return;
  r.servicioId=servicioId;
  r.servicioNombre=svc.nombre;
  const tab=LOT.alumnos.find(x=>x.id===id)?'alumnos':LOT.direccion.find(x=>x.id===id)?'direccion':'profesores';
  r.precio = tab==='alumnos' ? svc.alumno : tab==='direccion' ? svc.dir : svc.prof;
  const row=document.getElementById(`lot-row-${id}`);
  if(row){
    const pi=row.querySelector('input[step="0.01"]');
    if(pi) pi.value=r.precio.toFixed(2);
  }
  r.subtotal=r.cantidad*r.precio;
  const tot=document.getElementById(`lot-total-${id}`);
  if(tot) tot.textContent=r.subtotal>0?fmt(r.subtotal):'—';
  lotRefreshPreview();
}

function lotCantidad(value, id) {
  const r=_lotFindRow(id);
  if(!r) return;
  r.cantidad=parseInt(value)||0;
  r.subtotal=r.cantidad*(r.precio||0);
  const tot=document.getElementById(`lot-total-${id}`);
  if(tot) tot.textContent=r.subtotal>0?fmt(r.subtotal):'—';
  lotRefreshPreview();
}

function lotPrecio(value, id) {
  const r=_lotFindRow(id);
  if(!r) return;
  r.precio=parseFloat(value)||0;
  r.subtotal=r.cantidad*r.precio;
  const tot=document.getElementById(`lot-total-${id}`);
  if(tot) tot.textContent=r.subtotal>0?fmt(r.subtotal):'—';
  lotRefreshPreview();
}

function lotAluTipo(esPersonal, id) {
  const r=_lotFindRow(id);
  if(!r) return;
  r.esPersonal=esPersonal;
  if(esPersonal) r.salonId='';
  const body=document.getElementById('lot-tab-body');
  if(body){ body.innerHTML=_lotTabContent(); lucide.createIcons(); }
  lotRefreshPreview();
}

// ── Badges de pestañas ────────────────────────────────────────

function lotRefreshBadges() {
  const set=(elId, n) => {
    const el=document.getElementById(elId);
    if(el){ el.textContent=n; el.className=`badge badge-sm ${n>0?'badge-primary':'badge-neutral'}`; }
  };
  set('lot-cnt-profesores', LOT.profesores.length);
  set('lot-cnt-alumnos',    LOT.alumnos.length);
  set('lot-cnt-direccion',  LOT.direccion.length);
}

// ── Vista previa ──────────────────────────────────────────────

function lotRefreshPreview() {
  const card=document.getElementById('lot-preview-card');
  const body=document.getElementById('lot-preview-body');
  const saveTxt=document.getElementById('lot-save-txt');
  const resumen=document.getElementById('lot-resumen-txt');
  const opsBadge=document.getElementById('lot-ops-badge');

  const profMap={};
  LOT.profesores.filter(r=>r.profId&&r.cantidad>0).forEach(r=>{
    if(!profMap[r.profId]) profMap[r.profId]=[];
    profMap[r.profId].push(r);
  });

  const aluMap={};
  LOT.alumnos.filter(r=>r.alumnoNombre?.trim()&&r.cantidad>0).forEach(r=>{
    const k=r.alumnoNombre.trim();
    if(!aluMap[k]) aluMap[k]=[];
    aluMap[k].push(r);
  });

  const dirRows=LOT.direccion.filter(r=>r.quienOrdena?.trim()&&r.cantidad>0);
  const profOps=Object.keys(profMap).length;
  const aluOps=Object.keys(aluMap).length;
  const dirOp=dirRows.length>0?1:0;
  const totalOps=profOps+aluOps+dirOp;

  if(totalOps===0){ if(card) card.style.display='none'; return; }
  if(card) card.style.display='';

  let html=''; let grand=0;

  const row=(badge, color, nombre, items, sub)=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <span class="badge badge-sm badge-${color}" style="margin-right:6px">${badge}</span>
        <strong>${nombre}</strong>
        <span class="text-xs text-muted" style="margin-left:6px">${items}</span>
      </div>
      <span class="font-bold" style="flex-shrink:0;margin-left:12px">${fmt(sub)}</span>
    </div>`;

  Object.entries(profMap).forEach(([profId,rows])=>{
    const prof=getProfesor(profId);
    const sub=rows.reduce((a,r)=>a+r.subtotal,0); grand+=sub;
    const items=rows.map(r=>`${r.servicioNombre} ×${r.cantidad}${r.salonId?' ('+salonFull(r.salonId)+')':' (personal)'}`).join(' · ');
    html+=row('Profesor','primary',prof?_apNombre(prof.nombre):profId,items,sub);
  });

  Object.entries(aluMap).forEach(([nombre,rows])=>{
    const sub=rows.reduce((a,r)=>a+r.subtotal,0); grand+=sub;
    const items=rows.map(r=>`${r.servicioNombre} ×${r.cantidad}${r.esPersonal?' (personal)':r.salonId?' ('+salonFull(r.salonId)+')':''}`).join(' · ');
    html+=row('Alumno','info',nombre,items,sub);
  });

  if(dirOp){
    const sub=dirRows.reduce((a,r)=>a+r.subtotal,0); grand+=sub;
    const items=dirRows.map(r=>`${r.servicioNombre} ×${r.cantidad}`).join(' · ');
    const ordena=dirRows[0].quienOrdena;
    html+=row('Dirección','warning',`Dirección (${ordena})`,items,sub);
  }

  if(body) body.innerHTML=html;
  const lbl=`Guardar ${totalOps} operación${totalOps!==1?'es':''}`;
  if(saveTxt) saveTxt.textContent=lbl;
  if(opsBadge){ opsBadge.textContent=`${totalOps} operación${totalOps!==1?'es':''}`; }
  if(resumen) resumen.textContent=`Total acumulado: ${fmt(grand)}`;
}

// ── Guardar ───────────────────────────────────────────────────

function lotSave() {
  const fecha=LOT.fecha||today();
  const now=new Date();
  const fechaHora=fecha+' '+now.toTimeString().slice(0,5);
  let saved=0; const errors=[];

  LOT.profesores.forEach(r=>{
    if((r.cantidad>0||r.profId)&&(!r.profId))  errors.push('Fila de Profesores: selecciona el profesor');
    if((r.cantidad>0||r.profId)&&r.cantidad<1) errors.push('Fila de Profesores: ingresa la cantidad');
  });
  LOT.alumnos.forEach(r=>{
    if((r.cantidad>0||r.alumnoNombre)&&!r.alumnoNombre?.trim()) errors.push('Fila de Alumnos: ingresa el nombre del alumno');
    if((r.cantidad>0||r.alumnoNombre)&&r.cantidad<1)            errors.push('Fila de Alumnos: ingresa la cantidad');
  });
  LOT.direccion.forEach(r=>{
    if((r.cantidad>0||r.quienOrdena)&&!r.quienOrdena?.trim()) errors.push('Fila de Dirección: indica quién ordena');
    if((r.cantidad>0||r.quienOrdena)&&r.cantidad<1)            errors.push('Fila de Dirección: ingresa la cantidad');
  });

  if(errors.length>0){ toast(errors[0],'danger'); return; }

  const profMap={};
  LOT.profesores.filter(r=>r.profId&&r.cantidad>0).forEach(r=>{
    if(!profMap[r.profId]) profMap[r.profId]=[];
    profMap[r.profId].push(r);
  });
  Object.entries(profMap).forEach(([profId,rows])=>{
    const total=rows.reduce((a,r)=>a+r.subtotal,0);
    const id='OP'+String(DB.operaciones.length+1).padStart(3,'0');
    DB.operaciones.unshift({
      id, fecha:fechaHora, tipo:'profesor', solicitanteId:profId,
      items:rows.map(r=>({ servicio:r.servicioId, salonId:r.salonId||null, esPersonal:!r.salonId, cantidad:r.cantidad, precio:r.precio, subtotal:r.subtotal })),
      total, notas:'Registro por lote'
    });
    saved++;
  });

  const aluMap={};
  LOT.alumnos.filter(r=>r.alumnoNombre?.trim()&&r.cantidad>0).forEach(r=>{
    const k=r.alumnoNombre.trim();
    if(!aluMap[k]) aluMap[k]=[];
    aluMap[k].push(r);
  });
  Object.entries(aluMap).forEach(([alumnoNombre,rows])=>{
    const total=rows.reduce((a,r)=>a+r.subtotal,0);
    const id='OP'+String(DB.operaciones.length+1).padStart(3,'0');
    const alumnoId=rows[0].alumnoId||null;
    DB.operaciones.unshift({
      id, fecha:fechaHora, tipo:'alumno', alumnoNombre,
      solicitanteId:alumnoId,
      items:rows.map(r=>({ servicio:r.servicioId, salonId:r.salonId||null, esPersonal:r.esPersonal, cantidad:r.cantidad, precio:r.precio, subtotal:r.subtotal })),
      total, notas:'Registro por lote'
    });
    saved++;
  });

  const dirRows=LOT.direccion.filter(r=>r.quienOrdena?.trim()&&r.cantidad>0);
  if(dirRows.length>0){
    const total=dirRows.reduce((a,r)=>a+r.subtotal,0);
    const id='OP'+String(DB.operaciones.length+1).padStart(3,'0');
    DB.operaciones.unshift({
      id, fecha:fechaHora, tipo:'direccion',
      dirResponsable:dirRows[0].quienOrdena,
      dirPortador:dirRows[0].quienOrdena,
      items:dirRows.map(r=>({ servicio:r.servicioId, salonId:null, esPersonal:true, cantidad:r.cantidad, precio:r.precio, subtotal:r.subtotal })),
      total, notas:'Registro por lote'
    });
    saved++;
  }

  if(saved===0){ toast('Agrega al menos una fila completa antes de guardar','warning'); return; }

  saveDB();
  toast(`${saved} operación${saved!==1?'es':''} guardada${saved!==1?'s':''} correctamente`,'success');
  navigate('operaciones/historial');
}
