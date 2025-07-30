// Fix temporal para conflictos de variables
console.log('Resolviendo conflictos de variables...');

// Limpiar variables conflictivas
delete window.originalDisplayResults;
delete window.originalPrompt;

// Asegurar que las funciones principales funcionen
if (!window.displayResults && window.displayResultsEnhanced) {
    window.displayResults = window.displayResultsEnhanced;
}

console.log('✅ Conflictos resueltos');
