/* =============================================
   BCE System — View: Catálogos (CRUD completo)
   ============================================= */

const CATSAL  = { nivel: 'Primaria' };
const CATPROF = { page:1, perPage:10, query:'', filtro:'' };
const CATPERS = { page:1, perPage:10, query:'', filtro:'' };
const CATS    = { nivel:'Primaria', salonId:'TODOS', query:'' };
const CATUSR  = { query:'' };

// ── Helper compartido: avatar color picker ────────────────────
function _avColorPicker(sel) {
  const colors=['av-blue','av-green','av-orange','av-purple','av-teal','av-red'];
  return `<div style="display:flex;gap:8px;flex-wrap:wrap" id="av-picker">
    ${colors.map(c=>`
    <div class="avatar avatar-sm ${c}" style="cursor:pointer;${sel===c?'outline:3px solid var(--brand);outline-offset:2px;':''}transition:outline .1s"
         onclick="document.querySelectorAll('#av-picker .avatar').forEach(x=>{x.style.outline='';x.style.outlineOffset=''});this.style.outline='3px solid var(--brand)';this.style.outlineOffset='2px';document.getElementById('cat-av').value='${c}'">
      AB
    </div>`).join('')}
    <input type="hidden" id="cat-av" value="${sel||'av-blue'}">
  </div>`;
}

/* ══════════════════════════════════════════════
   CATÁLOGO SALONES
   ══════════════════════════════════════════════ */

function catsalSetNivel(nivel) {
  CATSAL.nivel = nivel;
  _doNavigate('catalogos/salones');
}

function viewCatalogoSalones() {
  const primaria   = DB.salones.filter(s=>s.nivel==='Primaria');
  const secundaria = DB.salones.filter(s=>s.nivel==='Secundaria');
  const salones    = CATSAL.nivel==='Primaria' ? primaria : secundaria;

  const renderGrid = (arr) => arr.map(s=>{
    const t=getProfesor(s.tutorId);
    const nAlumnos=DB.alumnos.filter(a=>a.salonId===s.id).length;
    return `<div class="card" style="padding:16px">
      <div class="flex items-center justify-between mb-2">
        <span class="badge ${s.nivel==='Primaria'?'nivel-primaria':'nivel-secundaria'} badge-lg">${s.grado}° ${s.seccion}</span>
        <div class="flex gap-1">
          <button class="btn-icon" onclick="BCE.openModalSalon('${s.id}')"><i data-lucide="pencil"></i></button>
          <button class="btn-icon" style="color:var(--danger)" onclick="BCE.deleteSalon('${s.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      <div class="font-bold" style="font-size:15px;margin-bottom:4px">${s.nivel} ${s.grado}°${s.seccion}</div>
      <div class="info-row mt-2"><i data-lucide="user"></i><span class="text-sm">${t?t.nombre:'Sin tutor'}</span></div>
      <div class="info-row mt-1"><i data-lucide="users"></i><span class="text-sm text-muted">${nAlumnos} alumno${nAlumnos!==1?'s':''}</span></div>
    </div>`;
  }).join('');

  return `
  <div class="page-header">
    <div><h1 class="page-title">Catálogo — Salones</h1>
    <p class="page-subtitle">${DB.salones.length} salones registrados · mostrando ${salones.length} de ${CATSAL.nivel}</p></div>
    <button class="btn btn-primary" onclick="BCE.openModalSalon(null)"><i data-lucide="plus"></i> Nuevo Salón</button>
  </div>
  <div class="tabs mb-4">
    <div class="tab${CATSAL.nivel==='Primaria'?' active':''}" style="cursor:pointer" onclick="BCE.catsalSetNivel('Primaria')">
      <i data-lucide="school"></i> Primaria <span class="tab-count">${primaria.length}</span>
    </div>
    <div class="tab${CATSAL.nivel==='Secundaria'?' active':''}" style="cursor:pointer" onclick="BCE.catsalSetNivel('Secundaria')">
      <i data-lucide="graduation-cap"></i> Secundaria <span class="tab-count">${secundaria.length}</span>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:24px">
    ${renderGrid(salones)}
  </div>`;
}

