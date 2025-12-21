//filters.js
function applyFilters() {
    const input = getActiveExcelInput();

    if (!input || !input.files.length) {
        showAlert(
            '⚠️ Debes seleccionar un archivo Excel antes de aplicar filtros.',
            'warning'
        );
        return;
    }

    loadExcel(input.files[0]);
}
