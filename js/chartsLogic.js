let chartIniciativas = null;
let chartSintesis = null;

/* ==============================
   CONTAR ESTADOS
================================ */
function contarEstados(data, columnName) {

    const conteo = {
        'En creación': 0,
        'Enviada': 0
    };

    data.forEach(row => {
        const estado = row[columnName];
        if (conteo.hasOwnProperty(estado)) {
            conteo[estado]++;
        }
    });

    return conteo;
}

/* ==============================
   CREAR / ACTUALIZAR GRÁFICO
================================ */
function renderPieChart(canvasId, conteo, titulo) {

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const total = conteo['En creación'] + conteo['Enviada'];

    const data = {
        labels: [
            `En creación (${conteo['En creación']} - ${total ? ((conteo['En creación'] / total) * 100).toFixed(1) : 0}%)`,
            `Enviada (${conteo['Enviada']} - ${total ? ((conteo['Enviada'] / total) * 100).toFixed(1) : 0}%)`
        ],
        datasets: [{
            data: [
                conteo['En creación'],
                conteo['Enviada']
            ],
            backgroundColor: [
                '#ffc107',
                '#198754'
            ]
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            },
            title: {
                display: false
            }
        }
    };

    return new Chart(ctx, {
        type: 'pie',
        data,
        options
    });
}

/* ==============================
   RENDER GENERAL
================================ */
function renderCharts(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    // destruir si existen
    if (chartIniciativas) chartIniciativas.destroy();
    if (chartSintesis) chartSintesis.destroy();

    // Iniciativas
    const estadosIni = contarEstados(
        fuente,
        'Estado (Iniciativas)'
    );

    chartIniciativas = renderPieChart(
        'chartEstadoIniciativas',
        estadosIni
    );

    // Síntesis
    const estadosSin = contarEstados(
        fuente,
        'Estado (Síntesis)'
    );

    chartSintesis = renderPieChart(
        'chartEstadoSintesis',
        estadosSin
    );
}
