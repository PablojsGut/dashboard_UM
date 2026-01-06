const columnasVCM = [
    {
        key: '¿La iniciativa está orientada a formación académica? (Vinculación Académica - VA) (Iniciativas)',
        label: 'VA'
    },
    {
        key: '¿La iniciativa implica la difusión y/o intercambio de conocimiento? (Articulación e Intercambio de Conocimiento - AIC) (Iniciativas)',
        label: 'AIC'
    },
    {
        key: '¿La iniciativa es una actividad cultural o artística? (Vinculación Artístico-Cultural - VAC) (Iniciativas)',
        label: 'VAC'
    },
    {
        key: '¿La iniciativa incluye investigación básica, aplicada o emprendimiento? (Investigación, Proyectos de Emprendimiento y Estudios - IPEE) (Iniciativas)',
        label: 'IPEE'
    },
    {
        key: '¿La iniciativa implica alianzas internacionales? (Internacionalización - INT) (Iniciativas)',
        label: 'INT'
    },
    {
        key: '¿La iniciativa está orientada a graduados/titulados y/o empleadores? (Graduados/Titulados, Empleabilidad y Redes - GTER) (Iniciativas)',
        label: 'GTER'
    }
];

function contarSiPorColumna(data) {
    const conteo = {};

    columnasVCM.forEach(col => conteo[col.label] = 0);

    data.forEach(row => {
        columnasVCM.forEach(col => {
            const valor = String(row[col.key] || '').trim().toLowerCase();
            if (valor === 'sí' || valor === 'si') {
                conteo[col.label]++;
            }
        });
    });

    return conteo;
}

function renderChartVCMIniciativas(data) {
    const fuente = data.filter(
        r => r['Estado (Iniciativas)'] === 'Enviada'
    );
    if (!fuente.length) return;

    const canvas = document.getElementById('chartVCMIniciativas');
    if (!canvas) return;

    if (window.chartVCMIniciativas?.destroy) {
        window.chartVCMIniciativas.destroy();
    }

    const conteo = contarSiPorColumna(fuente);

    window.chartVCMIniciativas = new Chart(canvas, {
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderChartVCMSintesis(data) {
    const fuente = data.filter(
        r => r['Estado (Síntesis)'] === 'Enviada'
    );
    if (!fuente.length) return;

    const canvas = document.getElementById('chartVCMSintesis');
    if (!canvas) return;

    if (window.chartVCMSintesis?.destroy) {
        window.chartVCMSintesis.destroy();
    }

    const conteo = contarSiPorColumna(fuente);

    window.chartVCMSintesis = new Chart(canvas, {
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function extraerMecanismoVCM(valor) {
    if (!valor) return 'Sin información';
    return String(valor).split(':')[0].trim();
}

function contarMecanismos(data) {
    const conteo = {};

    data.forEach(row => {
        const raw = row['Mecanismo VcM sugerido (Iniciativas)'];
        const mecanismo = extraerMecanismoVCM(raw);

        conteo[mecanismo] = (conteo[mecanismo] || 0) + 1;
    });

    return conteo;
}

function renderChartMecanismoIniciativas(data) {
    const fuente = data.filter(
        r => r['Estado (Iniciativas)'] === 'Enviada'
    );
    if (!fuente.length) return;

    const canvas = document.getElementById('chartMecanismoIniciativas');
    if (!canvas) return;

    if (window.chartMecanismoIniciativas?.destroy) {
        window.chartMecanismoIniciativas.destroy();
    }

    const conteo = contarMecanismos(fuente);
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);

    window.chartMecanismoIniciativas = new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{ data: values }]
        },
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

function renderChartMecanismoSintesis(data) {
    const fuente = data.filter(
        r => r['Estado (Síntesis)'] === 'Enviada'
    );
    if (!fuente.length) return;

    const canvas = document.getElementById('chartMecanismoSintesis');
    if (!canvas) return;

    if (window.chartMecanismoSintesis?.destroy) {
        window.chartMecanismoSintesis.destroy();
    }

    const conteo = contarMecanismos(fuente);
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);

    window.chartMecanismoSintesis = new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{ data: values }]
        },
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
