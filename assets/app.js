
const BOARD = document.getElementById('board');
const CLOCK = document.getElementById('clock');
const DATA_URL = './data/departures.json'; // produced by the GitHub Action

function pad(n){ return n.toString().padStart(2,'0'); }
function tick(){
  const d = new Date();
  CLOCK.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
setInterval(tick, 1000); tick();

function statusClass(remarks) {
  const r = (remarks || '').toLowerCase();
  if (r.includes('board') || r.includes('gate open') || r.includes('on time')) return 'ok';
  if (r.includes('delay') || r.includes('late') || r.includes('gate closed') || r.includes('cancel')) return 'warn';
  return '';
}

async function loadData() {
  try {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`); // bust cache
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();

    // Sort by estimated or scheduled local time
    list.sort((a,b) => (a.estimatedTime || a.scheduledTime || '').localeCompare(b.estimatedTime || b.scheduledTime || ''));

    // Clear existing rows
    document.querySelectorAll('.row').forEach(el => el.remove());

    // Render first 24 rows (add paging if you want more)
    for (const f of list.slice(0, 24)) {
      const time = (f.estimatedTime || f.scheduledTime || '').substring(11,16) || '--:--';
      const flight = `${(f.airlineCode || '').toUpperCase()} ${f.flightNumber || ''}`.trim();
      const airline = f.airlineName || '';
      const city = f.city || '';
      const gate = (f.gate || f.terminal) ? `${f.terminal ? 'T'+f.terminal+' ' : ''}${f.gate||''}`.trim() : '—';
      const remarks = f.remarks || '';
      const row = document.createElement('div'); row.className = 'row';

      [time, flight, airline, city, gate, remarks].forEach((txt, idx) => {
        const d = document.createElement('div');
        d.textContent = txt;
        if (idx === 5) d.className = `status ${statusClass(remarks)}`;
        row.appendChild(d);
      });

      BOARD.appendChild(row);
    }
  } catch (e) {
    console.error('Failed to load data', e);
  }
}

// Poll the JSON every 60s
loadData();
set
