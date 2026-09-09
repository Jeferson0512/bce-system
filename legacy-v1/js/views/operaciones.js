/* =============================================
   BCE System — View: Nueva Operación
   ============================================= */

const NOP = {
  tipo: 'profesor',
  profId: null,
  alumnoNombre: '',
  alumnoSalonId: null,
  alumnoEsPersonal: false,
  alumnoProfeEnvio: '',
  dirResponsable: '',
  dirPortador: '',
  items: [],
  multiSalonMode: false,
  salonesSeleccionados: {},
  modoKiosco: false,
  reset() {
    this.profId=null; this.alumnoNombre=''; this.alumnoSalonId=null;
    this.alumnoEsPersonal=false; this.alumnoProfeEnvio=''; this.dirResponsable=''; this.dirPortador='';
    this.items=[];
    this.multiSalonMode=false; this.salonesSeleccionados={};
    this.modoKiosco=false;
  }
};

function viewNuevaOperacion() {
  NOP.reset();
  NOP.tipo = 'profesor';
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Nueva Operación</h1>
      <p class="page-subtitle">Registrar copias, impresiones u otros servicios</p>
    </div>
  </div>

  <div class="grid-1-2" style="align-items:start">
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- PASO 1: Tipo -->
      <div class="card">
        <div class="card-header"><div class="card-title">1. ¿Quién solicita?</div></div>
        <div class="card-body">
          <div class="radio-group" id="nop-tipo-group">
            <label class="radio-card selected" onclick="BCE.nopSetTipo('profesor',this)">
              <i data-lucide="graduation-cap"></i>
              <span class="radio-card-label">Profesor</span>
            </label>
            <label class="radio-card" onclick="BCE.nopSetTipo('alumno',this)">
              <i data-lucide="user"></i>
              <span class="radio-card-label">Alumno</span>
            </label>
            <label class="radio-card" onclick="BCE.nopSetTipo('direccion',this)">
              <i data-lucide="building-2"></i>
              <span class="radio-card-label">Dirección</span>
            </label>
          </div>
        </div>
      </div>

      <!-- PASO 2: Solicitante -->
      <div class="card" id="nop-card-sol">
        ${nopSolicitanteHTML()}
      </div>

      <!-- PASO 3: Agregar servicio -->
      <div class="card">
        <div class="card-header" style="align-items:center">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="card-title">3. Agregar</div>
            <div class="filter-bar" id="nop-modo-tabs">
              <button class="filter-chip active" id="nop-tab-servicio" onclick="BCE.nopSetModo('servicio')">Servicio</button>
              <button class="filter-chip" id="nop-tab-kiosko" onclick="BCE.nopSetModo('kiosko')"><i data-lucide="shopping-bag" style="width:12px;height:12px;margin-right:3px"></i>Kiosco</button>
            </div>
          </div>
          <button id="nop-multisalon-toggle" class="btn btn-sm btn-outline-primary"
                  onclick="BCE.nopToggleMultiSalon(this)" title="Agregar el mismo servicio a varios salones de una vez">
            <i data-lucide="layers"></i> Varios salones
          </button>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
          <div class="form-group" id="nop-servicio-grp">
            <label class="form-label">Tipo de servicio <span class="required">*</span></label>
            <select class="form-control" id="nop-servicio" onchange="BCE.nopOnServicioChange(this.value)">
              ${DB.precios.map((p,i)=>`<option value="${p.id}"${i===0?' selected':''}>${p.nombre}${p.variable?' (variable)':''}</option>`).join('')}
            </select>
          </div>

          <!-- MODO INDIVIDUAL (default) -->
          <div id="nop-individual-grp" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group" id="nop-salon-grp">
              <label class="form-label">¿Para qué salón? <span class="text-muted text-xs">(vacío = personal del profesor)</span></label>
              <select class="form-control" id="nop-salon" onchange="BCE.nopOnSalonChange(this.value)">
                <option value="">— Personal del profesor —</option>
                <optgroup label="Primaria">
                  ${DB.salones.filter(s=>s.nivel==='Primaria').map(s=>`<option value="${s.id}">${s.grado}°${s.seccion} — Tutor: ${getProfesor(s.tutorId)?.nombre||'?'}</option>`).join('')}
                </optgroup>
                <optgroup label="Secundaria">
                  ${DB.salones.filter(s=>s.nivel==='Secundaria').map(s=>`<option value="${s.id}">${s.grado}°${s.seccion} — Tutor: ${getProfesor(s.tutorId)?.nombre||'?'}</option>`).join('')}
                </optgroup>
              </select>
              <div class="form-hint" id="nop-salon-hint" style="margin-top:4px"></div>
            </div>
            <div class="flex gap-3" style="align-items:flex-end">
              <div class="form-group flex-1">
                <label class="form-label">Cantidad <span class="required">*</span></label>
                <div style="display:flex;align-items:center;gap:5px">
                  <input type="number" class="form-control" id="nop-cantidad" placeholder="0" min="1" style="flex:1;min-width:0" oninput="BCE.nopCalcItem()">
                  <span class="text-muted" style="font-size:15px;flex-shrink:0">×</span>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:1px">
                    <input type="number" class="form-control" id="nop-juegos" value="1" min="1" style="width:52px;text-align:center" title="Juegos: cuántos originales distintos" oninput="BCE.nopCalcItem()">
                    <span style="font-size:10px;color:var(--t-300);line-height:1">juegos</span>
                  </div>
                  <span id="nop-total-real" class="text-xs text-muted" style="display:none;white-space:nowrap;flex-shrink:0"></span>
                </div>
              </div>
              <div class="form-group" style="width:120px">
                <label class="form-label">Precio unit.</label>
                <div class="input-group">
                  <span class="input-addon input-addon-left">S/</span>
                  <input type="number" class="form-control" id="nop-precio" step="0.01" placeholder="0.00" oninput="BCE.nopCalcItem()">
                </div>
              </div>
              <div class="form-group" style="width:110px">
                <label class="form-label">Subtotal</label>
                <input type="text" class="form-control" id="nop-subtotal" readonly placeholder="S/ 0.00" style="background:var(--bg-muted);font-weight:600">
              </div>
            </div>
            <button class="btn btn-outline-primary" onclick="BCE.nopAddItem()">
              <i data-lucide="plus"></i> Agregar al pedido
            </button>
          </div>

          <!-- MODO KIOSCO -->
          <div id="nop-kiosko-grp" style="display:none;flex-direction:column;gap:12px">
            <div class="form-group">
              <label class="form-label">Producto <span class="required">*</span></label>
              <div class="autocomplete-wrap">
                <input type="text" class="form-control" id="nop-kiosko-nombre"
                       placeholder="Buscar o escribir producto…" autocomplete="off"
                       oninput="BCE.nopSearchKiosko(this.value)"
                       onfocus="BCE.nopSearchKiosko(this.value)"
                       onblur="setTimeout(()=>BCE.nopCloseKioskoAC(),200)">
                <div class="autocomplete-dropdown" id="nop-kiosko-dropdown"></div>
              </div>
            </div>
            <div class="flex gap-3" style="align-items:flex-end">
              <div class="form-group" style="width:130px">
                <label class="form-label">Precio unit.</label>
                <div class="input-group">
                  <span class="input-addon input-addon-left">S/</span>
                  <input type="number" class="form-control" id="nop-kiosko-precio" step="0.01" placeholder="0.00" oninput="BCE.nopCalcKiosko()">
                </div>
              </div>
              <div class="form-group" style="width:90px">
                <label class="form-label">Cantidad</label>
                <input type="number" class="form-control" id="nop-kiosko-cantidad" value="1" min="1" oninput="BCE.nopCalcKiosko()">
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Subtotal</label>
                <input type="text" class="form-control" id="nop-kiosko-subtotal" readonly placeholder="S/ 0.00" style="background:var(--bg-muted);font-weight:600">
              </div>
            </div>
            <button class="btn btn-outline-primary" onclick="BCE.nopAddKioskoItem()">
              <i data-lucide="plus"></i> Agregar al pedido
            </button>
          </div>

          <!-- MODO MULTI-SALÓN -->
          <div id="nop-multisalon-grp" style="display:none;flex-direction:column;gap:10px">
            <div class="form-group" style="max-width:180px">
              <label class="form-label">Precio unit. <span class="required">*</span></label>
              <div class="input-group">
                <span class="input-addon input-addon-left">S/</span>
                <input type="number" class="form-control" id="nop-precio-multi" step="0.01" placeholder="0.00">
              </div>
            </div>
            <div id="nop-salon-grid-wrap"></div>
            <button class="btn btn-outline-primary" id="nop-multi-add-btn" onclick="BCE.nopAddMultiSalon()" disabled>
              <i data-lucide="check-square"></i>
              <span id="nop-multi-add-txt">Selecciona salones</span>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- RIGHT: Pedido en construcción -->
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card" style="position:sticky;top:80px">
        <div class="card-header">
          <div>
            <div class="card-title">Pedido actual</div>
            <div class="card-subtitle" id="nop-subtitle">Sin ítems aún</div>
          </div>
          <span class="badge badge-neutral" id="nop-count">0 ítems</span>
        </div>
        <div style="min-height:120px;padding:4px 20px" id="nop-items-wrap">
          ${nopItemsHTML()}
        </div>
        <div class="card-footer" style="flex-direction:column;align-items:stretch;gap:12px">
          <div class="flex justify-between items-center" style="padding:4px 0">
            <span class="font-semibold">Total</span>
            <span class="text-2xl font-bold text-primary" id="nop-total">S/ 0.00</span>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de la operación</label>
            <input type="date" class="form-control form-control-sm" id="nop-fecha"
                   value="${today()}" max="${today()}">
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <input type="text" class="form-control form-control-sm" id="nop-notas" placeholder="Ej: Examen de Matemáticas, 3er bimestre…">
          </div>
          <div class="form-group">
            <label class="form-label">¿Registrar pago ahora?</label>
            <select class="form-control form-control-sm" id="nop-pago">
              <option value="">Sin pago por ahora</option>
              <option value="completo-efectivo">Efectivo — Pago completo</option>
              <option value="completo-yape">Yape / Plin — Pago completo</option>
              <option value="parcial">Pago parcial</option>
            </select>
          </div>
          <button class="btn btn-success" style="width:100%" onclick="BCE.nopSave()">
            <i data-lucide="save"></i> Guardar Operación
          </button>
          <button class="btn btn-outline-primary" style="width:100%" onclick="BCE.nopSaveContinuar()" title="Guarda y queda listo para la siguiente operación manteniendo la fecha">
            <i data-lucide="plus-circle"></i> Guardar y continuar
          </button>
          <div style="display:flex;gap:8px;align-items:flex-start;padding:8px 10px;background:var(--info-bg,#eff6ff);border:1px solid var(--info-border,#bfdbfe);border-radius:var(--r);font-size:12px;color:var(--info-text,#1e40af)">
            <i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;margin-top:1px"></i>
            <span><strong>Cobro:</strong> salón → tutor · personal → solicitante</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function nopSolicitanteHTML() {
  if(NOP.tipo==='profesor') return `
    <div class="card-header"><div class="card-title">2. Seleccionar Profesor</div></div>
    <div class="card-body" style="display:flex;flex-direction:column;gap:10px">
      <div class="form-group">
        <label class="form-label">Profesor <span class="required">*</span></label>
        <select class="form-control" id="nop-prof" onchange="BCE.nopOnProfesorChange(this.value)">
          <option value="">— Seleccione un profesor —</option>
          ${DB.profesores.filter(p=>getRol(p.rolId)?.tipo==='docente').map(p=>`<option value="${p.id}">${p.nombre}${p.tutorDe?' · Tutor '+salonLabel(p.tutorDe):''}</option>`).join('')}
        </select>
      </div>
      <div id="nop-prof-info" class="alert alert-info" style="display:none">
        <i data-lucide="info"></i><span id="nop-prof-info-txt"></span>
      </div>
    </div>`;
  if(NOP.tipo==='alumno') return `
    <div class="card-header"><div class="card-title">2. Datos del Alumno</div></div>
    <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
      <div class="form-group">
        <label class="form-label">Nombre del alumno <span class="required">*</span></label>
        <div class="autocomplete-wrap">
          <input type="text" class="form-control" id="nop-alumno-nombre"
                 placeholder="Buscar o escribir nombre…" autocomplete="off"
                 oninput="BCE.nopSearchAlumno(this.value)"
                 onfocus="BCE.nopSearchAlumno(this.value)"
                 onblur="setTimeout(()=>BCE.nopCloseAutocomplete(),200)">
          <div class="autocomplete-dropdown" id="nop-alumno-dropdown"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de solicitud</label>
        <div class="radio-group" id="nop-alumno-tipo">
          <label class="radio-card selected" onclick="BCE.nopSetAlumnoTipo(false,this)">
            <i data-lucide="school"></i>
            <span class="radio-card-label">Encargo del profesor</span>
          </label>
          <label class="radio-card" onclick="BCE.nopSetAlumnoTipo(true,this)">
            <i data-lucide="user"></i>
            <span class="radio-card-label">Uso personal</span>
          </label>
        </div>
      </div>
      <div id="nop-alumno-salon-grp" class="form-group">
        <label class="form-label">¿Para qué salón son las copias? <span class="required">*</span></label>
        <select class="form-control" id="nop-alumno-salon" onchange="BCE.nopOnAlumnoSalonChange(this.value)">
          <option value="">— Seleccione salón —</option>
          <optgroup label="Primaria">
            ${DB.salones.filter(s=>s.nivel==='Primaria').map(s=>`<option value="${s.id}">${s.grado}°${s.seccion} — Tutor: ${getProfesor(s.tutorId)?.nombre||'?'}</option>`).join('')}
          </optgroup>
          <optgroup label="Secundaria">
            ${DB.salones.filter(s=>s.nivel==='Secundaria').map(s=>`<option value="${s.id}">${s.grado}°${s.seccion} — Tutor: ${getProfesor(s.tutorId)?.nombre||'?'}</option>`).join('')}
          </optgroup>
        </select>
        <div class="form-hint" id="nop-alumno-salon-hint" style="margin-top:4px"></div>
      </div>
      <div id="nop-alumno-envio-grp" class="form-group">
        <label class="form-label">Profesor que lo envió <span class="text-muted text-xs">(referencia)</span></label>
        <select class="form-control" id="nop-alumno-envio" onchange="BCE.NOP.alumnoProfeEnvio=this.value">
          <option value="">— No especificado —</option>
          ${DB.profesores.filter(p=>getRol(p.rolId)?.tipo==='docente').map(p=>`<option value="${p.id}">${p.nombre}${p.tutorDe?' · Tutor '+salonLabel(p.tutorDe):''}</option>`).join('')}
        </select>
        <div class="form-hint">Queda registrado para auditoría. El cobro siempre va al tutor del salón.</div>
      </div>
    </div>`;
  return `
    <div class="card-header"><div class="card-title">2. Dirección Institucional</div></div>
    <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
      <div class="alert alert-warning" style="margin:0">
        <i data-lucide="building-2"></i>
        <span>Los servicios se cargarán a la cuenta de <strong>Dirección</strong>.</span>
      </div>
      <div class="form-group">
        <label class="form-label">¿Quién ordena? <span class="required">*</span></label>
        <div class="autocomplete-wrap">
          <input type="text" class="form-control" id="nop-dir-ordena"
                 placeholder="Buscar en personal o escribir nombre…" autocomplete="off"
                 oninput="BCE.nopSearchDirPersonal('ordena',this.value)"
                 onfocus="BCE.nopSearchDirPersonal('ordena',this.value)"
                 onblur="setTimeout(()=>BCE.nopCloseDirAutocomplete('ordena'),200)">
          <div class="autocomplete-dropdown" id="nop-dir-ordena-drop"></div>
        </div>
        <div class="form-hint">El responsable que autoriza la solicitud (director, secretaría, coordinación…)</div>
      </div>
      <div class="form-group">
        <label class="form-label">¿Quién recoge las copias? <span class="text-muted text-xs">(opcional)</span></label>
        <div class="flex gap-2" style="align-items:flex-start">
          <div class="autocomplete-wrap" style="flex:1">
            <input type="text" class="form-control" id="nop-dir-portador"
                   placeholder="Buscar en personal o escribir nombre…" autocomplete="off"
                   oninput="BCE.nopSearchDirPersonal('portador',this.value)"
                   onfocus="BCE.nopSearchDirPersonal('portador',this.value)"
                   onblur="setTimeout(()=>BCE.nopCloseDirAutocomplete('portador'),200)">
            <div class="autocomplete-dropdown" id="nop-dir-portador-drop"></div>
          </div>
          <button class="btn btn-sm btn-outline-primary" style="flex-shrink:0"
                  onclick="BCE.nopDirMismaPersona()" title="Copiar desde el campo de quien ordena">
            <i data-lucide="copy"></i> Mismo
          </button>
        </div>
        <div class="form-hint">La persona que se presenta en la copiadora a recoger el pedido</div>
      </div>
    </div>`;
}

function nopItemsHTML() {
  if(NOP.items.length===0) return `
    <div style="text-align:center;padding:28px 0;color:var(--t-300)">
      <div style="font-size:32px;margin-bottom:6px">📋</div>
      <div style="font-size:13px">Agrega servicios usando el formulario</div>
    </div>`;
  return NOP.items.map((it,i)=>{
    const cobraTexto = it.esPersonal
      ? (NOP.tipo==='alumno' ? NOP.alumnoNombre||'Alumno' : getProfesor(NOP.profId)?.nombre||'Profesor')
      : it.tutorNombre;
    const isKiosko = it.servicioId==='kiosko';
    const cobraTag = isKiosko
      ? `<span class="badge badge-warning badge-sm">Kiosco</span>`
      : it.esPersonal
        ? `<span class="badge badge-info badge-sm">Personal</span>`
        : `<span class="badge badge-primary badge-sm">${it.salonLabel}</span>`;
    const nombreDisplay = it.servicioNombre;
    const cantDisplay = (it.juegos && it.juegos>1)
      ? `<span class="text-muted">× ${it.cantidad}</span> <span style="font-size:10px;color:var(--t-400)">(${it.copias}×${it.juegos})</span>`
      : `<span class="text-muted">× ${it.cantidad}</span>`;
    return `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div class="font-medium text-sm" style="color:var(--t-900)">${nombreDisplay} ${cantDisplay}</div>
        <div class="flex items-center gap-1 mt-1">${cobraTag}<span class="text-xs text-muted">→ <strong>${cobraTexto}</strong></span></div>
        <div class="text-xs text-muted">S/ ${it.precio.toFixed(2)}/u</div>
      </div>
      <div style="text-align:right;flex-shrink:0"><div class="font-bold">${fmt(it.subtotal)}</div></div>
      <button class="btn-icon" style="color:var(--t-300);flex-shrink:0;margin-top:2px" onclick="BCE.nopRemoveItem(${i})" title="Eliminar">
        <i data-lucide="x"></i>
      </button>
    </div>`;
  }).join('');
}

function nopSetTipo(tipo, el) {
  if(NOP.items.length > 0 && tipo !== NOP.tipo) {
    toast('Guarda o borra el pedido actual antes de cambiar de tipo.', 'warning');
    return;
  }
  NOP.tipo=tipo; NOP.profId=null; NOP.alumnoNombre=''; NOP.alumnoSalonId=null; NOP.alumnoEsPersonal=false;
  NOP.multiSalonMode=false; NOP.salonesSeleccionados={}; NOP.modoKiosco=false;
  document.querySelectorAll('#nop-tipo-group .radio-card').forEach(r=>r.classList.remove('selected'));
  el.classList.add('selected');
  const card=document.getElementById('nop-card-sol');
  if(card){ card.innerHTML=nopSolicitanteHTML(); lucide.createIcons(); }
  const toggleBtn=document.getElementById('nop-multisalon-toggle');
  if(toggleBtn){
    toggleBtn.style.display = tipo==='profesor' ? '' : 'none';
    toggleBtn.classList.remove('btn-primary');
    toggleBtn.classList.add('btn-outline-primary');
  }
  const individ=document.getElementById('nop-individual-grp');
  const multi=document.getElementById('nop-multisalon-grp');
  if(individ) individ.style.display='flex';
  if(multi)   multi.style.display='none';
  const sg=document.getElementById('nop-salon-grp');
  if(sg) sg.style.display = tipo==='profesor' ? '' : 'none';
  const modoTabs=document.getElementById('nop-modo-tabs');
  if(modoTabs) modoTabs.style.display = tipo==='profesor' ? 'flex' : 'none';
  const kioskoGrp=document.getElementById('nop-kiosko-grp');
  if(kioskoGrp) kioskoGrp.style.display='none';
  const srvGrp=document.getElementById('nop-servicio-grp');
  if(srvGrp) srvGrp.style.display='';
  const tabSrv=document.getElementById('nop-tab-servicio'); if(tabSrv) tabSrv.classList.add('active');
  const tabKsk=document.getElementById('nop-tab-kiosko'); if(tabKsk) tabKsk.classList.remove('active');
  ['nop-cantidad','nop-precio','nop-subtotal'].forEach(id=>{ const el2=document.getElementById(id); if(el2) el2.value=''; });
  const juegosEl2=document.getElementById('nop-juegos'); if(juegosEl2) juegosEl2.value='1';
  const sh=document.getElementById('nop-salon-hint'); if(sh) sh.innerHTML='';
  const srvEl=document.getElementById('nop-servicio');
  if(srvEl){ const firstId=DB.precios[0]?.id; if(firstId){ srvEl.value=firstId; nopOnServicioChange(firstId); } }
}

function nopOnProfesorChange(id) {
  if(NOP.items.length > 0 && id !== NOP.profId) {
    toast('Guarda o borra el pedido actual antes de cambiar de profesor.', 'warning');
    const sel=document.getElementById('nop-prof');
    if(sel) sel.value=NOP.profId||'';
    return;
  }
  NOP.profId=id;
  const p=getProfesor(id);
  const info=document.getElementById('nop-prof-info');
  const txt=document.getElementById('nop-prof-info-txt');
  if(!info) return;
  if(!p||!id){ info.style.display='none'; return; }
  info.style.display='flex';
  if(p.tutorDe){
    txt.innerHTML=`Tutor/a de <strong>${salonFull(p.tutorDe)}</strong>. Al elegir ese salón, el cobro va a su propia cuenta.`;
    const sel=document.getElementById('nop-salon');
    if(sel){ sel.value=p.tutorDe; nopOnSalonChange(p.tutorDe); }
  } else {
    txt.innerHTML=`Sin tutoría asignada. Selecciona el salón destino en cada servicio.`;
  }
  lucide.createIcons();
  const srv=document.getElementById('nop-servicio')?.value; if(srv) nopOnServicioChange(srv);
}

function nopSetAlumnoTipo(esPersonal, el) {
  NOP.alumnoEsPersonal=esPersonal;
  document.querySelectorAll('#nop-alumno-tipo .radio-card').forEach(r=>r.classList.remove('selected'));
  el.classList.add('selected');
  const grp=document.getElementById('nop-alumno-salon-grp');
  if(grp) grp.style.display=esPersonal?'none':'';
  const envio=document.getElementById('nop-alumno-envio-grp');
  if(envio) envio.style.display=esPersonal?'none':'';
  const srv=document.getElementById('nop-servicio')?.value; if(srv) nopOnServicioChange(srv);
}

function nopOnAlumnoSalonChange(salonId) {
  NOP.alumnoSalonId=salonId;
  const s=getSalon(salonId);
  const hint=document.getElementById('nop-alumno-salon-hint');
  if(hint&&s){ const t=getProfesor(s.tutorId); hint.innerHTML=t?`Cobro → <strong>${t.nombre}</strong>`:''; }
}

function nopOnSalonChange(salonId) {
  const s=getSalon(salonId);
  const hint=document.getElementById('nop-salon-hint');
  if(!hint) return;
  if(!salonId){ hint.innerHTML='Sin salón → cobro al profesor (personal)'; return; }
  if(s){
    const t=getProfesor(s.tutorId);
    const prof=getProfesor(NOP.profId);
    if(prof&&s.tutorId===NOP.profId)
      hint.innerHTML=`Cobro → <strong>${t?.nombre}</strong> <em>(¡su propia cuenta!)</em>`;
    else
      hint.innerHTML=`Cobro → <strong>${t?.nombre||'?'}</strong> (tutor de ${salonFull(salonId)})`;
  }
}

function nopOnServicioChange(id) {
  const p=DB.precios.find(x=>x.id===id);
  if(!p) return;
  let price=p.prof;
  if(NOP.tipo==='alumno'&&NOP.alumnoEsPersonal) price=p.alumno;
  else if(NOP.tipo==='direccion') price=p.dir;
  const el=document.getElementById('nop-precio');
  if(el){ el.value=price.toFixed(2); nopCalcItem(); }
  const el2=document.getElementById('nop-precio-multi');
  if(el2) el2.value=price.toFixed(2);
  if(p.variable) toast(`"${p.nombre}" tiene precio variable — ajusta si necesitas`, 'info');
}

function nopCalcItem() {
  const copias=parseFloat(document.getElementById('nop-cantidad')?.value||0);
  const juegos=Math.max(1,parseInt(document.getElementById('nop-juegos')?.value||1)||1);
  const prc=parseFloat(document.getElementById('nop-precio')?.value||0);
  const totalQty=copias*juegos;
  const el=document.getElementById('nop-subtotal');
  if(el) el.value=copias>0&&prc>0?`S/ ${(totalQty*prc).toFixed(2)}`:'';
  const trEl=document.getElementById('nop-total-real');
  if(trEl){
    if(juegos>1&&copias>0){ trEl.style.display=''; trEl.textContent=`= ${totalQty}`; }
    else trEl.style.display='none';
  }
}

function nopAddItem() {
  const servicioId=document.getElementById('nop-servicio')?.value;
  const copias=parseInt(document.getElementById('nop-cantidad')?.value||0);
  const juegos=Math.max(1,parseInt(document.getElementById('nop-juegos')?.value||1)||1);
  const cantidad=copias*juegos;
  const precio=parseFloat(document.getElementById('nop-precio')?.value||0);
  if(!servicioId)                   { toast('Selecciona un tipo de servicio','danger'); return; }
  if(copias<1)                      { toast('Ingresa una cantidad válida (mín. 1)','danger'); return; }
  if(precio<=0)                     { toast('El precio debe ser mayor a 0','danger'); return; }
  if(NOP.tipo==='profesor'&&!NOP.profId) { toast('Selecciona un profesor primero','danger'); return; }
  if(NOP.tipo==='alumno'&&!NOP.alumnoNombre.trim()) { toast('Ingresa el nombre del alumno','danger'); return; }
  if(NOP.tipo==='alumno'&&!NOP.alumnoEsPersonal&&!NOP.alumnoSalonId) {
    const v=document.getElementById('nop-alumno-salon')?.value;
    if(!v){ toast('Selecciona el salón del encargo','danger'); return; }
    NOP.alumnoSalonId=v;
  }

  let salonId='', salonLbl='', tutorNombre='', esPersonal=false;
  if(NOP.tipo==='profesor'){
    const sv=document.getElementById('nop-salon')?.value;
    if(sv){ salonId=sv; salonLbl=salonFull(sv); tutorNombre=getProfesor(getSalon(sv)?.tutorId)?.nombre||'?'; }
    else  { esPersonal=true; tutorNombre=getProfesor(NOP.profId)?.nombre||'Profesor'; }
  } else if(NOP.tipo==='alumno'){
    if(NOP.alumnoEsPersonal){ esPersonal=true; tutorNombre=NOP.alumnoNombre; }
    else { salonId=NOP.alumnoSalonId; salonLbl=salonFull(salonId); tutorNombre=getProfesor(getSalon(salonId)?.tutorId)?.nombre||'?'; }
  } else {
    tutorNombre='Dirección';
  }

  const svc=DB.precios.find(p=>p.id===servicioId);
  const itemData={ servicioId, servicioNombre:svc?.nombre||servicioId, salonId, salonLabel:salonLbl, tutorNombre, esPersonal, cantidad, precio, subtotal:cantidad*precio };
  if(juegos>1){ itemData.juegos=juegos; itemData.copias=copias; }
  NOP.items.push(itemData);

  ['nop-cantidad','nop-subtotal'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const juegosEl=document.getElementById('nop-juegos'); if(juegosEl) juegosEl.value='1';
  const trEl=document.getElementById('nop-total-real'); if(trEl) trEl.style.display='none';
  if(NOP.tipo==='profesor'){
    const sel=document.getElementById('nop-salon'); if(sel) sel.value='';
    const sh=document.getElementById('nop-salon-hint'); if(sh) sh.innerHTML='';
    const prof=getProfesor(NOP.profId);
    if(prof?.tutorDe){ const sel=document.getElementById('nop-salon'); if(sel) sel.value=prof.tutorDe; nopOnSalonChange(prof.tutorDe); }
  }
  nopRefreshPanel();
  toast('Servicio agregado','success');
}

function nopRemoveItem(i) { NOP.items.splice(i,1); nopRefreshPanel(); }

function nopRefreshPanel() {
  const wrap=document.getElementById('nop-items-wrap');
  const count=document.getElementById('nop-count');
  const total=document.getElementById('nop-total');
  const sub=document.getElementById('nop-subtitle');
  if(wrap){ wrap.innerHTML=nopItemsHTML(); lucide.createIcons(); }
  const n=NOP.items.length;
  if(count){ count.textContent=`${n} ítem${n!==1?'s':''}`; count.className=`badge ${n>0?'badge-primary':'badge-neutral'}`; }
  const t=NOP.items.reduce((a,i)=>a+i.subtotal,0);
  if(total) total.textContent=fmt(t);
  if(sub)   sub.textContent=n>0?`${n} servicio${n!==1?'s':''} · ${fmt(t)}`:'Sin ítems aún';
}

function nopToggleMultiSalon(toggleBtn) {
  const goingToMulti = !NOP.multiSalonMode;
  if(!goingToMulti) {
    const checkedCount = Object.values(NOP.salonesSeleccionados).filter(s=>s.checked).length;
    if(checkedCount > 0) {
      showConfirm({
        title: '¿Desactivar selección múltiple?',
        message: `Tienes <strong>${checkedCount} salón${checkedCount!==1?'es':''} seleccionado${checkedCount!==1?'s':''}</strong> con datos pendientes que se perderán al cambiar de modo.`,
        confirmText: 'Sí, cambiar',
        cancelText: 'Cancelar',
        type: 'warning',
        onConfirm: () => _applyToggleMultiSalon(toggleBtn, false),
      });
      return;
    }
  }
  _applyToggleMultiSalon(toggleBtn, goingToMulti);
}

function _applyToggleMultiSalon(toggleBtn, multiMode) {
  NOP.multiSalonMode = multiMode;
  NOP.salonesSeleccionados = {};
  const individ=document.getElementById('nop-individual-grp');
  const multi=document.getElementById('nop-multisalon-grp');
  if(NOP.multiSalonMode) {
    toggleBtn.classList.add('btn-primary');
    toggleBtn.classList.remove('btn-outline-primary');
    if(individ) individ.style.display='none';
    if(multi) multi.style.display='flex';
    const precio=document.getElementById('nop-precio')?.value;
    const precioMulti=document.getElementById('nop-precio-multi');
    if(precioMulti&&precio) precioMulti.value=precio;
    const gridWrap=document.getElementById('nop-salon-grid-wrap');
    if(gridWrap){ gridWrap.innerHTML=nopRenderSalonGrid(); lucide.createIcons(); }
    nopUpdateMultiCount();
  } else {
    toggleBtn.classList.remove('btn-primary');
    toggleBtn.classList.add('btn-outline-primary');
    if(individ) individ.style.display='flex';
    if(multi)   multi.style.display='none';
    const precioMulti=document.getElementById('nop-precio-multi')?.value;
    const precio=document.getElementById('nop-precio');
    if(precio&&precioMulti){ precio.value=precioMulti; nopCalcItem(); }
  }
}

function nopRenderSalonGrid() {
  function cardHTML(s) {
    const tutor=getProfesor(s.tutorId);
    const state=NOP.salonesSeleccionados[s.id];
    const checked=state?.checked||false;
    const qty=state?.cantidad||'';
    return `<div class="salon-check-card${checked?' checked':''}" onclick="BCE.nopToggleSalon('${s.id}',this)">
      <div class="salon-check-box">${checked?'<i data-lucide="check-square"></i>':'<i data-lucide="square"></i>'}</div>
      <div style="flex:1;min-width:0">
        <div class="salon-check-name">${s.grado}°${s.seccion}</div>
        <div class="salon-check-tutor">${tutor?.nombre||'?'}</div>
      </div>
      <input type="number" class="form-control salon-qty-input" id="salon-qty-${s.id}"
             value="${qty}" min="1" placeholder="Cant."
             onclick="event.stopPropagation()"
             oninput="event.stopPropagation();BCE.nopSetSalonQty('${s.id}',this.value)">
    </div>`;
  }
  const primaria=DB.salones.filter(s=>s.nivel==='Primaria');
  const secund=DB.salones.filter(s=>s.nivel==='Secundaria');
  return `
  <div class="salon-grid-section-label">Primaria</div>
  <div class="salon-grid">${primaria.map(cardHTML).join('')}</div>
  <div class="salon-grid-section-label">Secundaria</div>
  <div class="salon-grid">${secund.map(cardHTML).join('')}</div>`;
}

function nopToggleSalon(salonId, cardEl) {
  if(!NOP.salonesSeleccionados[salonId])
    NOP.salonesSeleccionados[salonId]={ checked:false, cantidad:0 };
  const state=NOP.salonesSeleccionados[salonId];
  state.checked=!state.checked;
  cardEl.classList.toggle('checked', state.checked);
  const box=cardEl.querySelector('.salon-check-box');
  if(box){ box.innerHTML=state.checked?'<i data-lucide="check-square"></i>':'<i data-lucide="square"></i>'; lucide.createIcons(); }
  nopUpdateMultiCount();
}

function nopSetSalonQty(salonId, value) {
  if(!NOP.salonesSeleccionados[salonId])
    NOP.salonesSeleccionados[salonId]={ checked:false, cantidad:0 };
  NOP.salonesSeleccionados[salonId].cantidad=parseInt(value)||0;
}

function nopUpdateMultiCount() {
  const n=Object.values(NOP.salonesSeleccionados).filter(s=>s.checked).length;
  const btn=document.getElementById('nop-multi-add-btn');
  const txt=document.getElementById('nop-multi-add-txt');
  if(btn) btn.disabled=n===0;
  if(txt) txt.textContent=n>0
    ? `Agregar ${n} salón${n!==1?'es':''} seleccionado${n!==1?'s':''}`
    : 'Selecciona salones';
}

function nopAddMultiSalon() {
  const servicioId=document.getElementById('nop-servicio')?.value;
  const precio=parseFloat(document.getElementById('nop-precio-multi')?.value||0);
  if(!servicioId)              { toast('Selecciona un tipo de servicio','danger'); return; }
  if(precio<=0)                { toast('El precio debe ser mayor a 0','danger'); return; }
  if(NOP.tipo==='profesor'&&!NOP.profId) { toast('Selecciona un profesor primero','danger'); return; }
  const salonesChecked=Object.entries(NOP.salonesSeleccionados).filter(([,v])=>v.checked);
  if(salonesChecked.length===0){ toast('Selecciona al menos un salón','danger'); return; }
  const svc=DB.precios.find(p=>p.id===servicioId);
  let added=0;
  for(const [salonId] of salonesChecked) {
    const qty=parseInt(document.getElementById(`salon-qty-${salonId}`)?.value||0);
    if(qty<1){ toast(`Ingresa la cantidad para ${salonFull(salonId)}`,'warning'); continue; }
    const s=getSalon(salonId);
    NOP.items.push({
      servicioId, servicioNombre:svc?.nombre||servicioId,
      salonId, salonLabel:salonFull(salonId),
      tutorNombre:getProfesor(s?.tutorId)?.nombre||'?',
      esPersonal:false, cantidad:qty, precio, subtotal:qty*precio
    });
    added++;
  }
  if(added===0) return;
  NOP.salonesSeleccionados={};
  const gridWrap=document.getElementById('nop-salon-grid-wrap');
  if(gridWrap){ gridWrap.innerHTML=nopRenderSalonGrid(); lucide.createIcons(); }
  nopUpdateMultiCount();
  nopRefreshPanel();
  toast(`${added} salón${added!==1?'es':''} agregado${added!==1?'s':''}`, 'success');
}

function nopSearchAlumno(query) {
  NOP.alumnoNombre = query;
  const drop = document.getElementById('nop-alumno-dropdown');
  if(!drop) return;
  const q = (query||'').trim().toLowerCase();
  if(!q) { drop.className='autocomplete-dropdown'; return; }
  const matches = DB.alumnos.filter(a=>a.nombre.toLowerCase().includes(q)).slice(0,8);
  const exactMatch = DB.alumnos.some(a=>a.nombre.toLowerCase()===q);
  let html = matches.map(a=>{
    const s=getSalon(a.salonId);
    return `<div class="autocomplete-item" onmousedown="BCE.nopSelectAlumno('${a.id}')">
      <div class="avatar avatar-sm av-blue">${slugAvatar(a.nombre)}</div>
      <div>
        <div class="autocomplete-item-name">${a.nombre}</div>
        ${s?`<div class="autocomplete-item-sub">${salonFull(a.salonId)}</div>`:''}
      </div>
    </div>`;
  }).join('');
  if(!exactMatch && query.trim()) {
    const safe = query.trim().replace(/'/g,"\\'");
    html += `<div class="autocomplete-item autocomplete-item-new" onmousedown="BCE.nopAddAlumnoNuevo('${safe}')">
      <i data-lucide="user-plus"></i>
      <span>Guardar "<strong>${query.trim()}</strong>" como nuevo alumno</span>
    </div>`;
  }
  drop.innerHTML = html;
  drop.className = 'autocomplete-dropdown open';
  lucide.createIcons();
}

function nopSelectAlumno(id) {
  const a = DB.alumnos.find(x=>x.id===id);
  if(!a) return;
  if(NOP.items.length > 0 && a.nombre !== NOP.alumnoNombre) {
    toast('Guarda o borra el pedido actual antes de cambiar de alumno.', 'warning');
    const input=document.getElementById('nop-alumno-nombre');
    if(input) input.value=NOP.alumnoNombre;
    nopCloseAutocomplete();
    return;
  }
  NOP.alumnoNombre = a.nombre;
  const input = document.getElementById('nop-alumno-nombre');
  if(input) input.value = a.nombre;
  nopCloseAutocomplete();
  if(!NOP.alumnoEsPersonal && a.salonId) {
    const sel = document.getElementById('nop-alumno-salon');
    if(sel) { sel.value=a.salonId; nopOnAlumnoSalonChange(a.salonId); }
  }
  toast(`Alumno: ${a.nombre}`, 'success');
}

function nopAddAlumnoNuevo(nombre) {
  if(NOP.items.length > 0 && nombre !== NOP.alumnoNombre) {
    toast('Guarda o borra el pedido actual antes de cambiar de alumno.', 'warning');
    const input=document.getElementById('nop-alumno-nombre');
    if(input) input.value=NOP.alumnoNombre;
    nopCloseAutocomplete();
    return;
  }
  const newId = 'ALU' + String(DB.alumnos.length+1).padStart(3,'0');
  DB.alumnos.push({ id:newId, nombre, salonId:null });
  saveDB();
  NOP.alumnoNombre = nombre;
  const input = document.getElementById('nop-alumno-nombre');
  if(input) input.value = nombre;
  nopCloseAutocomplete();
  toast(`"${nombre}" agregado al catálogo de alumnos`, 'success');
}

function nopCloseAutocomplete() {
  const drop = document.getElementById('nop-alumno-dropdown');
  if(drop) drop.className = 'autocomplete-dropdown';
}

function nopSearchDirPersonal(field, query) {
  const dropId = field==='ordena' ? 'nop-dir-ordena-drop' : 'nop-dir-portador-drop';
  const drop = document.getElementById(dropId);
  if(!drop) return;
  if(field==='ordena') NOP.dirResponsable = query;
  else                 NOP.dirPortador    = query;
  const q = (query||'').trim().toLowerCase();
  if(!q) { drop.className='autocomplete-dropdown'; return; }
  const matches = DB.profesores.filter(p=>p.nombre.toLowerCase().includes(q)).slice(0,8);
  const exactMatch = DB.profesores.some(p=>p.nombre.toLowerCase()===q);
  let html = matches.map(p=>`
    <div class="autocomplete-item" onmousedown="BCE.nopSelectDirPersonal('${field}','${p.nombre.replace(/'/g,"\\'")}')">
      <div class="avatar avatar-sm ${p.avatarColor}">${slugAvatar(p.nombre)}</div>
      <div>
        <div class="autocomplete-item-name">${p.nombre}</div>
        <div class="autocomplete-item-sub">${getRol(p.rolId)?.nombre||'Personal'}${p.tutorDe?' — '+salonFull(p.tutorDe):''}</div>
      </div>
    </div>`).join('');
  if(!exactMatch && query.trim()) {
    const safe = query.trim().replace(/'/g,"\\'");
    html += `<div class="autocomplete-item autocomplete-item-new" onmousedown="BCE.nopAddDirPersonal('${field}','${safe}')">
      <i data-lucide="user-plus"></i>
      <span>Registrar "<strong>${query.trim()}</strong>" en Personal</span>
    </div>`;
  }
  drop.innerHTML = html;
  drop.className = 'autocomplete-dropdown open';
  lucide.createIcons();
}

function nopSelectDirPersonal(field, nombre) {
  const inputId = field==='ordena' ? 'nop-dir-ordena' : 'nop-dir-portador';
  const input = document.getElementById(inputId);
  if(input) input.value = nombre;
  if(field==='ordena') NOP.dirResponsable = nombre;
  else                 NOP.dirPortador    = nombre;
  nopCloseDirAutocomplete(field);
}

function nopAddDirPersonal(field, nombre) {
  const existe = DB.profesores.find(p=>p.nombre.toLowerCase()===nombre.toLowerCase());
  if(!existe) {
    const colors=['av-blue','av-green','av-orange','av-purple','av-teal','av-red'];
    let h=0; for(const c of nombre) h=c.charCodeAt(0)+((h<<5)-h);
    const newId='P'+String(DB.profesores.filter(p=>p.id.startsWith('P')).length+1).padStart(3,'0');
    DB.profesores.push({ id:newId, nombre, rolId:'ROL05', tutorDe:null, avatarColor:colors[Math.abs(h)%colors.length] });
    saveDB();
    toast(`"${nombre}" agregado a Personal — ajusta su rol en Catálogos → Personal`, 'info');
  }
  nopSelectDirPersonal(field, nombre);
}

function nopCloseDirAutocomplete(field) {
  const dropId = field==='ordena' ? 'nop-dir-ordena-drop' : 'nop-dir-portador-drop';
  const drop = document.getElementById(dropId);
  if(drop) drop.className = 'autocomplete-dropdown';
}

function nopDirMismaPersona() {
  const ordena = document.getElementById('nop-dir-ordena')?.value || '';
  NOP.dirPortador = ordena;
  const portadorInput = document.getElementById('nop-dir-portador');
  if(portadorInput) portadorInput.value = ordena;
  if(ordena) toast(`Portador copiado: ${ordena}`, 'info');
}

function _nopValidar() {
  if(NOP.items.length===0)                              { toast('El pedido está vacío — agrega al menos un ítem antes de guardar','warning'); return false; }
  if(NOP.tipo==='profesor'&&!NOP.profId)                { toast('Selecciona un profesor','danger'); return false; }
  if(NOP.tipo==='alumno'&&!NOP.alumnoNombre.trim())     { toast('Ingresa el nombre del alumno','danger'); return false; }
  if(NOP.tipo==='direccion'&&!NOP.dirResponsable.trim()){ toast('Indica quién ordena los servicios','danger'); return false; }
  return true;
}

function _nopCommit() {
  const total=NOP.items.reduce((a,i)=>a+i.subtotal,0);
  const notas=document.getElementById('nop-notas')?.value||'';
  const pago=document.getElementById('nop-pago')?.value||'';
  const fechaSel=document.getElementById('nop-fecha')?.value||today();
  const now=new Date();
  const fecha=fechaSel+' '+now.toTimeString().slice(0,5);
  const newId='OP'+String(DB.operaciones.length+1).padStart(3,'0');
  DB.operaciones.unshift({
    id:newId, fecha, tipo:NOP.tipo,
    solicitanteId:NOP.tipo==='profesor'?NOP.profId:null,
    alumnoNombre:NOP.tipo==='alumno'?NOP.alumnoNombre:undefined,
    alumnoProfeEnvio:NOP.tipo==='alumno'&&!NOP.alumnoEsPersonal&&NOP.alumnoProfeEnvio?NOP.alumnoProfeEnvio:undefined,
    dirResponsable:NOP.tipo==='direccion'?NOP.dirResponsable:undefined,
    dirPortador:NOP.tipo==='direccion'?(NOP.dirPortador||NOP.dirResponsable):undefined,
    items:NOP.items.map(it=>({
      servicio:it.servicioId,
      ...(it.servicioId==='kiosko'?{servicioNombre:it.servicioNombre}:{}),
      salonId:it.salonId||null, esPersonal:it.esPersonal,
      cantidad:it.cantidad, precio:it.precio, subtotal:it.subtotal,
    })),
    total, notas,
  });
  if(pago.startsWith('completo')){
    const tipoPago=pago.includes('yape')?'yape':'efectivo';
    DB.pagos.push({ id:'PG'+Date.now(), fecha:fecha.slice(0,10), tipo:NOP.tipo, entidadId:NOP.profId||NOP.alumnoNombre, monto:total, tipoPago });
  }
  saveDB();
  return { newId, total, fechaSel };
}

function nopSave() {
  if(!_nopValidar()) return;
  const { newId, total } = _nopCommit();
  toast(`Operación ${newId} guardada — ${fmt(total)}`,'success');
  NOP.reset();
  navigate('operaciones/historial');
}

function nopSetModo(modo) {
  NOP.modoKiosco = (modo==='kiosko');
  const individGrp=document.getElementById('nop-individual-grp');
  const multiGrp=document.getElementById('nop-multisalon-grp');
  const kioskoGrp=document.getElementById('nop-kiosko-grp');
  const toggleBtn=document.getElementById('nop-multisalon-toggle');
  const srvGrp=document.getElementById('nop-servicio-grp');
  const tabSrv=document.getElementById('nop-tab-servicio');
  const tabKsk=document.getElementById('nop-tab-kiosko');
  if(NOP.modoKiosco) {
    if(individGrp) individGrp.style.display='none';
    if(multiGrp)   multiGrp.style.display='none';
    if(kioskoGrp)  kioskoGrp.style.display='flex';
    if(toggleBtn)  toggleBtn.style.display='none';
    if(srvGrp)     srvGrp.style.display='none';
    if(tabSrv)     tabSrv.classList.remove('active');
    if(tabKsk)     tabKsk.classList.add('active');
    NOP.multiSalonMode=false; NOP.salonesSeleccionados={};
  } else {
    if(individGrp) individGrp.style.display='flex';
    if(multiGrp)   multiGrp.style.display='none';
    if(kioskoGrp)  kioskoGrp.style.display='none';
    if(toggleBtn)  toggleBtn.style.display='';
    if(srvGrp)     srvGrp.style.display='';
    if(tabSrv)     tabSrv.classList.add('active');
    if(tabKsk)     tabKsk.classList.remove('active');
  }
}

function nopSearchKiosko(query) {
  const drop=document.getElementById('nop-kiosko-dropdown');
  if(!drop) return;
  const q=(query||'').trim().toLowerCase();
  if(!q){ drop.className='autocomplete-dropdown'; return; }
  const matches=DB.kiosko.filter(k=>k.nombre.toLowerCase().includes(q)).slice(0,8);
  if(!matches.length){ drop.className='autocomplete-dropdown'; return; }
  drop.innerHTML=matches.map(k=>`
    <div class="autocomplete-item" onmousedown="BCE.nopSelectKiosko('${k.id}')">
      <i data-lucide="package" style="width:16px;height:16px;flex-shrink:0"></i>
      <div>
        <div class="autocomplete-item-name">${k.nombre}</div>
        <div class="autocomplete-item-sub">S/ ${k.precio.toFixed(2)}</div>
      </div>
    </div>`).join('');
  drop.className='autocomplete-dropdown open';
  lucide.createIcons();
}

function nopSelectKiosko(id) {
  const k=DB.kiosko.find(x=>x.id===id);
  if(!k) return;
  const input=document.getElementById('nop-kiosko-nombre');
  if(input) input.value=k.nombre;
  const precioEl=document.getElementById('nop-kiosko-precio');
  if(precioEl){ precioEl.value=k.precio.toFixed(2); nopCalcKiosko(); }
  nopCloseKioskoAC();
}

function nopCloseKioskoAC() {
  const drop=document.getElementById('nop-kiosko-dropdown');
  if(drop) drop.className='autocomplete-dropdown';
}

function nopCalcKiosko() {
  const qty=Math.max(1,parseInt(document.getElementById('nop-kiosko-cantidad')?.value||1)||1);
  const prc=parseFloat(document.getElementById('nop-kiosko-precio')?.value||0);
  const el=document.getElementById('nop-kiosko-subtotal');
  if(el) el.value=prc>0?`S/ ${(qty*prc).toFixed(2)}`:'';
}

function nopAddKioskoItem() {
  if(!NOP.profId){ toast('Selecciona un profesor primero','danger'); return; }
  const nombre=(document.getElementById('nop-kiosko-nombre')?.value||'').trim();
  const precio=parseFloat(document.getElementById('nop-kiosko-precio')?.value||0);
  const cantidad=Math.max(1,parseInt(document.getElementById('nop-kiosko-cantidad')?.value||1)||1);
  if(!nombre){ toast('Escribe el nombre del producto','danger'); return; }
  if(precio<=0){ toast('El precio debe ser mayor a 0','danger'); return; }

  const existing=DB.kiosko.find(k=>k.nombre.toLowerCase()===nombre.toLowerCase());
  if(!existing){
    DB.kiosko.push({ id:'KSK'+Date.now(), nombre, precio });
  } else if(existing.precio!==precio){
    existing.precio=precio;
  }
  saveDB();

  NOP.items.push({
    servicioId:'kiosko', servicioNombre:nombre,
    salonId:'', salonLabel:'',
    tutorNombre:getProfesor(NOP.profId)?.nombre||'Profesor',
    esPersonal:true, cantidad, precio, subtotal:cantidad*precio,
  });

  const nombreEl=document.getElementById('nop-kiosko-nombre'); if(nombreEl) nombreEl.value='';
  const precioEl=document.getElementById('nop-kiosko-precio'); if(precioEl) precioEl.value='';
  const cantEl=document.getElementById('nop-kiosko-cantidad');  if(cantEl) cantEl.value='1';
  const subEl=document.getElementById('nop-kiosko-subtotal');   if(subEl) subEl.value='';
  nopRefreshPanel();
  toast('Producto kiosco agregado','success');
}

function nopSaveContinuar() {
  if(!_nopValidar()) return;
  const tipoAnterior = NOP.tipo;
  const { newId, total, fechaSel } = _nopCommit();
  toast(`Op. ${newId} guardada — ${fmt(total)} · Listo para la siguiente`, 'success');
  _doNavigate('operaciones/nueva');
  const fEl=document.getElementById('nop-fecha');
  if(fEl) fEl.value=fechaSel;
  if(tipoAnterior !== 'profesor') {
    const idxMap={alumno:1,direccion:2};
    const cards=document.querySelectorAll('#nop-tipo-group .radio-card');
    if(cards[idxMap[tipoAnterior]]) nopSetTipo(tipoAnterior, cards[idxMap[tipoAnterior]]);
  }
}
