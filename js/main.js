//main.js
document.addEventListener('DOMContentLoaded', () => {
    bindExcelInputs();
});

function bindExcelInputs() {
    ['excelInputFase1', 'excelInputFase2', 'excelInputAmbas']
        .forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', resetExcelState);
            }
        });
}
