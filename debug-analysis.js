// Debug para el análisis
console.log('Debug script cargado');

// Verificar que las funciones existan
window.addEventListener('load', function() {
    console.log('Verificando funciones...');
    console.log('analyzeReceipts existe:', typeof window.analyzeReceipts);
    console.log('analyzeReceiptsEnhanced existe:', typeof window.analyzeReceiptsEnhanced);
    console.log('tipoCambioManager existe:', typeof window.tipoCambioManager);
    console.log('businessModelEnhanced existe:', typeof window.businessModelEnhanced);
    
    // Si analyzeReceiptsEnhanced no existe, hay un problema
    if (typeof window.analyzeReceiptsEnhanced === 'undefined') {
        console.error('❌ analyzeReceiptsEnhanced no está definida!');
    }
});
