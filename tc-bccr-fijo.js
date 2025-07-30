// Tipo de Cambio BCCR - Venta (Actualizado 30/07/2025)
console.log('TC BCCR cargado');

// Tipo de cambio fijo del BCCR - VENTA
window.TC_BCCR_VENTA = 508.81;

// Configurar el manager con el valor fijo
if (!window.tipoCambioManager) {
    window.tipoCambioManager = {
        tipoCambioActual: window.TC_BCCR_VENTA,
        
        obtenerTipoCambio: function() {
            // No preguntar, solo retornar el valor
            return Promise.resolve(this.tipoCambioActual);
        },
        
        colonesToUSD: function(crc) { 
            return crc / this.tipoCambioActual; 
        },
        
        usdToColones: function(usd) { 
            return usd * this.tipoCambioActual; 
        },
        
        formatUSDWithCRC: function(usd) {
            const crc = this.usdToColones(usd);
            return `$${usd.toFixed(2)} (₡${new Intl.NumberFormat('es-CR').format(Math.round(crc))})`;
        }
    };
}

// Agregar info del TC en el header al cargar
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    if (header && !document.getElementById('tc-info')) {
        const tcInfo = document.createElement('p');
        tcInfo.id = 'tc-info';
        tcInfo.className = 'text-sm text-gray-600 mt-1';
        tcInfo.innerHTML = `Tipo de cambio: ₡${window.TC_BCCR_VENTA} (Fuente: BCCR - Venta)`;
        header.appendChild(tcInfo);
    }
});

// Agregar al final de los resultados
const originalDisplayResults = window.displayResults;
if (originalDisplayResults) {
    window.displayResults = function(results) {
        originalDisplayResults.call(this, results);
        
        // Agregar nota al final
        setTimeout(() => {
            const resultsSection = document.getElementById('results-section');
            if (resultsSection && !document.getElementById('tc-note')) {
                const note = document.createElement('div');
                note.id = 'tc-note';
                note.className = 'text-center text-sm text-gray-500 mt-4';
                note.innerHTML = `* Cálculos realizados con TC BCCR Venta: ₡${window.TC_BCCR_VENTA} por USD`;
                resultsSection.appendChild(note);
            }
        }, 100);
    };
}

console.log('Sistema configurado con TC BCCR Venta:', window.TC_BCCR_VENTA);
