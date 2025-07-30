// Generador de Pagaré Completo con campos configurables
console.log('Generador pagaré completo cargado');

window.generarPagareCompleto = function() {
    const analysis = window.currentAnalysis;
    if (!analysis?.results) {
        alert('Por favor, realice un análisis primero');
        return;
    }
    
    const results = analysis.results;
    
    // Crear modal para datos del pagaré
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-top: 0;">Generar Pagaré - ${analysis.clientName}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre completo del deudor:</label>
                    <input type="text" id="pagare-nombre" value="${analysis.clientName}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cédula/Identificación:</label>
                    <input type="text" id="pagare-cedula" placeholder="0-0000-0000" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Estado civil:</label>
                    <select id="pagare-estado-civil" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="soltero">Soltero(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viudo">Viudo(a)</option>
                    </select>
                </div>
                
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">En representación de (empresa):</label>
                    <input type="text" id="pagare-empresa" placeholder="Dejar vacío si es persona física" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cédula jurídica (si aplica):</label>
                    <input type="text" id="pagare-cedula-juridica" placeholder="3-000-000000" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Opciones del pagaré:</h3>
                
                <label style="display: block; margin: 10px 0;">
                    <input type="checkbox" id="incluir-notario" checked>
                    Incluir cláusula de honorarios de abogado
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <input type="checkbox" id="mostrar-cuentas-bancarias" checked>
                    Mostrar información de cuentas bancarias
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <input type="checkbox" id="incluir-clausula-mora" checked>
                    Incluir cláusula de mora ($50 USD)
                </label>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Resumen del financiamiento:</h4>
                <p>Modelo: <strong>${results.modeloRecomendado}</strong></p>
                <p>Precio total: <strong>$${results.precioEquipo.toFixed(2)}</strong></p>
                <p>Prima inicial: <strong>$${results.primaInicial.toFixed(2)}</strong></p>
                <p>Monto a financiar: <strong>$${results.montoFinanciado.toFixed(2)}</strong></p>
                <p>Cuota mensual: <strong>$${results.cuotaMensual.toFixed(2)}</strong></p>
                <p>Plazo: <strong>24 meses sin intereses</strong></p>
            </div>
            
            <div style="text-align: right; margin-top: 20px;">
                <button onclick="this.closest('.fixed').remove()" 
                        style="padding: 10px 20px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="generarPagareConDatos()" 
                        style="padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Generar Pagaré
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.generarPagareConDatos = function() {
    const results = window.currentAnalysis.results;
    
    // Obtener datos del formulario
    const nombre = document.getElementById('pagare-nombre').value;
    const cedula = document.getElementById('pagare-cedula').value;
    const estadoCivil = document.getElementById('pagare-estado-civil').value;
    const empresa = document.getElementById('pagare-empresa').value;
    const cedulaJuridica = document.getElementById('pagare-cedula-juridica').value;
    
    // Opciones
    const incluirNotario = document.getElementById('incluir-notario').checked;
    const mostrarCuentas = document.getElementById('mostrar-cuentas-bancarias').checked;
    const incluirMora = document.getElementById('incluir-clausula-mora').checked;
    
    // Cerrar modal
    document.querySelector('.fixed').remove();
    
    // Generar pagaré
    const ventana = window.open('', '_blank');
    
    const fechaHoy = new Date().toLocaleDateString('es-CR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    ventana.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pagaré - ${nombre}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            line-height: 1.8;
        }
        .header { text-align: center; margin-bottom: 40px; }
        .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 18px; font-weight: bold; }
        .content { text-align: justify; margin: 30px 0; }
        .signature-section { margin-top: 100px; }
        .signature-line { 
            display: inline-block; 
            width: 300px; 
            border-bottom: 1px solid black; 
            margin: 0 20px;
        }
        @media print { 
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CERTIFICADO DE PAGARÉ</div>
        <div class="subtitle">ENERGY SAVER COSTA RICA</div>
        <div class="subtitle">VALE POR $${results.montoFinanciado.toFixed(2)}</div>
    </div>
    
    <div class="content">
        <p>El suscrito: <strong>${nombre}</strong>, 
        cédula <strong>${cedula || '_______________'}</strong>,
        ${estadoCivil}${empresa ? `, en representación de la sociedad <strong>${empresa}</strong>, 
        cédula jurídica ${cedulaJuridica || '_______________'}` : ''}, 
        PROMETO pagar incondicionalmente a la sociedad <strong>ENERGY SAVER, SOCIEDAD ANONIMA</strong>, 
        cédula jurídica 3-101-577450, domiciliada en San José, Costa Rica, o a su orden, 
        la suma de <strong>${Math.round(results.montoFinanciado)} DÓLARES ESTADOUNIDENSES</strong> 
        (USD $${results.montoFinanciado.toFixed(2)}) moneda de curso legal de los Estados Unidos de América.</p>
        
        <p>Este PAGARÉ deberá ser cancelado <strong>SIN INTERESES</strong>, por medio de 
        <strong>VEINTICUATRO (24) CUOTAS MENSUALES Y CONSECUTIVAS</strong> de 
        <strong>$${results.cuotaMensual.toFixed(2)} DÓLARES</strong> cada una, 
        iniciando el primero del mes siguiente a la instalación del equipo.</p>
        
        ${incluirMora ? `<p>En caso de mora en el pago de cualquier cuota, se aplicará un cargo por mora de 
        <strong>CINCUENTA DÓLARES ($50.00)</strong> por cada mes o fracción de mes en mora.</p>` : ''}
        
        ${incluirNotario ? `<p>En caso de cobro judicial de este PAGARÉ, el deudor pagará al acreedor 
        un veinticinco por ciento (25%) de honorarios de abogado sobre el principal e intereses, 
        sin perjuicio de las demás responsabilidades legales a cargo del deudor, renunciando 
        expresamente a su domicilio.</p>` : ''}
        
        <p><strong>DETALLE DEL EQUIPO:</strong><br>
        Modelo: ${results.modeloRecomendado} - ${results.rango}<br>
        Aplicación: ${results.aplicacion}<br>
        Precio total: USD $${results.precioEquipo.toFixed(2)}<br>
        Prima inicial (30%): USD $${results.primaInicial.toFixed(2)}<br>
        Monto financiado: USD $${results.montoFinanciado.toFixed(2)}</p>
        
        ${mostrarCuentas ? `<p><strong>INFORMACIÓN PARA PAGOS:</strong><br>
        Titular: ENERGY SAVER, SOCIEDAD ANONIMA<br>
        <strong>CUENTA COLONES:</strong> BAC San José 100-01-119-000019-1<br>
        IBAN: CR12015111910010000190<br>
        <strong>CUENTA DÓLARES:</strong> BAC San José 100-02-119-000012-0<br>
        IBAN: CR49015111910020000127<br>
        <br>
        <strong>FAVOR ENVIAR COMPROBANTE A:</strong> energysavercr@gmail.com</p>` : ''}
        
        <p>En fe de lo anterior, firmo en _________________, 
        el ${fechaHoy}.</p>
    </div>
    
    <div class="signature-section">
        <div style="text-align: center;">
            <div class="signature-line"></div><br>
            <strong>${nombre}</strong><br>
            ${cedula ? `Cédula: ${cedula}` : 'Cédula: _______________'}<br>
            DEUDOR
        </div>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 40px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Imprimir Pagaré
        </button>
    </div>
</body>
</html>
    `);
};

// Reemplazar función anterior si existe
if (window.generarPagare) {
    window.generarPagare = window.generarPagareCompleto;
}

// Actualizar botón si existe
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('generate-pagare-btn');
    if (btn) {
        btn.onclick = window.generarPagareCompleto;
    }
});

console.log('✅ Generador de pagaré completo instalado');
