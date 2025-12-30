//buscadorLogic.js
const REGISTROS_POR_PAGINA = 15;
const PAGINAS_POR_BLOQUE = 15;

let paginaActualBuscador = 1;
let bloqueActual = 0;
let datosBuscador = [];
let datosBuscadorOriginal = [];

function destroyPopovers() {
    document
        .querySelectorAll('[data-bs-toggle="popover"]')
        .forEach(el => {
            const instance = bootstrap.Popover.getInstance(el);
            if (instance) instance.dispose();
        });
}

function renderEmail(email) {
    if (!email) return '';

    return `
        <a
            href="mailto:${email}"
            class="icon-link icon-link-hover text-decoration-none d-inline-flex align-items-center gap-1"
            title="Enviar correo"
            style="--bs-icon-link-transform: translate3d(0, -.125rem, 0);"
        >
            <span>${email}</span>
            <i class="bi bi-envelope-arrow-up"></i>
        </a>
    `;
}

function renderUnidadAcademica(valor) {
    if (!valor) return '';
    if (String(valor).trim() === 'Sin información') return '';
    return valor;
}

function renderEstado(estado, tipo, row) {
    if (!estado) return '';

    let contenidoPopover = '';
    let badgeClass = '';

    if (estado === 'En creación') {
        badgeClass = 'text-bg-danger';

        if (tipo === 'F1') {
            const avance = row['% Avance (Iniciativas)'];
            contenidoPopover = avance
                ? `Avance: ${avance}%`
                : 'Avance no informado';
        }

        if (tipo === 'F2') {
            const avance = row['% Avance (Síntesis)'];
            contenidoPopover = avance
                ? `Avance: ${avance}%`
                : 'Avance no informado';
        }
    }

    if (estado === 'Enviada') {
        badgeClass = 'text-bg-success';

        if (tipo === 'F1') {
            const fecha = row['Fecha envío (Iniciativas)'];
            contenidoPopover = fecha
                ? `Fecha envío: ${fecha}`
                : 'Fecha no informada';
        }

        if (tipo === 'F2') {
            const fecha = row['Fecha envío (Síntesis)'];
            contenidoPopover = fecha
                ? `Fecha envío: ${fecha}`
                : 'Fecha no informada';
        }
    }

    // Si no hay contenido especial → badge normal
    if (!contenidoPopover) {
        return `<span class="badge ${badgeClass}">${estado}</span>`;
    }

    return `
        <span
            class="badge ${badgeClass}"
            data-bs-toggle="popover"
            data-bs-trigger="hover focus"
            data-bs-placement="top"
            data-bs-content="${contenidoPopover}"
        >
            ${estado}
        </span>
    `;
}

function renderNota(valor) {
    const n = parseFloat(valor);
    return isNaN(n) ? '' : n.toFixed(2);
}

function initPopovers() {
    const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]')
    );

    popoverTriggerList.forEach(el => {
        new bootstrap.Popover(el);
    });
}

function mostrarPopoverCopiado(elemento, id) {

    // destruir popover previo si existe
    const existente = bootstrap.Popover.getInstance(elemento);
    if (existente) {
        existente.dispose();
    }

    const pop = new bootstrap.Popover(elemento, {
        content: `📋 Registro ID ${id} copiado`,
        placement: 'top',
        trigger: 'manual'
    });

    pop.show();

    // ocultar solo
    setTimeout(() => {
        pop.hide();
        pop.dispose();
    }, 1500);
}

function copiarRegistroCompleto(row) {

    if (!row || typeof row !== 'object') {
        console.error('Registro inválido para copiar');
        return;
    }

    const columnas = Object.keys(row);

    const encabezado = columnas.join(';');

    const valores = columnas.map(col => {
        const v = row[col];
        if (v === null || v === undefined) return '';
        return String(v).replace(/[\r\n]+/g, ' ').trim();
    }).join(';');

    const textoFinal = `${encabezado}\n${valores}`;

    // Clipboard API (requiere https o localhost)
    if (navigator.clipboard && window.isSecureContext) {

        navigator.clipboard.writeText(textoFinal)
            .then(() => {
                console.log(`Registro ID ${row.ID ?? '—'} copiado`);
            })
            .catch(err => {
                console.error('Error al copiar (clipboard):', err);
            });

    } else {
        // Fallback para http
        try {
            const textarea = document.createElement('textarea');
            textarea.value = textoFinal;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';

            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            console.log(`Registro ID ${row.ID ?? '—'} copiado (fallback)`);

        } catch (err) {
            console.error('Error al copiar (fallback):', err);
        }
    }
}

