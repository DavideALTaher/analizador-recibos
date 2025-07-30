// Cálculo Mejorado - Energy Saver
// Incluye: Conversión USD/CRC, cálculo de multas, selección por capacidad

// Configuración del tipo de cambio
const tipoCambioManager = {
    tipoCambioDefault: 520,
    tipoCambioActual: 520,
    
    async obtenerTipoCambio() {
        const guardado = localStorage.getItem('tipoCambioBCCR');
        if (guardado) {
            this.tipoCambioActual = parseFloat(guardado);
        }
        
        const nuevo = "508.81"; "; // prompt comentado
            'Ingrese el tipo de cambio actual del dólar (venta):\n' +
            'Consultar en: https://gee.bccr.fi.cr/indicadoreseconomicos/',
            this.tipoCambioActual
        );
        
        if (nuevo && !isNaN(nuevo)) {
            this.tipoCambioActual = parseFloat(nuevo);
            localStorage.setItem('tipoCambioBCCR', this.tipoCambioActual);
        }
        
        return this.tipoCambioActual;
    },
    
    colonesToUSD(crc) { return crc / this.tipoCambioActual; },
    usdToColones(usd) { return usd * this.tipoCambioActual; },
    
    formatUSDWithCRC(usd) {
        const crc = this.usdToColones(usd);
        return `$${usd.toFixed(2)} (₡${new Intl.NumberFormat('es-CR').format(Math.round(crc))})`;
    }
};

// Función mejorada de análisis
window.analyzeReceiptsEnhanced = async function(receipts) {
    tipoCambioManager.tipoCambioActual = 508.81; // await tipoCambioManager.obtenerTipoCambio();
    
    // Convertir facturas de CRC a USD
    const receiptsUSD = receipts.map(r => ({
        ...r,
        montoTotalUSD: tipoCambioManager.colonesToUSD(r.montoTotal)
    }));
    
    // Promedios
    const promedioConsumo = receipts.reduce((sum, r) => sum + Number(r.consumoKWh || 0), 0) / receipts.length;
    const promedioDemanda = receipts.reduce((sum, r) => sum + Number(r.demandaKW || 0), 0) / receipts.length;
    const promedioFactorPotencia = receipts.reduce((sum, r) => sum + Number(r.factorPotencia || 0), 0) / receipts.length || 0.95;
    const promedioMontoUSD = receiptsUSD.reduce((sum, r) => sum + r.montoTotalUSD, 0) / receiptsUSD.length;
    
    // Seleccionar modelo
    const modelo = window.determinarModeloPorCapacidad(promedioConsumo, promedioDemanda);
    
    // Calcular ahorros en USD
    const ahorroEnergeticoUSD = promedioMontoUSD * modelo.porcentajeAhorroBase;
    const multaUSD = window.businessModelEnhanced.calcularMultaFactorPotencia(promedioFactorPotencia, promedioMontoUSD);
    const ahorroMultasUSD = promedioFactorPotencia < 0.90 ? multaUSD : 0;
    const ahorroTotalUSD = ahorroEnergeticoUSD + ahorroMultasUSD;
    
    // Flujo y proyecciones
    const ahorroNetoUSD = ahorroTotalUSD - modelo.cuotaMensual;
    const tiempoRecuperacion = modelo.montoFinanciado / ahorroTotalUSD;
    const ahorro24MesesUSD = (ahorroTotalUSD * 24) - modelo.montoFinanciado;
    const ahorro5AnosUSD = (ahorroTotalUSD * 60) - modelo.precio;
    
    // Flujo de caja
    const cashFlow = [];
    for (let i = 0; i <= 36; i++) {
        const ahorroMensual = i === 0 ? -modelo.primaInicial : 
                            i <= 24 ? ahorroTotalUSD - modelo.cuotaMensual : 
                            ahorroTotalUSD;
        
        const ahorroAcumulado = i === 0 ? -modelo.primaInicial :
                              i === 1 ? ahorroMensual - modelo.primaInicial :
                              cashFlow[i-1].ahorroAcumulado + ahorroMensual;
        
        cashFlow.push({
            mes: i,
            sinEquipo: i === 0 ? 0 : promedioMontoUSD,
            conEquipo: i === 0 ? modelo.primaInicial : 
                      i <= 24 ? promedioMontoUSD - ahorroTotalUSD + modelo.cuotaMensual :
                      promedioMontoUSD - ahorroTotalUSD,
            ahorroEnergetico: i === 0 ? 0 : ahorroEnergeticoUSD,
            ahorroMultas: i === 0 ? 0 : ahorroMultasUSD,
            ahorroMensual,
            ahorroAcumulado
        });
    }
    
    return {
        // Datos básicos
        consumoPromedio: promedioConsumo,
        demandaPromedio: promedioDemanda,
        factorPotenciaPromedio: promedioFactorPotencia,
        montoPromedioUSD: promedioMontoUSD,
        
        // Modelo (valores en USD)
        modeloRecomendado: modelo.modelo,
        rango: modelo.rango,
        aplicacion: modelo.aplicacion,
        precioEquipo: modelo.precio,
        primaInicial: modelo.primaInicial,
        cuotaMensual: modelo.cuotaMensual,
        montoFinanciado: modelo.montoFinanciado,
        
        // Ahorros USD
        ahorroEnergetico: ahorroEnergeticoUSD,
        ahorroMultas: ahorroMultasUSD,
        ahorroEstimado: ahorroTotalUSD,
        ahorroNeto: ahorroNetoUSD,
        
        // Proyecciones
        tiempoRecuperacion,
        ahorroTotal24Meses: ahorro24MesesUSD,
        ahorro5Anos: ahorro5AnosUSD,
        
        // Otros
        tipoCambio: tipoCambioManager.tipoCambioActual,
        cashFlow,
        
        // Para gráficos (mantener en CRC)
        months: receipts.map(r => r.mes || new Date().toISOString().substring(0, 7)),
        consumptionData: receipts.map(r => r.consumoKWh),
        amountData: receipts.map(r => r.montoTotal)
    };
};

