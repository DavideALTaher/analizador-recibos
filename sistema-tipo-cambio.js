// Sistema de Tipo de Cambio Unificado - v508.81
console.log('Sistema tipo cambio unificado cargado');

window.tipoCambioManager = {
    tipoCambioActual: 508.81,
    
    async obtenerTipoCambio() {
        // Solo preguntar una vez al día
        const hoy = new Date().toISOString().split('T')[0];
        const fechaGuardada = localStorage.getItem('fechaTipoCambio');
        
        if (fechaGuardada === hoy) {
            const guardado = localStorage.getItem('tipoCambioBCCR');
            if (guardado) {
                this.tipoCambioActual = parseFloat(guardado);
                return this.tipoCambioActual;
            }
        }
        
        // Preguntar tipo de cambio
        const valor = prompt(
            'Tipo de cambio del dólar (venta):\n\n' +
            'Valor BCCR actual: ₡508.81\n' +
            'Consultar: https://gee.bccr.fi.cr/indicadoreseconomicos/',
            '508.81'
        );
        
        if (valor && !isNaN(valor)) {
            this.tipoCambioActual = parseFloat(valor);
            localStorage.setItem('tipoCambioBCCR', valor);
            localStorage.setItem('fechaTipoCambio', hoy);
        }
        
        return this.tipoCambioActual;
    },
    
    colonesToUSD(crc) { 
        return crc / this.tipoCambioActual; 
    },
    
    usdToColones(usd) { 
        return usd * this.tipoCambioActual; 
    },
    
    formatUSDWithCRC(usd) {
        const crc = this.usdToColones(usd);
        return `$${usd.toFixed(2)} (₡${new Intl.NumberFormat('es-CR').format(Math.round(crc))})`;
    }
};
