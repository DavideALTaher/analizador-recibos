// Fix para el botón de pagaré
console.log('Fix botón pagaré cargado');

// Esperar a que todo esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, buscando botón pagaré...');
    
    // Buscar y arreglar el botón después de un pequeño delay
    setTimeout(() => {
        const btn = document.getElementById('generate-pagare-btn');
        console.log('Botón encontrado:', btn);
        
        if (btn) {
            // Remover cualquier onclick anterior
            btn.onclick = null;
            btn.removeEventListener('click', window.generarPagare);
            btn.removeEventListener('click', window.generarPagareCompleto);
            
            // Agregar nuevo evento
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Click en botón pagaré');
                
                // Verificar que existe la función
                if (window.generarPagareCompleto) {
                    console.log('Llamando a generarPagareCompleto');
                    window.generarPagareCompleto();
                } else if (window.generarPagare) {
                    console.log('Llamando a generarPagare');
                    window.generarPagare();
                } else {
                    console.error('No se encontró función de pagaré');
                    alert('Error: Función de pagaré no disponible');
                }
            });
            
            console.log('Event listener agregado al botón');
        } else {
            console.error('No se encontró el botón generate-pagare-btn');
        }
        
        // También intentar agregarlo si no existe
        if (!btn) {
            const buttonsContainer = document.querySelector('.flex.flex-wrap.justify-center.gap-4');
            if (buttonsContainer) {
                const newBtn = document.createElement('button');
                newBtn.id = 'generate-pagare-btn';
                newBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded';
                newBtn.textContent = 'Generar Pagaré';
                newBtn.onclick = function() {
                    console.log('Click en nuevo botón pagaré');
                    if (window.generarPagareCompleto) {
                        window.generarPagareCompleto();
                    } else {
                        alert('Función de pagaré no disponible');
                    }
                };
                
                const finishBtn = document.getElementById('finish-analysis-btn');
                if (finishBtn) {
                    buttonsContainer.insertBefore(newBtn, finishBtn);
                } else {
                    buttonsContainer.appendChild(newBtn);
                }
                console.log('Nuevo botón pagaré creado');
            }
        }
    }, 1000);
});

// También interceptar cuando se muestran resultados
const originalShowResults = window.displayResults;
window.displayResults = function(results) {
    if (originalShowResults) {
        originalShowResults.call(this, results);
    }
    
    // Asegurar que el botón funcione después de mostrar resultados
    setTimeout(() => {
        const btn = document.getElementById('generate-pagare-btn');
        if (btn && !btn.hasAttribute('data-fixed')) {
            btn.setAttribute('data-fixed', 'true');
            btn.onclick = function() {
                console.log('Click desde displayResults');
                if (window.generarPagareCompleto) {
                    window.generarPagareCompleto();
                } else {
                    console.error('generarPagareCompleto no está definida');
                }
            };
        }
    }, 500);
};

console.log('✅ Fix botón pagaré instalado');
