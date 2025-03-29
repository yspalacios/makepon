// ================================
// VARIABLES GLOBALES Y CONFIGURACIÓN INICIAL
// ================================

// Array con los personajes disponibles. Cada objeto contiene nombre, rol, vida inicial y ruta de imagen.
let personajesDisponibles = [
    { nombre: 'Tanke', rol: 'Tanke', vida: 200, imagen: './assets/tanke.webp' },
    { nombre: 'Asesino', rol: 'Asesino', vida: 100, imagen: './assets/asesino.webp' },
    { nombre: 'Mago', rol: 'Mago', vida: 90, imagen: './assets/mago2.webp' },
    { nombre: 'Guerrero', rol: 'Guerrero', vida: 120, imagen: './assets/guerrero.webp' }
];

// Se asignan 3 vidas a cada personaje y se guarda el valor máximo de vida
personajesDisponibles = personajesDisponibles.map(personaje => {
    return { ...personaje, vidas: 3, maxVida: personaje.vida };
});

// Variables para almacenar el personaje seleccionado por el jugador y el enemigo actual
let personajeJugador = null;
let personajeEnemigo = null;

// Contador de enemigos vencidos para determinar cuándo aparece el jefe y bandera para saber si se está enfrentando al jefe
let enemigosVencidos = 0; // Contador para saber si enfrentamos al jefe
let esBoss = false; // Variable para saber si el enemigo es el jefe

// ================================
// CONFIGURACIÓN DE ATAQUES
// ================================

// Objeto que define los ataques de cada rol. Contiene la probabilidad de acierto, daño y el nombre del ataque.
const ataques = {
    'asesino': { probabilidad: 65, daño: 29, nombre: 'Danza de Hojas' },
    'tanke': { probabilidad: 50, daño: 20, nombre: 'Embestida' },
    'mago': { probabilidad: 70, daño: 30, nombre: 'Bola de Fuego' },
    'guerrero': { probabilidad: 90, daño: 100, nombre: 'Tajo Cortante' }
};

// ================================
// FUNCIONES AUXILIARES
// ================================

// Función para generar un número aleatorio entre min y max (incluidos ambos extremos)
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Función para actualizar las monedas en el localStorage y en la interfaz (UI)
function actualizarMonedas(cantidad) {
    // Se obtiene el número de monedas actual, se incrementa y se guarda en localStorage
    let monedas = parseInt(localStorage.getItem('zentriaMonedas') || '0');
    monedas += cantidad;
    localStorage.setItem('zentriaMonedas', monedas.toString());
    // Si existe el elemento en la UI, se actualiza su contenido
    if (document.getElementById('monedas')) {
        document.getElementById('monedas').textContent = monedas.toString();
    }
    return monedas;
}

// Función para mostrar un mensaje emergente indicando monedas ganadas
function mostrarMensajeMonedas(cantidad) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = `¡Has ganado ${cantidad} monedas!`;
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.top = '80px';
    mensajeDiv.style.left = '50%';
    mensajeDiv.style.transform = 'translateX(-50%)';
    mensajeDiv.style.backgroundColor = 'rgba(217, 158, 0, 0.9)';
    mensajeDiv.style.color = 'white';
    mensajeDiv.style.padding = '10px 20px';
    mensajeDiv.style.borderRadius = '8px';
    mensajeDiv.style.zIndex = '1000';
    document.body.appendChild(mensajeDiv);
    setTimeout(() => {
        mensajeDiv.remove();
    }, 2000);
}

// Función para mostrar un mensaje de turno, el cual se elimina automáticamente después de 1 segundo
function mostrarMensajeTurno(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.top = '20px';
    mensajeDiv.style.left = '50%';
    mensajeDiv.style.transform = 'translateX(-50%)';
    mensajeDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    mensajeDiv.style.color = 'white';
    mensajeDiv.style.padding = '10px 20px';
    mensajeDiv.style.borderRadius = '8px';
    mensajeDiv.style.zIndex = '1000';
    document.body.appendChild(mensajeDiv);
    setTimeout(() => {
        mensajeDiv.remove();
    }, 1000);
}

// ================================
// CONFIGURACIÓN DE LA SELECCIÓN DE PERSONAJES
// ================================

