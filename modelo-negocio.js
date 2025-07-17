// Implementación del modelo de negocio final
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando modelo de negocio final...');
    
    // 1. Configuración de los parámetros del modelo de negocio
    window.businessModel = {
        // Modelos de equipos y precios
        equipos: [
            {
                modelo: 'JS-1299',
                rango: '200A-450A',
                aplicacion: 'Residencial/Comercial pequeño',
                precioFinanciado: 3000,
                precioContado: 2700,
                instalacion: 300,
                primaTotal: 900,
                cuotaMensual: 87.50,
                porcentajeAhorro: 0.15
            },
            {
                modelo: 'JS-1699',
                rango: '451A-600A',
                aplicacion: 'Comercial mediano',
                precioFinanciado: 3800,
                precioContado: 3400,
                instalacion: 400,
                primaTotal: 1140,
                cuotaMensual: 110.83,
                porcentajeAhorro: 0.18
            },
            {
                modelo: 'JS-2099',
                rango: '601A-850A',
                aplicacion: 'Comercial grande',
                precioFinanciado: 4500,
                precioContado: 4050,
                instalacion: 450,
                primaTotal: 1350,
                cuotaMensual: 131.25,
                porcentajeAhorro: 0.22
            },
            {
                modelo: 'JS-2499',
                rango: '851A-1200A',
                aplicacion: 'Industrial',
                precioFinanciado: 5200,
                precioContado: 4680,
                instalacion: 520,
                primaTotal: 1560,
                cuotaMensual: 151.67,
                porcentajeAhorro: 0.25
            }
        ],
        
        // Parámetros para cálculo de multas por factor de potencia
        factorPotenciaMinimo: 0.90, // Por debajo de este valor se aplican multas
        multaFactorPotencia: function(factorActual, montoFactura) {
            if (factorActual >= this.factorPotenciaMinimo) return 0;
            
            // Calculamos el porcentaje de penalización
            // Fórmula aproximada basada en tarifas comunes:
            // Por cada 0.01 por debajo de 0.90, se penaliza con 1.5% de la factura
            const diferencia = this.factorPotenciaMinimo - factorActual;
            const porcentajeMulta = diferencia * 150; // 1.5% * 100 para tener el porcentaje
            
            return montoFactura * (porcentajeMulta / 100);
        },
        
        // Programa de referidos
        referidoDescuento: 1, // Una cuota mensual de descuento por referido
        referidoDescuentoNuevoCliente: 0.05, // 5% de descuento en prima para nuevos clientes referidos
        
        // Tipo de cambio USD/CRC
        tipoCambio: 500, // 500 colones por dólar
        
        // Convertir USD a colones
        usdToColones: function(montoUsd) {
            return montoUsd * this.tipoCambio;
        },
        
        // Convertir colones a USD
        colonesToUsd: function(montoColones) {
            return montoColones / this.tipoCambio;
        }
    };
    
    // 2. Modificar la función de análisis para incluir el doble ahorro
    window.analyzeReceiptsOriginal = window.analyzeReceipts; // Guardar la función original
    
    window.analyzeReceipts = function(receipts) {
        // Usar la función original como base
        const resultadosOriginales = window.analyzeReceiptsOriginal(receipts);
        
        // Calcular el ahorro adicional por eliminación de multas
        const factorPotenciaPromedio = resultadosOriginales.factorPotenciaPromedio;
        const montoPromedio = resultadosOriginales.montoPromedio;
        
        // Calcular multa mensual que se eliminaría
        const ahorroMultas = window.businessModel.multaFactorPotencia(factorPotenciaPromedio, montoPromedio);
        
        // Actualizar los resultados con el ahorro adicional
        const resultadosActualizados = {
            ...resultadosOriginales,
            ahorroEnergetico: resultadosOriginales.ahorroEstimado,
            ahorroMultas: ahorroMultas,
            ahorroEstimado: resultadosOriginales.ahorroEstimado + ahorroMultas,
            
            // Recalcular métricas financieras
            ahorroNeto: (resultadosOriginales.ahorroEstimado + ahorroMultas) - resultadosOriginales.cuotaMensual
        };
        
        // Recalcular tiempo de recuperación
        if (resultadosActualizados.ahorroNeto <= 0) {
            resultadosActualizados.tiempoRecuperacion = resultadosActualizados.primaInicial / resultadosActualizados.ahorroEstimado;
        } else {
            resultadosActualizados.tiempoRecuperacion = resultadosActualizados.primaInicial / resultadosActualizados.ahorroNeto;
        }
        
        // Recalcular ahorros a largo plazo
        resultadosActualizados.ahorroTotal24Meses = (resultadosActualizados.ahorroEstimado * 24) - resultadosActualizados.precioEquipo;
        resultadosActualizados.ahorro5Anos = (resultadosActualizados.ahorroEstimado * 60) - resultadosActualizados.primaInicial - (resultadosActualizados.cuotaMensual * 24);
        
        // Recalcular flujo de caja
        resultadosActualizados.cashFlow = [];
        for (let i = 0; i <= 36; i++) {
            let sinEquipo, conEquipoFinanciamiento, conEquipoDespues, ahorroMensual, ahorroAcumulado;
            
            const ahorroMensualTotal = resultadosActualizados.ahorroEstimado;
            
            if (i === 0) {
                // Mes 0: Solo prima inicial
                sinEquipo = 0;
                conEquipoFinanciamiento = resultadosActualizados.primaInicial;
                conEquipoDespues = null;
                ahorroMensual = -resultadosActualizados.primaInicial;
                ahorroAcumulado = -resultadosActualizados.primaInicial;
            } else {
                sinEquipo = montoPromedio;
                
                if (i <= 24) {
                    // Durante financiamiento
                    conEquipoFinanciamiento = montoPromedio - ahorroMensualTotal + resultadosActualizados.cuotaMensual;
                    conEquipoDespues = null;
                    ahorroMensual = ahorroMensualTotal - resultadosActualizados.cuotaMensual;
                } else {
                    // Después de financiamiento
                    conEquipoFinanciamiento = null;
                    conEquipoDespues = montoPromedio - ahorroMensualTotal;
                    ahorroMensual = ahorroMensualTotal;
                }
                
                // Cálculo de ahorro acumulado
                if (i === 1) {
                    ahorroAcumulado = ahorroMensual - resultadosActualizados.primaInicial;
                } else {
                    ahorroAcumulado = (i > 1 ? resultadosActualizados.cashFlow[i-1].ahorroAcumulado : 0) + ahorroMensual;
                }
            }
            
            resultadosActualizados.cashFlow.push({
                mes: i,
                sinEquipo,
                conEquipoFinanciamiento,
                conEquipoDespues,
                ahorroEnergetico: i === 0 ? 0 : resultadosOriginales.ahorroEstimado,
                ahorroMultas: i === 0 ? 0 : ahorroMultas,
                ahorroMensual,
                ahorroAcumulado
            });
        }
        
        return resultadosActualizados;
    };
    
    // 3. Modificar la función displayResults para mostrar el desglose de ahorros
    window.displayResultsOriginal = window.displayResults; // Guardar la función original
    
    window.displayResults = function(results) {
        // Llamar a la función original primero
        window.displayResultsOriginal(results);
        
        // Formatear números
        const formatNumber = (num) => new Intl.NumberFormat('es-CR').format(Math.round(num));
        const formatColones = (num) => '₡' + formatNumber(num);
        
        // Actualizar la sección de desglose de ahorros si existe
        const monthlyFlow = document.getElementById('net-flow');
        if (monthlyFlow) {
            // Crear sección de desglose si no existe
            const ahorroSection = document.getElementById('ahorro-desglose') || createAhorroDesglose();
            
            // Actualizar valores
            document.getElementById('ahorro-energetico').textContent = formatColones(results.ahorroEnergetico || results.ahorroEstimado);
            document.getElementById('ahorro-multas').textContent = formatColones(results.ahorroMultas || 0);
            document.getElementById('ahorro-total').textContent = formatColones(results.ahorroEstimado);
            
            // Actualizar texto del factor de potencia
            const factorInfo = document.getElementById('factor-info');
            if (factorInfo) {
                if ((results.factorPotenciaPromedio || 0) < window.businessModel.factorPotenciaMinimo) {
                    factorInfo.textContent = `(Factor de potencia ${results.factorPotenciaPromedio.toFixed(2)} está por debajo del mínimo requerido de ${window.businessModel.factorPotenciaMinimo})`;
                    factorInfo.classList.remove('hidden');
                } else {
                    factorInfo.textContent = `(Factor de potencia ${results.factorPotenciaPromedio.toFixed(2)} está por encima del mínimo requerido de ${window.businessModel.factorPotenciaMinimo})`;
                    factorInfo.classList.remove('hidden');
                }
            }
        }
        
        // Actualizar la tabla de flujo de caja si existe
        const cashFlowTable = document.querySelector('#cash-flow-table tbody');
        if (cashFlowTable && results.cashFlow) {
            cashFlowTable.innerHTML = '';
            
            results.cashFlow.forEach((flow, index) => {
                if (index > 25 && index < 35 && index % 3 !== 0) return; // Mostrar menos filas en el medio
                
                const row = document.createElement('tr');
                const isSpecialRow = index === 0 || index === 24 || index === 36;
                const isMonthRow = index % 12 === 0;
                
                row.className = isSpecialRow ? 'bg-blue-50' : isMonthRow ? 'bg-gray-50' : '';
                
                let label = `Mes ${index}`;
                if (index === 0) label = 'Inversión Inicial';
                if (index === 24) label += ' (Fin de financiamiento)';
                if (index === 36) label += ' (3 años)';
                
                let sinEquipoText = index === 0 ? '₡0' : formatColones(flow.sinEquipo);
                let conFinanciamientoText = index === 0 ? `-${formatColones(flow.conEquipoFinanciamiento)}` : 
                                          index <= 24 ? formatColones(flow.conEquipoFinanciamiento) : 'N/A';
                let conDespuesText = index > 24 ? formatColones(flow.conEquipoDespues) : 'N/A';
                let ahorroEnergText = formatColones(flow.ahorroEnergetico || 0);
                let ahorroMultasText = formatColones(flow.ahorroMultas || 0);
                let ahorroText = flow.ahorroAcumulado >= 0 
                                ? formatColones(flow.ahorroAcumulado) 
                                : `-${formatColones(Math.abs(flow.ahorroAcumulado))}`;
                
                row.innerHTML = `
                    <td class="px-4 py-3 ${isSpecialRow ? 'font-bold' : ''}">${label}</td>
                    <td class="px-4 py-3 text-right">${sinEquipoText}</td>
                    <td class="px-4 py-3 text-right">${conFinanciamientoText}</td>
                    <td class="px-4 py-3 text-right">${conDespuesText}</td>
                    <td class="px-4 py-3 text-right">${ahorroEnergText}</td>
                    <td class="px-4 py-3 text-right">${ahorroMultasText}</td>
                    <td class="px-4 py-3 text-right ${flow.ahorroAcumulado >= 0 ? 'text-green-600' : 'text-red-600'} ${isSpecialRow ? 'font-bold' : ''}">${ahorroText}</td>
                `;
                
                cashFlowTable.appendChild(row);
            });
        }
    };
    
    // Función auxiliar para crear la sección de desglose de ahorros
    function createAhorroDesglose() {
        // Encontrar el contenedor donde insertaremos el desglose
        const container = document.getElementById('monthly-savings').parentNode.parentNode;
        
        // Crear el elemento
        const desglose = document.createElement('div');
        desglose.id = 'ahorro-desglose';
        desglose.className = 'bg-green-50 p-4 rounded-lg border border-green-200 mt-4';
        desglose.innerHTML = `
            <h3 class="font-bold text-md mb-2 text-green-800">Desglose de Ahorros Mensuales</h3>
            <div class="grid grid-cols-1 gap-2">
                <div class="flex justify-between">
                    <span class="text-sm">Ahorro por Eficiencia Energética:</span>
                    <span id="ahorro-energetico" class="font-medium">₡0</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm">Ahorro por Eliminación de Multas:</span>
                    <span id="ahorro-multas" class="font-medium">₡0</span>
                    <span id="factor-info" class="text-xs text-gray-500 hidden"></span>
                </div>
                <div class="flex justify-between border-t pt-1 mt-1">
                    <span class="text-sm font-bold">Ahorro Total Mensual:</span>
                    <span id="ahorro-total" class="font-bold text-green-700">₡0</span>
                </div>
            </div>
        `;
        
        // Insertar después del contenedor de ahorro mensual
        container.appendChild(desglose);
        
        return desglose;
    }
    
    // 4. Modificar la cabecera de la tabla de flujo de caja
    const cashFlowTable = document.getElementById('cash-flow-table');
    if (cashFlowTable) {
        const thead = cashFlowTable.querySelector('thead');
        if (thead) {
            // Reemplazar la cabecera con la nueva que incluye columnas de desglose
            thead.innerHTML = `
                <tr>
                    <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                    <th class="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sin Equipo</th>
                    <th class="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Con Equipo (durante financiamiento)</th>
                    <th class="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Con Equipo (después de financiamiento)</th>
                    <th class="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Energético</th>
                    <th class="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Multas</th>
                    <th class="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Acumulado</th>
                </tr>
            `;
        }
    }
    
    // 5. Actualizar la interfaz con información del modelo de negocio
    const headerDescription = document.querySelector('header p');
    if (headerDescription) {
        headerDescription.innerHTML = 'Análisis de recibos eléctricos con cálculo de doble ahorro: eficiencia energética + eliminación de multas';
    }
    
    // Añadir información sobre el programa de referidos si estamos en la sección de resultados
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        // Buscar si ya existe la sección de programa de referidos
        if (!document.getElementById('referral-program')) {
            const referralDiv = document.createElement('div');
            referralDiv.id = 'referral-program';
            referralDiv.className = 'col-span-1 lg:col-span-2 bg-indigo-50 rounded-lg shadow-lg p-6 mt-6';
            referralDiv.innerHTML = `
                <h2 class="text-xl font-bold mb-4 text-indigo-800">Programa "Cliente Recomienda"</h2>
                <p class="mb-4">Reciba un descuento equivalente a una cuota mensual por cada cliente que refiera y que adquiera uno de nuestros equipos.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-4 rounded-lg border border-indigo-200">
                        <h3 class="font-bold text-lg mb-2 text-indigo-700">Para usted</h3>
                        <p>Por cada cliente referido que adquiera un equipo, usted recibe el equivalente a una cuota mensual de descuento.</p>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg border border-indigo-200">
                        <h3 class="font-bold text-lg mb-2 text-indigo-700">Para su referido</h3>
                        <p>Su referido recibe un 5% de descuento en la prima inicial al mencionar su código.</p>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg border border-indigo-200">
                        <h3 class="font-bold text-lg mb-2 text-indigo-700">Club Elite</h3>
                        <p>Al referir 3 o más clientes, ingresa al Club Elite con beneficios exclusivos y mantenimiento gratuito.</p>
                    </div>
                </div>
                
                <div class="mt-6 text-center">
                    <button id="referral-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded">
                        Solicitar mi código de referido
                    </button>
                </div>
            `;
            
            // Añadir al final de la sección de resultados
            resultsSection.appendChild(referralDiv);
            
            // Añadir evento al botón
            document.getElementById('referral-btn').addEventListener('click', function() {
                alert('¡Gracias por su interés! Un asesor se pondrá en contacto con usted para proporcionarle su código de referido personalizado.');
            });
        }
    }
    
    console.log('Modelo de negocio implementado correctamente');
});
