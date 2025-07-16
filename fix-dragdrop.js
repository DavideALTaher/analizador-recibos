// Archivo para corregir la funcionalidad de drag and drop
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando arreglo de drag and drop...');
    
    // Verificar si Dropzone está disponible
    if (typeof Dropzone === 'undefined') {
        console.error('Dropzone no está disponible');
        return;
    }
    
    // Forzar desactivación del auto-discover
    if (Dropzone.autoDiscover !== false) {
        Dropzone.autoDiscover = false;
        console.log('Forzado Dropzone.autoDiscover = false');
    }
    
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
                    
                    // Llamar a updateReceiptList si existe
                    if (typeof updateReceiptList === 'function') {
                        updateReceiptList();
                    } else {
                        console.error('La función updateReceiptList no está definida');
                        // Implementación alternativa
                        updateReceiptListAlternative(file);
                    }
                });
                
                this.on("removedfile", function(file) {
                    console.log("Archivo eliminado:", file.name);
                    
                    // Llamar a updateReceiptList si existe
                    if (typeof updateReceiptList === 'function') {
                        updateReceiptList();
                    } else {
                        console.error('La función updateReceiptList no está definida');
                        // Actualizar la lista manualmente
                        updateReceiptListUI();
                    }
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
    
    // Función alternativa para actualizar la lista de recibos
    function updateReceiptListAlternative(file) {
        const receiptList = document.getElementById('receipt-list');
        if (!receiptList) {
            console.error('Elemento receipt-list no encontrado');
            return;
        }
        
        // Limpiar el contenido existente si es el mensaje de "No hay recibos"
        if (receiptList.innerHTML.includes('No hay recibos cargados')) {
            receiptList.innerHTML = '';
        }
        
        // Crear elemento para el archivo
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between py-2 px-3 bg-blue-50 rounded mb-2';
        item.innerHTML = `
            <div class="flex items-center">
                <span class="text-sm font-medium">${file.name}</span>
                <span class="ml-2 text-xs text-gray-500">(${(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button class="text-red-500 hover:text-red-700 text-sm remove-file" data-name="${file.name}">
                Eliminar
            </button>
        `;
        
        // Añadir evento al botón de eliminar
        const removeBtn = item.querySelector('.remove-file');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                const fileName = this.getAttribute('data-name');
                
                // Buscar el archivo en Dropzone
                if (window.myDropzone) {
                    const files = window.myDropzone.files;
                    for (let i = 0; i < files.length; i++) {
                        if (files[i].name === fileName) {
                            window.myDropzone.removeFile(files[i]);
                            break;
                        }
                    }
                }
                
                // Eliminar el elemento de la lista
                receiptList.removeChild(item);
                
                // Mostrar mensaje si no hay archivos
                if (receiptList.children.length === 0) {
                    receiptList.innerHTML = '<div class="text-gray-500 italic">No hay recibos cargados</div>';
                }
            });
        }
        
        // Añadir a la lista
        receiptList.appendChild(item);
    }
    
    // Función para actualizar la interfaz de la lista de recibos
    function updateReceiptListUI() {
        const receiptList = document.getElementById('receipt-list');
        if (!receiptList) {
            console.error('Elemento receipt-list no encontrado');
            return;
        }
        
        // Verificar si hay archivos
        if (!window.myDropzone || window.myDropzone.files.length === 0) {
            receiptList.innerHTML = '<div class="text-gray-500 italic">No hay recibos cargados</div>';
            return;
        }
        
        // Limpiar la lista
        receiptList.innerHTML = '';
        
        // Añadir cada archivo a la lista
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
            
            // Añadir evento al botón de eliminar
            const removeBtn = item.querySelector('.remove-file');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (window.myDropzone.files[index]) {
                        window.myDropzone.removeFile(window.myDropzone.files[index]);
                    }
                });
            }
            
            // Añadir a la lista
            receiptList.appendChild(item);
        });
    }
});
