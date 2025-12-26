/* ==============================
   HELPERS KPI
================================ */
function toNumber(value) {
    if (value === null || value === undefined) return null;

    const cleaned = String(value)
        .replace('%', '')
        .replace(',', '.')
        .trim();

    if (cleaned === '') return null;

    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
}

/* ==============================
   KPIs (USA dfUnido)
================================ */
function updateKPIsAmbas(data = dfUnido) {

    const kpisContainer = document.getElementById('kpisContainer');
    if (!kpisContainer) return;

    const total = data.length;

    let sumaAv1 = 0, cntAv1 = 0;
    let sumaAv2 = 0, cntAv2 = 0;
    let sumaNota1 = 0, cntNota1 = 0;
    let sumaNota2 = 0, cntNota2 = 0;

    data.forEach(r => {
        const av1 = toNumber(r['% Avance (Iniciativas)']);
        const av2 = toNumber(r['% Avance (Síntesis)']);
        const n1 = toNumber(r['Nota final (Iniciativas)']);
        const n2 = toNumber(r['Nota final (Síntesis)']);

        if (Number.isFinite(av1)) { sumaAv1 += av1; cntAv1++; }
        if (Number.isFinite(av2)) { sumaAv2 += av2; cntAv2++; }
        if (Number.isFinite(n1)) { sumaNota1 += n1; cntNota1++; }
        if (Number.isFinite(n2)) { sumaNota2 += n2; cntNota2++; }
    });

    kpisContainer.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-label">Total Registros</div>
            <div class="kpi-value">${total}</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Tasa Avance Fase 1</div>
            <div class="kpi-value">${(cntAv1 ? sumaAv1 / cntAv1 : 0).toFixed(2)}%</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Tasa Avance Fase 2</div>
            <div class="kpi-value">${(cntAv2 ? sumaAv2 / cntAv2 : 0).toFixed(2)}%</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Prom. Nota Fase 1</div>
            <div class="kpi-value">${(cntNota1 ? sumaNota1 / cntNota1 : 0).toFixed(2)} pts</div>
        </div>

        <div class="kpi-card">
            <div class="kpi-label">Prom. Nota Fase 2</div>
            <div class="kpi-value">${(cntNota2 ? sumaNota2 / cntNota2 : 0).toFixed(2)} pts</div>
        </div>
    `;
}
