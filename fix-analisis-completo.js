// Fix completo para el análisis
(function() {
    console.log('Fix de análisis cargado');
    
    // Valor actual del BCCR
    const TIPO_CAMBIO_ACTUAL = 508.81;
    
    // Sobrescribir la función de análisis
    const originalAnalyze = window.analyzeReceipts;
    
    window.analyzeReceipts = async function(receipts) {
        console.log('Iniciando análisis con', receipts.length, 'recibos');
        
        // Obtener o establecer tipo de cambio
        if (!window.tipoCambioManager) {
            window.tipoCambioManager = {
                tipoCambioActual: TIPO_CAMBIO_ACTUAL,
                colonesToUSD: function(crc) { return crc / this.tipoCambioActual; },
                usdToColones: function(usd) { return usd * this.tipoCambioActual; },
                formatUSDWithCRC: function(usd) {
                    const crc = this.usdToColones(usd);
                    return `$${usd.toFixed(2)} (₡${new Intl.NumberFormat('es-CR').format(Math.round(crc))})`;
                }
            };
        }
        
        // Solicitar tipo de cambio solo si no está guardado hoy
        const hoy = new Date().toISOString().split('T')[0];
        const fechaGuardada = localStorage.getItem('fechaTipoCambio');
        
        if (fechaGuardada !== hoy) {
            const nuevoTC = prompt(
                'Tipo de cambio del dólar (venta):\n\n' +
                'Valor actual BCCR: ₡508.81\n' +
                'Consultar: https://gee.bccr.fi.cr/indicadoreseconomicos/',
                TIPO_CAMBIO_ACTUAL
            );
            
            if (nuevoTC && !isNaN(nuevoTC)) {
                window.tipoCambioManager.tipoCambioActual = parseFloat(nuevoTC);
                localStorage.setItem('tipoCambioBCCR', nuevoTC);
                localStorage.setItem('fechaTipoCambio', hoy);
            }
        } else {
            const guardado = localStorage.getItem('tipoCambioBCCR');
            if (guardado) {
                window.tipoCambioManager.tipoCambioActual = parseFloat(guardado);
            }
        }
        
        // Continuar con el análisis original si existe
        if (originalAnalyze) {
            return originalAnalyze.call(this, receipts);
        }
        
        // Si no, hacer análisis básico
        const promedioConsumo = receipts.reduce((sum, r) => sum + Number(r.consumoKWh || 0), 0) / receipts.length;
        const promedioDemanda = receipts.reduce((sum, r) => sum + Number(r.demandaKW || 0), 0) / receipts.length;
        const promedioFP = receipts.reduce((sum, r) => sum + Number(r.factorPotencia || 0), 0) / receipts.length;
        const promedioMontoCRC = receipts.reduce((sum, r) => sum + Number(r.montoTotal || 0), 0) / receipts.length;
        const promedioMontoUSD = window.tipoCambioManager.colonesToUSD(promedioMontoCRC);
        
        // Seleccionar modelo
        const modelo = window.determinarModeloPorCapacidad ? 
            window.determinarModeloPorCapacidad(promedioConsumo, promedioDemanda) :
            window.businessModelEnhanced.equipos[0];
        
        // Calcular ahorros
        const ahorroEnergeticoUSD = promedioMontoUSD * (modelo.porcentajeAhorroBase || 0.15);
        const multaUSD = promedioFP < 0.90 ? promedioMontoUSD * 0.08 : 0;
        const ahorroTotalUSD = ahorroEnergeticoUSD + multaUSD;
        
        return {
            consumoPromedio: promedioConsumo,
            demandaPromedio: promedioDemanda,
            factorPotenciaPromedio: promedioFP,
            montoPromedioUSD: promedioMontoUSD,
            modeloRecomendado: modelo.modelo,
            rango: modelo.rango,
            aplicacion: modelo.aplicacion,
            precioEquipo: modelo.precio,
            primaInicial: modelo.primaInicial,
            cuotaMensual: modelo.cuotaMensual,
            montoFinanciado: modelo.montoFinanciado,
            ahorroEnergetico: ahorroEnergeticoUSD,
            ahorroMultas: multaUSD,
            ahorroEstimado: ahorroTotalUSD,
            ahorroNeto: ahorroTotalUSD - modelo.cuotaMensual,
            tiempoRecuperacion: modelo.montoFinanciado / ahorroTotalUSD,
            ahorroTotal24Meses: (ahorroTotalUSD * 24) - modelo.montoFinanciado,
            ahorro5Anos: (ahorroTotalUSD * 60) - modelo.precio,
            tipoCambio: window.tipoCambioManager.tipoCambioActual,
            months: receipts.map(r => r.mes || 'Mes'),
            consumptionData: receipts.map(r => r.consumoKWh),
            amountData: receipts.map(r => r.montoTotal)
        };
    };
    
    console.log('Fix aplicado correctamente');
})();