// Función para mostrar resultados con USD (CRC)
window.displayResultsEnhanced = function(results) {
    const fmt = (usd) => tipoCambioManager.formatUSDWithCRC(usd);
    
    // Actualizar elementos básicos
    document.getElementById('avg-consumption').textContent = Math.round(results.consumoPromedio) + ' kWh';
    document.getElementById('avg-demand').textContent = results.demandaPromedio.toFixed(2) + ' kW';
    document.getElementById('avg-factor').textContent = results.factorPotenciaPromedio.toFixed(2);
    document.getElementById('avg-amount').textContent = fmt(results.montoPromedioUSD);
    
    // Modelo recomendado
    document.getElementById('recommended-model').textContent = results.modeloRecomendado;
    document.getElementById('model-description').textContent = `${results.aplicacion} (${results.rango})`;
    document.getElementById('model-price').textContent = fmt(results.precioEquipo);
    document.getElementById('model-downpayment').textContent = fmt(results.primaInicial);
    document.getElementById('model-monthly').textContent = fmt(results.cuotaMensual);
    
    // Ahorros
    if (document.getElementById('monthly-savings')) {
        document.getElementById('monthly-savings').textContent = fmt(results.ahorroEstimado);
    }
    if (document.getElementById('net-flow')) {
        document.getElementById('net-flow').textContent = fmt(results.ahorroNeto);
    }
    
    // ROI
    document.getElementById('roi-time').textContent = 
        Math.ceil(results.tiempoRecuperacion) + ' meses';
    document.getElementById('savings-after-financing').textContent = fmt(results.ahorroTotal24Meses);
    document.getElementById('savings-5-years').textContent = fmt(results.ahorro5Anos);
    
    // Agregar info tipo cambio
    if (!document.getElementById('tipo-cambio-info')) {
        const info = document.createElement('p');
        info.id = 'tipo-cambio-info';
        info.className = 'text-sm text-gray-500 mt-2';
        info.textContent = `Tipo de cambio: ₡${results.tipoCambio} por USD`;
        document.querySelector('header').appendChild(info);
    }
    
    // Llamar función original
    if (window.displayResultsOriginal) {
        window.displayResultsOriginal(results);
    }
    
    // Actualizar tabla de flujo
    updateCashFlowTable(results);
};

// Actualizar tabla de flujo
function updateCashFlowTable(results) {
    const tbody = document.querySelector('#cash-flow-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    results.cashFlow.forEach((flow, i) => {
        if (i > 25 && i < 35 && i % 3 !== 0) return;
        
        const row = document.createElement('tr');
        row.className = (i === 0 || i === 24 || i === 36) ? 'bg-blue-50 font-bold' : 
                       i % 12 === 0 ? 'bg-gray-50' : '';
        
        let label = `Mes ${i}`;
        if (i === 0) label = 'Inversión Inicial';
        if (i === 24) label += ' (Fin financiamiento)';
        if (i === 36) label += ' (3 años)';
        
        const fmt = (usd) => tipoCambioManager.formatUSDWithCRC(usd);
        
        row.innerHTML = `
            <td class="px-4 py-3">${label}</td>
            <td class="px-4 py-3 text-right">${i === 0 ? '$0' : fmt(flow.sinEquipo)}</td>
            <td class="px-4 py-3 text-right">${i === 0 ? `-${fmt(flow.conEquipo)}` : 
                                              i <= 24 ? fmt(flow.conEquipo) : 'N/A'}</td>
            <td class="px-4 py-3 text-right">${i > 24 ? fmt(flow.conEquipo) : 'N/A'}</td>
            <td class="px-4 py-3 text-right">${fmt(flow.ahorroEnergetico)}</td>
            <td class="px-4 py-3 text-right">${fmt(flow.ahorroMultas)}</td>
            <td class="px-4 py-3 text-right ${flow.ahorroAcumulado >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${flow.ahorroAcumulado >= 0 ? fmt(flow.ahorroAcumulado) : `-${fmt(-flow.ahorroAcumulado)}`}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Reemplazar funciones originales
if (window.analyzeReceipts) {
    window.analyzeReceiptsOriginal = window.analyzeReceipts;
    window.analyzeReceipts = window.analyzeReceiptsEnhanced;
}

if (window.displayResults) {
    window.displayResultsOriginal = window.displayResults;
    window.displayResults = window.displayResultsEnhanced;
}

window.tipoCambioManager = tipoCambioManager;
