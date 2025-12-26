//dependenciasView.js
function normalizeText(str) {
    if (!str) return '';

    return str
        .toLowerCase()
        .normalize('NFD')                  // quita tildes
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\bmatematicas\b/g, 'matematica')
        .replace(/\bfisicas\b/g, 'fisica')
        .replace(/\s+/g, ' ')
        .trim();
}

function prettyText(str) {
    return str
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

/* ==============================
   OBTENER DEPENDENCIAS
================================ */
function getDependencias() {

    if (!window.dfIniciativas || !dfIniciativas.all) {
        return [];
    }

    const dependenciaCol = 'Unidad o Dependencia Responsable';
    const set = new Set();

    dfIniciativas.all.forEach(row => {
        const dep = row[dependenciaCol];
        if (dep && dep.trim() !== '') {
            set.add(dep.trim());
        }
    });

    return [...set].sort();
}

/* ==============================
   OBTENER SUBDEPENDENCIAS
================================ */
function getSubdependencias(dependencia) {

    if (!window.dfIniciativas || !dfIniciativas.all || !dependencia) {
        return [];
    }

    /* MAPA DEP → COLUMNAS */
    const subdependenciaMap = {
        'Facultad de Ciencias Sociales y Artes': [
            'Escuela/Carrera Facultad de Ciencias Sociales y Artes'
        ],

        'Facultad de Ciencias, Ingeniería y Tecnología': [
            'Escuela/Carrera Facultad de Ciencias, Ingeniería y Tecnología'
        ],

        'Facultad de Medicina y Ciencias de la Salud': [
            'Facultad de Medicina y Ciencias de la Salud'
        ],

        'Centros de Investigación': [
            'Centro de Investigación'
        ],

        'Programas de Postgrado': [
            'Programas de Postgrado'
        ],

        'Otras Unidades': [
            'Otras Unidades No Académicas',
            'Otras Unidades No Académicas'
        ]
    };

    const cols = subdependenciaMap[dependencia];
    const map = new Map(); // normalizada → bonita

    dfIniciativas.all.forEach(row => {

        if (row['Unidad o Dependencia Responsable'] !== dependencia) {
            return;
        }

        if (!cols) {
            map.set('sin subdependencia', 'Sin subdependencia');
            return;
        }

        let encontrada = false;

        cols.forEach(col => {
            const val = row[col];

            if (val && String(val).trim() !== '') {
                const normalizada = normalizeText(val);
                if (normalizada) {
                    map.set(
                        normalizada,
                        prettyText(normalizada)
                    );
                    encontrada = true;
                }
            }
        });

        if (!encontrada) {
            map.set('sin subdependencia', 'Sin subdependencia');
        }
    });

    return [...map.values()].sort();
}
