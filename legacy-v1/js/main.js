/* =============================================
   BCE System — Main: Router + Init + window.BCE
   ============================================= */

let currentRoute = '';

function navigate(route) {
  if(currentRoute==='operaciones/nueva' && route!=='operaciones/nueva' && NOP.items.length>0) {
    showConfirm({
      title: '¿Salir sin guardar?',
      message: `Tienes <strong>${NOP.items.length} ítem${NOP.items.length!==1?'s':''}</strong> en el pedido que se perderán si sales ahora.`,
      confirmText: 'Sí, salir',
      cancelText: 'Quedarme',
      type: 'warning',
      onConfirm: () => _doNavigate(route),
    });
    return;
  }
  _doNavigate(route);
}

function _doNavigate(route) {
  currentRoute = route;
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.route === route);
  });
  const crumbs = {
    'dashboard':           'Dashboard',
    'operaciones/nueva':   'Operaciones / Nueva Operación',
    'operaciones/lote':    'Operaciones / Registro por Lote',
    'operaciones/historial':'Operaciones / Historial',
    'deudas/profesores':   'Deudas / Profesores',
    'deudas/alumnos':      'Deudas / Alumnos',
    'deudas/direccion':    'Deudas / Dirección',
    'reportes/diario':     'Reportes / Diario',
    'reportes/periodo':    'Reportes / Por Período',
    'catalogos/salones':   'Catálogos / Salones',
    'catalogos/profesores':'Catálogos / Profesores',
    'catalogos/alumnos':   'Catálogos / Alumnos',
    'catalogos/personal':  'Catálogos / Personal',
    'catalogos/usuarios':  'Catálogos / Usuarios',
    'config/precios':      'Configuración / Precios',
    'config/sistema':      'Configuración / Sistema',
  };
  const parts = (crumbs[route]||route).split(' / ');
  $('breadcrumb').innerHTML = parts.length>1
    ? `<span class="text-muted">${parts[0]}</span><span class="bc-sep">/</span><span class="bc-current">${parts[1]}</span>`
    : `<span class="bc-current">${parts[0]}</span>`;

  const views = {
    'dashboard':            viewDashboard,
    'operaciones/nueva':    viewNuevaOperacion,
    'operaciones/lote':     viewRegistroLote,
    'operaciones/historial':viewHistorial,
    'deudas/profesores':    viewDeudasProfesores,
    'deudas/alumnos':       viewDeudasAlumnos,
    'deudas/direccion':     viewDeudasDireccion,
    'reportes/diario':      viewReporteDiario,
    'reportes/periodo':     viewReportePeriodo,
    'catalogos/salones':    viewCatalogoSalones,
    'catalogos/profesores': viewCatalogoProfesores,
    'catalogos/alumnos':    viewCatalogoAlumnos,
    'catalogos/personal':   viewCatalogoPersonal,
    'catalogos/usuarios':   viewCatalogoUsuarios,
    'config/precios':       viewConfigPrecios,
    'config/sistema':       viewConfigSistema,
  };
  const fn = views[route] || viewComingSoon;
  $('content').innerHTML = fn();
  lucide.createIcons();
  afterRender(route);
}

function afterRender(route) {
  if(route==='dashboard')             initDashboardChart();
  if(route==='reportes/diario')       initDiarioChart();
  if(route==='reportes/periodo')      initPeriodoChart();
  if(route==='operaciones/historial') histRefreshTable();
  if(route==='deudas/profesores')     deudaProfRefresh();
  if(route==='deudas/alumnos')        deudaAluRefresh();
  if(route==='catalogos/profesores')  catProfRefresh();
  if(route==='catalogos/alumnos')     catsRefreshPanel();
  if(route==='catalogos/personal')    catPersRefresh();
  if(route==='catalogos/usuarios')    catUsrRefresh();
  if(route==='operaciones/nueva') {
    const firstPrecio = DB.precios[0];
    if(firstPrecio) nopOnServicioChange(firstPrecio.id);
  }
}

function setYear(y) { DB.year = parseInt(y); saveDB(); toast(`Mostrando datos de ${y}`, 'info'); }