function openModalSalon(salId) {
  const s = salId ? getSalon(salId) : null;
  const isEdit = !!s;
  const freeDocs = DB.profesores.filter(p => getRol(p.rolId)?.tipo==='docente' && (!p.tutorDe || p.tutorDe === salId));
  const tutorOpts = `<option value="">— Sin tutor asignado —</option>` +
    freeDocs.map(p=>`<option value="${p.id}"${s?.tutorId===p.id?' selected':''}>${p.nombre}</option>`).join('');

  const body = `<div class="flex flex-col gap-4">
    <div class="flex gap-3">
      <div class="form-group flex-1">
        <label class="form-label">Nivel <span class="required">*</span></label>
        <select class="form-control" id="sal-nivel">
          <option value="Primaria"${s?.nivel==='Primaria'?' selected':''}>Primaria</option>
          <option value="Secundaria"${s?.nivel==='Secundaria'?' selected':''}>Secundaria</option>
        </select>
      </div>
      <div class="form-group" style="width:90px">
        <label class="form-label">Grado <span class="required">*</span></label>
        <select class="form-control" id="sal-grado">
          ${[1,2,3,4,5,6].map(g=>`<option value="${g}"${s?.grado==g?' selected':''}>${g}°</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="width:90px">
        <label class="form-label">Sección <span class="required">*</span></label>
        <input type="text" class="form-control" id="sal-seccion" maxlength="3"
               placeholder="A" style="text-transform:uppercase" value="${s?.seccion||''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Profesor Tutor</label>
      <select class="form-control" id="sal-tutor">${tutorOpts}</select>
      <div class="form-hint">Solo docentes sin salón asignado aparecen en la lista</div>
    </div>
  </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="BCE.saveSalon('${salId||''}')">
      <i data-lucide="save"></i> ${isEdit?'Guardar cambios':'Crear salón'}
    </button>`;

  openModal(isEdit?`Editar salón: ${salonFull(salId)}`:'Nuevo Salón', body, footer);
}

function saveSalon(salId) {
  const tutorId = document.getElementById('sal-tutor')?.value || null;
  const nivel   = document.getElementById('sal-nivel')?.value;
  const grado   = parseInt(document.getElementById('sal-grado')?.value||0);
  const seccion = (document.getElementById('sal-seccion')?.value||'').trim().toUpperCase();
  if(!nivel||!grado||!seccion){ toast('Completa nivel, grado y sección','danger'); return; }
  const newId = `${nivel==='Primaria'?'P':'S'}${grado}${seccion}`;

  if(salId) {
    const s=getSalon(salId); if(!s) return;
    if(newId!==salId && DB.salones.find(x=>x.id===newId)){ toast(`El salón ${newId} ya existe`,'danger'); return; }
    if(s.tutorId && s.tutorId!==tutorId){
      const old=getProfesor(s.tutorId); if(old&&old.tutorDe===salId) old.tutorDe=null;
    }
    if(tutorId && tutorId!==s.tutorId){
      const newT=getProfesor(tutorId);
      if(newT){ if(newT.tutorDe){ const os=getSalon(newT.tutorDe); if(os) os.tutorId=null; } newT.tutorDe=salId; }
    }
    s.tutorId=tutorId; s.nivel=nivel; s.grado=grado; s.seccion=seccion;
    if(newId!==salId){
      DB.alumnos.forEach(a=>{ if(a.salonId===salId) a.salonId=newId; });
      DB.operaciones.forEach(op=>op.items?.forEach(it=>{ if(it.salonId===salId) it.salonId=newId; }));
      DB.profesores.forEach(p=>{ if(p.tutorDe===salId) p.tutorDe=newId; });
      s.id=newId;
    }
    saveDB(); closeModal();
    toast('Salón actualizado','success');
    _doNavigate('catalogos/salones');
    return;
  }

  if(DB.salones.find(s=>s.id===newId)){ toast(`El salón ${newId} ya existe`,'danger'); return; }
  DB.salones.push({ id:newId, nivel, grado, seccion, tutorId:tutorId||null });
  if(tutorId){ const t=getProfesor(tutorId); if(t) t.tutorDe=newId; }
  saveDB(); closeModal();
  toast(`Salón ${salonFull(newId)} creado`,'success');
  _doNavigate('catalogos/salones');
}

function deleteSalon(salId) {
  const s=getSalon(salId);
  if(!s) return;
  const nAlumnos=DB.alumnos.filter(a=>a.salonId===salId).length;
  const nOps=DB.operaciones.filter(op=>op.items?.some(it=>it.salonId===salId)).length;
  let msg=`¿Eliminar el salón <strong>${salonFull(salId)}</strong>?`;
  if(nAlumnos>0) msg+=`<br><span style="color:var(--warning)">⚠ ${nAlumnos} alumno${nAlumnos!==1?'s':''} quedarán sin salón.</span>`;
  if(nOps>0)     msg+=`<br><span style="color:var(--warning)">⚠ ${nOps} operación${nOps!==1?'es':''} hacen referencia a este salón.</span>`;
  showConfirm({ title:'Eliminar salón', message:msg, confirmText:'Sí, eliminar', type:'danger', onConfirm:()=>{
    if(s.tutorId){ const t=getProfesor(s.tutorId); if(t&&t.tutorDe===salId) t.tutorDe=null; }
    DB.alumnos.filter(a=>a.salonId===salId).forEach(a=>a.salonId=null);
    DB.salones=DB.salones.filter(x=>x.id!==salId);
    saveDB(); toast('Salón eliminado','success');
    _doNavigate('catalogos/salones');
  }});
}

/* ══════════════════════════════════════════════
   CATÁLOGO PROFESORES
   ══════════════════════════════════════════════ */

function viewCatalogoProfesores() {
  CATPROF.page=1; CATPROF.query=''; CATPROF.filtro='';
  return `
  <div class="page-header">
    <div><h1 class="page-title">Catálogo — Profesores</h1>
    <p class="page-subtitle" id="catprof-count">${DB.profesores.filter(p=>getRol(p.rolId)?.tipo==='docente').length} profesores registrados</p></div>
    <button class="btn btn-primary" onclick="BCE.openModalProfesor(null)"><i data-lucide="plus"></i> Nuevo Profesor</button>
  </div>
  <div class="card mb-4">
    <div class="card-body" style="display:flex;gap:10px">
      <div class="search-box" style="flex:1">
        <i data-lucide="search"></i>
        <input class="form-control" id="catprof-search" placeholder="Buscar por nombre..."
               oninput="BCE.catProfSearch(this.value,null)">
      </div>
      <select class="form-control" style="width:160px" onchange="BCE.catProfSearch(null,this.value)">
        <option value="">Todos</option>
        <option value="tutor">Con tutoría</option>
        <option value="no-tutor">Sin tutoría</option>
      </select>
    </div>
  </div>
  <div class="card">
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Nombre</th><th>Tutor de</th><th>Nivel</th><th>Deuda</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody id="catprof-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="catprof-pagination" class="pagination-bar"></div>
  </div>`;
}

function catProfGetFiltered() {
  return DB.profesores.filter(p=>{
    if(getRol(p.rolId)?.tipo!=='docente') return false;
    if(CATPROF.filtro==='tutor'    && !p.tutorDe) return false;
    if(CATPROF.filtro==='no-tutor' &&  p.tutorDe) return false;
    if(CATPROF.query && !p.nombre.toLowerCase().includes(CATPROF.query)) return false;
    return true;
  });
}

function catProfRefresh() {
  const all=catProfGetFiltered(), total=all.length;
  const totalPages=Math.max(1,Math.ceil(total/CATPROF.perPage));
  if(CATPROF.page>totalPages) CATPROF.page=totalPages;
  const start=(CATPROF.page-1)*CATPROF.perPage;
  const slice=all.slice(start,start+CATPROF.perPage);
  const tbody=document.getElementById('catprof-tbody');
  if(!tbody) return;
  tbody.innerHTML=slice.map(p=>{
    const d=calcDeudaProfesor(p.id), s=p.tutorDe?getSalon(p.tutorDe):null;
    return `<tr>
      <td><div class="flex items-center gap-2">
        <div class="avatar avatar-sm ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
        <span class="td-bold">${p.nombre}</span>
      </div></td>
      <td>${p.tutorDe?`<span class="badge ${s?.nivel==='Primaria'?'nivel-primaria':'nivel-secundaria'}">${salonFull(p.tutorDe)}</span>`:`<span class="text-muted text-sm">Sin tutoría</span>`}</td>
      <td class="text-sm text-muted">${s?.nivel||'—'}</td>
      <td class="td-mono ${d.pendiente>0?'text-danger font-bold':''}">${d.total>0?fmt(d.pendiente):'—'}</td>
      <td><span class="badge ${d.pendiente>0?'badge-warning':'badge-success'}">${d.pendiente>0?'Con deuda':'Al día'}</span></td>
      <td><div class="flex gap-1">
        <button class="btn btn-sm btn-secondary" onclick="BCE.openDetalleProfesor('${p.id}')"><i data-lucide="eye"></i> Ver</button>
        <button class="btn-icon" onclick="BCE.openModalProfesor('${p.id}')"><i data-lucide="pencil"></i></button>
        <button class="btn-icon" style="color:var(--danger)" onclick="BCE.deleteProfesor('${p.id}')"><i data-lucide="trash-2"></i></button>
      </div></td>
    </tr>`;
  }).join('')||`<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--t-300)">Sin resultados</td></tr>`;
  const pag=document.getElementById('catprof-pagination');
  if(pag) pag.innerHTML=makePagHTML(total,CATPROF.page,CATPROF.perPage,'catProfSetPage','catProfSetPerPage');
  const lbl=document.getElementById('catprof-count');
  if(lbl) lbl.textContent=`${total} profesor${total!==1?'es':''} ${CATPROF.query||CATPROF.filtro?'encontrados':'registrados'}`;
  lucide.createIcons();
}

