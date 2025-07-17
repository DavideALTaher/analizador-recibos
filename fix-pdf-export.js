// Corrección para la exportación a PDF
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando corrección para exportación a PDF...');
    
    // Guardar la función original de exportación a PDF
    window.exportToPDFOriginal = window.exportToPDF;
    
    // Sobrescribir la función de exportación a PDF
    window.exportToPDF = function(analysis) {
        analysis = analysis || window.currentAnalysis;
        
        if (!analysis || !analysis.results) {
            alert('No hay resultados para exportar');
            return;
        }
        
        const results = analysis.results;
        
        // Formatear números
        const formatNumber = (num) => new Intl.NumberFormat('es-CR').format(Math.round(num));
        const formatColones = (num) => '₡' + formatNumber(num);
        
        try {
            // Crear nueva instancia de jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.text('Análisis de Recibos Eléctricos', 105, 15, { align: 'center' });
            
            // Datos del cliente
            doc.setFontSize(14);
            doc.text('Datos del Cliente', 15, 25);
            doc.setFontSize(12);
            doc.text(`Cliente: ${analysis.clientName}`, 15, 35);
            doc.text(`Fecha: ${new Date(analysis.date).toLocaleDateString()}`, 15, 42);
            doc.text(`Recibos analizados: ${analysis.receipts.length}`, 15, 49);
            
            // Información del modelo recomendado
            doc.setFontSize(14);
            doc.text('Equipo Recomendado', 15, 60);
            
            doc.setFontSize(12);
            doc.text(`Modelo: ${results.modeloRecomendado}`, 15, 70);
            doc.text(`Descripción: ${results.aplicacion} (${results.rango})`, 15, 77);
            doc.text(`Precio: ${formatColones(results.precioEquipo)}`, 15, 84);
            doc.text(`Prima Inicial: ${formatColones(results.primaInicial)}`, 15, 91);
            doc.text(`Cuota Mensual: ${formatColones(results.cuotaMensual)}`, 15, 98);
            
            // Resumen de consumo
            doc.setFontSize(14);
            doc.text('Resumen de Consumo', 15, 110);
            
            doc.setFontSize(12);
            doc.text(`Consumo Promedio: ${formatNumber(results.consumoPromedio)} kWh`, 15, 120);
            doc.text(`Demanda Promedio: ${results.demandaPromedio.toFixed(2)} kW`, 15, 127);
            doc.text(`Factor de Potencia Promedio: ${results.factorPotenciaPromedio.toFixed(2)}`, 15, 134);
            doc.text(`Factura Promedio: ${formatColones(results.montoPromedio)}`, 15, 141);
            
            // Análisis financiero con desglose de ahorros
            doc.setFontSize(14);
            doc.text('Análisis Financiero', 15, 155);
            
            doc.setFontSize(12);
            
            // Añadir desglose de ahorros si existen los campos
            let yPos = 165;
            if ('ahorroEnergetico' in results && 'ahorroMultas' in results) {
                doc.text(`Ahorro por Eficiencia Energética: ${formatColones(results.ahorroEnergetico)}`, 15, yPos);
                yPos += 7;
                doc.text(`Ahorro por Eliminación de Multas: ${formatColones(results.ahorroMultas)}`, 15, yPos);
                yPos += 7;
                doc.text(`Ahorro Total Mensual: ${formatColones(results.ahorroEstimado)}`, 15, yPos);
                yPos += 7;
            } else {
                doc.text(`Ahorro Estimado Mensual: ${formatColones(results.ahorroEstimado)}`, 15, yPos);
                yPos += 7;
            }
            
            doc.text(`Flujo Mensual: ${formatColones(results.ahorroNeto)}`, 15, yPos);
            yPos += 7;
            doc.text(`Tiempo de Recuperación: ${Math.ceil(results.tiempoRecuperacion)} meses`, 15, yPos);
            yPos += 7;
            doc.text(`Ahorro al Finalizar Financiamiento: ${formatColones(results.ahorroTotal24Meses)}`, 15, yPos);
            yPos += 7;
            doc.text(`Ahorro Total en 5 Años: ${formatColones(results.ahorro5Anos)}`, 15, yPos);
            
            // Tabla de flujo de caja (siguiente página)
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Comparativa de Flujo de Caja', 105, 15, { align: 'center' });
            
            // Datos para la tabla
            const tableData = [];
            
            // Encabezados - Versión con desglose si están disponibles los campos
            if (results.cashFlow && results.cashFlow.length > 0 && 'ahorroEnergetico' in results.cashFlow[0] && 'ahorroMultas' in results.cashFlow[0]) {
                tableData.push(['Período', 'Sin Equipo', 'Con Equipo (financiamiento)', 'Con Equipo (después)', 'Ahorro Energético', 'Ahorro Multas', 'Ahorro Acumulado']);
            } else {
                tableData.push(['Período', 'Sin Equipo', 'Con Equipo (financiamiento)', 'Con Equipo (después)', 'Ahorro Acumulado']);
            }
            
            // Filas
            for (let i = 0; i <= 36; i += 4) { // Reducimos el número de filas para que quepa en el PDF
                const flow = results.cashFlow[i];
                if (!flow) continue;
                
                let label = `Mes ${i}`;
                if (i === 0) label = 'Inversión Inicial';
                if (i === 24) label = 'Mes 24 (Fin de financiamiento)';
                if (i === 36) label = 'Mes 36 (3 años)';
                
                let sinEquipoText = i === 0 ? '₡0' : formatColones(flow.sinEquipo);
                let conFinanciamientoText = i === 0 ? `-${formatColones(flow.conEquipoFinanciamiento)}` : 
                                          i <= 24 ? formatColones(flow.conEquipoFinanciamiento) : 'N/A';
                let conDespuesText = i > 24 ? formatColones(flow.conEquipoDespues) : 'N/A';
                let ahorroText = flow.ahorroAcumulado >= 0 
                                ? formatColones(flow.ahorroAcumulado) 
                                : `-${formatColones(Math.abs(flow.ahorroAcumulado))}`;
                
                // Si tenemos los campos de desglose, incluirlos en la tabla
                if ('ahorroEnergetico' in flow && 'ahorroMultas' in flow) {
                    let ahorroEnergText = formatColones(flow.ahorroEnergetico);
                    let ahorroMultasText = formatColones(flow.ahorroMultas);
                    tableData.push([label, sinEquipoText, conFinanciamientoText, conDespuesText, ahorroEnergText, ahorroMultasText, ahorroText]);
                } else {
                    tableData.push([label, sinEquipoText, conFinanciamientoText, conDespuesText, ahorroText]);
                }
            }
            
            // Generar tabla en PDF
            doc.autoTable({
                head: [tableData[0]],
                body: tableData.slice(1),
                startY: 25,
                margin: { top: 20 },
                styles: {
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 249, 255]
                }
            });
            
            // Agregar pie de página
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
                doc.text('Análisis generado por Analizador de Recibos Eléctricos', 105, doc.internal.pageSize.height - 5, { align: 'center' });
            }
            
            // Guardar el PDF
            const filename = `analisis_${analysis.clientName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
            doc.save(filename);
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Hubo un error al exportar a PDF. Por favor, intente nuevamente.');
        }
    };
    
    console.log('Corrección para exportación a PDF implementada correctamente');
});
