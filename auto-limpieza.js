// Auto limpieza de cache viejo
(function() {
    const VERSION = 'v2.0-tc508';
    const versionGuardada = localStorage.getItem('appVersion');
    
    if (versionGuardada !== VERSION) {
        console.log('Limpiando datos antiguos...');
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('appVersion', VERSION);
        console.log('✅ Datos antiguos eliminados');
    }
})();
