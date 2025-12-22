//filters.js
function applyFilters() {
    const input = getActiveExcelInput();

    if (!input || !input.files.length) {
        showAlert(
            'Debes seleccionar un archivo Excel antes de aplicar los filtros.',
            'warning'
        );
        return;
    }

    // Si aún no hay data cargada → cargar Excel
    if (!excelData.length) {
        loadExcel(input.files[0]);
        return;
    }

    /* ===== FILTRO SEDE ===== */
    const sedeSeleccionada = document.getElementById('filterSede').value;

    let dataFiltrada = [...excelData];

    if (sedeSeleccionada) {
        const idxSede = excelHeaders.findIndex(
            h => h.toLowerCase() === 'sede'
        );

        if (idxSede !== -1) {
            dataFiltrada = dataFiltrada.filter(
                row => String(row[idxSede]).trim() === sedeSeleccionada
            );
        }
    }

    updateKPIs(dataFiltrada);
}
