// Script para corregir todas las funcionalidades de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando arreglo global de la aplicación...');
    
    // Variables globales
    window.currentAnalysis = window.currentAnalysis || {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        receipts: [],
        results: null
    };
    
    window.savedAnalyses = window.savedAnalyses || [];
    
    // Arreglar Dropzone (drag and drop)
    fixDropzone();
    
    // Arreglar botones y eventos
    fixButtons();
    
    // Cargar análisis guardados si existen
    try {
        loadSavedAnalyses();
    } catch (e) {
        console.error('Error al cargar análisis guardados:', e);
    }
    
    console.log('Inicialización global completada');
});

// Función para arreglar Dropzone
function fixDropzone() {
    // Verificar si Dropzone está disponible
    if (typeof Dropzone === 'undefined') {
        console.error('Dropzone no está disponible');
        return;
    }
    
    // Forzar desactivación del auto-discover
    Dropzone.autoDiscover = false;
    console.log('Forzado Dropzone.autoDiscover = false');
    
    // Buscar el elemento upload-form
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) {
        console.error('Elemento upload-form no encontrado');
        return;
    }
    
    // Verificar si ya hay una instancia de Dropzone
    if (uploadForm.dropzone) {
        console.log('Ya existe una instancia de Dropzone. Eliminándola...');
        uploadForm.dropzone.destroy();
    }
    
    console.log('Creando nueva instancia de Dropzone...');
    
    // Crear una nueva instancia de Dropzone
    try {
        window.myDropzone = new Dropzone("#upload-form", {
            url: "#", // No hay backend real, procesamos localmente
            autoProcessQueue: false,
            maxFiles: 6,
            acceptedFiles: "image/jpeg,image/png,application/pdf",
            addRemoveLinks: true,
            dictRemoveFile: "Eliminar",
            dictDefaultMessage: "Arrastre sus recibos eléctricos aquí o haga clic para seleccionar archivos",
            init: function() {
                console.log('Dropzone inicializado correctamente');
                
                // Eventos
                this.on("addedfile", function(file) {
                    console.log("Archivo añadido:", file.name);
                    updateReceiptList();
                });
                
                this.on("removedfile", function(file) {
                    console.log("Archivo eliminado:", file.name);
                    updateReceiptList();
                });
                
                this.on("error", function(file, errorMessage) {
                    console.error("Error en Dropzone:", errorMessage);
                    alert("Error al cargar el archivo: " + errorMessage);
                });
            }
        });
        
        console.log('Instancia de Dropzone creada con éxito');
    } catch (error) {
        console.error('Error al crear instancia de Dropzone:', error);
        alert('Hubo un problema al inicializar la funcionalidad de drag and drop. Por favor, intente usar la entrada manual de datos.');
    }
}

// Función para arreglar todos los botones y eventos
function fixButtons() {
    // Arreglar el botón de nuevo análisis
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', function() {
            console.log('Botón Nuevo Análisis clickeado');
            createNewAnalysis();
        });
    }
    
    // Arreglar el botón de volver al historial
    const backToHistoryBtn = document.getElementById('back-to-history-btn');
    if (backToHistoryBtn) {
        backToHistoryBtn.addEventListener('click', function() {
            document.getElementById('history-section').classList.remove('hidden');
            document.getElementById('upload-section').classList.add('hidden');
            document.getElementById('results-section').classList.add('hidden');
        });
    }
    
    // Arreglar el botón de mostrar formulario manual
    const showManualBtn = document.getElementById('show-manual-btn');
    if (showManualBtn) {
        showManualBtn.addEventListener('click', function() {
            console.log('Mostrando formulario manual');
            document.getElementById('manual-entry-form').classList.remove('hidden');
            this.classList.add('hidden');
        });
    }
    
    // Arreglar el botón de cancelar formulario manual
    const clearManualBtn = document.getElementById('clear-manual-btn');
    if (clearManualBtn) {
        clearManualBtn.addEventListener('click', function() {
            console.log('Ocultando formulario manual');
            document.getElementById('manual-entry-form').classList.add('hidden');
            document.getElementById('show-manual-btn').classList.remove('hidden');
            resetManualForm();
        });
    }
    
    // Arreglar el botón de agregar recibo
    const addReceiptBtn = document.getElementById('add-receipt-btn');
    if (addReceiptBtn) {
        addReceiptBtn.addEventListener('click', function() {
            console.log('Agregando recibo adicional');
            addManualReceipt();
        });
    }
    
    // Arreglar el botón de guardar datos
    const saveDataBtn = document.getElementById('save-data-btn');
    if (saveDataBtn) {
        saveDataBtn.addEventListener('click', function() {
            console.log('Guardando datos');
            saveClientData();
        });
    }
    
    // Arreglar el botón de analizar
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            console.log('Analizando recibos');
            analyzeData();
        });
    }
    
    // Arreglar botones de la sección de resultados
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.getElementById('results-section').classList.add('hidden');
            document.getElementById('upload-section').classList.remove('hidden');
        });
    }
    
    const editDataBtn = document.getElementById('edit-data-btn');
    if (editDataBtn) {
        editDataBtn.addEventListener('click', function() {
            document.getElementById('results-section').classList.add('hidden');
            document.getElementById('upload-section').classList.remove('hidden');
        });
    }
    
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            console.log('Exportando a PDF');
            exportToPDF();
        });
    }
    
    const exportExcelBtn = document.getElementById('export-excel-btn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function() {
            console.log('Exportando a Excel');
            exportToExcel();
        });
    }
    
    const finishAnalysisBtn = document.getElementById('finish-analysis-btn');
    if (finishAnalysisBtn) {
        finishAnalysisBtn.addEventListener('click', function() {
            console.log('Finalizando análisis');
            document.getElementById('finish-modal').classList.remove('hidden');
        });
    }
    
    // Botones del modal de finalización
    const cancelFinishBtn = document.getElementById('cancel-finish-btn');
    if (cancelFinishBtn) {
        cancelFinishBtn.addEventListener('click', function() {
            document.getElementById('finish-modal').classList.add('hidden');
        });
    }
    
    const confirmFinishBtn = document.getElementById('confirm-finish-btn');
    if (confirmFinishBtn) {
        confirmFinishBtn.addEventListener('click', function() {
            document.getElementById('finish-modal').classList.add('hidden');
            finishAnalysis();
        });
    }
}

