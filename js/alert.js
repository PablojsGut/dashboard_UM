//alert.js
function showAlert(message, type = 'warning') {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function clearAlerts() {
    const container = document.getElementById('alertsContainer');
    if (container) container.innerHTML = '';
}
