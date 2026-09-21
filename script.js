const dashboardData = window.DASHBOARD_DATA;
let instrumentsExpanded = false;

if (!dashboardData) {
  document.body.insertAdjacentHTML('afterbegin','<div class="error-banner">No se pudo cargar data.js.</div>');
} else {
  initDashboard(dashboardData);
}

function initDashboard(data) {
  document.getElementById('dashboard-title').textContent = data.meta.title;
  document.getElementById('dashboard-updated').textContent = `Actualizado: ${data.meta.updated}`;
  renderTimeline(data.timeline);
  renderRecurrenceTable(data.recurrence_coverage);
  renderPriorityTable(data.priority_by_category);
  renderQuality(data.quality, data.meta.impact_note);
  renderInstrumentBars(data.frequency_instruments.slice(0,5));
  document.getElementById('toggleInstruments').addEventListener('click', () => {
    instrumentsExpanded = !instrumentsExpanded;
    renderInstrumentBars(instrumentsExpanded ? data.frequency_instruments : data.frequency_instruments.slice(0,5));
    document.getElementById('toggleInstruments').textContent = instrumentsExpanded ? '− ver menos' : '+ ver más';
  });
}

function renderTimeline(timeline) {
  const root = document.getElementById('timelineChart');
  const min = timeline.min_year;
  const max = timeline.max_year;
  const span = max - min;
  const tickYears = [];
  for (let y=min; y<=max; y++) if (y===min || y===max || (y-min)%5===0) tickYears.push(y);
  const axis = `<div class="timeline-axis"><div class="timeline-label-spacer"></div><div class="timeline-axis-track">${tickYears.map(y=>`<span style="left:${((y-min)/span)*100}%">${y}</span>`).join('')}</div></div>`;
  const rows = timeline.programs.map(p => {
    const left = ((p.start-min)/span)*100;
    const width = Math.max(1.8, ((p.end-p.start)/span)*100);
    const classes = `timeline-bar${p.ongoing ? ' ongoing' : ''}${p.approximate ? ' approximate' : ''}`;
    const endLabel = p.ongoing ? 'Presente' : p.end;
    return `<div class="timeline-row">
      <div class="timeline-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
      <div class="timeline-track">
        <div class="${classes}" style="left:${left}%;width:${width}%" title="${escapeHtml(p.name)} · ${escapeHtml(p.period)}"></div>
        <span class="timeline-start" style="left:${left}%">${p.start}</span>
        <span class="timeline-end" style="left:${Math.min(98,left+width)}%">${endLabel}</span>
      </div>
    </div>`;
  }).join('');
  root.innerHTML = axis + rows;
}

function renderRecurrenceTable(rows) {
  const tbody = document.querySelector('#recurrenceTable tbody');
  tbody.innerHTML = rows.map(r => {
    const cat = encodeURIComponent(r.category);
    return `<tr>
      <td>${escapeHtml(r.category)}</td>
      <td class="numeric-cell"><a class="count-link" href="categoria.html?categoria=${cat}&vista=problemas">${r.problems}</a></td>
      <td class="numeric-cell">${formatPct(r.recurrence_pct,1)}</td>
      <td class="numeric-cell"><a class="count-link" href="categoria.html?categoria=${cat}&vista=soluciones">${r.solutions}</a></td>
    </tr>`;
  }).join('');
}

function renderPriorityTable(rows) {
  const tbody = document.querySelector('#priorityTable tbody');
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${escapeHtml(r.category)}</td>
    <td><a class="type-link" href="instrumento.html?tipo=${encodeURIComponent(r.type)}">${escapeHtml(r.type)}</a></td>
    <td class="numeric-cell"><strong>${r.pct_label}</strong></td>
  </tr>`).join('');
}

function renderQuality(quality, impactNote) {
  const pct = Math.max(0,Math.min(1,quality.overall_confidence));
  const progress = document.getElementById('gaugeProgress');
  progress.style.strokeDasharray = '100';
  progress.style.strokeDashoffset = String(100 - pct*100);
  document.getElementById('confidenceValue').textContent = quality.overall_confidence_label;
  document.getElementById('completenessValue').textContent = quality.completeness_label;
  document.getElementById('impactNote').textContent = impactNote;
  document.querySelector('#qualityTable tbody').innerHTML = quality.factor_table.map(f => `<tr><td>${escapeHtml(f.label)}</td><td class="numeric-cell"><span class="status-chip">${f.score_label}</span></td></tr>`).join('');
}

function renderInstrumentBars(rows) {
  const root = document.getElementById('instrumentBars');
  const max = Math.max(...rows.map(r=>r.count));
  root.innerHTML = rows.map(r => `<a class="bar-row" href="instrumento.html?tipo=${encodeURIComponent(r.type)}">
    <div class="bar-label">${escapeHtml(r.type)}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${(r.count/max)*100}%"><span>${r.count}</span></div></div>
    <div class="bar-pct">${r.pct_label}</div>
  </a>`).join('');
}

function formatPct(v,digits=1){return `${(v*100).toFixed(digits).replace('.',',')}%`;}
function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