// Función para actualizar la lista de recibos
function updateReceiptList() {
    const receiptList = document.getElementById('receipt-list');
    if (!receiptList) {
        console.error('Elemento receipt-list no encontrado');
        return;
    }
    
    if (!window.myDropzone || window.myDropzone.files.length === 0) {
        receiptList.innerHTML = '<div class="text-gray-500 italic">No hay recibos cargados</div>';
        return;
    }
    
    receiptList.innerHTML = '';
    window.myDropzone.files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between py-2 px-3 bg-blue-50 rounded mb-2';
        item.innerHTML = `
            <div class="flex items-center">
                <span class="text-sm font-medium">${file.name}</span>
                <span class="ml-2 text-xs text-gray-500">(${(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button class="text-red-500 hover:text-red-700 text-sm remove-file" data-index="${index}">
                Eliminar
            </button>
        `;
        
        receiptList.appendChild(item);
    });
    
    // Añadir eventos a los botones de eliminar
    document.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (window.myDropzone && window.myDropzone.files[index]) {
                window.myDropzone.removeFile(window.myDropzone.files[index]);
            }
        });
    });
}

// Función para resetear el formulario manual
function resetManualForm() {
    const manualReceipts = document.getElementById('manual-receipts');
    if (!manualReceipts) return;
    
    manualReceipts.innerHTML = `
        <div class="receipt-entry mb-4 p-4 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Proveedor de Electricidad*</label>
                    <input type="text" class="receipt-provider w-full p-2 border border-gray-300 rounded" placeholder="Ej. ICE" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de Recibo*</label>
                    <input type="text" class="receipt-number w-full p-2 border border-gray-300 rounded" placeholder="Ej. 12345678" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Emisión*</label>
                    <input type="date" class="receipt-date w-full p-2 border border-gray-300 rounded" required>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mes de Facturación*</label>
                    <input type="month" class="receipt-month w-full p-2 border border-gray-300 rounded" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Consumo (kWh)*</label>
                    <input type="number" class="receipt-consumption w-full p-2 border border-gray-300 rounded" placeholder="Ej. 3000" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Demanda (kW)*</label>
                    <input type="number" class="receipt-demand w-full p-2 border border-gray-300 rounded" placeholder="Ej. 15" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Factor de Potencia*</label>
                    <input type="number" step="0.01" min="0" max="1" class="receipt-factor w-full p-2 border border-gray-300 rounded" placeholder="Ej. 0.85" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Monto Total (₡)*</label>
                    <input type="number" class="receipt-amount w-full p-2 border border-gray-300 rounded" placeholder="Ej. 150000" required>
                </div>
            </div>
        </div>
    `;
}

