//filtersLogic.js
function extraerMecanismo(valor) {
    if (!valor) return '';
    return String(valor).split(':')[0].trim();
}

function applyFilters() {

    if (!window.dfUnido || dfUnido.length === 0) {
        showAlert('❌ No hay datos para filtrar', 'danger');
        return;
    }

    const sede =
        document.getElementById('filterSede')?.value || '';
    const dependencia =
        document.getElementById('filterDependencia')?.value || '';
    const subdependencia =
        document.getElementById('filterUnidad')?.value || '';
    const mecanismo =
        document.getElementById('filterMecanismo')?.value || '';

    const subNorm = normalizeText(subdependencia);

    const dfFiltrado = dfUnido.filter(row => {

        // ======================
        // FILTRO SEDE
        // ======================
        if (sede) {
            if (
                String(row['Sede (Iniciativas)'] || '') !== sede
            ) return false;
        }

        // ======================
        // FILTRO DEPENDENCIA
        // ======================
        if (dependencia) {
            if (
                String(
                    row['Unidad o Dependencia Responsable (Iniciativas)'] || ''
                ) !== dependencia
            ) return false;
        }

        // ======================
        // FILTRO UNIDAD ACADÉMICA (FIX DEFINITIVO)
        // ======================
        if (subdependencia) {

            const unidad = String(
                row['Unidad Académica (Iniciativas)'] || ''
            ).replace(/&nbsp;/g, ' ').trim();

            if (!unidad) return false;

            const unidadNorm = normalizeText(unidad);

            if (unidadNorm !== subNorm) return false;
        }

        if (mecanismo) {
            const raw =
                row['Mecanismo VcM sugerido (Iniciativas)'];
            const mecRow = extraerMecanismo(raw);

            if (mecRow !== mecanismo) return false;
        }

        return true;
    });

    // ======================
    // ACTUALIZAR UI GENERAL
    // ======================
    updateKPIsAmbas(dfFiltrado);
    renderAvanceFaseChart(dfFiltrado);
    renderCharts(dfFiltrado);
    renderChartsPorMes(dfFiltrado);

    // ======================
    // GRÁFICOS POR SEDE
    // ======================
    const chartSedeWrapper =
        document.getElementById('chartSedeWrapper');
    const chartSedeSintesisWrapper =
        document.getElementById('chartSedeSintesisWrapper');
    const chartSedeTotalWrapper =
        document.getElementById('chartSedeTotalWrapper');

    if (!sede) {
        chartSedeWrapper?.classList.remove('d-none');
        chartSedeSintesisWrapper?.classList.remove('d-none');
        chartSedeTotalWrapper?.classList.remove('d-none');

        renderChartSede(dfFiltrado);
        renderChartSedeSintesis(dfFiltrado);
        renderChartSedeTotal(dfFiltrado);
    } else {
        chartSedeWrapper?.classList.add('d-none');
        chartSedeSintesisWrapper?.classList.add('d-none');
        chartSedeTotalWrapper?.classList.add('d-none');
    }

    // ======================
    // GRÁFICOS POR DEPENDENCIA
    // ======================
    const chartDependenciasTotalWrapper =
        document.getElementById('chartDependenciasTotalWrapper');
    const depIniWrapper =
        document.getElementById('chartDependenciasIniciativasWrapper');
    const depSinWrapper =
        document.getElementById('chartDependenciasSintesisWrapper');

    if (!dependencia) {
        chartDependenciasTotalWrapper?.classList.remove('d-none');
        depIniWrapper?.classList.remove('d-none');
        depSinWrapper?.classList.remove('d-none');

        renderChartDependenciasTotal(dfFiltrado);
        renderChartDependenciasIniciativas(dfFiltrado);
        renderChartDependenciasSintesis(dfFiltrado);
    } else {
        chartDependenciasTotalWrapper?.classList.add('d-none');
        depIniWrapper?.classList.add('d-none');
        depSinWrapper?.classList.add('d-none');
    }

    document.getElementById('chartsSection')
        ?.classList.remove('d-none');
    document.getElementById('tabsSection')
        ?.classList.remove('d-none');

    initBuscador(dfFiltrado);
    renderChartVCMIniciativas(dfFiltrado);
    renderChartVCMSintesis(dfFiltrado);
    renderChartMecanismoIniciativas(dfFiltrado);
    renderChartMecanismoSintesis(dfFiltrado);
}


