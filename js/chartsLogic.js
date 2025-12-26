//chartLogic.js
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
            backgroundColor: ['#ffc107', '#198754']
        }]
    };

    return new Chart(ctx, {
        type: 'pie',
        data,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: {
                    display: true,
                    text: titulo
                }
            }
        }
    });
}


/* ==============================
   RENDER GENERAL
================================ */
function renderCharts(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    if (chartIniciativas) chartIniciativas.destroy();
    if (chartSintesis) chartSintesis.destroy();

    chartIniciativas = renderPieChart(
        'chartEstadoIniciativas',
        contarEstados(fuente, 'Estado (Iniciativas)'),
        'Estado Iniciativas'
    );

    chartSintesis = renderPieChart(
        'chartEstadoSintesis',
        contarEstados(fuente, 'Estado (Síntesis)'),
        'Estado Síntesis'
    );
}


let chartAvanceFase = null;

/* ==============================
   AVANCE FASE 1 → FASE 2
================================ */
function calcularAvanceFase(data) {

    let avanza = 0;
    let noAvanza = 0;

    data.forEach(row => {

        // columnas de síntesis
        const columnasSintesis = Object.keys(row)
            .filter(k => k.endsWith('(Síntesis)'));

        const tieneSintesis = columnasSintesis.some(
            col => row[col] !== null && row[col] !== ''
        );

        if (tieneSintesis) {
            avanza++;
        } else {
            noAvanza++;
        }
    });

    return { avanza, noAvanza };
}

/* ==============================
   RENDER BAR CHART
================================ */
function renderAvanceFaseChart(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    const ctx = document.getElementById('chartAvanceFase');
    if (!ctx) return;

    if (chartAvanceFase) chartAvanceFase.destroy();

    const { avanza, noAvanza } = calcularAvanceFase(fuente);

    chartAvanceFase = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Avanza', 'No avanza'],
            datasets: [{
                label: 'Cantidad de registros',
                data: [avanza, noAvanza],
                backgroundColor: ['#0d6efd', '#dc3545']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Avance de Fase 1 → Fase 2'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Cantidad de registros'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Avance'
                    }
                }
            }
        }
    });
}

let chartsIniciativasMes = [];
let chartsSintesisMes = [];

function parseFecha(fecha) {
    if (!fecha) return null;
    const d = new Date(fecha);
    return isNaN(d) ? null : d;
}

function agruparPorAnoMes(data, columnaFecha) {

    const resultado = {};

    data.forEach(row => {
        const fecha = parseFecha(row[columnaFecha]);
        if (!fecha) return;

        const year = fecha.getFullYear();
        const month = fecha.getMonth(); // 0-11

        if (!resultado[year]) {
            resultado[year] = Array(12).fill(0);
        }

        resultado[year][month]++;
    });

    return resultado;
}

function crearBarChartPorAno(containerId, agrupado, tituloBase) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const meses = [
        'Ene','Feb','Mar','Abr','May','Jun',
        'Jul','Ago','Sep','Oct','Nov','Dic'
    ];

    Object.entries(agrupado).forEach(([year, valores]) => {

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: [{
                    label: `${tituloBase} ${year}`,
                    data: valores
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: `${tituloBase} ${year}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                }
            }
        });

        canvas.parentElement.style.height = '300px';
        canvas.parentElement.style.marginBottom = '24px';
    });
}

function renderChartsPorMes(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    // =========================
    // INICIATIVAS
    // =========================
    const iniciativasAgrupadas = agruparPorAnoMes(
        fuente,
        'Fecha envío (Iniciativas)'
    );

    crearBarChartPorAno(
        'chartsIniciativasPorMes',
        iniciativasAgrupadas,
        'Iniciativas'
    );

    // =========================
    // SÍNTESIS
    // =========================
    const sintesisAgrupadas = agruparPorAnoMes(
        fuente,
        'Fecha envío (Síntesis)'
    );

    crearBarChartPorAno(
        'chartsSintesisPorMes',
        sintesisAgrupadas,
        'Síntesis'
    );
}
