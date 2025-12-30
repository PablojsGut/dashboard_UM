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

    if (!window.dfUnido || !dependencia) return [];

    // normalizada -> versión bonita
    const map = new Map();

    dfUnido.forEach(row => {

        if (
            row['Unidad o Dependencia Responsable (Iniciativas)'] !== dependencia
        ) return;

        const raw = String(
            row['Unidad Académica (Iniciativas)'] || ''
        ).replace(/&nbsp;/g, ' ').trim();

        if (!raw) return;

        const normalizada = normalizeText(raw);

        if (!normalizada) return;

        // guardar solo una versión bonita por clave normalizada
        if (!map.has(normalizada)) {
            map.set(normalizada, prettyText(normalizada));
        }
    });

    return [...map.values()].sort();
}

