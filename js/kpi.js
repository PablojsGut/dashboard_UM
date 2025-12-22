/* ==============================
   HELPERS KPI
================================ */

/* Obtiene el índice de una columna por nombre */
function getColumnIndex(columnName) {
    return excelHeaders.findIndex(
        h => h.toLowerCase() === columnName.toLowerCase()
    );
}

/* Convierte valores numéricos seguros */
function toNumber(value) {
    if (value === null || value === undefined) return null;

    const n = Number(
        String(value)
            .replace('%', '')
            .replace(',', '.')
            .trim()
    );

    return isNaN(n) ? null : n;
}

/* ==============================
   KPIs
================================ */
function updateKPIs(data = excelData) {
    const kpisContainer = document.getElementById('kpisContainer');

    const total = data.length;

    const idxEstado = getColumnIndex('Estado');
    const idxAvance = getColumnIndex('% Avance');
    const idxNota = getColumnIndex('Nota final');

    let enviadas = 0;
    let enCreacion = 0;
    let sumaAvance = 0;
    let countAvance = 0;
    let sumaNota = 0;
    let countNota = 0;

    data.forEach(row => {
        if (idxEstado !== -1) {
            const estado = String(row[idxEstado]).toLowerCase();
            if (estado.includes('enviada')) enviadas++;
            if (estado.includes('creación') || estado.includes('creacion')) enCreacion++;
        }

        if (idxAvance !== -1) {
            const avance = toNumber(row[idxAvance]);
            if (avance !== null) {
                sumaAvance += avance;
                countAvance++;
            }
        }

        if (idxNota !== -1) {
            const nota = toNumber(row[idxNota]);
            if (nota !== null) {
                sumaNota += nota;
                countNota++;
            }
        }
    });

    const promedioAvance = countAvance
        ? (sumaAvance / countAvance).toFixed(2)
        : '0.00';

    const promedioNota = countNota
        ? (sumaNota / countNota).toFixed(2)
        : '0.00';

    kpisContainer.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-label">Total Iniciativas</div>
            <div class="kpi-value">${total}</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Enviadas</div>
            <div class="kpi-value">${enviadas}</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">En Creación</div>
            <div class="kpi-value">${enCreacion}</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Tasa de Avance</div>
            <div class="kpi-value">${promedioAvance}%</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Promedio Nota Final</div>
            <div class="kpi-value">${promedioNota} pts.</div>
        </div>
    `;
}
