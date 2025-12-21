//validation.js
function normalize(text) {
    return String(text)
        .trim()
        .replace(/\s+/g, ' ');
}

function validateColumns(headers, expected) {
    const normalizedHeaders = headers.map(normalize);
    const normalizedExpected = expected.map(normalize);

    const faltantes = normalizedExpected.filter(
        col => !normalizedHeaders.includes(col)
    );

    if (faltantes.length) {
        showAlert(
            `❌ Faltan columnas obligatorias:<br><ul>${faltantes
                .map(c => `<li>${c}</li>`)
                .join('')}</ul>`,
            'warning'
        );
        return false;
    }

    return true;
}