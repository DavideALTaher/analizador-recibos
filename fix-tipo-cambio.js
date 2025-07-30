// Fix para el tipo de cambio
(function() {
    // Sobrescribir la función problemática
    if (window.tipoCambioManager) {
        window.tipoCambioManager.obtenerTipoCambio = async function() {
            // Obtener valor guardado
            const guardado = localStorage.getItem('tipoCambioBCCR');
            if (guardado) {
                this.tipoCambioActual = parseFloat(guardado);
            }
            
            // Si el usuario presiona Cancelar, usar el valor guardado
            const inputValue = prompt(
                'Tipo de cambio del dólar (venta):\n\n' +
                'Consultar en: https://gee.bccr.fi.cr/indicadoreseconomicos/\n\n' +
                'Ingrese el valor:',
                this.tipoCambioActual || 520
            );
            
            if (inputValue && !isNaN(inputValue)) {
                this.tipoCambioActual = parseFloat(inputValue);
                localStorage.setItem('tipoCambioBCCR', inputValue);
                localStorage.setItem('fechaTipoCambio', new Date().toISOString().split('T')[0]);
            }
            
            return this.tipoCambioActual;
        };
    }
})();
