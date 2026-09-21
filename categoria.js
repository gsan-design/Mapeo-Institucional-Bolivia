const data = window.DASHBOARD_DATA;
const params = new URLSearchParams(window.location.search);
const category = params.get('categoria');
const initialView = params.get('vista') || 'problemas';
const detail = data && data.category_details ? data.category_details[category] : null;

if (!detail) {
  document.getElementById('categoryTitle').textContent = 'Categoría no encontrada';
} else {
  document.getElementById('categoryTitle').textContent = detail.category;
  document.getElementById('categorySubtitle').textContent = 'Detalle de problemas y soluciones asociadas';
  document.getElementById('categoryProblems').textContent = detail.problem_count;
  document.getElementById('categoryPct').textContent = `${(detail.recurrence_pct*100).toFixed(1).replace('.',',')}%`;
  document.getElementById('categorySolutions').textContent = detail.solution_count;
  document.getElementById('problemList').innerHTML = detail.problems.map(p => `<li>${escapeHtml(p)}</li>`).join('');
  document.getElementById('solutionsBody').innerHTML = detail.solutions.map(s => `<tr><td>${escapeHtml(s.instrument)}</td><td>${escapeHtml(s.type)}</td><td>${escapeHtml(s.program)}</td><td>${escapeHtml(s.problem)}</td></tr>`).join('');
  document.getElementById('problemsTab').addEventListener('click',()=>showView('problemas'));
  document.getElementById('solutionsTab').addEventListener('click',()=>showView('soluciones'));
  showView(initialView);
}
function showView(view){
  const problems = view !== 'soluciones';
  document.getElementById('problemsPanel').style.display = problems ? 'block' : 'none';
  document.getElementById('solutionsPanel').style.display = problems ? 'none' : 'block';
  document.getElementById('problemsTab').classList.toggle('active',problems);
  document.getElementById('solutionsTab').classList.toggle('active',!problems);
}
function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
