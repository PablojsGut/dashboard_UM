//kpi.js
function updateKPIs() {
    const totalIniciativas = excelData.length;

    const kpisContainer = document.getElementById('kpisContainer');
    kpisContainer.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-label">Total de Iniciativas</div>
            <div class="kpi-value">${totalIniciativas}</div>
            <div class="kpi-unit"></div>
        </div>
    `;
}