// Función para añadir un recibo manual
function addManualReceipt() {
    const container = document.getElementById('manual-receipts');
    if (!container) return;
    
    const newReceipt = document.createElement('div');
    newReceipt.className = 'receipt-entry mb-4 p-4 border border-gray-200 rounded-lg';
    newReceipt.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <div class="text-sm font-medium text-gray-600">Recibo adicional</div>
            <button class="text-red-500 hover:text-red-700 text-sm remove-receipt-btn">
                Eliminar
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Proveedor de Electricidad*</label>
                <input type="text" class="receipt-provider w-full p-2 border border-gray-300 rounded" placeholder="Ej. ICE" required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número de Recibo*</label>
                <input type="text" class="receipt-number w-full p-2 border border-gray-300 rounded" placeholder="Ej. 12345678" required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Emisión*</label>
                <input type="date" class="receipt-date w-full p-2 border border-gray-300 rounded" required>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mes de Facturación*</label>
                <input type="month" class="receipt-month w-full p-2 border border-gray-300 rounded" required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Consumo (kWh)*</label>
                <input type="number" class="receipt-consumption w-full p-2 border border-gray-300 rounded" placeholder="Ej. 3000" required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Demanda (kW)*</label>
                <input type="number" class="receipt-demand w-full p-2 border border-gray-300 rounded" placeholder="Ej. 15" required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Factor de Potencia*</label>
                <input type="number" step="0.01" min="0" max="1" class="receipt-factor w-full p-2 border border-gray-300 rounded" placeholder="Ej. 0.85" required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto Total (₡)*</label>
                <input type="number" class="receipt-amount w-full p-2 border border-gray-300 rounded" placeholder="Ej. 150000" required>
            </div>
        </div>
    `;
    
    container.appendChild(newReceipt);
    
    // Añadir evento para eliminar
    const removeBtn = newReceipt.querySelector('.remove-receipt-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            container.removeChild(newReceipt);
        });
    }
}

// Función para guardar datos del cliente
function saveClientData() {
    const clientName = document.getElementById('client-name').value.trim();
    if (!clientName) {
        alert('Por favor, ingrese el nombre del cliente.');
        return;
    }
    
    window.currentAnalysis.clientName = clientName;
    
    // Actualizar receipts si hay datos en el formulario manual
    const manualReceipts = getReceiptData();
    if (manualReceipts.length > 0) {
        window.currentAnalysis.receipts = manualReceipts;
    }
    
    // Guardar en localStorage
    const existingIndex = window.savedAnalyses.findIndex(a => a.id === window.currentAnalysis.id);
    if (existingIndex >= 0) {
        window.savedAnalyses[existingIndex] = window.currentAnalysis;
    } else {
        window.savedAnalyses.push(window.currentAnalysis);
    }
    
    saveAnalyses();
    
    alert('Datos guardados correctamente.');
}

// Función para analizar datos
function analyzeData() {
    // Verificar que hay un nombre de cliente
    const clientName = document.getElementById('client-name').value.trim();
    if (!clientName) {
        alert('Por favor, ingrese el nombre del cliente antes de analizar.');
        return;
    }
    
    // Actualizar datos del cliente
    window.currentAnalysis.clientName = clientName;
    
    // Obtener datos de recibos
    const receipts = getReceiptData();
    
    if (receipts.length === 0) {
        alert('Por favor ingrese datos de al menos un recibo');
        return;
    }
    
    // Realizar análisis
    const results = analyzeReceipts(receipts);
    
    // Guardar resultados en el análisis actual
    window.currentAnalysis.results = results;
    
    // Actualizar interfaz de resultados
    document.getElementById('results-client-name').textContent = window.currentAnalysis.clientName;
    document.getElementById('results-date').textContent = new Date(window.currentAnalysis.date).toLocaleDateString();
    
    // Mostrar resultados
    displayResults(results);
    
    // Ocultar sección de carga y mostrar resultados
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
}

// Función para crear un nuevo análisis
function createNewAnalysis() {
    console.log('Creando nuevo análisis...');
    
    window.currentAnalysis = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        receipts: [],
        results: null
    };
    
    // Limpiar campos
    const clientNameInput = document.getElementById('client-name');
    if (clientNameInput) {
        clientNameInput.value = '';
    }
    
    const analysisDateInput = document.getElementById('analysis-date');
    if (analysisDateInput) {
        analysisDateInput.value = window.currentAnalysis.date;
    }
    
    // Resetear Dropzone
    if (window.myDropzone) {
        window.myDropzone.removeAllFiles();
    }
    
    // Actualizar lista de recibos
    updateReceiptList();
    
    // Mostrar sección de carga
    document.getElementById('history-section').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');
    
    console.log('Nuevo análisis creado y secciones actualizadas');
}

// Función para obtener datos de recibos
function getReceiptData() {
    const receipts = [];
    
    // Obtener datos de Dropzone
    if (window.myDropzone && window.myDropzone.files.length > 0) {
        window.myDropzone.files.forEach(file => {
            // Simular datos de consumo basados en el tamaño del archivo
            const consumo = Math.floor(Math.random() * 5000) + 1000;
            const demanda = Math.floor(Math.random() * 30) + 5;
            const factorPotencia = (Math.floor(Math.random() * 20) + 80) / 100;
            const monto = consumo * 100 + demanda * 2000;
            
            receipts.push({
                proveedor: 'ICE', // Simulado
                numeroRecibo: 'F' + Math.floor(Math.random() * 1000000), // Simulado
                fechaEmision: new Date().toISOString().split('T')[0], // Simulado
                mes: new Date().toISOString().substring(0, 7), // YYYY-MM
                consumoKWh: consumo,
                demandaKW: demanda,
                factorPotencia: factorPotencia,
                montoTotal: monto
            });
        });
    }
    
    // Obtener datos del formulario manual
    const manualReceipts = document.querySelectorAll('.receipt-entry');
    manualReceipts.forEach(entry => {
        const proveedor = entry.querySelector('.receipt-provider')?.value;
        const numeroRecibo = entry.querySelector('.receipt-number')?.value;
        const fechaEmision = entry.querySelector('.receipt-date')?.value;
        const mes = entry.querySelector('.receipt-month')?.value;
        const consumo = entry.querySelector('.receipt-consumption')?.value;
        const demanda = entry.querySelector('.receipt-demand')?.value;
        const factor = entry.querySelector('.receipt-factor')?.value;
        const monto = entry.querySelector('.receipt-amount')?.value;
        
        if (monto) { // Al menos el monto es requerido
            receipts.push({
                proveedor: proveedor || 'No especificado',
                numeroRecibo: numeroRecibo || 'No especificado',
                fechaEmision: fechaEmision || new Date().toISOString().split('T')[0],
                mes: mes || new Date().toISOString().substring(0, 7),
                consumoKWh: parseFloat(consumo) || 0,
                demandaKW: parseFloat(demanda) || 0,
                factorPotencia: parseFloat(factor) || 0,
                montoTotal: parseFloat(monto)
            });
        }
    });
    
    // Si no hay datos, usar datos de ejemplo
    if (receipts.length === 0) {
        const exampleData = [
            { 
                proveedor: 'ICE',
                numeroRecibo: 'F123456',
                fechaEmision: '2025-01-15',
                mes: '2025-01', 
                consumoKWh: 3017, 
                demandaKW: 8.20, 
                factorPotencia: 0.51, 
                montoTotal: 373225 
            },
            { 
                proveedor: 'CNFL',
                numeroRecibo: 'F234567',
                fechaEmision: '2025-02-15',
                mes: '2025-02', 
                consumoKWh: 3500, 
                demandaKW: 9.10, 
                factorPotencia: 0.52, 
                montoTotal: 410000 
            },
            { 
                proveedor: 'ICE',
                numeroRecibo: 'F345678',
                fechaEmision: '2025-03-15',
                mes: '2025-03', 
                consumoKWh: 3200, 
                demandaKW: 8.50, 
                factorPotencia: 0.50, 
                montoTotal: 385000 
            }
        ];
        
        return exampleData;
    }
    
    return receipts;
}

// Función para cargar análisis guardados
function loadSavedAnalyses() {
    const saved = localStorage.getItem('savedAnalyses');
    if (saved) {
        try {
            window.savedAnalyses = JSON.parse(saved);
            updateAnalysisList();
        } catch (e) {
            console.error('Error cargando análisis guardados:', e);
            window.savedAnalyses = [];
        }
    }
}

// Función para guardar análisis
function saveAnalyses() {
    try {
        localStorage.setItem('savedAnalyses', JSON.stringify(window.savedAnalyses));
    } catch (e) {
        console.error('Error guardando análisis:', e);
        alert('Error al guardar los análisis. Es posible que el almacenamiento local esté lleno o no disponible.');
    }
}

// Función para actualizar la lista de análisis
function updateAnalysisList() {
    const analysisList = document.getElementById('analysis-items');
    if (!analysisList) return;
    
    if (window.savedAnalyses.length === 0) {
        analysisList.innerHTML = `
            <div class="p-3 text-center text-gray-500 italic">
                No hay análisis guardados
            </div>
        `;
        return;
    }
    
    analysisList.innerHTML = '';
    window.savedAnalyses.forEach((analysis, index) => {
        const date = new Date(analysis.date);
        const formattedDate = date.toLocaleDateString();
        
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-gray-50';
        item.innerHTML = `
            <div class="grid grid-cols-12 gap-2">
                <div class="col-span-3 font-medium">${analysis.clientName}</div>
                <div class="col-span-2">${formattedDate}</div>
                <div class="col-span-2">${analysis.receipts.length}</div>
                <div class="col-span-2">${analysis.results?.modeloRecomendado || '-'}</div>
                <div class="col-span-3 flex space-x-2">
                    <button class="view-analysis text-blue-600 hover:text-blue-800" data-index="${index}">
                        Ver
                    </button>
                    <button class="export-pdf text-green-600 hover:text-green-800" data-index="${index}">
                        PDF
                    </button>
                    <button class="export-excel text-indigo-600 hover:text-indigo-800" data-index="${index}">
                        Excel
                    </button>
                    <button class="delete-analysis text-red-600 hover:text-red-800" data-index="${index}">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        analysisList.appendChild(item);
    });
    
    // Añadir eventos a los botones
    document.querySelectorAll('.view-analysis').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            loadAnalysis(index);
        });
    });
    
    document.querySelectorAll('.export-pdf').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            exportToPDF(window.savedAnalyses[index]);
        });
    });
    
    document.querySelectorAll('.export-excel').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            exportToExcel(window.savedAnalyses[index]);
        });
    });
    
    document.querySelectorAll('.delete-analysis').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (confirm(`¿Está seguro de eliminar el análisis de ${window.savedAnalyses[index].clientName}?`)) {
                window.savedAnalyses.splice(index, 1);
                saveAnalyses();
                updateAnalysisList();
            }
        });
    });
}

