
let dashboardData = window.DASHBOARD_DATA;
let selectedType;

if (!dashboardData) {
  document.body.insertAdjacentHTML('afterbegin', '<div style="background:#fee2e2;color:#991b1b;padding:12px 18px;font-family:Arial">No se pudo cargar data.js. Verifica que el archivo esté en la raíz del repositorio.</div>');
} else {
  initDetailPage(dashboardData);
}

function initDetailPage(data) {
  const allTypes = data.frequency_instruments.map(row => row.type);
  const params = new URLSearchParams(window.location.search);
  selectedType = params.get('tipo') || allTypes[0];
  if (!data.instruments_by_type[selectedType]) selectedType = allTypes[0];

  const select = document.getElementById('typeSelect');
  select.innerHTML = allTypes.map(type => `<option value="${escapeHtml(type)}" ${type === selectedType ? 'selected' : ''}>${type}</option>`).join('');
  document.getElementById('goType').addEventListener('click', () => {
    window.location.href = `instrumento.html?tipo=${encodeURIComponent(select.value)}`;
  });
  select.addEventListener('change', () => {
    window.location.href = `instrumento.html?tipo=${encodeURIComponent(select.value)}`;
  });
  renderDetail(selectedType, data);
}

function renderDetail(tipo, data) {
  const detail = data.instruments_by_type[tipo];
  if (!detail) return;
  document.getElementById('detailTitle').textContent = tipo;
  document.getElementById('detailSubtitle').textContent = 'Listado de instrumentos y herramientas asociados a este tipo';
  document.getElementById('detailCategory').textContent = detail.analytical_category || '—';
  document.getElementById('detailCount').textContent = detail.count;
  document.getElementById('detailPct').textContent = detail.pct_label || formatPct(detail.pct || 0);
  document.getElementById('detailLevel').textContent = detail.level || '—';
  document.querySelector('#detailTable tbody').innerHTML = detail.items.map(item => `
    <tr><td>${item.instrument}</td><td>${item.program}</td><td>${item.problem}</td><td>${item.problem_category}</td></tr>
  `).join('');
}

function formatPct(v) { return `${(v * 100).toFixed(2).replace('.', ',')}%`; }
function escapeHtml(str) { return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
