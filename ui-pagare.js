// Generador de Pagaré y UI Enhancements

// Toggle para incluir/excluir prima
function addPrimaToggle() {
    const roiContainer = document.getElementById('roi-time')?.parentElement;
    if (!roiContainer || document.getElementById('prima-toggle')) return;
    
    const toggle = document.createElement('div');
    toggle.id = 'prima-toggle';
    toggle.className = 'mb-4 p-3 bg-gray-100 rounded-lg';
    toggle.innerHTML = `
        <label class="flex items-center justify-between">
            <span class="text-sm font-medium">Incluir prima inicial en cálculo de recuperación</span>
            <input type="checkbox" id="incluir-prima" class="ml-2" onchange="recalcularConPrima()">
        </label>
    `;
    roiContainer.parentElement.insertBefore(toggle, roiContainer);
}

// Recalcular con/sin prima
window.recalcularConPrima = function() {
    const incluirPrima = document.getElementById('incluir-prima')?.checked;
    const results = window.currentAnalysis?.results;
    if (!results) return;
    
    const montoRecuperar = incluirPrima ? results.precioEquipo : results.montoFinanciado;
    const tiempoRecuperacion = montoRecuperar / results.ahorroEstimado;
    
    document.getElementById('roi-time').textContent = Math.ceil(tiempoRecuperacion) + ' meses';
    
    const label = document.querySelector('#roi-time').previousElementSibling;
    if (label) {
        label.textContent = incluirPrima ? 'Tiempo de Recuperación (con prima)' : 'Tiempo de Recuperación (sin prima)';
    }
};

// Generador de pagaré (solo USD, sin colones)
window.generarPagare = function() {
    const analysis = window.currentAnalysis;
    if (!analysis?.results) {
        alert('Por favor, realice un análisis primero');
        return;
    }
    
    const results = analysis.results;
    const clientName = analysis.clientName;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pagaré - ${clientName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.8;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 18px; font-weight: bold; }
        .subtitle { font-size: 16px; font-weight: bold; margin: 10px 0; }
        .content { text-align: justify; margin: 20px 0; }
        .signature { margin-top: 100px; text-align: center; }
        .highlight { font-weight: bold; text-decoration: underline; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CERTIFICADO DE PAGARÉ</div>
        <div class="subtitle">ENERGY SAVER COSTA RICA</div>
        <div class="subtitle">VALE POR $${results.montoFinanciado.toFixed(2)}</div>
    </div>
    
    <div class="content">
        <p>El suscrito: <span class="highlight">${clientName}</span>, 
        cédula <span class="highlight">______________</span>,
        [ ] soltero [ ] casado [ ] divorciado [ ] viudo,
        PROMETO pagar incondicionalmente a la sociedad ENERGY SAVER, SOCIEDAD ANONIMA, 
        cédula jurídica 3-101-577450, la suma de 
        <span class="highlight">${Math.round(results.montoFinanciado)} DÓLARES</span> 
        sin intereses, en un plazo de VEINTICUATRO MESES.</p>
        
        <p>Este PAGARÉ deberá ser cancelado por medio de mensualidades de 
        <span class="highlight">$${results.cuotaMensual.toFixed(2)}</span> 
        iniciando el primero del mes siguiente a la instalación.</p>
        
        <p>Equipo: <strong>${results.modeloRecomendado}</strong> (${results.rango})<br>
        Precio total: $${results.precioEquipo.toFixed(2)}<br>
        Prima inicial (30%): $${results.primaInicial.toFixed(2)}<br>
        Monto a financiar: $${results.montoFinanciado.toFixed(2)}</p>
        
        <p>El pago se realizará a:<br>
        <strong>COLONES:</strong> Cuenta 100-01-119-000019-1 (BAC)<br>
        IBAN: CR12015111910010000190<br>
        <strong>DÓLARES:</strong> Cuenta 100-02-119-000012-0 (BAC)<br>
        IBAN: CR49015111910020000127</p>
        
        <p>FAVOR ENVIAR COMPROBANTE A: energysavercr@gmail.com</p>
    </div>
    
    <div class="signature">
        <p>_______________________________<br>
        ${clientName}<br>
        DEUDOR</p>
    </div>
    
    <script>window.print();</script>
</body>
</html>
    `);
};

// Agregar botón de pagaré si no existe
function addPagareButton() {
    if (document.getElementById('generate-pagare-btn')) return;
    
    const container = document.querySelector('.flex.flex-wrap.justify-center.gap-4');
    if (!container) return;
    
    const btn = document.createElement('button');
    btn.id = 'generate-pagare-btn';
    btn.className = 'bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded';
    btn.textContent = 'Generar Pagaré';
    btn.onclick = generarPagare;
    
    const finishBtn = document.getElementById('finish-analysis-btn');
    container.insertBefore(btn, finishBtn);
}

// Interceptar displayResults
const originalDisplay = window.displayResults;
window.displayResults = function(results) {
    if (originalDisplay) originalDisplay.call(this, results);
    setTimeout(() => {
        addPrimaToggle();
        addPagareButton();
    }, 100);
};