function catProfSearch(q,filtro) {
  if(q!==null) CATPROF.query=(q||'').toLowerCase();
  if(filtro!==null&&filtro!==undefined) CATPROF.filtro=filtro||'';
  CATPROF.page=1; catProfRefresh();
}
function catProfSetPage(p)    { CATPROF.page=p; catProfRefresh(); }
function catProfSetPerPage(n) { CATPROF.perPage=n; CATPROF.page=1; catProfRefresh(); }

function openModalProfesor(profId) {
  const p = profId ? getProfesor(profId) : null;
  const rolOpts = DB.roles.filter(r=>r.tipo==='docente').map(r=>
    `<option value="${r.id}"${(p?.rolId||'ROL06')===r.id?' selected':''}>${r.nombre}</option>`
  ).join('');
  const salonesDisp = DB.salones.filter(s=>!s.tutorId||s.id===p?.tutorDe);
  const tutorOpts = `<option value="">— Sin tutoría —</option>`+
    salonesDisp.map(s=>`<option value="${s.id}"${p?.tutorDe===s.id?' selected':''}>${salonFull(s.id)}</option>`).join('');

  const body=`<div class="flex flex-col gap-4">
    <div class="form-group">
      <label class="form-label">Nombre completo <span class="required">*</span></label>
      <input type="text" class="form-control" id="prof-nombre" value="${p?.nombre||''}" placeholder="Ej: Ana Flores">
    </div>
    <div class="form-group">
      <label class="form-label">Rol</label>
      <select class="form-control" id="prof-rol">${rolOpts}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Salón tutor <span class="text-muted text-xs">(opcional)</span></label>
      <select class="form-control" id="prof-tutor">${tutorOpts}</select>
      <div class="form-hint">Solo salones sin tutor asignado están disponibles</div>
    </div>
    <div class="form-group">
      <label class="form-label">Color de avatar</label>
      ${_avColorPicker(p?.avatarColor||'av-blue')}
    </div>
  </div>`;

  const footer=`
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="BCE.saveProfesor('${profId||''}')">
      <i data-lucide="save"></i> ${p?'Guardar cambios':'Crear profesor'}
    </button>`;

  openModal(p?`Editar: ${p.nombre}`:'Nuevo Profesor', body, footer);
}

function saveProfesor(profId) {
  const nombre  = document.getElementById('prof-nombre')?.value.trim();
  const rolId   = document.getElementById('prof-rol')?.value;
  const tutorDe = document.getElementById('prof-tutor')?.value||null;
  const color   = document.getElementById('cat-av')?.value||'av-blue';
  if(!nombre){ toast('El nombre es obligatorio','danger'); return; }

  if(profId) {
    const p=getProfesor(profId); if(!p) return;
    if(p.tutorDe&&p.tutorDe!==tutorDe){ const os=getSalon(p.tutorDe); if(os&&os.tutorId===profId) os.tutorId=null; }
    if(tutorDe&&tutorDe!==p.tutorDe){ const ns=getSalon(tutorDe); if(ns) ns.tutorId=profId; }
    p.nombre=nombre; p.rolId=rolId; p.tutorDe=tutorDe; p.avatarColor=color;
  } else {
    const newId='T'+String(DB.profesores.filter(p=>p.id.startsWith('T')).length+1).padStart(2,'0');
    DB.profesores.push({ id:newId, nombre, rolId, tutorDe, avatarColor:color });
    if(tutorDe){ const s=getSalon(tutorDe); if(s) s.tutorId=newId; }
  }
  saveDB(); closeModal();
  toast(profId?'Profesor actualizado':'Profesor creado','success');
  catProfRefresh();
}

