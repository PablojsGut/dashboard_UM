// ==============================
// VARIABLES GLOBALES
// ==============================
let chartIniciativas = null;
let chartSintesis = null;
let chartAvanceFase = null;
let chartSedeIniciativas = null;

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
function crearLineChartPorAno(containerId, agrupado) {

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
            type: 'line', // 👈 CAMBIO CLAVE
            data: {
                labels: meses,
                datasets: [{
                    label: year,
                    data: valores,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.15)',
                    fill: true,
                    tension: 0.35, // suaviza la línea
                    pointRadius: 4,
                    pointHoverRadius: 6
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

    crearLineChartPorAno(
        'chartsIniciativasPorMes',
        agruparPorAnoMes(fuente, 'Fecha envío (Iniciativas)')
    );

    crearLineChartPorAno(
        'chartsSintesisPorMes',
        agruparPorAnoMes(fuente, 'Fecha envío (Síntesis)')
    );
}

function contarSedes(data) {

    const conteo = {
        'Santiago': 0,
        'Temuco': 0,
        'Santiago;Temuco': 0
    };

    data.forEach(row => {
        const sede = row['Sede (Iniciativas)'];

        if (conteo.hasOwnProperty(sede)) {
            conteo[sede]++;
        }
    });

    return conteo;
}

function renderChartSede(data = null) {

    const fuenteOriginal = data ?? window.dfUnido;
    if (!fuenteOriginal || fuenteOriginal.length === 0) return;

    const canvas = document.getElementById('chartSedeIniciativas');
    const wrapper = document.getElementById('chartSedeWrapper');

    if (!canvas || !wrapper) return;

    // ✅ Solo iniciativas ENVIADAS
    const fuente = fuenteOriginal.filter(row =>
        row['Estado (Iniciativas)'] === 'Enviada'
    );

    if (fuente.length === 0) return;

    if (
        window.chartSedeIniciativas &&
        typeof window.chartSedeIniciativas.destroy === 'function'
    ) {
        window.chartSedeIniciativas.destroy();
    }

    const conteo = contarSedes(fuente);

    window.chartSedeIniciativas = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Iniciativas enviadas',
                data: Object.values(conteo),
                backgroundColor: [
                    '#0d6efd',
                    '#198754',
                    '#6f42c1'
                ]
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
                        text: 'Cantidad de iniciativas'
                    }
                }
            }
        }
    });
}

function renderChartSedeSintesis(data = null) {

    const fuenteOriginal = data ?? window.dfUnido;
    if (!fuenteOriginal || fuenteOriginal.length === 0) return;

    const canvas = document.getElementById('chartSedeSintesis');
    const wrapper = document.getElementById('chartSedeSintesisWrapper');

    if (!canvas || !wrapper) return;

    // ✅ Solo SÍNTESIS ENVIADAS
    const fuente = fuenteOriginal.filter(row =>
        row['Estado (Síntesis)'] === 'Enviada'
    );

    if (fuente.length === 0) return;

    if (
        window.chartSedeSintesis &&
        typeof window.chartSedeSintesis.destroy === 'function'
    ) {
        window.chartSedeSintesis.destroy();
    }

    const conteo = contarSedes(fuente);

    window.chartSedeSintesis = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Síntesis enviadas',
                data: Object.values(conteo),
                backgroundColor: [
                    '#fd7e14',
                    '#20c997',
                    '#6610f2'
                ]
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
                        text: 'Cantidad de síntesis'
                    }
                }
            }
        }
    });
}

function contarSedesTotales(data) {

    const conteo = {
        'Santiago': 0,
        'Temuco': 0,
        'Santiago;Temuco': 0,
        'Sin información': 0
    };

    data.forEach(row => {
        const sede = row['Sede (Iniciativas)'];

        if (!sede || String(sede).trim() === '') {
            conteo['Sin información']++;
        } else if (conteo.hasOwnProperty(sede)) {
            conteo[sede]++;
        } else {
            conteo['Sin información']++;
        }
    });

    return conteo;
}

function renderChartSedeTotal(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    const canvas = document.getElementById('chartSedeTotal');
    if (!canvas) return;

    // Destruir gráfico previo
    if (
        window.chartSedeTotal &&
        typeof window.chartSedeTotal.destroy === 'function'
    ) {
        window.chartSedeTotal.destroy();
    }

    const conteo = contarSedesTotales(fuente);
    const total = Object.values(conteo).reduce((a, b) => a + b, 0);

    const labels = Object.keys(conteo).map(key => {
        const value = conteo[key];
        const pct = total ? ((value / total) * 100).toFixed(1) : 0;
        return `${key} (${value} - ${pct}%)`;
    });

    window.chartSedeTotal = new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: Object.values(conteo),
                backgroundColor: [
                    '#0d6efd', // Santiago
                    '#198754', // Temuco
                    '#6f42c1', // Santiago;Temuco
                    '#adb5bd'  // Sin info
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function contarDependencias(data) {
    const conteo = {};

    data.forEach(row => {
        const dep = row['Unidad o Dependencia Responsable (Iniciativas)'];

        if (!dep || dep.trim() === '') return;

        conteo[dep] = (conteo[dep] || 0) + 1;
    });

    return conteo;
}

function renderChartDependenciasIniciativas(data) {

    const fuente = data.filter(
        r => r['Estado (Iniciativas)'] === 'Enviada'
    );

    if (!fuente.length) return;

    const canvas = document.getElementById('chartDependenciasIniciativas');
    if (!canvas) return;

    if (
        window.chartDependenciasIniciativas &&
        typeof window.chartDependenciasIniciativas.destroy === 'function'
    ) {
        window.chartDependenciasIniciativas.destroy();
    }

    const conteo = contarDependencias(fuente);

    window.chartDependenciasIniciativas = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Iniciativas Enviadas',
                data: Object.values(conteo),
                backgroundColor: '#0d6efd'
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
                        text: 'Cantidad'
                    }
                }
            }
        }
    });
}

