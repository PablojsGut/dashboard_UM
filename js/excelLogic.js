//excelLogic.js
let excelData = [];
let faseSeleccionada = 'fase1';

function setFase(fase) {
    faseSeleccionada = fase;
}

function getActiveExcelInput() {
    return document.getElementById(
        faseSeleccionada === 'fase1'
            ? 'excelInputFase1'
            : faseSeleccionada === 'fase2'
            ? 'excelInputFase2'
            : 'excelInputAmbas'
    );
}

function resetExcelState() {
    excelData = [];
    document.getElementById('kpisContainer').innerHTML = '';
}

function loadExcel(file) {
    resetExcelState();

    const reader = new FileReader();

    reader.onload = e => {
        const workbook = XLSX.read(
            new Uint8Array(e.target.result),
            { type: 'array' }
        );

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            range: 2,
            defval: ''
        });

        const headers = rows[0];

        if (faseSeleccionada === 'fase1') {
            if (!validateColumns(headers, columnasValidasFase1)) {
                showAlert(
                    '❌ El Excel no contiene las columnas requeridas para Fase 1.',
                    'warning'
                );
                return;
            }
        }

        excelData = rows.slice(1).filter(row =>
            row.some(cell => cell !== '')
        );

        updateKPIs();
    };

    reader.readAsArrayBuffer(file);
}