function deleteProfesor(profId) {
  const p=getProfesor(profId); if(!p) return;
  const nOps=DB.operaciones.filter(op=>op.solicitanteId===profId).length;
  let msg=`¿Eliminar al profesor <strong>${p.nombre}</strong>?`;
  if(p.tutorDe) msg+=`<br><span style="color:var(--warning)">⚠ Es tutor de ${salonFull(p.tutorDe)}. El salón quedará sin tutor.</span>`;
  if(nOps>0)    msg+=`<br><span style="color:var(--warning)">⚠ Tiene ${nOps} operación${nOps!==1?'es':''} registrada${nOps!==1?'s':''}.</span>`;
  showConfirm({ title:'Eliminar profesor', message:msg, confirmText:'Sí, eliminar', type:'danger', onConfirm:()=>{
    if(p.tutorDe){ const s=getSalon(p.tutorDe); if(s&&s.tutorId===profId) s.tutorId=null; }
    DB.profesores=DB.profesores.filter(x=>x.id!==profId);
    saveDB(); toast(`${p.nombre} eliminado`,'success');
    catProfRefresh();
  }});
}

/* ══════════════════════════════════════════════
   CATÁLOGO PERSONAL
   ══════════════════════════════════════════════ */

function viewCatalogoPersonal() {
  CATPERS.page=1; CATPERS.query=''; CATPERS.filtro='';
  return `
  <div class="page-header">
    <div><h1 class="page-title">Catálogo — Personal</h1>
    <p class="page-subtitle" id="catpers-count">${DB.profesores.length} miembros del personal registrados</p></div>
    <button class="btn btn-primary" onclick="BCE.openModalPersonal(null)"><i data-lucide="plus"></i> Nuevo Registro</button>
  </div>
  <div class="card mb-4">
    <div class="card-body" style="display:flex;gap:10px">
      <div class="search-box" style="flex:1">
        <i data-lucide="search"></i>
        <input class="form-control" id="catpers-search" placeholder="Buscar por nombre..."
               oninput="BCE.catPersSearch(this.value,null)">
      </div>
      <select class="form-control" style="width:180px" onchange="BCE.catPersSearch(null,this.value)">
        <option value="">Todos</option>
        <option value="administrativo">Administrativo</option>
        <option value="docente">Docente</option>
      </select>
    </div>
  </div>
  <div class="card">
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Nombre</th><th>Rol</th><th>Tipo</th><th>Salón tutor</th><th>Acciones</th></tr></thead>
          <tbody id="catpers-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="catpers-pagination" class="pagination-bar"></div>
  </div>`;
}

function catPersGetFiltered() {
  return DB.profesores.filter(p=>{
    const rol=getRol(p.rolId);
    if(CATPERS.filtro&&rol?.tipo!==CATPERS.filtro) return false;
    if(CATPERS.query&&!p.nombre.toLowerCase().includes(CATPERS.query)) return false;
    return true;
  });
}

function catPersRefresh() {
  const all=catPersGetFiltered(), total=all.length;
  const totalPages=Math.max(1,Math.ceil(total/CATPERS.perPage));
  if(CATPERS.page>totalPages) CATPERS.page=totalPages;
  const start=(CATPERS.page-1)*CATPERS.perPage;
  const slice=all.slice(start,start+CATPERS.perPage);
  const tbody=document.getElementById('catpers-tbody');
  if(!tbody) return;
  tbody.innerHTML=slice.map(p=>{
    const rol=getRol(p.rolId);
    const tipoClass=rol?.tipo==='administrativo'?'badge-warning':'badge-primary';
    const tipoLabel=rol?.tipo==='administrativo'?'Administrativo':'Docente';
    return `<tr>
      <td><div class="flex items-center gap-2">
        <div class="avatar avatar-sm ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
        <span class="td-bold">${p.nombre}</span>
      </div></td>
      <td class="text-sm">${rol?.nombre||'—'}</td>
      <td><span class="badge ${tipoClass}">${tipoLabel}</span></td>
      <td>${p.tutorDe?`<span class="badge ${getSalon(p.tutorDe)?.nivel==='Primaria'?'nivel-primaria':'nivel-secundaria'}">${salonFull(p.tutorDe)}</span>`:`<span class="text-muted text-sm">—</span>`}</td>
      <td><div class="flex gap-1">
        <button class="btn-icon" onclick="BCE.openModalPersonal('${p.id}')"><i data-lucide="pencil"></i></button>
        <button class="btn-icon" style="color:var(--danger)" onclick="BCE.deletePersonal('${p.id}')"><i data-lucide="trash-2"></i></button>
      </div></td>
    </tr>`;
  }).join('')||`<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--t-300)">Sin resultados</td></tr>`;
  const pag=document.getElementById('catpers-pagination');
  if(pag) pag.innerHTML=makePagHTML(total,CATPERS.page,CATPERS.perPage,'catPersSetPage','catPersSetPerPage');
  const lbl=document.getElementById('catpers-count');
  if(lbl) lbl.textContent=`${total} ${total!==1?'miembros':'miembro'} ${CATPERS.query||CATPERS.filtro?'encontrados':'registrados'}`;
  lucide.createIcons();
}