/* ==============================
   CARGA DE FILTROS
================================ */

document.addEventListener('DOMContentLoaded', () => {

    const cboDependencia = document.getElementById('filterDependencia');
    const cboUnidad = document.getElementById('filterUnidad');
    const cboMecanismo = document.getElementById('filterMecanismo');

    if (!cboDependencia || !cboUnidad) return;

    /* ==============================
       CARGAR DEPENDENCIAS
    ================================ */
    function cargarDependencias() {

        const dependencias = getDependencias();

        cboDependencia.innerHTML =
            '<option value="">Todas las dependencias</option>';

        dependencias.forEach(dep => {
            const opt = document.createElement('option');
            opt.value = dep;
            opt.textContent = dep;
            cboDependencia.appendChild(opt);
        });

        // reset subdependencias
        cboUnidad.innerHTML =
            '<option value="">Todas las unidades</option>';
    }

    /* ==============================
       CARGAR SUBDEPENDENCIAS
    ================================ */
    function cargarSubdependencias(dependencia) {

        cboUnidad.innerHTML =
            '<option value="">Todas las unidades</option>';

        if (!dependencia) return;

        const subs = getSubdependencias(dependencia);

        subs.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            cboUnidad.appendChild(opt);
        });
    }

    function cargarMecanismos() {

        if (!window.dfUnido || !cboMecanismo) return;

        const set = new Set();

        dfUnido.forEach(row => {
            const raw =
                row['Mecanismo VcM sugerido (Iniciativas)'];
            const mec = extraerMecanismo(raw);
            if (mec) set.add(mec);
        });

        cboMecanismo.innerHTML =
            '<option value="">Todos los mecanismos</option>';

        [...set].sort().forEach(mec => {
            const opt = document.createElement('option');
            opt.value = mec;
            opt.textContent = mec;
            cboMecanismo.appendChild(opt);
        });
    }

    /* ==============================
       EVENTOS
    ================================ */
    cboDependencia.addEventListener('change', e => {
        cargarSubdependencias(e.target.value);
    });

    /* ==============================
       EXPONER PARA USO EXTERNO
       (cuando cargan los excels)
    ================================ */
    window.initFiltrosDependencias = function () {
        cargarDependencias();
        cargarMecanismos();
    };
});

function clearFilters() {

    // ======================
    // RESET SELECTS
    // ======================
    const filterSede = document.getElementById('filterSede');
    const filterDependencia = document.getElementById('filterDependencia');
    const filterUnidad = document.getElementById('filterUnidad');
    const filterMecanismo = document.getElementById('filterMecanismo');

    if (filterSede) filterSede.value = '';
    if (filterDependencia) filterDependencia.value = '';
    if (filterMecanismo) filterMecanismo.value = '';

    if (filterUnidad) {
        filterUnidad.innerHTML =
            '<option value="">Todas las unidades</option>';
    }

    // ======================
    // OCULTAR SECCIONES
    // ======================
    document.getElementById('chartsSection')
        ?.classList.add('d-none');

    document.getElementById('tabsSection')
        ?.classList.add('d-none');

    // ======================
    // LIMPIAR KPIs
    // ======================
    const kpisContainer = document.getElementById('kpisContainer');
    if (kpisContainer) {
        kpisContainer.innerHTML = '';
    }

    // ======================
    // LIMPIAR BUSCADOR
    // ======================
    const buscadorInput = document.getElementById('buscadorInput');
    if (buscadorInput) buscadorInput.value = '';

    const buscadorTableBody =
        document.getElementById('buscadorTableBody');
    if (buscadorTableBody) {
        buscadorTableBody.innerHTML = '';
    }

    const buscadorPagination =
        document.getElementById('buscadorPagination');
    if (buscadorPagination) {
        buscadorPagination.innerHTML = '';
    }

    // ======================
    // MENSAJE OPCIONAL
    // ======================
    showAlert('↻ Filtros limpiados correctamente', 'info');
}
