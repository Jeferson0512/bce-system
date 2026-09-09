/* =============================================
   BCE System — Utils (export, print, dropdown)
   ============================================= */

function exportCSV(filename, headers, rows) {
  const esc = v => '"' + String(v==null?'':v).replace(/"/g,'""') + '"';
  const txt = [headers, ...rows].map(r=>r.map(esc).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿'+txt], {type:'text/csv;charset=utf-8;'}));
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  toast('Archivo descargado', 'success');
}

function printPDF(titulo, subtitulo, tableHTML) {
  const w = window.open('', '_blank', 'width=960,height=720');
  const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  w.document.write(`<!DOCTYPE html><html lang="es"><head>
  <meta charset="UTF-8"><title>${titulo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1e293b;background:#fff;padding:28px 32px}
    .print-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:14px;margin-bottom:20px}
    .logo{font-size:26px;font-weight:800;color:#2563eb;letter-spacing:-1px}
    .logo-sub{font-size:10px;color:#64748b;margin-top:1px}
    .doc-title{font-size:18px;font-weight:700;color:#0f172a;margin:4px 0 2px}
    .doc-sub{font-size:11px;color:#64748b}
    .doc-right{text-align:right;font-size:11px;color:#64748b}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11px}
    thead th{background:#1e293b;color:#fff;padding:8px 10px;text-align:left;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.4px}
    tbody td{padding:7px 10px;border-bottom:1px solid #e2e8f0}
    tbody tr:nth-child(even) td{background:#f8fafc}
    tfoot td{padding:8px 10px;font-weight:700;background:#eff6ff;border-top:2px solid #2563eb}
    .td-right{text-align:right} .td-center{text-align:center}
    .badge-prof{background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:4px;font-size:10px}
    .badge-alu{background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:4px;font-size:10px}
    .badge-dir{background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:4px;font-size:10px}
    .print-footer{margin-top:20px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between}
    .btn-print{margin-top:16px;background:#2563eb;color:#fff;border:none;padding:9px 22px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}
    .btn-print:hover{background:#1d4ed8}
    @media print{.btn-print{display:none}.print-footer{position:fixed;bottom:10px;left:32px;right:32px}}
  </style>
</head><body>
  <div class="print-header">
    <div>
      <div class="logo">BCE <span style="font-size:14px;font-weight:400;color:#64748b">System</span></div>
      <div class="logo-sub">Bitácora de Copias Escolares</div>
    </div>
    <div>
      <div class="doc-title">${titulo}</div>
      <div class="doc-sub">${subtitulo}</div>
    </div>
    <div class="doc-right">Generado: ${fecha}<br>Año lectivo ${DB.year}</div>
  </div>
  ${tableHTML}
  <div class="print-footer">
    <span>BCE System — Bitácora de Copias Escolares</span>
    <span>Impreso el ${fecha}</span>
  </div>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</body></html>`);
  w.document.close();
}

function toggleExportDrop(id) {
  const el = document.getElementById(id);
  if(!el) return;
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.export-drop-wrap.open').forEach(d=>d.classList.remove('open'));
  if(!wasOpen) el.classList.add('open');
}

document.addEventListener('click', e => {
  if(!e.target.closest('.export-drop-wrap'))
    document.querySelectorAll('.export-drop-wrap.open').forEach(d=>d.classList.remove('open'));
});
