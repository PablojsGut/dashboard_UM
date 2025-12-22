// excelLogic.js
/* ==============================
   NORMALIZAR TEXTO
================================ */
function normalizeText(text) {
    return String(text ?? '')
        .replace(/\r?\n|\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/* ==============================
   VARIABLES GLOBALES
================================ */
let excelData = [];
let excelHeaders = [];
let faseSeleccionada = 'fase1';

/* ==============================
   CONTROL DE FASE
================================ */
function setFase(fase) {
    faseSeleccionada = fase;
}

/* ==============================
   INPUT ACTIVO
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
   RESET ESTADO
================================ */
function resetExcelState() {
    excelData = [];
    excelHeaders = [];
    const kpis = document.getElementById('kpisContainer');
    if (kpis) kpis.innerHTML = '';
}

/* ==============================
   CARGA EXCEL
================================ */
function loadExcel(file) {
    resetExcelState();
    clearAlerts();

    const reader = new FileReader();

    reader.onload = e => {
        const workbook = XLSX.read(
            new Uint8Array(e.target.result),
            { type: 'array' }
        );

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // encabezados en fila 3
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            range: 2,
            defval: ''
        });

        if (!rows.length) {
            showAlert('El archivo Excel está vacío.', 'warning');
            return;
        }

        /* ===== ENCABEZADOS ===== */
        excelHeaders = rows[0].map(normalizeText);

        /* ===== VALIDACIÓN FASE 1 ===== */
        if (faseSeleccionada === 'fase1') {
            const expected = columnasValidasFase1.map(normalizeText);
            if (!validateColumns(excelHeaders, expected)) return;
        }

        /* ===== DATOS ===== */
        excelData = rows.slice(1).filter(row =>
            row.some(cell => String(cell).trim() !== '')
        );

        if (!excelData.length) {
            showAlert('El Excel no contiene registros válidos.', 'warning');
            return;
        }

        updateKPIs();
    };

    reader.readAsArrayBuffer(file);
}
