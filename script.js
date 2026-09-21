
let dashboardData = window.DASHBOARD_DATA;
let instrumentChart;
let expanded = false;

if (!dashboardData) {
  document.body.insertAdjacentHTML('afterbegin', '<div style="background:#fee2e2;color:#991b1b;padding:12px 18px;font-family:Arial">No se pudo cargar data.js. Verifica que el archivo esté en la raíz del repositorio.</div>');
} else {
  initDashboard(dashboardData);
}

function initDashboard(data) {
  document.getElementById('dashboard-title').textContent = data.meta.title;
  document.getElementById('dashboard-updated').textContent = `Actualizado: ${data.meta.updated}`;
  document.getElementById('evolution-note').textContent = `${data.meta.notes.evolution} Total de programas mapeados: ${data.evolution.total_programs}.`;

  renderEvolutionChart(data.evolution);
  renderRecurrenceTable(data.recurrence_coverage);
  renderPriorityTable(data.priority_by_category);
  renderQuality(data.quality);
  renderInstrumentChart(data.frequency_instruments.slice(0, 5));

  const btn = document.getElementById('toggleInstruments');
  btn.addEventListener('click', () => {
    expanded = !expanded;
    const subset = expanded ? data.frequency_instruments : data.frequency_instruments.slice(0, 5);
    renderInstrumentChart(subset);
    btn.textContent = expanded ? '▾ ver menos' : '▸ ver más';
    const chartWrap = document.querySelector('.instruments-card .chart-wrap');
    chartWrap.style.height = expanded ? `${Math.max(440, subset.length * 32)}px` : '250px';
  });
}

function renderEvolutionChart(evolution) {
  const ctx = document.getElementById('evolutionChart');
  if (typeof Chart === 'undefined') {
    ctx.parentElement.innerHTML = '<p style="padding:20px">No se pudo cargar la librería de gráficos. Revisa la conexión a internet.</p>';
    return;
  }
  const colors = evolution.counts.map((v, i) => (i % 3 === 0 ? '#d7dd8f' : (i % 3 === 1 ? '#91ab52' : '#5a852d')));
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: evolution.years,
      datasets: [{
        label: 'Programas creados',
        data: evolution.counts,
        backgroundColor: colors,
        borderRadius: 4,
        maxBarThickness: 20
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} programa(s)` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10, font: { size: 11 } } },
        y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Programas creados' }, grid: { color: '#cccccc' } }
      }
    }
  });
}

function renderRecurrenceTable(rows) {
  const tbody = document.querySelector('#recurrenceTable tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.category}</td>
      <td style="text-align:center">${r.problems}</td>
      <td style="text-align:center">${formatPct(r.recurrence_pct)}</td>
      <td style="text-align:center">${r.coverage}</td>
    </tr>
  `).join('');
}

function renderPriorityTable(rows) {
  const tbody = document.querySelector('#priorityTable tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.category}</td>
      <td><a class="type-link" href="instrumento.html?tipo=${encodeURIComponent(r.type)}">${r.type}</a></td>
      <td style="text-align:center"><strong>${r.pct_label}</strong></td>
    </tr>
  `).join('');
}

function renderQuality(quality) {
  setGauge('confidenceGauge', quality.overall_confidence);
  document.getElementById('confidenceValue').textContent = quality.overall_confidence_label;
  document.getElementById('completenessValue').textContent = quality.completeness_label;
  const tbody = document.querySelector('#qualityTable tbody');
  tbody.innerHTML = quality.factor_table.map(f => `
    <tr><td>${f.label}</td><td><span class="status-chip">${f.score_label} · ${f.status}</span></td></tr>
  `).join('');
}

function setGauge(id, pct) {
  document.getElementById(id).style.setProperty('--pct', Math.max(0, Math.min(100, pct * 100)));
}

function renderInstrumentChart(rows) {
  const ctx = document.getElementById('instrumentChart');
  if (typeof Chart === 'undefined') {
    ctx.parentElement.innerHTML = '<p style="padding:20px">No se pudo cargar la librería de gráficos. Revisa la conexión a internet.</p>';
    return;
  }
  const labels = rows.map(r => r.type);
  const values = rows.map(r => r.count);
  const colors = rows.map((_, i) => i === 0 ? '#ff5b5b' : (i % 2 === 0 ? '#5a852d' : '#8eac54'));
  if (instrumentChart) instrumentChart.destroy();
  instrumentChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4 }] },
    options: {
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} apariciones` } } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#cccccc' } }, y: { ticks: { font: { size: 11 } }, grid: { display: false } } },
      onClick: (evt, elements) => {
        if (!elements.length) return;
        const type = labels[elements[0].index];
        window.location.href = `instrumento.html?tipo=${encodeURIComponent(type)}`;
      }
    }
  });
}

function formatPct(v) {
  return `${(v * 100).toFixed(1).replace('.', ',')}%`;
}