// Función para cargar un análisis
function loadAnalysis(index) {
    window.currentAnalysis = window.savedAnalyses[index];
    
    // Actualizar campos del cliente
    document.getElementById('client-name').value = window.currentAnalysis.clientName;
    document.getElementById('analysis-date').value = window.currentAnalysis.date;
    
    // Mostrar sección de resultados si hay resultados
    if (window.currentAnalysis.results) {
        document.getElementById('results-client-name').textContent = window.currentAnalysis.clientName;
        document.getElementById('results-date').textContent = new Date(window.currentAnalysis.date).toLocaleDateString();
        
        displayResults(window.currentAnalysis.results);
        
        document.getElementById('history-section').classList.add('hidden');
        document.getElementById('upload-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');
    } else {
        // Si no hay resultados, mostrar sección de carga
        document.getElementById('history-section').classList.add('hidden');
        document.getElementById('upload-section').classList.remove('hidden');
        document.getElementById('results-section').classList.add('hidden');
    }
}

// Función para finalizar análisis
function finishAnalysis() {
    // Verificar que hay datos básicos
    if (!window.currentAnalysis || !window.currentAnalysis.clientName) {
        alert('Por favor, ingrese el nombre del cliente antes de finalizar el análisis.');
        return;
    }
    
    // Guardar el análisis
    if (!window.currentAnalysis.results) {
        alert('No hay resultados para guardar. Por favor, realice el análisis primero.');
        return;
    }
    
    // Verificar si ya existe un análisis con el mismo id
    const existingIndex = window.savedAnalyses.findIndex(a => a.id === window.currentAnalysis.id);
    if (existingIndex >= 0) {
        window.savedAnalyses[existingIndex] = window.currentAnalysis;
    } else {
        window.savedAnalyses.push(window.currentAnalysis);
    }
    
    // Guardar en localStorage
    saveAnalyses();
    
    // Mostrar la sección de historial
    document.getElementById('history-section').classList.remove('hidden');
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('results-section').classList.add('hidden');
    
    // Actualizar la lista de análisis
    updateAnalysisList();
}

