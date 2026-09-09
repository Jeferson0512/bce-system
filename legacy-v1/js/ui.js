/* =============================================
   BCE System — UI (modal, confirm, toast)
   ============================================= */

function openModal(title, body, footer, size='') {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML    = body;
  $('modal-footer').innerHTML  = footer;
  const modal = $('modal');
  modal.className = `modal ${size}`;
  $('modal-overlay').classList.add('open');
  lucide.createIcons();
}

function closeModal(e) {
  if(e && e.target !== $('modal-overlay')) return;
  $('modal-overlay').classList.remove('open');
}

function showConfirm({ title='¿Confirmar?', message='', confirmText='Confirmar', cancelText='Cancelar', type='warning', onConfirm, onCancel }) {
  const overlay = document.getElementById('confirm-overlay');
  const icon = document.getElementById('confirm-icon');
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').innerHTML = message;
  const okBtn = document.getElementById('confirm-ok-btn');
  const cancelBtn = document.getElementById('confirm-cancel-btn');
  okBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  okBtn.className = `btn ${type==='danger'?'btn-danger':type==='warning'?'btn-warning':'btn-primary'}`;
  const iconMap = { warning:'alert-triangle', danger:'alert-circle', info:'info' };
  icon.className = `confirm-icon ${type}`;
  icon.innerHTML = `<i data-lucide="${iconMap[type]||'alert-triangle'}"></i>`;
  okBtn.onclick    = () => { closeConfirm(); if(onConfirm) onConfirm(); };
  cancelBtn.onclick = () => { closeConfirm(); if(onCancel) onCancel(); };
  overlay.classList.add('open');
  lucide.createIcons();
}

function closeConfirm() {
  document.getElementById('confirm-overlay')?.classList.remove('open');
}

function toast(msg, type='info') {
  const icons={success:'check-circle',danger:'alert-circle',warning:'alert-triangle',info:'info'};
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i data-lucide="${icons[type]||'info'}"></i><span>${msg}</span>`;
  $('toast-wrap').appendChild(el);
  lucide.createIcons();
  setTimeout(()=>el.remove(), 3500);
}
