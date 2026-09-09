/* =============================================
   BCE System — DB (Datos + Persistencia)
   ============================================= */

// today() y _dAgo() deben estar antes de DB para que los seed data puedan usarlos
// (las declaraciones function son hoisted, así que pueden estar en cualquier lugar del archivo)
function today() { return new Date().toISOString().split('T')[0]; }
function _dAgo(n) { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; }

const DB = {
  year: 2026,
  precios: [
    { id:'copia_bn',       nombre:'Copia B/N',           desc:'Por hoja, ambos lados posible', prof:0.10, alumno:0.20, dir:0.10, variable:false },
    { id:'impresion_bn',   nombre:'Impresión B/N',        desc:'Desde archivo digital',          prof:0.20, alumno:0.50, dir:0.20, variable:false },
    { id:'copia_color',    nombre:'Copia a Color',        desc:'Copiado desde original color',   prof:0.50, alumno:0.80, dir:0.50, variable:false },
    { id:'impresion_color',nombre:'Impresión a Color',    desc:'Varía según cobertura de tinta', prof:0.50, alumno:1.00, dir:0.50, variable:true  },
    { id:'anillado',       nombre:'Anillado',             desc:'Incluye tapas y espiral',        prof:3.00, alumno:4.00, dir:3.00, variable:true  },
    { id:'escaneo',        nombre:'Escaneo',              desc:'Por página, a PDF o JPG',        prof:0.50, alumno:1.00, dir:0.50, variable:false },
    { id:'plastificado',   nombre:'Plastificado',         desc:'Tamaño A4 o carnet',             prof:1.50, alumno:2.00, dir:1.50, variable:true  },
  ],
  roles: [
    { id:'ROL01', nombre:'Director/a',    tipo:'administrativo' },
    { id:'ROL02', nombre:'Subdirector/a', tipo:'administrativo' },
    { id:'ROL03', nombre:'Secretaria/o',  tipo:'administrativo' },
    { id:'ROL04', nombre:'Coordinador/a', tipo:'administrativo' },
    { id:'ROL05', nombre:'Auxiliar',      tipo:'administrativo' },
    { id:'ROL06', nombre:'Docente',       tipo:'docente'        },
    { id:'ROL07', nombre:'Docente Tutor', tipo:'docente'        },
  ],
  salones: [
    { id:'P1A', nivel:'Primaria',   grado:1, seccion:'A', tutorId:'T01' },
    { id:'P1B', nivel:'Primaria',   grado:1, seccion:'B', tutorId:'T02' },
    { id:'P2A', nivel:'Primaria',   grado:2, seccion:'A', tutorId:'T03' },
    { id:'P2B', nivel:'Primaria',   grado:2, seccion:'B', tutorId:'T04' },
    { id:'P3A', nivel:'Primaria',   grado:3, seccion:'A', tutorId:'T05' },
    { id:'P3B', nivel:'Primaria',   grado:3, seccion:'B', tutorId:'T06' },
    { id:'P4A', nivel:'Primaria',   grado:4, seccion:'A', tutorId:'T07' },
    { id:'P4B', nivel:'Primaria',   grado:4, seccion:'B', tutorId:'T08' },
    { id:'P5A', nivel:'Primaria',   grado:5, seccion:'A', tutorId:'T09' },
    { id:'P5B', nivel:'Primaria',   grado:5, seccion:'B', tutorId:'T10' },
    { id:'P6A', nivel:'Primaria',   grado:6, seccion:'A', tutorId:'T11' },
    { id:'P6B', nivel:'Primaria',   grado:6, seccion:'B', tutorId:'T12' },
    { id:'S1A', nivel:'Secundaria', grado:1, seccion:'A', tutorId:'T13' },
    { id:'S1B', nivel:'Secundaria', grado:1, seccion:'B', tutorId:'T14' },
    { id:'S2A', nivel:'Secundaria', grado:2, seccion:'A', tutorId:'T15' },
    { id:'S2B', nivel:'Secundaria', grado:2, seccion:'B', tutorId:'T16' },
    { id:'S3A', nivel:'Secundaria', grado:3, seccion:'A', tutorId:'T17' },
    { id:'S3B', nivel:'Secundaria', grado:3, seccion:'B', tutorId:'T18' },
    { id:'S4A', nivel:'Secundaria', grado:4, seccion:'A', tutorId:'T19' },
    { id:'S4B', nivel:'Secundaria', grado:4, seccion:'B', tutorId:'T20' },
    { id:'S5A', nivel:'Secundaria', grado:5, seccion:'A', tutorId:'T21' },
    { id:'S5B', nivel:'Secundaria', grado:5, seccion:'B', tutorId:'T22' },
  ],
  profesores: [
    { id:'T01',  nombre:'Ana Flores',        rolId:'ROL07', tutorDe:'P1A', avatarColor:'av-blue'   },
    { id:'T02',  nombre:'Carlos Mendoza',    rolId:'ROL07', tutorDe:'P1B', avatarColor:'av-green'  },
    { id:'T03',  nombre:'Rosa Vargas',       rolId:'ROL07', tutorDe:'P2A', avatarColor:'av-orange' },
    { id:'T04',  nombre:'Luis Herrera',      rolId:'ROL07', tutorDe:'P2B', avatarColor:'av-purple' },
    { id:'T05',  nombre:'Carmen Ríos',       rolId:'ROL07', tutorDe:'P3A', avatarColor:'av-teal'   },
    { id:'T06',  nombre:'Jorge Castillo',    rolId:'ROL07', tutorDe:'P3B', avatarColor:'av-red'    },
    { id:'T07',  nombre:'Patricia Lara',     rolId:'ROL07', tutorDe:'P4A', avatarColor:'av-blue'   },
    { id:'T08',  nombre:'Miguel Torres',     rolId:'ROL07', tutorDe:'P4B', avatarColor:'av-green'  },
    { id:'T09',  nombre:'Sofía Paredes',     rolId:'ROL07', tutorDe:'P5A', avatarColor:'av-orange' },
    { id:'T10',  nombre:'Roberto Salas',     rolId:'ROL07', tutorDe:'P5B', avatarColor:'av-purple' },
    { id:'T11',  nombre:'Elena Cruz',        rolId:'ROL07', tutorDe:'P6A', avatarColor:'av-teal'   },
    { id:'T12',  nombre:'Andrés Pinto',      rolId:'ROL07', tutorDe:'P6B', avatarColor:'av-red'    },
    { id:'T13',  nombre:'Isabel Morales',    rolId:'ROL07', tutorDe:'S1A', avatarColor:'av-blue'   },
    { id:'T14',  nombre:'Fernando Chávez',   rolId:'ROL07', tutorDe:'S1B', avatarColor:'av-green'  },
    { id:'T15',  nombre:'Gabriela Núñez',    rolId:'ROL07', tutorDe:'S2A', avatarColor:'av-orange' },
    { id:'T16',  nombre:'Raúl Espinoza',     rolId:'ROL07', tutorDe:'S2B', avatarColor:'av-purple' },
    { id:'T17',  nombre:'Mónica Aguilar',    rolId:'ROL07', tutorDe:'S3A', avatarColor:'av-teal'   },
    { id:'T18',  nombre:'Diego Ramírez',     rolId:'ROL07', tutorDe:'S3B', avatarColor:'av-red'    },
    { id:'T19',  nombre:'Lucía Peña',        rolId:'ROL07', tutorDe:'S4A', avatarColor:'av-blue'   },
    { id:'T20',  nombre:'Omar Gutiérrez',    rolId:'ROL07', tutorDe:'S4B', avatarColor:'av-green'  },
    { id:'T21',  nombre:'Verónica Soto',     rolId:'ROL07', tutorDe:'S5A', avatarColor:'av-orange' },
    { id:'T22',  nombre:'César Villanueva',  rolId:'ROL07', tutorDe:'S5B', avatarColor:'av-purple' },
    { id:'T23',  nombre:'Pilar Mendez',      rolId:'ROL06', tutorDe:null,  avatarColor:'av-teal'   },
    { id:'T24',  nombre:'Héctor Villena',    rolId:'ROL06', tutorDe:null,  avatarColor:'av-red'    },
    { id:'T25',  nombre:'Nora Castañeda',    rolId:'ROL06', tutorDe:null,  avatarColor:'av-blue'   },
    { id:'P001', nombre:'Pedro Ramírez',     rolId:'ROL01', tutorDe:null,  avatarColor:'av-red'    },
    { id:'P002', nombre:'Laura Gutiérrez',   rolId:'ROL02', tutorDe:null,  avatarColor:'av-orange' },
    { id:'P003', nombre:'Silvia Castro',     rolId:'ROL03', tutorDe:null,  avatarColor:'av-teal'   },
    { id:'P004', nombre:'Roberto Chávez',    rolId:'ROL04', tutorDe:null,  avatarColor:'av-blue'   },
    { id:'P005', nombre:'Elena Mora',        rolId:'ROL05', tutorDe:null,  avatarColor:'av-green'  },
  ],
  alumnos: [
    { id:'A001', nombre:'Rodrigo Alva',    salonId:'S3A', grado:3, seccion:'A', nivel:'Secundaria' },
    { id:'A002', nombre:'Valeria Ruiz',    salonId:'S3A', grado:3, seccion:'A', nivel:'Secundaria' },
    { id:'A003', nombre:'Juan Pérez',      salonId:'S3A', grado:3, seccion:'A', nivel:'Secundaria' },
    { id:'A004', nombre:'María Condori',   salonId:'P5B', grado:5, seccion:'B', nivel:'Primaria'   },
    { id:'A005', nombre:'Diego Quispe',    salonId:'P5B', grado:5, seccion:'B', nivel:'Primaria'   },
    { id:'A006', nombre:'Luciana Torres',  salonId:'S5A', grado:5, seccion:'A', nivel:'Secundaria' },
    { id:'A007', nombre:'Camila Vega',     salonId:'S5A', grado:5, seccion:'A', nivel:'Secundaria' },
    { id:'A008', nombre:'Sebastián León',  salonId:'S2B', grado:2, seccion:'B', nivel:'Secundaria' },
    { id:'A009', nombre:'Andrea Flores',   salonId:'P4A', grado:4, seccion:'A', nivel:'Primaria'   },
    { id:'A010', nombre:'Fabio Huanca',    salonId:'P4A', grado:4, seccion:'A', nivel:'Primaria'   },
  ],
  operaciones: [
    /* ---- Día 21 (_dAgo(4)) ---- */
    {
      id:'OP001', fecha:_dAgo(4)+' 08:10', tipo:'profesor', solicitanteId:'T03',
      items:[
        { servicio:'copia_bn', salonId:'P2A', esPersonal:false, cantidad:35, precio:0.10, subtotal:3.50 },
      ],
      total:3.50, notas:''
    },
    {
      id:'OP002', fecha:_dAgo(4)+' 08:45', tipo:'profesor', solicitanteId:'T15',
      items:[
        { servicio:'copia_bn', salonId:'S2A', esPersonal:false, cantidad:40, precio:0.10, subtotal:4.00 },
        { servicio:'copia_bn', salonId:'S3A', esPersonal:false, cantidad:40, precio:0.10, subtotal:4.00 },
        { servicio:'copia_bn', salonId:'S4A', esPersonal:false, cantidad:38, precio:0.10, subtotal:3.80 },
      ],
      total:11.80, notas:'Examen de Matemáticas'
    },
    {
      id:'OP003', fecha:_dAgo(4)+' 09:20', tipo:'alumno', solicitanteId:null,
      alumnoNombre:'Camila Vega',
      items:[
        { servicio:'impresion_bn', salonId:null, esPersonal:true, cantidad:3, precio:0.50, subtotal:1.50 },
      ],
      total:1.50, notas:'Impresión personal'
    },
    {
      id:'OP004', fecha:_dAgo(4)+' 10:00', tipo:'direccion', solicitanteId:null,
      dirResponsable:'Pedro Ramírez', dirPortador:'Pedro Ramírez',
      items:[
        { servicio:'impresion_color', salonId:null, esPersonal:false, cantidad:10, precio:1.00, subtotal:10.00 },
        { servicio:'anillado',        salonId:null, esPersonal:false, cantidad:2,  precio:5.00, subtotal:10.00 },
      ],
      total:20.00, notas:'Informe anual de gestión'
    },
    {
      id:'OP005', fecha:_dAgo(4)+' 10:50', tipo:'profesor', solicitanteId:'T09',
      items:[
        { servicio:'copia_color', salonId:'P5A', esPersonal:false, cantidad:25, precio:0.50, subtotal:12.50 },
      ],
      total:12.50, notas:'Láminas de arte'
    },
    {
      id:'OP006', fecha:_dAgo(4)+' 11:30', tipo:'profesor', solicitanteId:'T21',
      items:[
        { servicio:'impresion_bn', salonId:'S5A', esPersonal:false, cantidad:40, precio:0.20, subtotal:8.00 },
      ],
      total:8.00, notas:''
    },
    /* ---- Día 22 (_dAgo(3)) ---- */
    {
      id:'OP007', fecha:_dAgo(3)+' 08:05', tipo:'profesor', solicitanteId:'T05',
      items:[
        { servicio:'copia_bn', salonId:'P3A', esPersonal:false, cantidad:30, precio:0.10, subtotal:3.00 },
      ],
      total:3.00, notas:''
    },
    {
      id:'OP008', fecha:_dAgo(3)+' 08:40', tipo:'profesor', solicitanteId:'T17',
      items:[
        { servicio:'copia_bn', salonId:'S3A', esPersonal:false, cantidad:32, precio:0.10, subtotal:3.20 },
        { servicio:'copia_bn', salonId:'S3B', esPersonal:false, cantidad:34, precio:0.10, subtotal:3.40 },
      ],
      total:6.60, notas:''
    },
    {
      id:'OP009', fecha:_dAgo(3)+' 09:15', tipo:'alumno', solicitanteId:'A006',
      alumnoNombre:'Luciana Torres',
      items:[
        { servicio:'escaneo', salonId:null, esPersonal:true, cantidad:4, precio:1.00, subtotal:4.00 },
      ],
      total:4.00, notas:''
    },
    {
      id:'OP010', fecha:_dAgo(3)+' 10:00', tipo:'profesor', solicitanteId:'T16',
      items:[
        { servicio:'copia_bn', salonId:'S2B', esPersonal:false, cantidad:38, precio:0.10, subtotal:3.80 },
        { servicio:'copia_bn', salonId:'S3B', esPersonal:false, cantidad:34, precio:0.10, subtotal:3.40 },
      ],
      total:7.20, notas:''
    },
    {
      id:'OP011', fecha:_dAgo(3)+' 11:00', tipo:'alumno', solicitanteId:'A001',
      alumnoNombre:'Rodrigo Alva',
      items:[
        { servicio:'copia_bn', salonId:'S3A', esPersonal:false, cantidad:1, precio:0.10, subtotal:0.10 },
      ],
      total:0.10, notas:'Mandado por la profa.'
    },
    {
      id:'OP012', fecha:_dAgo(3)+' 14:00', tipo:'direccion', solicitanteId:null,
      dirResponsable:'Silvia Castro', dirPortador:'Silvia Castro',
      items:[
        { servicio:'plastificado', salonId:null, esPersonal:false, cantidad:5, precio:2.00, subtotal:10.00 },
      ],
      total:10.00, notas:'Credenciales docentes'
    },
  ],
  pagos: [
    { id:'PG001', fecha:_dAgo(3), tipo:'profesor', entidadId:'T17', monto:6.60, tipoPago:'efectivo' },
    { id:'PG002', fecha:_dAgo(4), tipo:'alumno',   entidadId:'A006', monto:4.00, tipoPago:'yape'     },
  ],
  kiosko: [
    { id:'KSK001', nombre:'Pan',           precio:1.50 },
    { id:'KSK002', nombre:'Café',          precio:1.00 },
    { id:'KSK003', nombre:'Papel lustre',  precio:2.00 },
    { id:'KSK004', nombre:'Galletas',      precio:1.00 },
  ],
  usuarios: [
    { id:'U001', username:'admin',   password:'1234', personaId:'P001', nivel:'admin',    activo:true  },
    { id:'U002', username:'silvia',  password:'5678', personaId:'P003', nivel:'operador', activo:true  },
    { id:'U003', username:'consulta', password:'0000', personaId:'P005', nivel:'consulta', activo:false },
  ],
};

