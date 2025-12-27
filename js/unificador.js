// ==============================
// CONFIG
// ==============================
const FILA_COLUMNAS = 3;
const FILA_DATOS = 4;
const MIN_INPUTS = 2;

// ==============================
// ELEMENTOS
// ==============================
const toggleButtons = document.querySelectorAll('.btn-um-toggle');
const inputsContainer = document.getElementById('inputs-container');
const btnAgregarInput = document.getElementById('btnAgregarInput');
const btnDescargar = document.querySelector('.btn-um-download');

// ==============================
// EVENTOS
// ==============================

// Toggle tipo archivo
toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Agregar input
btnAgregarInput.addEventListener('click', agregarInput);

// Descargar
btnDescargar.addEventListener('click', unirYDescargar);

// Delegación eliminar
inputsContainer.addEventListener('click', (e) => {
    if (e.target.closest('.btn-icon-danger')) {
        e.target.closest('.file-input-row').remove();
        actualizarBasureros();
    }
});

// ==============================
// NORMALIZAR TEXTO
// ==============================
function normalizarTexto(texto) {
    return texto
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}

// ==============================
// FASE ACTUAL
// ==============================
function obtenerFaseActual() {
    const activo = document.querySelector('.btn-um-toggle.active');
    return activo.textContent.trim() === 'Iniciativas'
        ? columnasValidasFase1
        : columnasValidasFase2;
}

// ==============================
// INPUTS
// ==============================
function agregarInput() {
    const row = document.createElement('div');
    row.className = 'row align-items-center mb-3 file-input-row';

    row.innerHTML = `
        <div class="col-md-10">
            <input type="file" class="form-control excel-input" accept=".xls,.xlsx">
        </div>
        <div class="col-md-2 text-end">
            <button class="btn btn-icon-danger">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    inputsContainer.appendChild(row);
    actualizarBasureros();
}

function actualizarBasureros() {
    document.querySelectorAll('.file-input-row').forEach((row, index) => {
        const btn = row.querySelector('.btn-icon-danger');
        if (!btn) return;
        btn.style.display = index < MIN_INPUTS ? 'none' : 'inline-block';
    });
}

// ==============================
// UNIR Y DESCARGAR
// ==============================
async function unirYDescargar() {
    const inputs = document.querySelectorAll('.excel-input');
    const columnasEsperadas = obtenerFaseActual();
    const columnasNorm = columnasEsperadas.map(normalizarTexto);

    const registrosPorID = new Map();
    let encabezadosFinales = null;

    for (const input of inputs) {
        if (!input.files.length) continue;

        const data = await input.files[0].arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const encabezados = rows[FILA_COLUMNAS - 1];
        if (!encabezados) {
            mostrarError('Archivo sin encabezados en fila 3.');
            return;
        }

        const encabezadosNorm = encabezados.map(normalizarTexto);

        // Validación columnas
        for (let i = 0; i < columnasNorm.length; i++) {
            if (!encabezadosNorm.includes(columnasNorm[i])) {
                mostrarError('Uno de los archivos no coincide con el tipo seleccionado.');
                return;
            }
        }

        if (!encabezadosFinales) encabezadosFinales = encabezados;

        // Procesar filas
        for (let i = FILA_DATOS - 1; i < rows.length; i++) {
            const fila = rows[i];
            if (!fila || !fila[0]) continue;

            const id = fila[0].toString().trim();

            if (!registrosPorID.has(id)) {
                registrosPorID.set(id, fila);
            } else {
                const existente = registrosPorID.get(id);
                for (let c = 0; c < fila.length; c++) {
                    const nuevo = fila[c] ?? '';
                    const viejo = existente[c] ?? '';
                    if (nuevo.toString().length > viejo.toString().length) {
                        existente[c] = nuevo;
                    }
                }
            }
        }
    }

    if (registrosPorID.size === 0) {
        mostrarError('No hay datos para unir.');
        return;
    }

    // Crear Excel final
    const resultado = [
        encabezadosFinales,
        ...Array.from(registrosPorID.values())
    ];

    const ws = XLSX.utils.aoa_to_sheet(resultado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Unificado');

    XLSX.writeFile(wb, 'unificado.xlsx');
}

// ==============================
// MODAL ERROR
// ==============================
function mostrarError(msg) {
    document.getElementById('errorModalBody').innerHTML = msg;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

// ==============================
actualizarBasureros();
