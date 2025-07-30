// Override TOTAL - Eliminar TODAS las ventanas de tipo cambio
console.log('Override total activado - NO ventanas');

// Bloquear TODOS los prompts
window.prompt = function() {
    console.log('Prompt bloqueado');
    return null;
};

// Override forzado del tipoCambioManager
window.tipoCambioManager = {
    tipoCambioActual: 508.81,
    obtenerTipoCambio: function() {
        // NO hacer nada, solo retornar el valor
        return Promise.resolve(508.81);
    },
    colonesToUSD: function(crc) { 
        return crc / 508.81; 
    },
    usdToColones: function(usd) { 
        return usd * 508.81; 
    },
    formatUSDWithCRC: function(usd) {
        const crc = this.usdToColones(usd);
        return `$${usd.toFixed(2)} (₡${new Intl.NumberFormat('es-CR').format(Math.round(crc))})`;
    }
};

console.log('✅ Sistema forzado a TC 508.81 sin ventanas');
