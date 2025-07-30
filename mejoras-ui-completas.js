// Mejoras UI - Toggle prima, selector equipo, visualización multas
console.log('Mejoras UI cargadas');

// 1. TOGGLE PRIMA INICIAL
function agregarTogglePrima() {
    // Buscar donde insertar
    const modelPriceElement = document.getElementById('model-price');
    if (!modelPriceElement || document.getElementById('toggle-prima-container')) return;
    
    const container = modelPriceElement.closest('.bg-blue-50');
    if (!container) return;
    
    // Crear toggle
    const toggleDiv = document.createElement('div');
    toggleDiv.id = 'toggle-prima-container';
    toggleDiv.className = 'mt-4 p-3 bg-gray-100 rounded';
    toggleDiv.innerHTML = `
        <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm font-medium">Incluir prima inicial en cálculo ROI</span>
            <input type="checkbox" id="incluir-prima" class="ml-2" checked onchange="recalcularROI()">
        </label>
    `;
    container.appendChild(toggleDiv);
}

// 2. SELECTOR DE EQUIPOS
function agregarSelectorEquipos() {
    const modelElement = document.getElementById('recommended-model');
    if (!modelElement || document.getElementById('selector-equipo')) return;
    
    const equipos = window.businessModelEnhanced?.equipos || [];
    if (equipos.length === 0) return;
    
    // Crear selector
    const selectorDiv = document.createElement('div');
    selectorDiv.id = 'selector-equipo-container';
    selectorDiv.className = 'mt-3';
    selectorDiv.innerHTML = `
        <label class="text-sm text-gray-600">Cambiar modelo:</label>
        <select id="selector-equipo" class="ml-2 p-1 border rounded" onchange="cambiarModelo(this.value)">
            ${equipos.map(eq => 
                `<option value="${eq.modelo}">${eq.modelo} - ${eq.aplicacion}</option>`
            ).join('')}
        </select>
    `;
    
    modelElement.parentElement.appendChild(selectorDiv);
}

// 3. VISUALIZACIÓN DE MULTAS
function mostrarDetalleMultas() {
    const results = window.currentAnalysis?.results;
    if (!results) return;
    
    const penaltyAlert = document.getElementById('penalty-alert');
    if (!penaltyAlert) return;
    
    // Si hay multa, mostrar detalles
    if (results.factorPotenciaPromedio < 0.90) {
        const multaCRC = results.multaActual * 508.81;
        penaltyAlert.innerHTML = `
            <p class="text-red-800 font-medium">⚠️ Factor de potencia bajo: ${results.factorPotenciaPromedio.toFixed(2)}</p>
            <p class="text-red-600">Multa mensual estimada: 
                <strong>$${results.multaActual.toFixed(2)} (₡${Math.round(multaCRC).toLocaleString()})</strong>
            </p>
            <p class="text-red-600 text-sm mt-1">
                El equipo Energy Saver corregirá el FP a ≥0.90, eliminando esta multa
            </p>
        `;
        penaltyAlert.classList.remove('hidden');
    }
}

// Función para recalcular ROI con/sin prima
window.recalcularROI = function() {
    const results = window.currentAnalysis?.results;
    if (!results) return;
    
    const incluirPrima = document.getElementById('incluir-prima')?.checked;
    const montoRecuperar = incluirPrima ? results.precioEquipo : results.montoFinanciado;
    const tiempoRecuperacion = montoRecuperar / results.ahorroEstimado;
    
    // Actualizar UI
    const roiElement = document.getElementById('roi-time');
    if (roiElement) {
        roiElement.textContent = Math.ceil(tiempoRecuperacion) + ' meses';
        
        // Actualizar label
        const label = roiElement.previousElementSibling;
        if (label) {
            label.innerHTML = incluirPrima 
                ? 'Tiempo de Recuperación<br><small>(incluye prima inicial)</small>'
                : 'Tiempo de Recuperación<br><small>(solo monto financiado)</small>';
        }
    }
};

// Función para cambiar modelo manualmente
window.cambiarModelo = function(modeloSeleccionado) {
    const results = window.currentAnalysis?.results;
    if (!results) return;
    
    // Buscar el modelo seleccionado
    const nuevoModelo = window.businessModelEnhanced.equipos.find(eq => eq.modelo === modeloSeleccionado);
    if (!nuevoModelo) return;
    
    // Actualizar resultados
    results.modeloRecomendado = nuevoModelo.modelo;
    results.precioEquipo = nuevoModelo.precio;
    results.primaInicial = nuevoModelo.primaInicial;
    results.cuotaMensual = nuevoModelo.cuotaMensual;
    results.montoFinanciado = nuevoModelo.montoFinanciado;
    
    // Recalcular ahorros con nuevo modelo
    const factorAhorro = nuevoModelo.porcentajeAhorroBase || 0.15;
    results.ahorroEnergetico = results.montoPromedioUSD * factorAhorro;
    results.ahorroEstimado = results.ahorroEnergetico + results.ahorroMultas;
    results.ahorroNeto = results.ahorroEstimado - nuevoModelo.cuotaMensual;
    
    // Actualizar display
    if (window.displayResults) {
        window.displayResults(results);
    }
    
    // Mantener selección
    setTimeout(() => {
        const selector = document.getElementById('selector-equipo');
        if (selector) selector.value = modeloSeleccionado;
    }, 100);
};

// Interceptar displayResults para agregar mejoras
const originalDisplayResults = window.displayResults;
window.displayResults = function(results) {
    if (originalDisplayResults) {
        originalDisplayResults.call(this, results);
    }
    
    // Agregar mejoras después de mostrar resultados
    setTimeout(() => {
        agregarTogglePrima();
        agregarSelectorEquipos();
        mostrarDetalleMultas();
    }, 100);
};

// Agregar desglose de ahorros si no existe
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si existe la sección de desglose
    setTimeout(() => {
        if (!document.getElementById('savings-breakdown') && document.getElementById('net-flow')) {
            const netFlowContainer = document.getElementById('net-flow').parentElement.parentElement;
            
            const breakdownDiv = document.createElement('div');
            breakdownDiv.id = 'savings-breakdown';
            breakdownDiv.className = 'bg-green-50 p-4 rounded-lg border border-green-200 mb-4';
            breakdownDiv.innerHTML = `
                <h3 class="font-bold text-md mb-3 text-green-800">Desglose de Ahorros Mensuales</h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-sm">Ahorro por Eficiencia Energética:</span>
                        <span id="efficiency-savings" class="font-medium">$0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm">Ahorro por Eliminación de Multas:</span>
                        <span id="penalty-savings" class="font-medium">$0</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 mt-2">
                        <span class="text-sm font-bold">Ahorro Total Mensual:</span>
                        <span id="total-monthly-savings" class="font-bold text-green-700">$0</span>
                    </div>
                </div>
            `;
            
            netFlowContainer.parentElement.insertBefore(breakdownDiv, netFlowContainer);
        }
    }, 500);
});

console.log('✅ Mejoras UI agregadas: Toggle prima, selector equipos, detalle multas');