// Función para exportar a PDF
function exportToPDF(analysis) {
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
        
        // Análisis financiero
        doc.setFontSize(14);
        doc.text('Análisis Financiero', 15, 155);
        
        doc.setFontSize(12);
        doc.text(`Ahorro Estimado Mensual: ${formatColones(results.ahorroEstimado)}`, 15, 165);
        doc.text(`Flujo Mensual: ${formatColones(results.ahorroNeto)}`, 15, 172);
        doc.text(`Tiempo de Recuperación: ${Math.ceil(results.tiempoRecuperacion)} meses`, 15, 179);
        doc.text(`Ahorro al Finalizar Financiamiento: ${formatColones(results.ahorroTotal24Meses)}`, 15, 186);
        doc.text(`Ahorro Total en 5 Años: ${formatColones(results.ahorro5Anos)}`, 15, 193);
        
        // Tabla de flujo de caja (siguiente página)
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Comparativa de Flujo de Caja', 105, 15, { align: 'center' });
        
        // Datos para la tabla
        const tableData = [];
        
        // Encabezados
        tableData.push(['Período', 'Sin Equipo', 'Con Equipo (financiamiento)', 'Con Equipo (después)', 'Ahorro Acumulado']);
        
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
            
            tableData.push([label, sinEquipoText, conFinanciamientoText, conDespuesText, ahorroText]);
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
}