function catPersSearch(q,filtro) {
  if(q!==null) CATPERS.query=(q||'').toLowerCase();
  if(filtro!==null&&filtro!==undefined) CATPERS.filtro=filtro||'';
  CATPERS.page=1; catPersRefresh();
}
function catPersSetPage(p)    { CATPERS.page=p; catPersRefresh(); }
function catPersSetPerPage(n) { CATPERS.perPage=n; CATPERS.page=1; catPersRefresh(); }

function openModalPersonal(persId) {
  const p = persId ? getProfesor(persId) : null;
  const rolOpts = DB.roles.map(r=>
    `<option value="${r.id}"${(p?.rolId||'ROL05')===r.id?' selected':''}>${r.nombre} — ${r.tipo==='docente'?'Docente':'Administrativo'}</option>`
  ).join('');

  const body=`<div class="flex flex-col gap-4">
    <div class="form-group">
      <label class="form-label">Nombre completo <span class="required">*</span></label>
      <input type="text" class="form-control" id="pers-nombre" value="${p?.nombre||''}" placeholder="Ej: Pedro Ramírez">
    </div>
    <div class="form-group">
      <label class="form-label">Rol <span class="required">*</span></label>
      <select class="form-control" id="pers-rol">${rolOpts}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Color de avatar</label>
      ${_avColorPicker(p?.avatarColor||'av-blue')}
    </div>
  </div>`;

  const footer=`
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="BCE.savePersonal('${persId||''}')">
      <i data-lucide="save"></i> ${p?'Guardar cambios':'Agregar al personal'}
    </button>`;

  openModal(p?`Editar: ${p.nombre}`:'Nuevo miembro del personal', body, footer);
}

function savePersonal(persId) {
  const nombre = document.getElementById('pers-nombre')?.value.trim();
  const rolId  = document.getElementById('pers-rol')?.value;
  const color  = document.getElementById('cat-av')?.value||'av-blue';
  if(!nombre){ toast('El nombre es obligatorio','danger'); return; }

  if(persId) {
    const p=getProfesor(persId); if(!p) return;
    p.nombre=nombre; p.rolId=rolId; p.avatarColor=color;
  } else {
    const newId='P'+String(DB.profesores.filter(p=>p.id.startsWith('P')).length+1).padStart(3,'0');
    DB.profesores.push({ id:newId, nombre, rolId, tutorDe:null, avatarColor:color });
  }
  saveDB(); closeModal();
  toast(persId?'Personal actualizado':'Personal agregado','success');
  catPersRefresh();
}

function deletePersonal(persId) {
  const p=getProfesor(persId); if(!p) return;
  const nOpsDir=DB.operaciones.filter(op=>op.dirResponsable===p.nombre||op.dirPortador===p.nombre).length;
  let msg=`¿Eliminar a <strong>${p.nombre}</strong> del personal?`;
  if(nOpsDir>0) msg+=`<br><span style="color:var(--warning)">⚠ Aparece en ${nOpsDir} operación${nOpsDir!==1?'es':''} de Dirección.</span>`;
  showConfirm({ title:'Eliminar personal', message:msg, confirmText:'Sí, eliminar', type:'danger', onConfirm:()=>{
    if(p.tutorDe){ const s=getSalon(p.tutorDe); if(s&&s.tutorId===persId) s.tutorId=null; }
    DB.profesores=DB.profesores.filter(x=>x.id!==persId);
    saveDB(); toast(`${p.nombre} eliminado del personal`,'success');
    catPersRefresh();
  }});
}

/* ══════════════════════════════════════════════
   CATÁLOGO ALUMNOS
   ══════════════════════════════════════════════ */

function viewCatalogoAlumnos() {
  const salonesNivel = DB.salones.filter(s=>s.nivel===CATS.nivel);
  if(!CATS.salonId) CATS.salonId='TODOS';
  return `
  <div class="page-header">
    <div><h1 class="page-title">Catálogo — Alumnos</h1>
    <p class="page-subtitle">${DB.alumnos.length} alumnos registrados</p></div>
    <button class="btn btn-primary" onclick="BCE.openModalAlumno(null)"><i data-lucide="plus"></i> Nuevo Alumno</button>
  </div>
  <div class="grid-1-2" style="align-items:start;gap:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">Filtrar</div></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label class="form-label">Nivel</label>
          <div class="filter-bar" style="margin-top:6px">
            <button class="filter-chip${CATS.nivel==='Primaria'?' active':''}" onclick="BCE.catsSetNivel('Primaria',this)">Primaria</button>
            <button class="filter-chip${CATS.nivel==='Secundaria'?' active':''}" onclick="BCE.catsSetNivel('Secundaria',this)">Secundaria</button>
            <button class="filter-chip${CATS.nivel==='sin-asignar'?' active':''}" onclick="BCE.catsSetNivel('sin-asignar',this)">
              Sin salón <span class="tab-count">${DB.alumnos.filter(a=>!a.salonId).length}</span>
            </button>
          </div>
        </div>
        <div id="cats-salon-wrap"${CATS.nivel==='sin-asignar'?' style="display:none"':''}>
          <label class="form-label">Salón</label>
          <div class="salon-chips" id="cats-salon-chips" style="margin-top:6px">
            <button class="filter-chip${CATS.salonId==='TODOS'?' active':''}" onclick="BCE.catsSetSalon('TODOS',this)">Todos</button>
            ${salonesNivel.map(s=>`
            <button class="filter-chip${s.id===CATS.salonId?' active':''}" onclick="BCE.catsSetSalon('${s.id}',this)">
              ${s.grado}°${s.seccion}
            </button>`).join('')}
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <label class="form-label">Buscar por nombre</label>
          <div class="search-box" style="margin-top:6px">
            <i data-lucide="search"></i>
            <input class="form-control" id="cats-search" placeholder="Nombre del alumno..."
                   oninput="BCE.catsSearch(this.value)" value="${CATS.query||''}">
          </div>
        </div>
      </div>
    </div>
    <div id="cats-salon-panel"></div>
  </div>`;
}

