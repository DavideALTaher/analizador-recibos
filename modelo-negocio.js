// Modelo de Negocio Energy Saver - Versión Mejorada
const businessModel = {
    equipos: [
        {
            modelo: 'JS-1299',
            rango: '200A-450A',
            capacidad: { min: 200, max: 450 },
            aplicacion: 'Residencial/Comercial pequeño',
            precio: 3000,
            primaInicial: 900,
            cuotaMensual: 87.50,
            montoFinanciado: 2100,
            porcentajeAhorroBase: 0.15
        },
        {
            modelo: 'JS-1699',
            rango: '451A-600A',
            capacidad: { min: 451, max: 600 },
            aplicacion: 'Comercial mediano',
            precio: 3800,
            primaInicial: 1140,
            cuotaMensual: 110.83,
            montoFinanciado: 2660,
            porcentajeAhorroBase: 0.18
        },
        {
            modelo: 'JS-2099',
            rango: '601A-850A',
            capacidad: { min: 601, max: 850 },
            aplicacion: 'Comercial grande',
            precio: 4500,
            primaInicial: 1350,
            cuotaMensual: 131.25,
            montoFinanciado: 3150,
            porcentajeAhorroBase: 0.22
        },
        {
            modelo: 'JS-2499',
            rango: '851A-1200A',
            capacidad: { min: 851, max: 1200 },
            aplicacion: 'Industrial',
            precio: 5200,
            primaInicial: 1560,
            cuotaMensual: 151.67,
            montoFinanciado: 3640,
            porcentajeAhorroBase: 0.25
        }
    ],
    factorPotenciaMinimo: 0.90,
    tipoCambio: 520,
    calcularMultaFactorPotencia: function(factorPotencia, montoBase) {
        if (factorPotencia >= 0.90) return 0;
        const porcentajeMulta = factorPotencia < 0.85 ? 0.10 : 0.05;
        return montoBase * porcentajeMulta;
    }
};

function determinarModeloPorCapacidad(consumoPromedio, demandaPromedio) {
    const amperajeEstimado = (demandaPromedio * 1000) / (208 * 1.732 * 0.9);
    for (const modelo of businessModel.equipos) {
        if (amperajeEstimado >= modelo.capacidad.min && amperajeEstimado <= modelo.capacidad.max) {
            return modelo;
        }
    }
    if (amperajeEstimado < businessModel.equipos[0].capacidad.min) return businessModel.equipos[0];
    return businessModel.equipos[businessModel.equipos.length - 1];
}

window.businessModelEnhanced = businessModel;
window.determinarModeloPorCapacidad = determinarModeloPorCapacidad;