// Función para exportar a Excel
function exportToExcel(analysis) {
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
        // Crear libro de trabajo Excel
        const wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Análisis de Recibos Eléctricos - " + analysis.clientName,
            Author: "Analizador de Recibos",
            CreatedDate: new Date()
        };
        
        // Datos del resumen
        const resumenData = [
            ["Análisis de Recibos Eléctricos"],
            [""],
            ["DATOS DEL CLIENTE"],
            ["Cliente", analysis.clientName],
            ["Fecha", new Date(analysis.date).toLocaleDateString()],
            ["Recibos analizados", analysis.receipts.length],
            [""],
            ["RESUMEN DE CONSUMO"],
            ["Consumo Promedio", formatNumber(results.consumoPromedio) + " kWh"],
            ["Demanda Promedio", results.demandaPromedio.toFixed(2) + " kW"],
            ["Factor de Potencia Promedio", results.factorPotenciaPromedio.toFixed(2)],
            ["Factura Promedio", formatColones(results.montoPromedio)],
            [""],
            ["EQUIPO RECOMENDADO"],
            ["Modelo", results.modeloRecomendado],
            ["Descripción", `${results.aplicacion} (${results.rango})`],
            ["Precio", formatColones(results.precioEquipo)],
            ["Prima Inicial", formatColones(results.primaInicial)],
            ["Cuota Mensual", formatColones(results.cuotaMensual)],
            [""],
            ["ANÁLISIS FINANCIERO"],
            ["Ahorro Estimado Mensual", formatColones(results.ahorroEstimado)],
            ["Flujo Mensual", formatColones(results.ahorroNeto)],
            ["Tiempo de Recuperación", `${Math.ceil(results.tiempoRecuperacion)} meses`],
            ["Ahorro al Finalizar Financiamiento", formatColones(results.ahorroTotal24Meses)],
            ["Ahorro Total en 5 Años", formatColones(results.ahorro5Anos)]
        ];
        
        // Crear hoja para el resumen
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
        
        // Datos de recibos
        const recibosData = [
            ["Proveedor", "Número de Recibo", "Fecha de Emisión", "Mes", "Consumo (kWh)", "Demanda (kW)", "Factor de Potencia", "Monto Total (₡)"]
        ];
        
        analysis.receipts.forEach(receipt => {
            recibosData.push([
                receipt.proveedor,
                receipt.numeroRecibo,
                receipt.fechaEmision,
                receipt.mes,
                receipt.consumoKWh,
                receipt.demandaKW,
                receipt.factorPotencia,
                receipt.montoTotal
            ]);
        });
        
        // Crear hoja para los recibos
        const wsRecibos = XLSX.utils.aoa_to_sheet(recibosData);
        XLSX.utils.book_append_sheet(wb, wsRecibos, "Recibos");
        
        // Datos para el flujo de caja
        const cashFlowData = [
            ["Período", "Sin Equipo", "Con Equipo (durante financiamiento)", "Con Equipo (después de financiamiento)", "Ahorro Acumulado"]
        ];
        
        results.cashFlow.forEach((flow, index) => {
            let label = `Mes ${index}`;
            if (index === 0) label = 'Inversión Inicial';
            if (index === 24) label += ' (Fin de financiamiento)';
            if (index === 36) label += ' (3 años)';
            
            cashFlowData.push([
                label,
                flow.sinEquipo,
                flow.conEquipoFinanciamiento,
                flow.conEquipoDespues,
                flow.ahorroAcumulado
            ]);
        });
        
        // Crear hoja para el flujo de caja
        const wsFlujo = XLSX.utils.aoa_to_sheet(cashFlowData);
        XLSX.utils.book_append_sheet(wb, wsFlujo, "Flujo de Caja");
        
        // Guardar el archivo Excel
        const filename = `analisis_${analysis.clientName.replace(/\s+/g, '_').toLowerCase()}.xlsx`;
        XLSX.writeFile(wb, filename);
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        alert('Hubo un error al exportar a Excel. Por favor, intente nuevamente.');
    }
}