/* ---- LOCALSTORAGE PERSISTENCE ---- */
const LS_KEY = 'bce_db_v3';

function saveDB() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      year:        DB.year,
      precios:     DB.precios,
      roles:       DB.roles,
      salones:     DB.salones,
      profesores:  DB.profesores,
      alumnos:     DB.alumnos,
      operaciones: DB.operaciones,
      pagos:       DB.pagos,
      usuarios:    DB.usuarios,
      kiosko:      DB.kiosko,
    }));
  } catch(e) { console.warn('[BCE] Error guardando en localStorage', e); }
}

function loadDB() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.year)                       DB.year        = parseInt(s.year);
    if (Array.isArray(s.precios))     DB.precios     = s.precios;
    if (Array.isArray(s.roles))       DB.roles       = s.roles;
    if (Array.isArray(s.salones))     DB.salones     = s.salones;
    if (Array.isArray(s.profesores))  DB.profesores  = s.profesores;
    if (Array.isArray(s.alumnos))     DB.alumnos     = s.alumnos;
    if (Array.isArray(s.operaciones)) DB.operaciones = s.operaciones;
    if (Array.isArray(s.pagos))       DB.pagos       = s.pagos;
    if (Array.isArray(s.usuarios))    DB.usuarios    = s.usuarios;
    if (Array.isArray(s.kiosko))      DB.kiosko      = s.kiosko;
  } catch(e) { console.warn('[BCE] Error cargando desde localStorage', e); }
}