function catsAlumnosHTML() {
  const esSinAsignar = CATS.nivel==='sin-asignar';
  const esTodos = !esSinAsignar && (!CATS.salonId||CATS.salonId==='TODOS');
  let alumnos, panelTitle, panelSub;
  if(esSinAsignar) {
    alumnos=DB.alumnos.filter(a=>!a.salonId);
    panelTitle='Sin salón asignado';
    panelSub='Alumnos registrados sin nivel ni salón (creados desde operaciones)';
  } else if(esTodos) {
    const ids=DB.salones.filter(s=>s.nivel===CATS.nivel).map(s=>s.id);
    alumnos=DB.alumnos.filter(a=>ids.includes(a.salonId));
    panelTitle=`Todos — ${CATS.nivel}`;
    panelSub=`${alumnos.length} alumno${alumnos.length!==1?'s':''} registrado${alumnos.length!==1?'s':''}`;
  } else {
    const salon=getSalon(CATS.salonId), tutor=getProfesor(salon?.tutorId);
    alumnos=DB.alumnos.filter(a=>a.salonId===CATS.salonId);
    panelTitle=salonFull(CATS.salonId);
    panelSub=`Tutor: ${tutor?.nombre||'Sin asignar'}`;
  }
  if(CATS.query) alumnos=alumnos.filter(a=>a.nombre.toLowerCase().includes(CATS.query.toLowerCase()));
  const cols=(esTodos||esSinAsignar)?5:4;
  return `
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">${panelTitle}</div><div class="card-subtitle">${panelSub}</div></div>
      <span class="badge badge-neutral">${alumnos.length} alumno${alumnos.length!==1?'s':''}</span>
    </div>
    <div class="card-body-flush">
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>#</th><th>Nombre</th>
            ${(esTodos||esSinAsignar)?'<th>Salón</th>':''}
            <th>Deuda personal</th><th>Acciones</th>
          </tr></thead>
          <tbody>
            ${alumnos.length ? alumnos.map((a,i)=>{
              const d=calcDeudaAlumno(a.id,a.nombre);
              return `<tr>
                <td class="text-muted">${i+1}</td>
                <td><div class="flex items-center gap-2">
                  <div class="avatar avatar-sm av-blue">${slugAvatar(a.nombre)}</div>
                  <span class="td-bold">${a.nombre}</span>
                </div></td>
                ${(esTodos||esSinAsignar)?`<td class="text-sm">${a.salonId?salonLabel(a.salonId):'<span class="badge badge-warning badge-sm">Sin salón</span>'}</td>`:''}
                <td>${d.pendiente>0?`<span class="font-bold text-danger">${fmt(d.pendiente)}</span>`:`<span class="text-success font-medium">Sin deuda</span>`}</td>
                <td><div class="flex gap-1">
                  <button class="btn-icon" onclick="BCE.openModalAlumno('${a.id}')"><i data-lucide="pencil"></i></button>
                  <button class="btn-icon" style="color:var(--danger)" onclick="BCE.deleteAlumno('${a.id}')"><i data-lucide="trash-2"></i></button>
                </div></td>
              </tr>`;
            }).join(''):`<tr><td colspan="${cols}" style="text-align:center;padding:24px;color:var(--t-300)">Sin alumnos${CATS.query?' que coincidan':' registrados aquí'}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function catsRefreshPanel() {
  const panel=document.getElementById('cats-salon-panel');
  if(panel){ panel.innerHTML=catsAlumnosHTML(); lucide.createIcons(); }
}

function catsSetNivel(nivel, el) {
  CATS.nivel=nivel; CATS.salonId='TODOS'; CATS.query='';
  if(el){ el.closest('.filter-bar')?.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); }
  const wrap=document.getElementById('cats-salon-wrap');
  if(wrap) wrap.style.display=nivel==='sin-asignar'?'none':'';
  const chips=document.getElementById('cats-salon-chips');
  if(chips) chips.innerHTML=`<button class="filter-chip active" onclick="BCE.catsSetSalon('TODOS',this)">Todos</button>`+
    DB.salones.filter(s=>s.nivel===nivel).map(s=>`<button class="filter-chip" onclick="BCE.catsSetSalon('${s.id}',this)">${s.grado}°${s.seccion}</button>`).join('');
  const search=document.getElementById('cats-search'); if(search) search.value='';
  catsRefreshPanel();
}

