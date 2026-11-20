const canvas = document.querySelector(".graph canvas");
const c = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const startInput = document.getElementById("startdate");
const endInput = document.getElementById("enddate");

function shiftMonth(value, delta) {
  const [y, m] = value.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function syncBounds() {
  if (startInput.value) endInput.min = shiftMonth(startInput.value, 0);
  if (endInput.value) startInput.max = shiftMonth(endInput.value, -0);
}

async function loadJSON() {
  try {
    const start = startInput.value + "-01";
    const end = endInput.value + "-01";
    const response = await (
      await fetch(`sorted/data-${start}_${end}.json`)
    ).json();
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }
}

function getUTC(start, end) {
  const [starty, startm] = start.split("-").map(Number);
  const [endy, endm] = end.split("-").map(Number);

  const utcS = Date.UTC(starty, startm - 1, 1);
  const utcE = Date.UTC(endy, endm - 1, 1);

  return [utcS, utcE];
}

function getFilteredData(start, end) {
  const [utcS, utcE] = getUTC(start, end);

  const filtered = [];
  for (const row of allData) {
    if (row.time >= utcS && row.time <= utcE) {
      filtered.push(row);
    }
  }

  const grouped = {};
  for (const row of filtered) {
    if (row.time in grouped) {
      grouped[row.time].sum += row["NearNadir_Composite_Snow_Free"];
      grouped[row.time].count += 1;
    } else {
      grouped[row.time] = {
        sum: row["NearNadir_Composite_Snow_Free"],
        count: 1,
      };
    }
  }

  const final = [];
  for (const row in grouped) {
    final.push({
      time: Number(row),
      value: grouped[row].sum / grouped[row].count,
    });
  }

  return final;
}

function niceStep(range, target = 5) {
  if (range <= 0) return 1;
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * mag;
}

function drawGraph() {
  const left = 45;
  const right = 30;
  const top = 15;
  const bottom = 35;
  const w = canvas.width - left - right;
  const h = canvas.height - top - bottom;

  c.fillStyle = "#00072d";
  c.fillRect(0, 0, canvas.width, canvas.height);

  if (fData.length === 0) {
    c.fillStyle = "#00072d";
    c.font = "14px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("No data", canvas.width / 2, canvas.height / 2);
    return;
  }

  const values = fData.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = niceStep(max - min);
  const axisMin = Math.floor(min / step) * step;
  let axisMax = Math.ceil(max / step) * step;
  if (axisMax === axisMin) axisMax += step;

  const x = (i) =>
    left + (fData.length === 1 ? w / 2 : (i * w) / (fData.length - 1));
  const y = (v) => top + h - ((v - axisMin) / (axisMax - axisMin)) * h;

  // Horizontal gridlines and y-axis labels
  c.font = "12px sans-serif";
  c.textAlign = "right";
  c.textBaseline = "middle";
  const ticks = Math.round((axisMax - axisMin) / step);
  for (let i = 0; i <= ticks; i++) {
    const v = axisMin + i * step;
    c.strokeStyle = "#afc1d6";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(left, y(v));
    c.lineTo(left + w, y(v));
    c.stroke();
    c.fillStyle = "#e09f3e";
    c.fillText(String(Number(v.toFixed(6))), left - 6, y(v));
  }

  // X-axis labels, about 8 of them, formatted in UTC
  c.textAlign = "center";
  c.textBaseline = "top";
  const every = Math.ceil(fData.length / 8);
  for (let i = 0; i < fData.length; i += every) {
    const label = new Date(fData[i].time).toISOString().slice(0, 7);
    c.fillStyle = "#e09f3e";
    c.fillText(label, x(i), top + h + 8);
  }

  // Axis lines
  c.strokeStyle = "#e09f3e";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(left, top);
  c.lineTo(left, top + h);
  c.lineTo(left + w, top + h);
  c.stroke();

  // The data line
  c.strokeStyle = "#e09f3e";
  c.lineWidth = 2;
  c.beginPath();
  fData.forEach((p, i) => {
    if (i === 0) c.moveTo(x(i), y(p.value));
    else c.lineTo(x(i), y(p.value));
  });
  c.stroke();
}

function animate() {
  requestAnimationFrame(animate);
  drawGraph();
}

function refresh() {
  if (!startInput.value || !endInput.value) return;
  if (startInput.value > endInput.value) return;
  fData = getFilteredData(startInput.value, endInput.value);
}

document.querySelector(".date-input").addEventListener("change", refresh);

startInput.addEventListener("change", syncBounds);
endInput.addEventListener("change", syncBounds);

let allData = [];
let fData = [];
loadJSON().then((value) => {
  allData = value ? value : [];
  fData = getFilteredData(startInput.value, endInput.value);
});
syncBounds();
animate();
