const data = window.DASHBOARD_DATA;
const allTypes = data.frequency_instruments.map(r=>r.type);
const params = new URLSearchParams(window.location.search);
let selectedType = params.get('tipo') || allTypes[0];
const select = document.getElementById('typeSelect');
select.innerHTML = allTypes.map(t=>`<option value="${escapeHtml(t)}" ${t===selectedType?'selected':''}>${escapeHtml(t)}</option>`).join('');
document.getElementById('goType').addEventListener('click',()=>go(select.value));
select.addEventListener('change',()=>go(select.value));
render(selectedType);
function go(t){window.location.href=`instrumento.html?tipo=${encodeURIComponent(t)}`;}
function render(type){
  const d=data.instruments_by_type[type]; if(!d)return;
  document.getElementById('detailTitle').textContent=type;
  document.getElementById('detailCategory').textContent=d.analytical_category || '—';
  document.getElementById('detailCount').textContent=d.count;
  document.getElementById('detailPct').textContent=d.pct_label;
  document.getElementById('detailLevel').textContent=d.level;
  document.getElementById('detailBody').innerHTML=d.items.map(i=>`<tr><td>${escapeHtml(i.instrument)}</td><td>${escapeHtml(i.program)}</td><td>${escapeHtml(i.problem)}</td><td>${escapeHtml(i.problem_category)}</td></tr>`).join('');
}
function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
