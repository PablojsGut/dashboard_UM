function exportExcelUnido() {

    if (!dfUnido || !dfUnido.length) {
        showAlert('⚠️ No hay datos unidos aún', 'warning');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(dfUnido);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Unificado');

    XLSX.writeFile(
        wb,
        `VcM_Unificado_${new Date().toISOString().slice(0,10)}.xlsx`
    );

    showAlert('✅ Excel descargado correctamente', 'success');
}
