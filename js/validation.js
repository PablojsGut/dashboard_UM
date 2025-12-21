//validation.js
function validateColumns(headers, expected) {
    const faltantes = expected.filter(col => !headers.includes(col));

    if (faltantes.length) {
        showAlert(
            `Faltan columnas obligatorias:<br><ul>${faltantes
                .map(c => `<li>${c}</li>`)
                .join('')}</ul>`,
            'warning'
        );
        return false;
    }
    return true;
}
