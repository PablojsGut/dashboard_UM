// excelLogic.js

let excelData = [];
let faseSeleccionada = 'fase1';

/* ==============================
   CONTROL DE FASE
================================ */
function setFase(fase) {
    faseSeleccionada = fase;
}

/* ==============================
   INPUT ACTIVO SEGÚN FASE
================================ */
function getActiveExcelInput() {
    return document.getElementById(
        faseSeleccionada === 'fase1'
            ? 'excelInputFase1'
            : faseSeleccionada === 'fase2'
            ? 'excelInputFase2'
            : 'excelInputAmbas'
    );
}

/* ==============================
   RESET ESTADO EXCEL
================================ */
function resetExcelState() {
    excelData = [];
    const kpis = document.getElementById('kpisContainer');
    if (kpis) kpis.innerHTML = '';
}

/* ==============================
   NORMALIZACIÓN DE TEXTO
================================ */
function normalizeText(text) {
    return String(text)
        .replace(/\r?\n|\r/g, ' ')   // elimina saltos de línea
        .replace(/\s+/g, ' ')        // espacios múltiples
        .trim();
}

/* ==============================
   CARGA DE EXCEL
================================ */
function loadExcel(file) {
    resetExcelState();

    const reader = new FileReader();

    reader.onload = e => {
        const workbook = XLSX.read(
            new Uint8Array(e.target.result),
            { type: 'array' }
        );

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Encabezados en fila 3
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            range: 2,
            defval: ''
        });

        if (!rows.length) {
            showAlert('El archivo Excel está vacío.', 'warning');
            return;
        }

        /* ==============================
           ENCABEZADOS
        ================================ */
        const rawHeaders = rows[0];
        const headers = rawHeaders.map(normalizeText);

        /* ==============================
           VALIDACIÓN FASE 1
        ================================ */
        if (faseSeleccionada === 'fase1') {
            const expected = columnasValidasFase1.map(normalizeText);

            const faltantes = expected.filter(
                col => !headers.includes(col)
            );

            if (faltantes.length) {
                showAlert(
                    `❌ El Excel no cumple el formato requerido.<br>
                     <strong>Columnas faltantes:</strong>
                     <ul>${faltantes.map(c => `<li>${c}</li>`).join('')}</ul>`,
                    'warning'
                );
                return;
            }
        }

        /* ==============================
           DATOS
        ================================ */
        excelData = rows
            .slice(1)
            .filter(row => row.some(cell => cell !== ''));

        if (!excelData.length) {
            showAlert('El Excel no contiene registros válidos.', 'warning');
            return;
        }

        updateKPIs();
    };

    reader.readAsArrayBuffer(file);
}