function renderTablaBuscador() {
    destroyPopovers();

    const tbody = document.getElementById('buscadorTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const inicio = (paginaActualBuscador - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;

    datosBuscador.slice(inicio, fin).forEach((row, index) => {

        const tr = document.createElement('tr');
        const numeroFila = inicio + index + 1;

        tr.innerHTML = `
            <td class="fw-bold text-warning">${numeroFila}</td>
            <td class="position-relative">
                <span
                    class="fw-semibold text-decoration-none id-link"
                    style="cursor:pointer"
                    data-id="${row.ID ?? ''}"
                    data-email="${row['Email (Iniciativas)'] ?? ''}">
                    ${row.ID || ''}
                </span>

                <i
                    class="bi bi-info-circle-fill position-absolute top-0 end-0 small id-info"
                    style="cursor:pointer"
                    data-id="${row.ID ?? ''}"
                    data-email="${row['Email (Iniciativas)'] ?? ''}">
                </i>
            </td>
            <td>${renderEmail(row['Email (Iniciativas)'])}</td>
            <td>${row['Nombre de la Iniciativa VcM (Iniciativas)'] || ''}</td>
            <td>${row['Unidad o Dependencia Responsable (Iniciativas)'] || ''}</td>
            <td>${renderUnidadAcademica(row['Unidad Académica (Iniciativas)'])}</td>
            <td>${renderEstado(row['Estado (Iniciativas)'], 'F1', row)}</td>
            <td>${renderEstado(row['Estado (Síntesis)'], 'F2', row)}</td>
            <td>${renderNota(row['Nota final (Iniciativas)'])}</td>
            <td>${renderNota(row['Nota final (Síntesis)'])}</td>
        `;

        tr.addEventListener('click', () => {
            // quitar selección previa
            document
                .querySelectorAll('#buscadorTableBody tr')
                .forEach(fila => fila.classList.remove('row-selected'));

            // seleccionar fila actual
            tr.classList.add('row-selected');

            // copiar registro completo
            copiarRegistroCompleto(row);

            // mostrar popover en la celda N°
            const celdaNumero = tr.querySelector('td');
            mostrarPopoverCopiado(celdaNumero, row.ID ?? '—');
        });

        tbody.appendChild(tr);
        const abrirModalHandler = (e) => {
            e.stopPropagation();
            abrirModalDetalle(row);
        };


        tr.querySelector('.id-link')
        .addEventListener('click', abrirModalHandler);

        tr.querySelector('.id-info')
        .addEventListener('click', abrirModalHandler);

    });
    initPopovers();
}


function renderPaginacionBuscador() {

    const pag = document.getElementById('buscadorPagination');
    if (!pag) return;

    pag.innerHTML = '';

    const totalPaginas = Math.ceil(
        datosBuscador.length / REGISTROS_POR_PAGINA
    );

    const inicioBloque = bloqueActual * PAGINAS_POR_BLOQUE + 1;
    const finBloque = Math.min(
        inicioBloque + PAGINAS_POR_BLOQUE - 1,
        totalPaginas
    );

    /* ««  BLOQUE ANTERIOR */
    if (bloqueActual > 0) {
        pag.appendChild(crearBoton('«', () => {
            bloqueActual--;
            paginaActualBuscador = bloqueActual * PAGINAS_POR_BLOQUE + 1;
            renderPaginacionBuscador();
            renderTablaBuscador();
        }));
    }

    /* «  */
    if (inicioBloque > 1) {
        pag.appendChild(crearBoton('‹', () => {
            bloqueActual--;
            renderPaginacionBuscador();
        }));
    }

    /* NÚMEROS */
    for (let i = inicioBloque; i <= finBloque; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActualBuscador ? 'active' : ''}`;

        const btn = document.createElement('button');
        btn.className = 'page-link';
        btn.textContent = i;

        btn.onclick = () => {
            paginaActualBuscador = i;
            renderTablaBuscador();
            renderPaginacionBuscador();
        };

        li.appendChild(btn);
        pag.appendChild(li);
    }

    /* › */
    if (finBloque < totalPaginas) {
        pag.appendChild(crearBoton('›', () => {
            bloqueActual++;
            renderPaginacionBuscador();
        }));
    }

    /* »» BLOQUE SIGUIENTE */
    if (finBloque < totalPaginas) {
        pag.appendChild(crearBoton('»', () => {
            bloqueActual++;
            paginaActualBuscador = bloqueActual * PAGINAS_POR_BLOQUE + 1;
            renderPaginacionBuscador();
            renderTablaBuscador();
        }));
    }
}

function crearBoton(texto, onClick) {
    const li = document.createElement('li');
    li.className = 'page-item';

    const btn = document.createElement('button');
    btn.className = 'page-link';
    btn.innerHTML = texto;
    btn.onclick = onClick;

    li.appendChild(btn);
    return li;
}

function filtrarBuscador(texto) {
    const q = texto.trim().toLowerCase();

    if (!q) {
        datosBuscador = [...datosBuscadorOriginal];
    } else {
        datosBuscador = datosBuscadorOriginal.filter(row => {

            const id = String(row.ID ?? '').toLowerCase();
            const email = String(row['Email (Iniciativas)'] ?? '').toLowerCase();
            const nombre = String(
                row['Nombre de la Iniciativa VcM (Iniciativas)'] ?? ''
            ).toLowerCase();

            return (
                id.includes(q) ||
                email.includes(q) ||
                nombre.includes(q)
            );
        });
    }

    paginaActualBuscador = 1;
    bloqueActual = 0;

    renderTablaBuscador();
    renderPaginacionBuscador();
}

function initBuscador(df) {
    datosBuscadorOriginal = df || [];
    datosBuscador = [...datosBuscadorOriginal];

    paginaActualBuscador = 1;
    bloqueActual = 0;

    renderTablaBuscador();
    renderPaginacionBuscador();
}

function formatearMonedaCLP(valor) {
    const n = Number(valor);
    if (isNaN(n)) return '—';

    return n.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });
}

function renderCumple(valor) {
    if (String(valor).trim().toLowerCase() === 'sí') {
        return '<span class="badge bg-success">Cumple</span>';
    }
    return '<span class="badge bg-danger">No cumple</span>';
}

function abrirModalDetalle(row) {

    if (!row || typeof row !== 'object') return;

    const nombreCompleto = [
        row['Nombre (Iniciativas)'],
        row['Primer apellido (Iniciativas)'],
        row['Segundo apellido (Iniciativas)']
    ].filter(Boolean).join(' ');

    const sedeOrdenada = String(
        row['Sede (Iniciativas)'] ?? ''
    )
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'es'));

    const antiguedad = String(
        row['Antigüedad de la Iniciativa VcM (Iniciativas)'] ?? ''
    ).split(';').join(', ');

    const tipoAcceso = String(
        row['Tipo de Acceso a la Iniciativa (Iniciativas)'] ?? ''
    ).split(':')[0];

    const acceso = String(
        row['Acceso a la Iniciativa (Iniciativas)'] ?? ''
    ).split(':')[0];

    document.getElementById('modalDetalleIDHeader').textContent =
        row.ID ?? '—';

    document.getElementById('modalDetalleNombreHeader').textContent =
        row['Nombre de la Iniciativa VcM (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleEmail').textContent =
        row['Email (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleSede').textContent =
        sedeOrdenada.length ? sedeOrdenada.join(', ') : '—';

    document.getElementById('modalDetalleNombre').textContent =
        nombreCompleto || '—';

    document.getElementById('modalDetalleModalidad').textContent =
        row['Modalidad de Implementación de la Iniciativa  (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleFechaInicio').textContent =
        row['Fecha de Inicio de la Iniciativa (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleFechaTermino').textContent =
        row['Fecha de Término de la Iniciativa (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleDescripcion').textContent =
        row['Descripción y Acciones de la Iniciativa (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleMonto').textContent =
        formatearMonedaCLP(
            row['Monto de Financiamiento VcM Requerido (Iniciativas)']
        );

    document.getElementById('modalDetalleAntiguedad').textContent =
        antiguedad || '—';

    document.getElementById('modalDetalleCodigoVCM').textContent =
        row['En caso afirmativo, indique el Código VcM asignado (Iniciativas)'] ?? '—';

    document.getElementById('modalDetalleTipoAcceso').textContent =
        tipoAcceso || '—';

    document.getElementById('modalDetalleAcceso').textContent =
        acceso || '—';

    document.getElementById('mecanismoVA').innerHTML =
        renderCumple(
            row['¿La iniciativa está orientada a formación académica? (Vinculación Académica - VA) (Iniciativas)']
        );

    document.getElementById('mecanismoAIC').innerHTML =
        renderCumple(
            row['¿La iniciativa implica la difusión y/o intercambio de conocimiento? (Articulación e Intercambio de Conocimiento - AIC) (Iniciativas)']
        );

    document.getElementById('mecanismoVAC').innerHTML =
        renderCumple(
            row['¿La iniciativa es una actividad cultural o artística? (Vinculación Artístico-Cultural - VAC) (Iniciativas)']
        );

    document.getElementById('mecanismoIPEE').innerHTML =
        renderCumple(
            row['¿La iniciativa incluye investigación básica, aplicada o emprendimiento? (Investigación, Proyectos de Emprendimiento y Estudios - IPEE) (Iniciativas)']
        );

    document.getElementById('mecanismoINT').innerHTML =
        renderCumple(
            row['¿La iniciativa implica alianzas internacionales? (Internacionalización - INT) (Iniciativas)']
        );

    document.getElementById('mecanismoGTER').innerHTML =
        renderCumple(
            row['¿La iniciativa está orientada a graduados/titulados y/o empleadores? (Graduados/Titulados, Empleabilidad y Redes - GTER) (Iniciativas)']
        );

    const modal = new bootstrap.Modal(
        document.getElementById('modalDetalle')
    );

    modal.show();
}

document.addEventListener('input', e => {
    if (e.target.id === 'buscadorInput') {
        filtrarBuscador(e.target.value);
    }
});