function renderChartDependenciasSintesis(data) {

    const fuente = data.filter(
        r => r['Estado (Síntesis)'] === 'Enviada'
    );

    if (!fuente.length) return;

    const canvas = document.getElementById('chartDependenciasSintesis');
    if (!canvas) return;

    if (
        window.chartDependenciasSintesis &&
        typeof window.chartDependenciasSintesis.destroy === 'function'
    ) {
        window.chartDependenciasSintesis.destroy();
    }

    const conteo = contarDependencias(fuente);

    window.chartDependenciasSintesis = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Síntesis Enviadas',
                data: Object.values(conteo),
                backgroundColor: '#198754'
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
                        text: 'Cantidad'
                    }
                }
            }
        }
    });
}

function contarDependencias(data) {

    const conteo = {};

    data.forEach(row => {
        let dep = row['Unidad o Dependencia Responsable (Iniciativas)'];

        if (!dep || String(dep).trim() === '') {
            dep = 'Sin información';
        }

        conteo[dep] = (conteo[dep] || 0) + 1;
    });

    return conteo;
}

function renderChartDependenciasTotal(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    const canvas = document.getElementById('chartDependenciasTotal');
    const wrapper = document.getElementById('chartDependenciasTotalWrapper');

    if (!canvas || !wrapper) return;

    // destruir gráfico previo
    if (
        window.chartDependenciasTotal &&
        typeof window.chartDependenciasTotal.destroy === 'function'
    ) {
        window.chartDependenciasTotal.destroy();
    }

    const conteo = contarDependencias(fuente);

    const labels = Object.keys(conteo);
    const values = Object.values(conteo);

    const total = values.reduce((a, b) => a + b, 0);

    window.chartDependenciasTotal = new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const value = ctx.raw;
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${ctx.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

function contarUnidadesAcademicas(data) {
    const conteo = {};
    data.forEach(row => {
        let unidad = row['Unidad Académica (Iniciativas)'];
        if (!unidad || String(unidad).trim() === '') unidad = 'Sin información';
        unidad = String(unidad).replace(/&nbsp;/g, ' ').trim();
        conteo[unidad] = (conteo[unidad] || 0) + 1;
    });
    return conteo;
}

function renderChartUnidadesIniciativas(data) {
    const fuente = data.filter(r => r['Estado (Iniciativas)'] === 'Enviada');
    if (!fuente.length) return;

    const canvas = document.getElementById('chartUnidadesIniciativas');
    if (!canvas) return;

    if (window.chartUnidadesIniciativas?.destroy) window.chartUnidadesIniciativas.destroy();

    const conteo = contarUnidadesAcademicas(fuente);

    window.chartUnidadesIniciativas = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Iniciativas Enviadas',
                data: Object.values(conteo),
                backgroundColor: '#0d6efd'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, title: { display: true, text: 'Cantidad' } } }
        }
    });
}

function renderChartUnidadesSintesis(data) {
    const fuente = data.filter(r => r['Estado (Síntesis)'] === 'Enviada');
    if (!fuente.length) return;

    const canvas = document.getElementById('chartUnidadesSintesis');
    if (!canvas) return;

    if (window.chartUnidadesSintesis?.destroy) window.chartUnidadesSintesis.destroy();

    const conteo = contarUnidadesAcademicas(fuente);

    window.chartUnidadesSintesis = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Síntesis Enviadas',
                data: Object.values(conteo),
                backgroundColor: '#198754'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, title: { display: true, text: 'Cantidad' } } }
        }
    });
}

function renderChartUnidadesTotal(data = null) {
    const fuente = data ?? window.dfUnido;
    if (!fuente?.length) return;

    const canvas = document.getElementById('chartUnidadesTotal');
    if (!canvas) return;

    if (window.chartUnidadesTotal?.destroy) window.chartUnidadesTotal.destroy();

    const conteo = contarUnidadesAcademicas(fuente);
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);

    window.chartUnidadesTotal = new Chart(canvas, {
        type: 'pie',
        data: { labels, datasets: [{ data: values }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const value = ctx.raw;
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${ctx.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}