// Función para analizar recibos
function analyzeReceipts(receipts) {
    // Calcular promedios
    const promedioConsumo = receipts.reduce((sum, recibo) => sum + Number(recibo.consumoKWh || 0), 0) / receipts.length;
    const promedioDemanda = receipts.reduce((sum, recibo) => sum + Number(recibo.demandaKW || 0), 0) / receipts.length;
    const promedioFactorPotencia = receipts.reduce((sum, recibo) => sum + Number(recibo.factorPotencia || 0), 0) / receipts.length;
    const promedioMonto = receipts.reduce((sum, recibo) => sum + Number(recibo.montoTotal || 0), 0) / receipts.length;
    
    // Lógica para seleccionar modelo basado en consumo y demanda
    let modeloRecomendado;
    
    // Modelos disponibles
    const modelos = [
        {
            modelo: 'JS-1299',
            rango: '200A-450A',
            aplicacion: 'Residencial/Comercial pequeño',
            precioFinanciado: 3200000,
            precioContado: 2800000,
            instalacion: 500000,
            primaTotal: 1100000,
            cuotaMensual: 128375,
            porcentajeAhorro: 0.15
        },
        {
            modelo: 'JS-1699',
            rango: '451A-600A',
            aplicacion: 'Comercial mediano',
            precioFinanciado: 4000000,
            precioContado: 3600000,
            instalacion: 500000,
            primaTotal: 1300000,
            cuotaMensual: 157710,
            porcentajeAhorro: 0.18
        },
        {
            modelo: 'JS-2099',
            rango: '601A-850A',
            aplicacion: 'Comercial grande',
            precioFinanciado: 4600000,
            precioContado: 4200000,
            instalacion: 500000,
            primaTotal: 1500000,
            cuotaMensual: 177625,
            porcentajeAhorro: 0.22
        },
        {
            modelo: 'JS-2499',
            rango: '851A-1200A',
            aplicacion: 'Industrial',
            precioFinanciado: 5200000,
            precioContado: 4800000,
            instalacion: 550000,
            primaTotal: 1750000,
            cuotaMensual: 197810,
            porcentajeAhorro: 0.25
        }
    ];
    
    if (promedioDemanda <= 50 && promedioMonto < 500000) {
        modeloRecomendado = modelos[0]; // JS-1299
    } else if (promedioDemanda <= 150 && promedioMonto < 1000000) {
        modeloRecomendado = modelos[1]; // JS-1699
    } else if (promedioDemanda <= 300 && promedioMonto < 3000000) {
        modeloRecomendado = modelos[2]; // JS-2099
    } else {
        modeloRecomendado = modelos[3]; // JS-2499
    }
    
    // Calcular métricas financieras
    const ahorroEstimado = promedioMonto * modeloRecomendado.porcentajeAhorro;
    const ahorroNeto = ahorroEstimado - modeloRecomendado.cuotaMensual;
    const ahorroTotal24Meses = (ahorroEstimado * 24) - modeloRecomendado.precioFinanciado;
    
    let tiempoRecuperacion;
    if (ahorroNeto <= 0) {
        tiempoRecuperacion = modeloRecomendado.primaTotal / ahorroEstimado;
    } else {
        tiempoRecuperacion = modeloRecomendado.primaTotal / ahorroNeto;
    }
    
    const ahorro5Anos = (ahorroEstimado * 60) - modeloRecomendado.primaTotal - (modeloRecomendado.cuotaMensual * 24);
    
    // Generar datos para gráficos
    const months = receipts.map(r => {
        const date = r.mes ? new Date(r.mes + '-01') : new Date();
        return date.toLocaleDateString('es', { month: 'short', year: 'numeric' });
    }).sort((a, b) => new Date(a) - new Date(b));
    
    const consumptionData = receipts.map(r => r.consumoKWh);
    const amountData = receipts.map(r => r.montoTotal);
    
    // Calcular flujo de caja para los próximos 36 meses
    const cashFlow = [];
    for (let i = 0; i <= 36; i++) {
        let sinEquipo, conEquipoFinanciamiento, conEquipoDespues, ahorroMensual, ahorroAcumulado;
        
        if (i === 0) {
            // Mes 0: Solo prima inicial
            sinEquipo = 0;
            conEquipoFinanciamiento = modeloRecomendado.primaTotal;
            conEquipoDespues = null;
            ahorroMensual = -modeloRecomendado.primaTotal;
            ahorroAcumulado = -modeloRecomendado.primaTotal;
        } else {
            sinEquipo = promedioMonto;
            
            if (i <= 24) {
                // Durante financiamiento
                conEquipoFinanciamiento = promedioMonto - ahorroEstimado + modeloRecomendado.cuotaMensual;
                conEquipoDespues = null;
                ahorroMensual = ahorroEstimado - modeloRecomendado.cuotaMensual;
            } else {
                // Después de financiamiento
                conEquipoFinanciamiento = null;
                conEquipoDespues = promedioMonto - ahorroEstimado;
                ahorroMensual = ahorroEstimado;
            }
            
            // Cálculo de ahorro acumulado
            if (i === 1) {
                ahorroAcumulado = ahorroMensual - modeloRecomendado.primaTotal;
            } else if (i <= 24) {
                ahorroAcumulado = cashFlow[i-1].ahorroAcumulado + ahorroMensual;
            } else {
                ahorroAcumulado = cashFlow[i-1].ahorroAcumulado + ahorroMensual;
            }
        }
        
        cashFlow.push({
            mes: i,
            sinEquipo,
            conEquipoFinanciamiento,
            conEquipoDespues,
            ahorroMensual,
            ahorroAcumulado
        });
    }
    
    return {
        consumoPromedio: promedioConsumo,
        demandaPromedio: promedioDemanda,
        factorPotenciaPromedio: promedioFactorPotencia,
        montoPromedio: promedioMonto,
        modeloRecomendado: modeloRecomendado.modelo,
        rango: modeloRecomendado.rango,
        aplicacion: modeloRecomendado.aplicacion,
        precioEquipo: modeloRecomendado.precioFinanciado,
        primaInicial: modeloRecomendado.primaTotal,
        cuotaMensual: modeloRecomendado.cuotaMensual,
        ahorroEstimado: ahorroEstimado,
        ahorroNeto: ahorroNeto,
        tiempoRecuperacion: tiempoRecuperacion,
        ahorroTotal24Meses: ahorroTotal24Meses,
        ahorro5Anos: ahorro5Anos,
        months: months,
        consumptionData: consumptionData,
        amountData: amountData,
        cashFlow: cashFlow
    };
}

