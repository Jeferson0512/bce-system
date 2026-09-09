/* =============================================
   BCE System — Helpers (lookups, calc, fmt)
   ============================================= */

const $ = id => document.getElementById(id);
const slugAvatar = str => (str||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

function getSalon(id)    { return DB.salones.find(s=>s.id===id); }
function getProfesor(id) { return DB.profesores.find(p=>p.id===id); }
function getAlumno(id)   { return DB.alumnos.find(a=>a.id===id); }
function getRol(rolId)   { return DB.roles.find(r=>r.id===rolId); }
function salonLabel(id)  { const s=getSalon(id); return s ? `${s.grado}°${s.seccion} ${s.nivel==='Primaria'?'Prim.':'Sec.'}` : id; }
function salonFull(id)   { const s=getSalon(id); return s ? `${s.nivel} ${s.grado}°${s.seccion}` : '—'; }

function fmt(n) { return 'S/ '+parseFloat(n||0).toFixed(2); }
function fmtDate(str) {
  if(!str) return '—';
  const d=new Date(str.replace(' ','T'));
  return d.toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'});
}
function fmtTime(str) {
  if(!str) return '';
  const d=new Date(str.replace(' ','T'));
  return d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
}
function fmtDateTime(str) { return `${fmtDate(str)} ${fmtTime(str)}`; }

function servicioNombre(id) {
  const p=DB.precios.find(x=>x.id===id);
  return p ? p.nombre : id;
}

function getNombreItem(item) {
  if(item.servicio==='kiosko') return item.servicioNombre||'Kiosco';
  return servicioNombre(item.servicio);
}

function solicitanteLabel(op) {
  if(op.tipo==='profesor') {
    const p=getProfesor(op.solicitanteId);
    return p ? p.nombre : '—';
  }
  if(op.tipo==='alumno') return op.alumnoNombre || 'Alumno';
  return 'Dirección';
}

function tipoBadge(tipo) {
  if(tipo==='profesor') return `<span class="badge badge-primary">Profesor</span>`;
  if(tipo==='alumno')   return `<span class="badge badge-info">Alumno</span>`;
  return `<span class="badge badge-warning">Dirección</span>`;
}

function calcDeudaProfesor(profId) {
  let copias = 0, kiosko = 0;
  DB.operaciones.forEach(op => {
    op.items.forEach(it => {
      if(!it.esPersonal) {
        const s = getSalon(it.salonId);
        if(s && s.tutorId === profId) copias += it.subtotal;
      } else if(op.tipo==='profesor' && op.solicitanteId===profId) {
        if(it.servicio==='kiosko') kiosko += it.subtotal;
        else copias += it.subtotal;
      }
    });
  });
  const pagado = DB.pagos.filter(p=>p.tipo==='profesor'&&p.entidadId===profId).reduce((a,p)=>a+p.monto,0);
  const total = copias + kiosko;
  return { total, copias, kiosko, pagado, pendiente: total - pagado };
}

function calcDeudaAlumno(alumnoId, alumnoNombre) {
  let total = 0;
  DB.operaciones.forEach(op => {
    if(op.tipo==='alumno') {
      const matchId = op.solicitanteId === alumnoId;
      const matchNombre = !op.solicitanteId && op.alumnoNombre === alumnoNombre;
      if(matchId || matchNombre) {
        op.items.filter(it=>it.esPersonal).forEach(it=>{ total += it.subtotal; });
      }
    }
  });
  const pagado = DB.pagos.filter(p=>p.tipo==='alumno'&&(p.entidadId===alumnoId||p.nombre===alumnoNombre)).reduce((a,p)=>a+p.monto,0);
  return { total, pagado, pendiente: total-pagado };
}

function pagRange(cur, total) {
  if(total<=7) return Array.from({length:total},(_,i)=>i+1);
  if(cur<=4)   return [1,2,3,4,5,'...',total];
  if(cur>=total-3) return [1,'...',total-4,total-3,total-2,total-1,total];
  return [1,'...',cur-1,cur,cur+1,'...',total];
}

function makePagHTML(total, page, perPage, pageFn, perPageFn) {
  const totalPages = Math.max(1, Math.ceil(total/perPage));
  const start = (page-1)*perPage;
  const end   = Math.min(start+perPage, total);
  const opts  = [10,20,50].map(n=>`<option value="${n}"${n===perPage?' selected':''}>${n}</option>`).join('');
  const pages = pagRange(page, totalPages).map(p=>p==='...'
    ? `<span class="pag-dots">…</span>`
    : `<button class="pag-btn${p===page?' active':''}" onclick="BCE.${pageFn}(${p})">${p}</button>`
  ).join('');
  return `
  <div class="pagination-info">Mostrando <strong>${total>0?start+1:0}–${end}</strong> de <strong>${total}</strong></div>
  <div class="pagination-controls">
    <span class="text-sm text-muted" style="margin-right:2px">Por página:</span>
    <select class="form-control form-control-sm per-page-select" onchange="BCE.${perPageFn}(parseInt(this.value))">${opts}</select>
    <button class="pag-btn" onclick="BCE.${pageFn}(${page-1})" ${page<=1?'disabled':''}><i data-lucide="chevron-left"></i></button>
    ${pages}
    <button class="pag-btn" onclick="BCE.${pageFn}(${page+1})" ${page>=totalPages?'disabled':''}><i data-lucide="chevron-right"></i></button>
  </div>`;
}