// Función para configurar la selección de personajes (mostrar tarjetas y asignar el personaje seleccionado)
function configurarSeleccionPersonajes() {
    // Se obtienen todas las tarjetas con la clase "character-card"
    const characterCards = document.querySelectorAll('.character-card');
    
    // Se añade un evento de clic a cada tarjeta
    characterCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            // Se remueven estilos de selección de todas las tarjetas
            characterCards.forEach(c => c.classList.remove('border-4', 'border-green-500'));
            // Se agrega estilo de selección a la tarjeta clickeada
            card.classList.add('border-4', 'border-green-500');
            // Se asigna el personaje seleccionado al jugador
            personajeJugador = personajesDisponibles[index];
            // Se oculta la sección de selección de personajes y se inicia la batalla
            document.getElementById('characterSelection').classList.add('hidden');
            
            // Se reinician los contadores (enemigos vencidos y bandera del jefe)
            enemigosVencidos = 0;
            esBoss = false;
            
            // Se inicia la batalla
            iniciarBatalla();
        });
    });
}

// ================================
// FUNCIONES DE BATALLA
// ================================

// Función para iniciar la batalla
function iniciarBatalla() {
    // Si se han vencido 3 enemigos y no se está enfrentando al jefe, se invoca la función spawnBoss
    if (enemigosVencidos >= 3 && !esBoss) {
        spawnBoss();
    } else {
        // Se selecciona aleatoriamente un enemigo de los disponibles (excluyendo el personaje del jugador)
        const enemigos = personajesDisponibles.filter(p => p !== personajeJugador);
        // Se clona el enemigo seleccionado (para no modificar el original)
        personajeEnemigo = JSON.parse(JSON.stringify(enemigos[aleatorio(0, enemigos.length - 1)]));
        // Se establecen 2 vidas para el enemigo y se guarda su vida máxima
        personajeEnemigo.vidas = 2;
        personajeEnemigo.maxVida = personajeEnemigo.vida;
    }
    
    // Se crea la interfaz de batalla en forma de modal
    const battleModal = document.createElement('div');
    battleModal.id = "battleModal";
    battleModal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div class="bg-gray-900 p-8 rounded-lg shadow-xl max-w-4xl w-full">
                <h2 class="text-3xl font-bold text-center mb-6 text-red-500">Batalla en el Coliseo de los Espíritus</h2>
                
                <div class="flex justify-between items-center mb-6">
                    <!-- Sección del Jugador -->
                    <div class="text-center w-1/3">
                        <img id="imgJugador" src="${personajeJugador.imagen}" alt="${personajeJugador.nombre}" class="mx-auto mb-4 w-48 h-48 object-cover rounded-lg">
                        <h3 class="text-2xl font-semibold">${personajeJugador.nombre}</h3>
                        <p id="vidaJugador" class="text-green-500">Vida: ${personajeJugador.vida} | Vidas: ${personajeJugador.vidas}</p>
                        <!-- Botón de ataque del jugador, muestra el nombre del ataque correspondiente -->
                        <button id="ataqueJugador" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            ${ataques[personajeJugador.rol.toLowerCase()].nombre}
                        </button>
                    </div>
                    
                    <!-- Botón central para escapar del combate -->
                    <div class="text-center w-1/3">
                        <button id="escapaCombate" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                            Escapa del Combate
                        </button>
                    </div>
                    
                    <!-- Sección del Enemigo -->
                    <div class="text-center w-1/3">
                        <img id="imgEnemigo" src="${personajeEnemigo.imagen}" alt="${personajeEnemigo.nombre}" class="mx-auto mb-4 w-48 h-48 object-cover rounded-lg">
                        <h3 id="nombreEnemigo" class="text-2xl font-semibold">${personajeEnemigo.nombre}</h3>
                        <p id="vidaEnemigo" class="text-green-500">Vida: ${personajeEnemigo.vida} | Vidas: ${personajeEnemigo.vidas}</p>
                        <!-- Botón que muestra el nombre del ataque del enemigo (deshabilitado) -->
                        <button disabled class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded opacity-70 cursor-not-allowed">
                            ${ataques[personajeEnemigo.rol.toLowerCase()].nombre}
                        </button>
                    </div>
                </div>
                
                <!-- Registro de mensajes de batalla -->
                <div id="registroBatalla" class="mt-6 text-center text-white max-h-40 overflow-y-auto">
                    <!-- Los mensajes se insertarán aquí -->
                </div>
            </div>
        </div>
    `;
    // Se añade el modal de batalla al body
    document.body.appendChild(battleModal);
    
    // Se configura el evento para el botón de ataque del jugador
    document.getElementById('ataqueJugador').addEventListener('click', () => {
        // Se deshabilita el botón para evitar múltiples clics
        document.getElementById('ataqueJugador').disabled = true;
        turnoJugador();
    });
    
    // Se configura el botón para escapar del combate, que cierra el modal y vuelve a la selección de personajes
    document.getElementById('escapaCombate').addEventListener('click', () => {
        document.getElementById('battleModal').remove();
        document.getElementById('characterSelection').classList.remove('hidden');
    });
}

// ================================
// FUNCIONES PARA EL JEFEO Y GENERACIÓN DE ENEMIGOS
// ================================

// Función para generar el jefe (Boss)
function spawnBoss() {
    esBoss = true;
    // Se crea el objeto jefe con sus propiedades, incluyendo 300 de vida
    personajeEnemigo = {
        nombre: 'Devora',
        rol: 'Boss',
        vida: 300,
        maxVida: 300,
        vidas: 3,
        imagen: './assets/jefe.jpeg'
    };
    
    // Se define el ataque especial del jefe ("Vergueo Masivo")
    ataques['boss'] = { probabilidad: 70, daño: 60, nombre: 'Vergueo Masivo' };
    
    // Se muestra un mensaje emergente indicando la aparición del jefe
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = "¡EL JEFE FINAL HA APARECIDO!";
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.top = '50%';
    mensajeDiv.style.left = '50%';
    mensajeDiv.style.transform = 'translate(-50%, -50%)';
    mensajeDiv.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
    mensajeDiv.style.color = 'white';
    mensajeDiv.style.padding = '20px 40px';
    mensajeDiv.style.borderRadius = '8px';
    mensajeDiv.style.fontSize = '24px';
    mensajeDiv.style.fontWeight = 'bold';
    mensajeDiv.style.zIndex = '1000';
    document.body.appendChild(mensajeDiv);
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}

// Función para actualizar la interfaz de batalla (vidas y contadores)
function actualizarInterfaz() {
    document.getElementById('vidaJugador').textContent = `Vida: ${personajeJugador.vida} | Vidas: ${personajeJugador.vidas}`;
    document.getElementById('vidaEnemigo').textContent = `Vida: ${personajeEnemigo.vida} | Vidas: ${personajeEnemigo.vidas}`;
}

// Función para generar un nuevo enemigo después de vencer al anterior o tras vencer al jefe
function spawnNuevoEnemigo() {
    // Se incrementa el contador de enemigos vencidos
    enemigosVencidos++;
    
    // Si se han vencido 3 enemigos y no se está enfrentando al jefe, se genera el jefe
    if (enemigosVencidos >= 3 && !esBoss) {
        spawnBoss();
    } else if (!esBoss) {
        // Si no se enfrenta al jefe, se genera un enemigo normal aleatoriamente (excluyendo al jugador)
        const enemigos = personajesDisponibles.filter(p => p !== personajeJugador);
        personajeEnemigo = JSON.parse(JSON.stringify(enemigos[aleatorio(0, enemigos.length - 1)]));
        personajeEnemigo.vidas = 2;
        personajeEnemigo.maxVida = personajeEnemigo.vida;
    } else {
        // Si se acaba el jefe, se restablece para volver a enemigos normales
        esBoss = false;
        enemigosVencidos = 0;
        const enemigos = personajesDisponibles.filter(p => p !== personajeJugador);
        personajeEnemigo = JSON.parse(JSON.stringify(enemigos[aleatorio(0, enemigos.length - 1)]));
        personajeEnemigo.vidas = 2;
        personajeEnemigo.maxVida = personajeEnemigo.vida;
    }
    
    // Se actualizan los datos del enemigo en la interfaz (imagen, nombre y botón de ataque)
    document.getElementById('imgEnemigo').src = personajeEnemigo.imagen;
    document.getElementById('imgEnemigo').alt = personajeEnemigo.nombre;
    document.getElementById('nombreEnemigo').textContent = personajeEnemigo.nombre;
    
    // Se actualiza el texto del botón del enemigo con su ataque correspondiente
    const enemyButton = document.querySelector('#battleModal div.flex > div:nth-child(3) button');
    enemyButton.textContent = ataques[personajeEnemigo.rol.toLowerCase()].nombre;
    actualizarInterfaz();
    
    // Se registra un mensaje en el registro de batalla indicando que un nuevo enemigo ha aparecido
    const registroBatalla = document.getElementById('registroBatalla');
    const mensajeElemento = document.createElement('p');
    mensajeElemento.textContent = `¡Un nuevo enemigo, ${personajeEnemigo.nombre}, ha aparecido para el combate!`;
    registroBatalla.insertBefore(mensajeElemento, registroBatalla.firstChild);
}

// ================================
// FUNCIONES DE TURNO DE BATALLA
// ================================

// Función que ejecuta el turno del jugador
function turnoJugador() {
    // Se muestra un mensaje emergente indicando que es el turno del jugador
    mostrarMensajeTurno("Turno del Jugador");
    const registroBatalla = document.getElementById('registroBatalla');
    let mensajes = [];
    
    // Se obtiene el ataque del jugador según su rol
    const ataqueJugador = ataques[personajeJugador.rol.toLowerCase()];
    // Se determina si el ataque acierta mediante un número aleatorio comparado con la probabilidad
    const aciertaJugador = aleatorio(1, 100) <= ataqueJugador.probabilidad;
    if (aciertaJugador) {
        // Si acierta, se reduce la vida del enemigo y se registra el mensaje de éxito
        personajeEnemigo.vida -= ataqueJugador.daño;
        mensajes.push(`¡Tu ${personajeJugador.nombre} ataca con ${ataqueJugador.nombre} y quita ${ataqueJugador.daño} de vida a ${personajeEnemigo.nombre}!`);
    } else {
        // Si falla, se registra el mensaje correspondiente
        mensajes.push(`¡Tu ${personajeJugador.nombre} falló el ataque!`);
    }
    
    // Si la vida del enemigo llega a 0 o menos, se reduce una vida del enemigo
    if (personajeEnemigo.vida <= 0) {
        personajeEnemigo.vidas--;
        if (personajeEnemigo.vidas > 0) {
            mensajes.push(`¡Le quitaste una vida a ${personajeEnemigo.nombre}! Vidas restantes: ${personajeEnemigo.vidas}`);
            // Se restaura la vida del enemigo a su valor máximo
            personajeEnemigo.vida = personajeEnemigo.maxVida;
        } else {
            mensajes.push(`¡Has vencido a ${personajeEnemigo.nombre}!`);
            
            // Se recompensa al jugador con monedas: 15 si es jefe, 5 en caso contrario
            const monedasGanadas = esBoss ? 15 : 5;
            actualizarMonedas(monedasGanadas);
            mostrarMensajeMonedas(monedasGanadas);
            
            // Se recompensa al jugador con una vida adicional y se restaura su vida
            personajeJugador.vidas++;
            personajeJugador.vida = personajeJugador.maxVida;
            actualizarInterfaz();
            // Se genera un nuevo enemigo
            spawnNuevoEnemigo();
            
            // Se registran los mensajes en el área de registro de batalla
            mensajes.forEach(mensaje => {
                const mensajeElemento = document.createElement('p');
                mensajeElemento.textContent = mensaje;
                registroBatalla.insertBefore(mensajeElemento, registroBatalla.firstChild);
            });
            
            // Se vuelve a habilitar el botón de ataque y se termina el turno
            document.getElementById('ataqueJugador').disabled = false;
            return;
        }
    }
    
    // Se actualiza la interfaz para reflejar los cambios en vidas
    actualizarInterfaz();
    
    // Se muestran los mensajes en el registro de batalla
    mensajes.forEach(mensaje => {
        const mensajeElemento = document.createElement('p');
        mensajeElemento.textContent = mensaje;
        registroBatalla.insertBefore(mensajeElemento, registroBatalla.firstChild);
    });
    
    // Después de 2 segundos, se pasa el turno al enemigo
    setTimeout(turnoEnemigo, 2000);
}

// Función que ejecuta el turno del enemigo
function turnoEnemigo() {
    // Se muestra un mensaje emergente indicando que es el turno del enemigo
    mostrarMensajeTurno("Turno del Enemigo");
    const registroBatalla = document.getElementById('registroBatalla');
    let mensajes = [];
    
    // Se obtiene el ataque del enemigo según su rol
    const ataqueEnemigo = ataques[personajeEnemigo.rol.toLowerCase()];
    // Se determina si el ataque acierta
    const aciertaEnemigo = aleatorio(1, 100) <= ataqueEnemigo.probabilidad;
    if (aciertaEnemigo) {
        // Si acierta, se reduce la vida del jugador y se registra el mensaje
        personajeJugador.vida -= ataqueEnemigo.daño;
        mensajes.push(`¡El enemigo ${personajeEnemigo.nombre} ataca con ${ataqueEnemigo.nombre} y quita ${ataqueEnemigo.daño} de vida!`);
    } else {
        mensajes.push(`¡El enemigo ${personajeEnemigo.nombre} falló su ataque!`);
    }
    
    // Se verifica si la vida del jugador se agota
    if (personajeJugador.vida <= 0) {
        personajeJugador.vidas--;
        if (personajeJugador.vidas > 0) {
            mensajes.push(`¡Haz perdido una vida! Vidas restantes: ${personajeJugador.vidas}`);
            // Se restaura la vida del jugador
            personajeJugador.vida = personajeJugador.maxVida;
        } else {
            mensajes.push(`¡Has perdido! Game Over`);
            // Se muestra el mensaje final de Game Over y se termina la función
            mostrarMensajeFinal('¡Has perdido! Game Over');
            mensajes.forEach(mensaje => {
                const mensajeElemento = document.createElement('p');
                mensajeElemento.textContent = mensaje;
                registroBatalla.insertBefore(mensajeElemento, registroBatalla.firstChild);
            });
            return;
        }
    }
    
    // Se actualiza la interfaz para reflejar cambios en el jugador
    actualizarInterfaz();
    
    // Se muestran los mensajes del turno del enemigo
    mensajes.forEach(mensaje => {
        const mensajeElemento = document.createElement('p');
        mensajeElemento.textContent = mensaje;
        registroBatalla.insertBefore(mensajeElemento, registroBatalla.firstChild);
    });
    
    // Se vuelve a habilitar el botón de ataque del jugador para el siguiente turno
    document.getElementById('ataqueJugador').disabled = false;
}

// ================================
// FUNCIONES PARA MOSTRAR MENSAJES FINALES Y REINICIAR
// ================================

// Función para mostrar un mensaje final (por ejemplo, Game Over o victoria) y ofrecer la opción de reiniciar el juego
function mostrarMensajeFinal(mensaje) {
    const modalFinal = document.createElement('div');
    modalFinal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div class="bg-gray-900 p-8 rounded-lg shadow-xl text-center">
                <h2 class="text-3xl font-bold mb-6 text-red-500">${mensaje}</h2>
                <button id="reiniciarJuego" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Reiniciar Juego
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalFinal);
    
    // Al hacer clic en el botón, se recarga la página para reiniciar el juego
    document.getElementById('reiniciarJuego').addEventListener('click', () => {
        location.reload();
    });
}

// ================================
// FUNCIONES PARA CARGAR HABILIDADES COMPRADAS (EXTRA)
// ================================

// Función que revisa si el jugador tiene habilidades extra compradas en la tienda y las aplica
function cargarHabilidadesCompradas() {
    // Se obtiene el array de habilidades compradas desde localStorage
    const habilidadesCompradas = JSON.parse(localStorage.getItem('zentriaHabilidadesCompradas') || '[]');
    
    // Para cada habilidad comprada, se aplica un efecto según el caso
    for (const habilidad of habilidadesCompradas) {
        switch(habilidad) {
            case 'danio_aumentado':
                // Aumenta el daño de los ataques del jugador en un 20%
                const rolJugador = personajeJugador.rol.toLowerCase();
                ataques[rolJugador].daño = Math.floor(ataques[rolJugador].daño * 1.2);
                break;
            case 'vida_extra':
                // Otorga una vida adicional al jugador
                personajeJugador.vidas += 1;
                break;
            case 'precision_aumentada':
                // Aumenta la probabilidad de acierto del jugador en un 15%
                const rolPrecision = personajeJugador.rol.toLowerCase();
                ataques[rolPrecision].probabilidad = Math.min(95, ataques[rolPrecision].probabilidad + 15);
                break;
            case 'regeneracion':
                // Esta habilidad permitiría recuperar 5 de vida después de cada turno (implementar en turnoEnemigo)
                break;
        }
    }
    
    // Se actualiza la interfaz si ya hay un personaje seleccionado
    if (personajeJugador) {
        actualizarInterfaz();
    }
}

// ================================
// INICIALIZACIÓN DEL JUEGO
// ================================

// Al cargar el documento, se configura la selección de personajes
document.addEventListener('DOMContentLoaded', configurarSeleccionPersonajes);

// Al cargar el documento, se inicializa la tienda si la clave de habilidades compradas no existe en localStorage
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('zentriaHabilidadesCompradas')) {
        localStorage.setItem('zentriaHabilidadesCompradas', '[]');
    }
});
