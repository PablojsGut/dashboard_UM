//excelLogic.js
window.excelHeadersFase1 = [];
window.excelDataFase1 = [];

window.excelHeadersFase2 = [];
window.excelDataFase2 = [];

window.dfIniciativas = null;
window.dfSintesis = null;
window.dfUnido = null;

let fase1Cargada = false;
let fase2Cargada = false;

/* ===============================
   LEER EXCEL
================================ */
function leerExcel(file, fase) {

    const reader = new FileReader();

    reader.onload = e => {

        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            blankrows: false
        });

        const headers = sheetData[2];   // fila 3
        const rows = sheetData.slice(3); // datos

        if (fase === 1) {
            excelHeadersFase1 = headers;
            excelDataFase1 = rows;
            fase1Cargada = true;
        }

        if (fase === 2) {
            excelHeadersFase2 = headers;
            excelDataFase2 = rows;
            fase2Cargada = true;
        }

        // ✅ SOLO CUANDO AMBOS ESTÁN LISTOS
        if (fase1Cargada && fase2Cargada) {
            construirDataframes();
        }
    };

    reader.readAsArrayBuffer(file);
}

/* ===============================
   CONSTRUIR DATAFRAMES
================================ */
function construirDataframes() {

    dfIniciativas = buildDfIniciativas(
        excelHeadersFase1,
        excelDataFase1
    );

    dfSintesis = buildDfSintesis(
        excelHeadersFase2,
        excelDataFase2
    );

    dfUnido = unirExcelsPorID(
        excelHeadersFase1,
        excelDataFase1,
        excelHeadersFase2,
        excelDataFase2
    );

    // ✅ ESTA ES LA LÍNEA QUE FALTABA
    if (typeof initFiltrosDependencias === 'function') {
        initFiltrosDependencias();
    }

    // inicializar buscador
    initBuscador(dfUnido);

    showAlert('✅ Excel unidos y listos para descargar', 'success');
}

/* ===============================
   BUILD DF INICIATIVAS
================================ */
function buildDfIniciativas(headers, data) {

    const colDependencia = "Unidad o Dependencia Responsable";

    const idxDep = headers.indexOf(colDependencia);

    if (idxDep === -1) {
        showAlert('❌ No se encontró la columna Dependencia', 'danger');
        return null;
    }

    const rows = data.map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i] ?? '');
        return obj;
    });

    const df = {
        all: rows,
        byDependencia: {}
    };

    rows.forEach(row => {
        const dep = row[colDependencia] || 'Sin dependencia';

        if (!df.byDependencia[dep]) {
            df.byDependencia[dep] = {
                all: [],
                bySubdependencia: {}
            };
        }

        df.byDependencia[dep].all.push(row);
    });

    return df;
}

/* ===============================
   BUILD DF SÍNTESIS
================================ */
function buildDfSintesis(headers, data) {
    return data.map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i] ?? '');
        return obj;
    });
}

function obtenerUnidadAcademica(headers, row) {

    const columnasUnidad = [
        'Escuela/Carrera Facultad de Ciencias Sociales y Artes',
        'Escuela/Carrera Facultad de Ciencias, Ingeniería y Tecnología',
        'Facultad de Medicina y Ciencias de la Salud',
        'Centro de Investigación',
        'Programas de Postgrado',
        'Otras Unidades No Académicas',
        'Otras Unidades No Académicas' // texto libre
    ];

    let valorOtra = '';

    for (let i = 0; i < headers.length; i++) {
        const h = headers[i];
        const v = String(row[i] ?? '').trim();

        if (!columnasUnidad.includes(h) || !v) continue;

        // Caso especial "Otra"
        if (h === 'Otras Unidades No Académicas') {
            if (v.toLowerCase() === 'otra') {
                valorOtra = v;
                continue;
            }
        }

        return v;
    }

    // Si se eligió "Otra", usar la segunda columna
    if (valorOtra) {
        const idxOtraLibre = headers.lastIndexOf('Otras Unidades No Académicas');
        const libre = String(row[idxOtraLibre] ?? '').trim();
        if (libre) return libre;
    }

    return 'Sin información';
}


/* ===============================
   UNIÓN POR ID
================================ */
function unirExcelsPorID(headersF1, dataF1, headersF2, dataF2) {

    const idx1 = headersF1.findIndex(h => h.toLowerCase() === 'id');
    const idx2 = headersF2.findIndex(h => h.toLowerCase() === 'id');

    if (idx1 === -1 || idx2 === -1) {
        showAlert('❌ Ambos Excel deben tener columna ID', 'danger');
        return null;
    }

    const mapF2 = new Map();
    dataF2.forEach(r => {
        mapF2.set(String(r[idx2]).trim(), r);
    });

    const columnasUnidadEliminar = [
        'Escuela/Carrera Facultad de Ciencias Sociales y Artes',
        'Escuela/Carrera Facultad de Ciencias, Ingeniería y Tecnología',
        'Facultad de Medicina y Ciencias de la Salud',
        'Centro de Investigación',
        'Programas de Postgrado',
        'Otras Unidades No Académicas'
    ];

    const unidos = [];

    dataF1.forEach(r1 => {

        const id = String(r1[idx1]).trim();
        const r2 = mapF2.get(id);

        const obj = { ID: id };

        // 👉 calcular Unidad Académica
        const unidadAcademica = obtenerUnidadAcademica(headersF1, r1);

        headersF1.forEach((h, i) => {

            if (h.toLowerCase() === 'id') return;
            if (columnasUnidadEliminar.includes(h)) return;

            const key = `${h} (Iniciativas)`;
            obj[key] = r1[i] ?? '';

            // 👇 INSERTAR INMEDIATAMENTE DESPUÉS
            if (h === 'Unidad o Dependencia Responsable') {
                obj['Unidad Académica (Iniciativas)'] = unidadAcademica;
            }
        });

        headersF2.forEach((h, i) => {
            if (h.toLowerCase() !== 'id') {
                obj[`${h} (Síntesis)`] = r2 ? r2[i] : '';
            }
        });

        unidos.push(obj);
    });

    return unidos;
}