function catsSetSalon(salonId, el) {
  CATS.salonId=salonId;
  document.querySelectorAll('#cats-salon-chips .filter-chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  catsRefreshPanel();
}

function catsSearch(q) { CATS.query=q; catsRefreshPanel(); }

function openModalAlumno(aluId) {
  const a = aluId ? DB.alumnos.find(x=>x.id===aluId) : null;
  const salOpts = `<option value="">— Sin salón asignado —</option>`+
    ['Primaria','Secundaria'].map(nivel=>`<optgroup label="${nivel}">`+
      DB.salones.filter(s=>s.nivel===nivel).map(s=>`<option value="${s.id}"${a?.salonId===s.id?' selected':''}>${salonFull(s.id)} — ${getProfesor(s.tutorId)?.nombre||'sin tutor'}</option>`).join('')+
    `</optgroup>`).join('');

  const body=`<div class="flex flex-col gap-4">
    <div class="form-group">
      <label class="form-label">Nombre completo <span class="required">*</span></label>
      <input type="text" class="form-control" id="alu-nombre" value="${a?.nombre||''}" placeholder="Ej: Camila Vega Torres">
    </div>
    <div class="form-group">
      <label class="form-label">Salón</label>
      <select class="form-control" id="alu-salon">${salOpts}</select>
    </div>
  </div>`;

  const footer=`
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="BCE.saveAlumno('${aluId||''}')">
      <i data-lucide="save"></i> ${a?'Guardar cambios':'Agregar alumno'}
    </button>`;

  openModal(a?`Editar: ${a.nombre}`:'Nuevo Alumno', body, footer);
}

function saveAlumno(aluId) {
  const nombre  = document.getElementById('alu-nombre')?.value.trim();
  const salonId = document.getElementById('alu-salon')?.value||null;
  if(!nombre){ toast('El nombre es obligatorio','danger'); return; }

  if(aluId) {
    const a=DB.alumnos.find(x=>x.id===aluId); if(!a) return;
    a.nombre=nombre; a.salonId=salonId;
  } else {
    const newId='ALU'+String(DB.alumnos.length+1).padStart(3,'0');
    DB.alumnos.push({ id:newId, nombre, salonId });
  }
  saveDB(); closeModal();
  toast(aluId?'Alumno actualizado':'Alumno agregado','success');
  catsRefreshPanel();
}

function deleteAlumno(aluId) {
  const a=DB.alumnos.find(x=>x.id===aluId); if(!a) return;
  const d=calcDeudaAlumno(aluId,a.nombre);
  const nOps=DB.operaciones.filter(op=>op.tipo==='alumno'&&(op.solicitanteId===aluId||op.alumnoNombre===a.nombre)).length;
  let msg=`¿Eliminar al alumno <strong>${a.nombre}</strong>?`;
  if(d.pendiente>0) msg+=`<br><span style="color:var(--danger)">⚠ Tiene deuda pendiente de <strong>${fmt(d.pendiente)}</strong>.</span>`;
  if(nOps>0) msg+=`<br><span style="color:var(--warning)">⚠ Tiene ${nOps} operación${nOps!==1?'es':''} registrada${nOps!==1?'s':''}.</span>`;
  showConfirm({ title:'Eliminar alumno', message:msg, confirmText:'Sí, eliminar', type:'danger', onConfirm:()=>{
    DB.alumnos=DB.alumnos.filter(x=>x.id!==aluId);
    saveDB(); toast(`${a.nombre} eliminado`,'success');
    catsRefreshPanel();
  }});
}

/* ══════════════════════════════════════════════
   CATÁLOGO USUARIOS
   ══════════════════════════════════════════════ */

const _nivelLabel = { admin:'Administrador', operador:'Operador', consulta:'Solo consulta' };
const _nivelBadge = { admin:'badge-danger', operador:'badge-success', consulta:'badge-neutral' };

function viewCatalogoUsuarios() {
  CATUSR.query = '';
  return `
  <div class="page-header">
    <div><h1 class="page-title">Catálogo — Usuarios del Sistema</h1>
    <p class="page-subtitle" id="catusr-count">${DB.usuarios.length} usuario${DB.usuarios.length!==1?'s':''} registrado${DB.usuarios.length!==1?'s':''}</p></div>
    <button class="btn btn-primary" onclick="BCE.openModalUsuario(null)"><i data-lucide="plus"></i> Nuevo Usuario</button>
  </div>

  <div class="alert alert-info mb-4">
    <i data-lucide="info"></i>
    <span>Los usuarios definen quién puede acceder al sistema BCE y con qué nivel de permisos. El inicio de sesión se habilitará en una próxima versión.</span>
  </div>

  <div class="card">
    <div class="card-body" style="padding-bottom:0">
      <div class="search-box" style="max-width:320px">
        <i data-lucide="search"></i>
        <input class="form-control" id="catusr-search" placeholder="Buscar por usuario o persona..."
               oninput="BCE.catUsrSearch(this.value)">
      </div>
    </div>
    <div class="card-body-flush" id="catusr-table-wrap">
      ${_catUsrTableHTML()}
    </div>
  </div>`;
}

function _catUsrTableHTML() {
  let lista = DB.usuarios || [];
  if(CATUSR.query) lista = lista.filter(u=>(u.username||'').toLowerCase().includes(CATUSR.query.toLowerCase())||
    (getProfesor(u.personaId)?.nombre||'').toLowerCase().includes(CATUSR.query.toLowerCase()));
  return `<table class="table">
    <thead><tr>
      <th>#</th><th>Usuario</th><th>Persona vinculada</th><th>Nivel de acceso</th><th>Estado</th><th>Acciones</th>
    </tr></thead>
    <tbody>${lista.length ? lista.map((u,i)=>{
      const p = getProfesor(u.personaId);
      const rol = p ? getRol(p.rolId) : null;
      return `<tr>
        <td class="text-muted">${i+1}</td>
        <td><div class="flex items-center gap-2">
          <div class="avatar avatar-sm av-blue" style="font-size:11px"><i data-lucide="user-round"></i></div>
          <div><div class="td-bold">${u.username||'—'}</div>
            <div class="text-xs text-muted">••••••</div>
          </div>
        </div></td>
        <td>${p ? `<div class="td-bold">${p.nombre}</div><div class="text-xs text-muted">${rol?.nombre||''}</div>` : '<span class="text-muted">Sin vincular</span>'}</td>
        <td><span class="badge ${_nivelBadge[u.nivel]||'badge-neutral'}">${_nivelLabel[u.nivel]||u.nivel}</span></td>
        <td>
          <label class="toggle-wrap" style="gap:8px;cursor:pointer" onclick="BCE.catUsrToggleActivo('${u.id}')">
            <div class="toggle${u.activo?' on':''}"><div class="toggle-knob"></div></div>
            <span class="text-sm ${u.activo?'text-success font-medium':'text-muted'}">${u.activo?'Activo':'Inactivo'}</span>
          </label>
        </td>
        <td><div class="flex gap-1">
          <button class="btn-icon" onclick="BCE.openModalUsuario('${u.id}')"><i data-lucide="pencil"></i></button>
          <button class="btn-icon" style="color:var(--danger)" onclick="BCE.deleteUsuario('${u.id}')"><i data-lucide="trash-2"></i></button>
        </div></td>
      </tr>`;
    }).join('') : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--t-300)">Sin usuarios registrados</td></tr>`}
    </tbody>
  </table>`;
}

function catUsrRefresh() {
  const wrap = document.getElementById('catusr-table-wrap');
  if(wrap){ wrap.innerHTML = _catUsrTableHTML(); lucide.createIcons(); }
  const cnt = document.getElementById('catusr-count');
  if(cnt) cnt.textContent = `${(DB.usuarios||[]).length} usuario${(DB.usuarios||[]).length!==1?'s':''} registrado${(DB.usuarios||[]).length!==1?'s':''}`;
}

function catUsrSearch(q) { CATUSR.query=q; catUsrRefresh(); }

function openModalUsuario(usrId) {
  const u = usrId ? (DB.usuarios||[]).find(x=>x.id===usrId) : null;
  const personaOpts = `<option value="">— Sin vincular —</option>` +
    DB.profesores.map(p=>`<option value="${p.id}"${u?.personaId===p.id?' selected':''}>${p.nombre} — ${getRol(p.rolId)?.nombre||''}</option>`).join('');

  const body = `<div class="flex flex-col gap-4">
    <div class="form-group">
      <label class="form-label">Nombre de usuario <span class="required">*</span></label>
      <input type="text" class="form-control" id="usr-username" value="${u?.username||''}" placeholder="Ej: jperez" autocomplete="off">
      <div class="form-hint">Se usará para iniciar sesión. Solo letras, números y guiones.</div>
    </div>
    <div class="form-group">
      <label class="form-label">${u?'Nueva contraseña <span class="text-muted">(dejar vacío para no cambiar)</span>':'Contraseña <span class="required">*</span>'}</label>
      <input type="password" class="form-control" id="usr-password" placeholder="••••••" autocomplete="new-password">
    </div>
    <div class="form-group">
      <label class="form-label">Persona vinculada</label>
      <select class="form-control" id="usr-persona">${personaOpts}</select>
      <div class="form-hint">Persona del Personal o Profesores a la que corresponde este usuario.</div>
    </div>
    <div class="form-group">
      <label class="form-label">Nivel de acceso <span class="required">*</span></label>
      <select class="form-control" id="usr-nivel">
        <option value="admin"${u?.nivel==='admin'?' selected':''}>Administrador — acceso completo</option>
        <option value="operador"${u?.nivel==='operador'?' selected':''}>Operador — registrar operaciones y ver reportes</option>
        <option value="consulta"${u?.nivel==='consulta'?' selected':''}>Solo consulta — solo lectura</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <label class="flex items-center gap-2" style="cursor:pointer">
        <input type="checkbox" id="usr-activo"${(u?.activo!==false)?' checked':''} style="width:16px;height:16px">
        <span class="text-sm">Usuario activo</span>
      </label>
    </div>
  </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="BCE.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="BCE.saveUsuario('${usrId||''}')">
      <i data-lucide="save"></i> ${u?'Guardar cambios':'Crear usuario'}
    </button>`;

  openModal(u?`Editar usuario: ${u.username}`:'Nuevo Usuario del Sistema', body, footer);
}

function saveUsuario(usrId) {
  if(!DB.usuarios) DB.usuarios=[];
  const username = document.getElementById('usr-username')?.value.trim().toLowerCase();
  const password = document.getElementById('usr-password')?.value;
  const personaId= document.getElementById('usr-persona')?.value||null;
  const nivel    = document.getElementById('usr-nivel')?.value;
  const activo   = document.getElementById('usr-activo')?.checked ?? true;

  if(!username){ toast('El nombre de usuario es obligatorio','danger'); return; }
  const dup = DB.usuarios.find(x=>x.username===username && x.id!==usrId);
  if(dup){ toast(`El usuario "${username}" ya existe`,'danger'); return; }

  if(usrId) {
    const u=DB.usuarios.find(x=>x.id===usrId); if(!u) return;
    u.username=username; u.personaId=personaId; u.nivel=nivel; u.activo=activo;
    if(password) u.password=password;
  } else {
    if(!password){ toast('La contraseña es obligatoria para un usuario nuevo','danger'); return; }
    const newId='U'+String((DB.usuarios.length+1)).padStart(3,'0');
    DB.usuarios.push({ id:newId, username, password, personaId, nivel, activo });
  }
  saveDB(); closeModal();
  toast(usrId?'Usuario actualizado':'Usuario creado','success');
  catUsrRefresh();
}

function deleteUsuario(usrId) {
  const u=(DB.usuarios||[]).find(x=>x.id===usrId); if(!u) return;
  showConfirm({ title:'Eliminar usuario', message:`¿Eliminar al usuario <strong>${u.username}</strong>? Esta acción no se puede deshacer.`,
    confirmText:'Sí, eliminar', type:'danger', onConfirm:()=>{
    DB.usuarios=DB.usuarios.filter(x=>x.id!==usrId);
    saveDB(); toast(`Usuario "${u.username}" eliminado`,'success');
    catUsrRefresh();
  }});
}

function catUsrToggleActivo(usrId) {
  const u=(DB.usuarios||[]).find(x=>x.id===usrId); if(!u) return;
  u.activo=!u.activo;
  saveDB();
  catUsrRefresh();
}
