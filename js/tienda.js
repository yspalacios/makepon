// ================================
// Selección de elementos del DOM
// ================================

// Elemento donde se muestra el número de monedas
const monedasElement = document.getElementById('monedas');
// Botones para comprar habilidades (todos los que tengan la clase "buy-skill")
const buyButtons = document.querySelectorAll('.buy-skill');
// Elemento de notificación para mostrar mensajes al usuario
const notification = document.getElementById('notification');
// Elemento de texto dentro de la notificación
const notificationText = document.getElementById('notificationText');

// ================================
// Variables globales
// ================================

// Variable que almacena el número de monedas disponibles
let monedas = 0;
// Array para almacenar las asignaciones de habilidades, cada objeto es de la forma: { skillId, hero }
let habilidadesAsignadas = [];
// Variable temporal para almacenar la compra en proceso; se usará para deducir el precio solo cuando se asigne
let tempCompra = null;

// ================================
// Definición de héroes disponibles
// ================================

// Array de héroes (debe coincidir con los personajes de mokepon.html)
const heroesDisponibles = [
    { nombre: 'Tanke', imagen: './assets/tanke.webp' },
    { nombre: 'Asesino', imagen: './assets/asesino.webp' },
    { nombre: 'Mago', imagen: './assets/mago2.webp' },
    { nombre: 'Guerrero', imagen: './assets/guerrero.webp' }
];

