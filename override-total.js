// Override TOTAL - Eliminar TODAS las ventanas de tipo cambio
console.log('Override total activado - NO ventanas');

// Bloquear TODOS los prompts
const originalPrompt = window.prompt;
window.prompt = function() {
    console.log('Prompt bloqueado - retornando 508.81');
    return '508.81';
};

// Override forzado del tipoCambioManager
window.tipoCambioManager = {
    tipoCambioActual: 508.81,
    obtenerTipoCambio: async function() {
        console.log('obtenerTipoCambio override - sin ventana');
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

// También override analyzeReceiptsEnhanced si existe
if (window.analyzeReceiptsEnhanced) {
    const original = window.analyzeReceiptsEnhanced;
    window.analyzeReceiptsEnhanced = async function(receipts) {
        console.log('Análisis sin ventanas');
        // Forzar el TC sin preguntar
        window.tipoCambioManager.tipoCambioActual = 508.81;
        return original.call(this, receipts);
    };
}

console.log('✅ Sistema forzado a TC 508.81 sin ventanas');
