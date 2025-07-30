// Fix completo - Todo en USD con CRC entre paréntesis
console.log('Fix USD completo cargado');

// Asegurar que el tipo de cambio esté disponible
window.TC_BCCR = 508.81;

// Fix para el checkbox de prima
window.recalcularROI = function() {
    const results = window.currentAnalysis?.results;
    if (!results) return;
    
    const incluirPrima = document.getElementById('incluir-prima')?.checked;
    console.log('Recalculando ROI, incluir prima:', incluirPrima);
    
    // Calcular tiempo de recuperación
    const montoRecuperar = incluirPrima ? results.precioEquipo : results.montoFinanciado;
    const tiempoRecuperacion = montoRecuperar / results.ahorroEstimado;
    
    // Actualizar UI
    const roiElement = document.getElementById('roi-time');
    if (roiElement) {
        roiElement.textContent = Math.ceil(tiempoRecuperacion) + ' meses';
    }
    
    // Actualizar flujo neto también
    const flujoNeto = results.ahorroEstimado - results.cuotaMensual;
    const netFlowElement = document.getElementById('net-flow');
    if (netFlowElement) {
        netFlowElement.textContent = formatUSDWithCRC(flujoNeto);
    }
    
    // Actualizar tabla de flujo si existe
    actualizarTablaFlujo(results, incluirPrima);
};

// Función para formatear USD con CRC
function formatUSDWithCRC(usd) {
    const crc = usd * window.TC_BCCR;
    return `$${usd.toFixed(2)} (₡${new Intl.NumberFormat('es-CR').format(Math.round(crc))})`;
}

