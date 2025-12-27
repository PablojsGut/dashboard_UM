// ==============================
// VARIABLES GLOBALES
// ==============================
let chartIniciativas = null;
let chartSintesis = null;
let chartAvanceFase = null;

let chartsIniciativasMes = [];
let chartsSintesisMes = [];

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
   PIE CHART (SIN TÍTULO)
================================ */
function renderPieChart(canvasId, conteo) {

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const total = conteo['En creación'] + conteo['Enviada'];

    return new Chart(ctx, {
        type: 'pie',
        data: {
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

/* ==============================
   RENDER GENERAL (TORTAS)
================================ */
function renderCharts(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    if (chartIniciativas) chartIniciativas.destroy();
    if (chartSintesis) chartSintesis.destroy();

    chartIniciativas = renderPieChart(
        'chartEstadoIniciativas',
        contarEstados(fuente, 'Estado (Iniciativas)')
    );

    chartSintesis = renderPieChart(
        'chartEstadoSintesis',
        contarEstados(fuente, 'Estado (Síntesis)')
    );
}

/* ==============================
   AVANCE FASE 1 → FASE 2
================================ */
function calcularAvanceFase(data) {

    let avanza = 0;
    let noAvanza = 0;

    data.forEach(row => {

        const columnasSintesis = Object.keys(row)
            .filter(k => k.endsWith('(Síntesis)'));

        const tieneSintesis = columnasSintesis.some(
            col => row[col] !== null && row[col] !== ''
        );

        tieneSintesis ? avanza++ : noAvanza++;
    });

    return { avanza, noAvanza };
}

/* ==============================
   BAR CHART AVANCE FASE (SIN TÍTULO)
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
                data: [avanza, noAvanza],
                backgroundColor: ['#0d6efd', '#dc3545']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de registros'
                    }
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

/* ==============================
   FECHAS Y AGRUPACIONES
================================ */
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
        const month = fecha.getMonth();

        if (!resultado[year]) {
            resultado[year] = Array(12).fill(0);
        }

        resultado[year][month]++;
    });

    return resultado;
}

/* ==============================
   BARRAS POR AÑO (SIN TÍTULO)
================================ */
function crearBarChartPorAno(containerId, agrupado) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const meses = [
        'Ene','Feb','Mar','Abr','May','Jun',
        'Jul','Ago','Sep','Oct','Nov','Dic'
    ];

    Object.entries(agrupado).forEach(([year, valores]) => {

        const wrapper = document.createElement('div');
        wrapper.style.height = '300px';
        wrapper.style.marginBottom = '24px';

        const canvas = document.createElement('canvas');
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: [{
                    data: valores,
                    backgroundColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
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
    });
}

/* ==============================
   RENDER GRÁFICOS POR MES
================================ */
function renderChartsPorMes(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    crearBarChartPorAno(
        'chartsIniciativasPorMes',
        agruparPorAnoMes(fuente, 'Fecha envío (Iniciativas)')
    );

    crearBarChartPorAno(
        'chartsSintesisPorMes',
        agruparPorAnoMes(fuente, 'Fecha envío (Síntesis)')
    );
}