function initSidebar() {
  $('sidebar-toggle').addEventListener('click',()=>{
    $('sidebar').classList.toggle('collapsed');
    $('main-wrapper').classList.toggle('collapsed');
  });
  $('sidebar-overlay').addEventListener('click',()=>{
    $('sidebar').classList.remove('collapsed');
    $('main-wrapper').classList.remove('collapsed');
  });
}

function initNavbar() {
  const menu = $('user-menu');
  $('user-trigger').addEventListener('click',(e)=>{
    e.stopPropagation();
    menu.classList.toggle('open');
  });
  document.addEventListener('click',()=>menu.classList.remove('open'));

  document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      navigate(link.dataset.route);
    });
  });
}

function init() {
  loadDB();
  if (!localStorage.getItem(LS_KEY)) saveDB();
  const ySel = document.getElementById('year-select');
  if (ySel) ySel.value = String(DB.year);
  initSidebar();
  initNavbar();
  document.getElementById('confirm-overlay').addEventListener('click', e => {
    if(e.target===e.currentTarget) closeConfirm();
  });
  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);

window.BCE = {
  navigate, toast, openModal, closeModal, setYear,
  showConfirm, closeConfirm,
  NOP,
  nopSetTipo, nopOnProfesorChange, nopSetAlumnoTipo,
  nopOnAlumnoSalonChange, nopOnSalonChange,
  nopOnServicioChange, nopCalcItem, nopAddItem,
  nopRemoveItem, nopRefreshPanel, nopSave, nopSaveContinuar,
  nopToggleMultiSalon, nopToggleSalon, nopSetSalonQty, nopAddMultiSalon,
  nopSearchAlumno, nopSelectAlumno, nopAddAlumnoNuevo, nopCloseAutocomplete,
  nopSearchDirPersonal, nopSelectDirPersonal, nopAddDirPersonal, nopCloseDirAutocomplete, nopDirMismaPersona,
  nopSetModo, nopSearchKiosko, nopSelectKiosko, nopCloseKioskoAC, nopCalcKiosko, nopAddKioskoItem,
  histSearch, histSetTipo, histSetPage, histSetPerPage, histSetFecha, histExportCSV, histExportPDF,
  openDetalleOperacion,
  deudaProfSearch, deudaProfExportCSV, deudaProfExportPDF,
  deudaAluSearch, deudaAluSetSalon, deudaAluExportCSV, deudaAluExportPDF, openDetalleAlumno,
  dirExportCSV, dirExportPDF,
  printResumenProfesor, printDetalleProfesor, printKioskoProfesor,
  printResumenAlumno, printDetalleAlumno,
  printResumenDireccion, printDetalleDireccion,
  pagoConfirmar, _pagoTipoChange,
  clearDB, resetDemoData, iniciarDesdeCero,
  catProfSearch, catProfSetPage, catProfSetPerPage,
  catPersSearch, catPersSetPage, catPersSetPerPage,
  catsalSetNivel,
  catsSetNivel, catsSetSalon, catsSearch,
  openModalUsuario, saveUsuario, deleteUsuario, catUsrToggleActivo, catUsrSearch,
  openModalSalon, saveSalon, deleteSalon,
  openModalProfesor, saveProfesor, deleteProfesor,
  openModalPersonal, savePersonal, deletePersonal,
  openModalAlumno, saveAlumno, deleteAlumno,
  openDetalleProfesor, openModalPago,
  diarioSetFecha, diarioExportCSV, diarioExportPDF,
  periodoGetRange, periodoSetFiltro, periodoExportCSV, periodoExportPDF,
  toggleExportDrop,
  LOT,
  lotSetTab, lotSetFecha, lotAddRow, lotRemove,
  lotField, lotServicio, lotCantidad, lotPrecio, lotAluTipo, lotSave,
  lotSearchAlumno, lotSelectAlumno, lotSelectAlumnoNuevo, lotCloseAluDrop,
  lotSearchDirPersonal, lotSelectDirPersonal, lotAddDirPersonal, lotCloseDirDrop,
};