// ================================
// Función: showNotification
// Muestra un mensaje emergente al usuario (éxito o error)
// ================================
function showNotification(message, isSuccess = true) {
    // Actualiza el texto del mensaje
    notificationText.textContent = message;
    // Remueve clases de fondo anteriores y asigna la clase correspondiente según éxito o error
    notification.classList.remove('bg-gray-800', 'bg-red-600', 'bg-green-600');
    notification.classList.add(isSuccess ? 'bg-green-600' : 'bg-red-600');
    // Muestra el mensaje (animación de transición)
    notification.classList.remove('translate-y-20', 'opacity-0');
    notification.classList.add('translate-y-0', 'opacity-100');
    
    // Después de 3 segundos, oculta el mensaje nuevamente
    setTimeout(() => {
        notification.classList.remove('translate-y-0', 'opacity-100');
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// ================================
// Función: cargarDatos
// Carga las monedas y las habilidades asignadas desde localStorage
// ================================
function cargarDatos() {
    // Se obtiene el número de monedas guardado; si no existe, se usa '0'
    monedas = parseInt(localStorage.getItem('zentriaMonedas') || '0');
    // Se actualiza el elemento de monedas en el DOM
    monedasElement.textContent = monedas;
    // Se cargan las asignaciones; si no existe, se inicializa con un array vacío
    habilidadesAsignadas = JSON.parse(localStorage.getItem('zentriaHabilidadesAsignadas') || '[]');
    // Se actualiza la visualización de las habilidades en la tienda
    actualizarEstadoHabilidades();
}

// ================================
// Función: actualizarEstadoHabilidades
// Actualiza el estado de cada tarjeta de habilidad según las asignaciones realizadas
// ================================
function actualizarEstadoHabilidades() {
    // Para cada tarjeta con la clase "skill-card"
    document.querySelectorAll('.skill-card').forEach(card => {
        // Se obtienen el botón y el estado de la habilidad (elemento que muestra "Habilidad Adquirida")
        const button = card.querySelector('.buy-skill');
        const status = card.querySelector('.skill-status');
        // Se lee el atributo data-skill para identificar la habilidad
        const skillId = button.getAttribute('data-skill');
        // Se cuentan cuántas asignaciones ya existen para esa habilidad
        const asignaciones = habilidadesAsignadas.filter(item => item.skillId === skillId).length;
        // Si la habilidad ya fue asignada a todos los héroes (4 en total)
        if (asignaciones >= heroesDisponibles.length) {
            // Se deshabilita el botón, se cambia el estilo y se muestra el estado "Habilidad Adquirida"
            button.disabled = true;
            button.classList.add('bg-gray-500', 'cursor-not-allowed');
            button.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            button.textContent = 'Habilidad Adquirida';
            status.classList.remove('hidden');
        } else {
            // Si aún se pueden asignar, se aseguran de que el botón esté habilitado y con el estilo correcto
            button.disabled = false;
            button.classList.remove('bg-gray-500', 'cursor-not-allowed');
            button.classList.add('bg-purple-600', 'hover:bg-purple-700');
            button.textContent = 'Comprar Habilidad';
            status.classList.add('hidden');
        }
    });
}

// ================================
// Función: mostrarSeleccionHeroeParaHabilidad
// Muestra el modal para que el usuario seleccione a qué héroe asignar la habilidad
// ================================
function mostrarSeleccionHeroeParaHabilidad(skillId) {
    // Se obtiene el modal y el contenedor para las opciones de héroe
    const modal = document.getElementById('heroAssignModal');
    const heroOptions = document.getElementById('heroOptions');
    // Se limpia el contenido previo del contenedor
    heroOptions.innerHTML = '';

    // Se filtran los héroes que aún no tienen asignada la habilidad especificada
    const heroesDisponiblesParaSkill = heroesDisponibles.filter(hero => {
        return !habilidadesAsignadas.some(item => item.skillId === skillId && item.hero === hero.nombre);
    });

    // Si no hay héroes disponibles, se notifica y se cierra el modal
    if (heroesDisponiblesParaSkill.length === 0) {
        showNotification('Todos los héroes ya tienen esta habilidad.', false);
        modal.classList.add('hidden');
        return;
    }

    // Por cada héroe disponible, se crea una tarjeta de selección
    heroesDisponiblesParaSkill.forEach(hero => {
        const option = document.createElement('div');
        option.classList.add('character-card');
        // Estilos en línea para la tarjeta
        option.style.display = 'inline-block';
        option.style.margin = '5px';
        option.style.border = '1px solid #ccc';
        option.style.padding = '5px';
        option.style.textAlign = 'center';
        // Se inserta la imagen y el nombre del héroe
        option.innerHTML = `<img src="${hero.imagen}" alt="${hero.nombre}" width="100"><br><strong>${hero.nombre}</strong>`;
        // Al hacer clic en la tarjeta, se confirma la asignación
        option.addEventListener('click', () => {
            // Si existe una compra en proceso (tempCompra), se descuenta el precio, se asigna la habilidad y se actualiza localStorage
            if (tempCompra) {
                monedas -= tempCompra.price;
                localStorage.setItem('zentriaMonedas', monedas.toString());
                monedasElement.textContent = monedas;
                // Se agrega la asignación al array de habilidades asignadas
                habilidadesAsignadas.push({ skillId: tempCompra.skillId, hero: hero.nombre });
                localStorage.setItem('zentriaHabilidadesAsignadas', JSON.stringify(habilidadesAsignadas));
                // Se muestra notificación de éxito
                showNotification(`¡Habilidad asignada a ${hero.nombre}!`);
                // Se actualiza el estado de las habilidades en la tienda
                actualizarEstadoHabilidades();
                // Se limpia la compra temporal y se cierra el modal
                tempCompra = null;
                modal.classList.add('hidden');
            }
        });
        // Se añade la opción al contenedor
        heroOptions.appendChild(option);
    });
    // Se muestra el modal
    modal.classList.remove('hidden');
}

// ================================
// Función: comprarHabilidad
// Inicia el proceso de compra de una habilidad sin deducir monedas inmediatamente.
// Solo se deducen cuando se asigna la habilidad al seleccionar un héroe.
// ================================
function comprarHabilidad(skillId, price, element) {
    // Si no hay suficientes monedas, se muestra notificación y se detiene
    if (monedas < price) {
        showNotification('¡No tienes suficientes monedas para esta habilidad!', false);
        return;
    }
    // Verifica si la habilidad ya ha sido asignada a todos los héroes disponibles
    const asignaciones = habilidadesAsignadas.filter(item => item.skillId === skillId).length;
    if (asignaciones >= heroesDisponibles.length) {
        showNotification('¡Ya se ha asignado esta habilidad a todos los héroes!', false);
        return;
    }
    // Se guarda la compra de forma temporal (sin descontar monedas)
    tempCompra = { skillId, price };
    // Se muestra el modal para seleccionar a qué héroe asignar la habilidad
    mostrarSeleccionHeroeParaHabilidad(skillId);
    
    // Efecto visual: se aplica un "ring" verde en la tarjeta de habilidad
    const card = element.closest('.skill-card');
    card.classList.add('ring-4', 'ring-green-500');
    setTimeout(() => {
        card.classList.remove('ring-4', 'ring-green-500');
    }, 1500);
}

// ================================
// Configuración de eventos para los botones de compra
// ================================
buyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Se extraen los atributos data-skill y data-price del botón
        const skillId = e.target.getAttribute('data-skill');
        const price = parseInt(e.target.getAttribute('data-price'));
        // Se llama a la función de compra
        comprarHabilidad(skillId, price, e.target);
    });
});

// ================================
// Inicialización: carga de datos al iniciar el documento
// ================================
document.addEventListener('DOMContentLoaded', cargarDatos);
// Se inicializa localStorage para habilidades asignadas si aún no existe
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('zentriaHabilidadesAsignadas')) {
        localStorage.setItem('zentriaHabilidadesAsignadas', '[]');
    }
});

// ================================
// Configuración del botón "Cancelar" del modal de asignación
// Si se cancela, se limpia la compra temporal y se cierra el modal sin descontar monedas
// ================================
document.getElementById('cancelAssign').addEventListener('click', () => {
    tempCompra = null;
    document.getElementById('heroAssignModal').classList.add('hidden');
});