// Actualizar la tabla de flujo de caja
function actualizarTablaFlujo(results, incluirPrima) {
    const tbody = document.querySelector('#cash-flow-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Generar flujo considerando si incluye prima o no
    for (let i = 0; i <= 36; i++) {
        if (i > 25 && i < 35 && i % 3 !== 0) continue;
        
        const row = document.createElement('tr');
        row.className = (i === 0 || i === 24 || i === 36) ? 'bg-blue-50 font-bold' : 
                       i % 12 === 0 ? 'bg-gray-50' : '';
        
        let label = `Mes ${i}`;
        if (i === 0) label = 'Inversión Inicial';
        if (i === 24) label += ' (Fin financiamiento)';
        if (i === 36) label += ' (3 años)';
        
        // Calcular valores
        let sinEquipo = i === 0 ? 0 : results.montoPromedioUSD;
        let conEquipo, ahorroMensual, ahorroAcumulado;
        
        if (i === 0) {
            conEquipo = incluirPrima ? results.primaInicial : 0;
            ahorroMensual = incluirPrima ? -results.primaInicial : 0;
            ahorroAcumulado = ahorroMensual;
        } else {
            if (i <= 24) {
                conEquipo = results.montoPromedioUSD - results.ahorroEstimado + results.cuotaMensual;
                ahorroMensual = results.ahorroEstimado - results.cuotaMensual;
            } else {
                conEquipo = results.montoPromedioUSD - results.ahorroEstimado;
                ahorroMensual = results.ahorroEstimado;
            }
            
            // Calcular acumulado
            const mesAnterior = tbody.rows[tbody.rows.length - 1];
            const acumuladoAnterior = mesAnterior ? 
                parseFloat(mesAnterior.cells[6].getAttribute('data-value')) || 0 : 
                (incluirPrima ? -results.primaInicial : 0);
            ahorroAcumulado = acumuladoAnterior + ahorroMensual;
        }
        
        row.innerHTML = `
            <td class="px-4 py-3">${label}</td>
            <td class="px-4 py-3 text-right">${i === 0 ? '$0' : formatUSDWithCRC(sinEquipo)}</td>
            <td class="px-4 py-3 text-right">${i === 0 ? (incluirPrima ? `-${formatUSDWithCRC(conEquipo)}` : '$0') : 
                                              i <= 24 ? formatUSDWithCRC(conEquipo) : 'N/A'}</td>
            <td class="px-4 py-3 text-right">${i > 24 ? formatUSDWithCRC(conEquipo) : 'N/A'}</td>
            <td class="px-4 py-3 text-right">${formatUSDWithCRC(i === 0 ? 0 : results.ahorroEnergetico)}</td>
            <td class="px-4 py-3 text-right">${formatUSDWithCRC(i === 0 ? 0 : results.ahorroMultas)}</td>
            <td class="px-4 py-3 text-right ${ahorroAcumulado >= 0 ? 'text-green-600' : 'text-red-600'}" data-value="${ahorroAcumulado}">
                ${ahorroAcumulado >= 0 ? formatUSDWithCRC(ahorroAcumulado) : `-${formatUSDWithCRC(Math.abs(ahorroAcumulado))}`}
            </td>
        `;
        tbody.appendChild(row);
    }
}

// Override displayResultsEnhanced para mostrar todo en USD (CRC)
const originalDisplayResultsEnhanced = window.displayResultsEnhanced || window.displayResults;
window.displayResults = function(results) {
    console.log('Mostrando resultados en USD con CRC');
    
    // Asegurar que todos los valores estén en USD
    if (!results.montoPromedioUSD && results.montoPromedio) {
        // Si los montos vienen en colones, convertir
        results.montoPromedioUSD = results.montoPromedio / window.TC_BCCR;
    }
    
    // Formatear elementos básicos
    document.getElementById('avg-consumption').textContent = Math.round(results.consumoPromedio) + ' kWh';
    document.getElementById('avg-demand').textContent = results.demandaPromedio.toFixed(2) + ' kW';
    document.getElementById('avg-factor').textContent = results.factorPotenciaPromedio.toFixed(2);
    document.getElementById('avg-amount').textContent = formatUSDWithCRC(results.montoPromedioUSD);
    
    // Modelo recomendado - todo en USD
    document.getElementById('recommended-model').textContent = results.modeloRecomendado;
    document.getElementById('model-price').textContent = formatUSDWithCRC(results.precioEquipo);
    document.getElementById('model-downpayment').textContent = formatUSDWithCRC(results.primaInicial);
    document.getElementById('model-monthly').textContent = formatUSDWithCRC(results.cuotaMensual);
    
    // Desglose de ahorros
    const efficiencyElement = document.getElementById('efficiency-savings');
    const penaltyElement = document.getElementById('penalty-savings');
    const totalSavingsElement = document.getElementById('total-monthly-savings');
    
    if (efficiencyElement) {
        efficiencyElement.textContent = formatUSDWithCRC(results.ahorroEnergetico);
        penaltyElement.textContent = formatUSDWithCRC(results.ahorroMultas || 0);
        totalSavingsElement.textContent = formatUSDWithCRC(results.ahorroEstimado);
    }
    
    // Flujo neto
    const netFlowElement = document.getElementById('net-flow');
    if (netFlowElement) {
        netFlowElement.textContent = formatUSDWithCRC(results.ahorroNeto);
    }
    
    // ROI y proyecciones
    document.getElementById('roi-time').textContent = Math.ceil(results.tiempoRecuperacion) + ' meses';
    
    const savings24Element = document.getElementById('savings-after-financing');
    const savings5Element = document.getElementById('savings-5-years');
    
    if (savings24Element) {
        savings24Element.textContent = formatUSDWithCRC(results.ahorroTotal24Meses);
    }
    if (savings5Element) {
        savings5Element.textContent = formatUSDWithCRC(results.ahorro5Anos);
    }
    
    // Llamar función original si existe
    if (originalDisplayResultsEnhanced && originalDisplayResultsEnhanced !== window.displayResults) {
        originalDisplayResultsEnhanced.call(this, results);
    }
    
    // Actualizar tabla con checkbox inicial
    setTimeout(() => {
        const incluirPrima = document.getElementById('incluir-prima')?.checked ?? true;
        actualizarTablaFlujo(results, incluirPrima);
    }, 100);
};

// Fix para el generador de pagaré - solo USD sin conversiones
const originalGenerarPagare = window.generarPagareConDatos;
if (originalGenerarPagare) {
    window.generarPagareConDatos = function() {
        // Temporalmente cambiar formatUSDWithCRC para el pagaré
        const originalFormat = window.formatUSDWithCRC;
        window.formatUSDWithCRC = function(usd) {
            return `$${usd.toFixed(2)}`; // Solo USD para el pagaré
        };
        
        // Generar pagaré
        originalGenerarPagare.call(this);
        
        // Restaurar formato original
        window.formatUSDWithCRC = originalFormat;
    };
}

console.log('✅ Fix completo USD aplicado');
