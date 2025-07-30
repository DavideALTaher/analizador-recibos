// Sistema automático de tipo de cambio BCCR

const tipoCambioBCCR = {
    tipoCambioActual: 520,
    ultimaActualizacion: null,
    
    async obtenerTipoCambioAutomatico() {
        try {
            // Intentar obtener de localStorage primero
            const hoy = new Date().toISOString().split('T')[0];
            const guardado = localStorage.getItem('tipoCambioBCCR');
            const fecha = localStorage.getItem('fechaTipoCambio');
            
            if (guardado && fecha === hoy) {
                this.tipoCambioActual = parseFloat(guardado);
                return this.tipoCambioActual;
            }
            
            // Como el BCCR requiere CORS, usamos un proxy público
            // Alternativa: usar un valor predefinido actualizado periódicamente
            const tipoCambioDefault = 515; // Actualizar mensualmente
            
            // Mostrar ventana con link clickeable
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
            `;
            
            modal.innerHTML = `
                <h3 style="margin-top: 0;">Tipo de Cambio del Dólar</h3>
                <p>Para obtener el tipo de cambio actualizado:</p>
                <a href="https://gee.bccr.fi.cr/indicadoreseconomicos/Cuadros/frmVerCatCuadro.aspx?idioma=1&CodCuadro=%20400" 
                   target="_blank" 
                   style="color: #1a73e8; text-decoration: underline;">
                   Consultar BCCR (Venta)
                </a>
                <br><br>
                <label>Tipo de cambio (₡ por $1 USD):</label>
                <input type="number" 
                       id="tipoCambioInput" 
                       value="${tipoCambioDefault}" 
                       step="0.01"
                       style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                <br>
                <button onclick="
                    const valor = document.getElementById('tipoCambioInput').value;
                    if (valor) {
                        tipoCambioBCCR.guardarTipoCambio(parseFloat(valor));
                        this.parentElement.remove();
                    }
                " style="background: #1a73e8; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    Confirmar
                </button>
                <button onclick="this.parentElement.remove()" 
                        style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                    Cancelar
                </button>
            `;
            
            document.body.appendChild(modal);
            
            // Esperar a que el usuario ingrese el valor
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!document.body.contains(modal)) {
                        clearInterval(checkInterval);
                        resolve(this.tipoCambioActual);
                    }
                }, 100);
            });
            
        } catch (error) {
            console.error('Error obteniendo tipo de cambio:', error);
            return 520; // Valor por defecto
        }
    },
    
    guardarTipoCambio(valor) {
        this.tipoCambioActual = valor;
        const hoy = new Date().toISOString().split('T')[0];
        localStorage.setItem('tipoCambioBCCR', valor.toString());
        localStorage.setItem('fechaTipoCambio', hoy);
    }
};

// Reemplazar el manager anterior
if (window.tipoCambioManager) {
    window.tipoCambioManager.obtenerTipoCambio = tipoCambioBCCR.obtenerTipoCambioAutomatico.bind(tipoCambioBCCR);
    window.tipoCambioManager.guardarTipoCambio = tipoCambioBCCR.guardarTipoCambio.bind(tipoCambioBCCR);
}

// Hacer disponible globalmente
window.tipoCambioBCCR = tipoCambioBCCR;
