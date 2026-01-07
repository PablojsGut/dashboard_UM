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
function renderDoughnutChart(canvasId, conteo) {

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Destruir gráfico previo si existe
    if (canvas._chart instanceof Chart) {
        canvas._chart.destroy();
    }

    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);

    canvas._chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#ffc107', // En creación
                    '#198754'  // Enviada
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {

                // Leyenda limpia a la derecha
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: {
                            size: 12
                        }
                    }
                },

                // Tooltip con detalle
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            const value = ctx.raw || 0;
                            const percent = total
                                ? ((value / total) * 100).toFixed(1)
                                : 0;
                            return `${ctx.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });

    return canvas._chart;
}


/* ==============================
   RENDER GENERAL (TORTAS)
================================ */
function renderCharts(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!Array.isArray(fuente) || fuente.length === 0) return;

    chartIniciativas = renderDoughnutChart(
        'chartEstadoIniciativas',
        contarEstados(fuente, 'Estado (Iniciativas)')
    );

    chartSintesis = renderDoughnutChart(
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

    // Esperado: DD/MM/YYYY HH:mm
    const partes = String(fecha).split(' ');
    if (partes.length === 0) return null;

    const fechaParte = partes[0]; // DD/MM/YYYY
    const [dd, mm, yyyy] = fechaParte.split('/').map(Number);

    if (!dd || !mm || !yyyy) return null;

    // Mes en JS es 0-based
    return new Date(yyyy, mm - 1, dd);
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
function crearLineChartMultiAno(canvasId, agrupado) {

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // destruir gráfico previo
    if (canvas._chart) {
        canvas._chart.destroy();
    }

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    const colores = [
        '#0d6efd', '#198754', '#dc3545', '#fd7e14',
        '#6f42c1', '#20c997'
    ];

    const datasets = Object.entries(agrupado).map(([year, valores], i) => ({
        label: year,
        data: valores,
        borderColor: colores[i % colores.length],
        backgroundColor: colores[i % colores.length] + '33',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6
    }));

    canvas._chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: meses,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
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
}


/* ==============================
   RENDER GRÁFICOS POR MES
================================ */
function renderChartsPorMes(data = null) {

    const fuente = data ?? window.dfUnido;
    if (!fuente || fuente.length === 0) return;

    crearLineChartMultiAno(
        'chartsIniciativasPorMes',
        agruparPorAnoMes(fuente, 'Fecha envío (Iniciativas)')
    );

    crearLineChartMultiAno(
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
    if (!Array.isArray(fuente) || fuente.length === 0) return;

    const canvas = document.getElementById('chartSedeTotal');
    if (!canvas) return;

    // Destruir gráfico previo
    if (window.chartSedeTotal instanceof Chart) {
        window.chartSedeTotal.destroy();
        window.chartSedeTotal = null;
    }

    // Validar función de conteo
    if (typeof contarSedesTotales !== 'function') {
        console.error('❌ contarSedesTotales no está definida');
        return;
    }

    const conteo = contarSedesTotales(fuente);

    const labels = Object.keys(conteo);
    const values = Object.values(conteo);

    if (labels.length === 0) return;

    const total = values.reduce((a, b) => a + b, 0);

    // Colores base (se reciclan si hay más categorías)
    const baseColors = [
        '#0d6efd', // Santiago
        '#198754', // Temuco
        '#6f42c1', // Santiago;Temuco
        '#adb5bd'  // Sin info
    ];

    const colors = labels.map((_, i) => baseColors[i % baseColors.length]);

    window.chartSedeTotal = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {

                // Leyenda limpia
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: {
                            size: 12
                        }
                    }
                },

                // Tooltip con valores
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            const value = Number(ctx.raw) || 0;
                            const percent = total
                                ? ((value / total) * 100).toFixed(1)
                                : '0.0';
                            return `${ctx.label}: ${value} (${percent}%)`;
                        }
                    }
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
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
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