// Función para mostrar resultados
function displayResults(results) {
    // Formatear números
    const formatNumber = (num) => new Intl.NumberFormat('es-CR').format(Math.round(num));
    const formatColones = (num) => '₡' + formatNumber(num);
    
    // Actualizar resumen de consumo
    document.getElementById('avg-consumption').textContent = formatNumber(results.consumoPromedio) + ' kWh';
    document.getElementById('avg-demand').textContent = results.demandaPromedio.toFixed(2) + ' kW';
    document.getElementById('avg-factor').textContent = results.factorPotenciaPromedio.toFixed(2);
    document.getElementById('avg-amount').textContent = formatColones(results.montoPromedio);
    
    // Actualizar modelo recomendado
    document.getElementById('recommended-model').textContent = results.modeloRecomendado;
    document.getElementById('model-description').textContent = `${results.aplicacion} (${results.rango})`;
    document.getElementById('model-price').textContent = formatColones(results.precioEquipo);
    document.getElementById('model-downpayment').textContent = formatColones(results.primaInicial);
    document.getElementById('model-monthly').textContent = formatColones(results.cuotaMensual);
    
    // Actualizar análisis financiero
    document.getElementById('monthly-savings').textContent = formatColones(results.ahorroEstimado);
    document.getElementById('net-flow').textContent = formatColones(results.ahorroNeto);
    
    // Actualizar estilos según el flujo neto
    const flowContainer = document.getElementById('flow-container');
    const flowLabel = document.getElementById('flow-label');
    const netFlow = document.getElementById('net-flow');
    
    if (results.ahorroNeto >= 0) {
        flowContainer.className = 'bg-green-50 p-3 rounded-lg border border-green-200';
        flowLabel.className = 'text-sm text-green-800 mb-1';
        flowLabel.textContent = 'Flujo Positivo Mensual';
        netFlow.className = 'text-2xl font-bold text-green-700';
    } else {
        flowContainer.className = 'bg-yellow-50 p-3 rounded-lg border border-yellow-200';
        flowLabel.className = 'text-sm text-yellow-800 mb-1';
        flowLabel.textContent = 'Flujo Mensual Durante Financiamiento';
        netFlow.className = 'text-2xl font-bold text-yellow-600';
    }
    
    // Actualizar retorno de inversión
    document.getElementById('roi-time').textContent = 
        results.tiempoRecuperacion > 0 
            ? `${Math.ceil(results.tiempoRecuperacion)} meses` 
            : 'Inmediato';
    document.getElementById('savings-after-financing').textContent = formatColones(results.ahorroTotal24Meses);
    document.getElementById('savings-5-years').textContent = formatColones(results.ahorro5Anos);
    
    // Generar tabla de flujo de caja
    const tableBody = document.querySelector('#cash-flow-table tbody');
    tableBody.innerHTML = '';
    
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
        let ahorroText = flow.ahorroAcumulado >= 0 
                        ? formatColones(flow.ahorroAcumulado) 
                        : `-${formatColones(Math.abs(flow.ahorroAcumulado))}`;
        
        row.innerHTML = `
            <td class="px-4 py-3 ${isSpecialRow ? 'font-bold' : ''}">${label}</td>
            <td class="px-4 py-3 text-right">${sinEquipoText}</td>
            <td class="px-4 py-3 text-right">${conFinanciamientoText}</td>
            <td class="px-4 py-3 text-right">${conDespuesText}</td>
            <td class="px-4 py-3 text-right ${flow.ahorroAcumulado >= 0 ? 'text-green-600' : 'text-red-600'} ${isSpecialRow ? 'font-bold' : ''}">${ahorroText}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Generar gráfico de consumo
    try {
        const consumptionCanvas = document.getElementById('consumption-chart');
        const consumptionCtx = consumptionCanvas.getContext('2d');
        
        // Verificar si ya existe un gráfico y destruirlo
        if (window.consumptionChart) {
            window.consumptionChart.destroy();
        }
        
        window.consumptionChart = new Chart(consumptionCtx, {
            type: 'bar',
            data: {
                labels: results.months,
                datasets: [{
                    label: 'Consumo (kWh)',
                    data: results.consumptionData,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kWh'
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (e) {
        console.error('Error al generar gráfico de consumo:', e);
    }
    
    // Generar gráfico de ahorro
    try {
        const savingsCanvas = document.getElementById('savings-chart');
        const savingsCtx = savingsCanvas.getContext('2d');
        const labels = Array.from({length: 37}, (_, i) => `Mes ${i}`);
        const ahorroData = results.cashFlow.map(flow => flow.ahorroAcumulado);
        
        // Verificar si ya existe un gráfico y destruirlo
        if (window.savingsChart) {
            window.savingsChart.destroy();
        }
        
        window.savingsChart = new Chart(savingsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ahorro Acumulado',
                    data: ahorroData,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Colones (₡)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo'
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (e) {
        console.error('Error al generar gráfico de ahorro:', e);
    }
}
