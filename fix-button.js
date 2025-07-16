// Archivo para corregir el botón de nuevo análisis
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando arreglo del botón...');
    
    // Asegurar que el botón exista
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    if (newAnalysisBtn) {
        console.log('Botón de nuevo análisis encontrado, añadiendo evento');
        
        // Remover cualquier evento existente
        newAnalysisBtn.replaceWith(newAnalysisBtn.cloneNode(true));
        
        // Añadir el evento nuevamente
        document.getElementById('new-analysis-btn').addEventListener('click', function() {
            console.log('Botón de nuevo análisis clickeado');
            createNewAnalysis();
        });
    } else {
        console.error('El botón de nuevo análisis no fue encontrado');
    }
});

// Función para crear un nuevo análisis
function createNewAnalysis() {
    console.log('Creando nuevo análisis...');
    
    // Crear objeto de análisis
    const currentAnalysis = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        receipts: [],
        results: null
    };
    
    // Asignar a variable global (si existe)
    if (typeof window.currentAnalysis !== 'undefined') {
        window.currentAnalysis = currentAnalysis;
    }
    
    // Limpiar campos
    const clientNameInput = document.getElementById('client-name');
    if (clientNameInput) {
        clientNameInput.value = '';
    }
    
    const analysisDateInput = document.getElementById('analysis-date');
    if (analysisDateInput) {
        analysisDateInput.value = currentAnalysis.date;
    }
    
    // Resetear Dropzone si existe
    if (window.myDropzone) {
        window.myDropzone.removeAllFiles();
    }
    
    // Actualizar lista de recibos si la función existe
    if (typeof updateReceiptList === 'function') {
        updateReceiptList();
    }
    
    // Mostrar sección de carga y ocultar otras
    const historySection = document.getElementById('history-section');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    
    if (historySection) historySection.classList.add('hidden');
    if (uploadSection) uploadSection.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    
    console.log('Nuevo análisis creado y secciones actualizadas');
}
