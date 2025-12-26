function applyFilters() {

    if (!window.dfUnido || dfUnido.length === 0) {
        showAlert('❌ No hay datos para filtrar', 'danger');
        return;
    }

    const sede = document.getElementById('filterSede').value;
    const dependencia = document.getElementById('filterDependencia').value;
    const subdependencia = document.getElementById('filterUnidad').value;

    dfFiltrado = dfUnido.filter(row => {

        // ======================
        // FILTRO SEDE
        // ======================
        if (sede) {
            const sedeRow = row['Sede (Iniciativas)'];
            if (!sedeRow || sedeRow !== sede) {
                return false;
            }
        }

        // ======================
        // FILTRO DEPENDENCIA
        // ======================
        if (dependencia) {
            const depRow = row['Unidad o Dependencia Responsable (Iniciativas)'];
            if (!depRow || depRow !== dependencia) {
                return false;
            }
        }

        // ======================
        // FILTRO SUBDEPENDENCIA
        // ======================
        if (subdependencia) {
            let match = false;

            Object.keys(row).forEach(k => {
                if (
                    k.includes('Escuela/Carrera') ||
                    k.includes('Programas de Postgrado') ||
                    k.includes('Centro de Investigación') ||
                    k.includes('Otras Unidades No Académicas')
                ) {
                    if (row[k] === subdependencia) {
                        match = true;
                    }
                }
            });

            if (!match) return false;
        }

        return true;
    });

    // ======================
    // ACTUALIZAR UI
    // ======================
    updateKPIsAmbas(dfFiltrado);
    renderCharts(dfFiltrado);
}


/* ==============================
   CARGA DE FILTROS
================================ */

document.addEventListener('DOMContentLoaded', () => {

    const cboDependencia = document.getElementById('filterDependencia');
    const cboUnidad = document.getElementById('filterUnidad');

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
    };
});
