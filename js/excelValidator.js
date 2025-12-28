const inputFase1 = document.getElementById("excelInputAmbasFase1");
const inputFase2 = document.getElementById("excelInputAmbasFase2");

inputFase1.addEventListener("change", () => {
    validarYLeer(inputFase1.files[0], columnasValidasFase1, 1);
});

inputFase2.addEventListener("change", () => {
    validarYLeer(inputFase2.files[0], columnasValidasFase2, 2);
});

function validarYLeer(file, columnasEsperadas, fase) {
    clearAlerts();
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const columnasExcel = (sheetData[2] || [])
            .map(c => String(c ?? '').trim())
            .filter(c => c.length > 0);

        const faltantes = columnasEsperadas.filter(c => !columnasExcel.includes(c));

        if (faltantes.length) {
            showAlert(
                `❌ El archivo cargado no corresponde a la Fase ${fase}.
                Verifica que estés usando el Excel correcto.`,
                'danger'
            );
            return;
        }

        showAlert(`✅ Fase ${fase} válida`, 'success');
        leerExcel(file, fase);
    };

    reader.readAsArrayBuffer(file);
}