function clearDB() {
  showConfirm({
    title: 'Limpiar operaciones y pagos',
    message: 'Se eliminarán <strong>todas las operaciones y pagos</strong> registrados. Los catálogos (profesores, alumnos, salones) se conservan. Esta acción <strong>no se puede deshacer</strong>.',
    confirmText: 'Sí, limpiar',
    type: 'danger',
    onConfirm: () => {
      DB.operaciones = [];
      DB.pagos = [];
      saveDB();
      toast('Operaciones y pagos eliminados. Catálogos intactos.', 'success');
      navigate('dashboard');
    }
  });
}

function iniciarDesdeCero() {
  showConfirm({
    title: 'Iniciar desde cero',
    message: `Esto borrará <strong>absolutamente todo</strong>: operaciones, pagos, salones, profesores, alumnos y usuarios.<br><br>
      <span style="color:var(--success)">✓ Se conservan los precios de servicios.</span><br><br>
      El sistema quedará completamente vacío, listo para ser configurado desde el inicio. <strong>No se puede deshacer.</strong>`,
    confirmText: 'Sí, borrar todo',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: () => {
      DB.salones     = [];
      DB.profesores  = [];
      DB.alumnos     = [];
      DB.operaciones = [];
      DB.pagos       = [];
      DB.usuarios    = [];
      saveDB();
      location.reload();
    }
  });
}

function resetDemoData() {
  showConfirm({
    title: 'Restaurar datos demo',
    message: '¿Restaurar los datos de demostración? Esto <strong>reemplazará todos los datos actuales</strong>.',
    confirmText: 'Restaurar demo',
    type: 'warning',
    onConfirm: () => {
      localStorage.removeItem(LS_KEY);
      location.reload();
    }
  });
}
