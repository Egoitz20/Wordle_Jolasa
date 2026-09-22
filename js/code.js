"use strict";

// ************************************************************************************
// __________________________________CONEXIÓN API______________________________________
// ************************************************************************************

// Se declara la función con async
async function obtenerPalabras(numLetras) {
  try {
    // 'await fetch' va a buscar los datos a la API y se queda espereando a que respondan
    const respuesta = await fetch(
      "https://random-word-api.herokuapp.com/word?number=1&lang=es&length=" +
        numLetras +
        "",
    );

    // 'await respuesta.json' traduce la respuesta a un Array de plabaras JavaScript
    const palabras = await respuesta.json();

    // DEBUG
    console.log("Palabras recibidas:", palabras);
    console.log("Total de palabras:", palabras.length);
    console.log("Primera palabra:", palabras[0]);
    console.log("Total de letras:", palabras[0].length);
    console.log("Peticion correcta?", respuesta.ok);
    console.log("Respuesta de petición", respuesta.status);
    console.log("HTTP:", respuesta.headers);

    return palabras[0];
  } catch (error) {
    console.error("Hubo un error al conectar con la API:", error);
    return null;
  }
}

// **********************************************************************************************************
// __________________________________BOTON JUGAR_____________________________________________________________
// **********************************************************************************************************

const botonJugar = document.querySelector(".botonJugar");
const primeraConfiguracion = document.querySelector(".primeraConfiguracion");
const cajaPalabra = document.querySelector(".cajaPalabra");

let letras = "";
let intentos = "";
let palabraSecreta = "";
let partidaGanada = false;

// Interacción al darle boton de "Jugar", oculta el div principal y visualiza el teclado y los cuadrados del juego
botonJugar.addEventListener("click", async () => {
  // Se obtiene la información de cada campo
  letras = document.getElementById("letras");
  intentos = document.getElementById("intentos");

  primeraConfiguracion.classList.add("oculto"); // Se oculta el menu de configuración del juego
  cajaPalabra.classList.remove("oculto"); // Se visualualiza los campos
  tecladoVirtual.classList.remove("oculto"); // Se visualiza el teclado virtual

  // El .value devuelve el valor seleccionado del campo
  console.log("Intentos: ", intentos.value, " Letras: ", letras.value);
  generarCuadrados(letras.value, intentos.value); // Segun los valores recogidos se generaran los recuadros

  intentoActual = 0;
  letraActual = 0;
  partidaGanada = false;

  // Se llama a la API para obtener una palabra con el numero de letras aplicado y se guarda en la variable
  palabraSecreta = await obtenerPalabras(letras.value);

  // Si la API falla, avisamos y no continuamos
  if (!palabraSecreta) {
    console.error("No se pudo obtener la palabra de la API");
    return;
  }

  palabraSecreta = palabraSecreta.toUpperCase();

  // DEBUG
  console.log(palabraSecreta);
});

// **********************************************************************************************************
// __________________________________GENERACIÓN DE CUADRADOS_________________________________________________
// **********************************************************************************************************

// Función que dinamicamente añade inputs segun la longitud del numero de letras seleccionado
// Y agrega filas segun el numero de intentos seleccionado.
function generarCuadrados(letras, intentos) {
  // innerHTML añade al html el contenido nuevo
  cajaPalabra.innerHTML = "";

  for (let i = 0; i < intentos; i++) {
    let linea = document.createElement("div");
    linea.setAttribute("id", "intento-" + i);
    linea.setAttribute("class", "recuadro");

    for (let j = 0; j < letras; j++) {
      const caja = obtenerCuadrado(cajaPalabra, i, j);
      linea.append(caja);
    }
    cajaPalabra.append(linea);
  }
}

const obtenerCuadrado = (cajaPalabra, linea, posicion) => {
  const cuadrado = document.createElement("span"); // Crea el elemento span en el html de forma dinamica
  cuadrado.setAttribute("class", "caja"); // Se añade una clase para ese elemento
  cuadrado.setAttribute("type", "text"); // Se añade un type
  cuadrado.setAttribute("maxlength", "1"); // Se añade el limitador de caracter
  cuadrado.setAttribute("id", "box-" + linea + "-" + posicion); // Se añade una id
  return cuadrado;
};

// ************************************************************************************
// __________________________________TECLADO VIRTUAL___________________________________
// ************************************************************************************

const tecladoVirtual = document.querySelector(".tecladoVirtual");

let intentoActual = 0; // Controla la fila actual
let letraActual = 0; // Controla el recuadro actual

// Interacción con el teclado virtual, recoge la id de las letras del teclado.
tecladoVirtual.addEventListener("click", (event) => {
  const elementoClickado = event.target; // event.target es el elemento donde el raton hizo click

  if (elementoClickado.classList.contains("tecla")) {
    const idTeclaRecogida = elementoClickado.id;
    procesarTecla(idTeclaRecogida);
  }
});

// ************************************************************************************
// __________________________________TECLADO FISICO___________________________________
// ************************************************************************************

window.addEventListener("keydown", (e) => {
  // Se recoge en una variable la tecla presionada y se pasa a mayúsculas
  const teclaPresionada = e.key.toUpperCase();

  // --- ENTER ---
  // e.key devuelve "Enter", que en mayúsculas es "ENTER".
  // Se mapea al mismo string que el id del botón virtual para reutilizar procesarTecla().
  if (teclaPresionada === "ENTER") {
    procesarTecla("ENTER");
    return;
  }

  // --- DEL (borrar) ---
  // e.key puede ser "supr" o "Delete".
  // Se mapean ambos a "DEL" para que coincidan con el id del botón virtual.
  if (teclaPresionada === "BACKSPACE" || teclaPresionada === "DELETE") {
    procesarTecla("DEL");
    return;
  }

  // --- Letras normales ---
  // Para que no salte error en el depurador y solo detecte teclas especificas
  // Solo mira las teclas de la A a la Z y Ñ incluida
  const validacionTecla = /^[A-ZÑ]$/.test(teclaPresionada);

  // Se reutiliza la función de procesarTecla() para que escriba dentro de los recuadros
  // Se valida si la letra pulsada corresponde con la regla.
  if (validacionTecla) {
    procesarTecla(teclaPresionada);
  }
});

// **********************************************************************************************************
// __________________________________FUNCIÓN PARA LA INTERACCION DE TECLAS___________________________________
// **********************************************************************************************************

// Procesa la tecla pulsada, ya venga del teclado virtual o del fisico
function procesarTecla(idTecla) {
  // Se leen los límites configurados por el jugador (nº de letras y nº de intentos)
  const maxLetras = parseInt(letras.value);
  const maxIntentos = parseInt(intentos.value);

  // Si ya se agotaron los intentos o la partida se ganó, ignoramos cualquier tecla.
  if (intentoActual >= maxIntentos || partidaGanada) return;

  // DEBUG: mostramos qué tecla se ha pulsado y en qué fila/columna estamos
  console.log(
    "Se ha pulsado la tecla con ID: " +
      idTecla +
      " Se ha escrito en la fila " +
      intentoActual +
      " y en la columna " +
      letraActual,
  );

  // Tecla DEL (borrar la última letra escrita en la fila actual)
  if (idTecla === "DEL") {
    // Solo se puede borrar si hay alguna letra escrita en la fila actual.
    // Si letraActual === 0 estamos al principio de la fila y no hay nada que borrar.
    if (letraActual > 0) {
      // Retrocedemos una posición para colocarnos sobre la última letra escrita
      letraActual--;

      // Seleccionamos esa casilla y la vaciamos
      const box = document.getElementById(
        "box-" + intentoActual + "-" + letraActual,
      );
      if (box) box.textContent = "";
    }

    // Salimos: DEL no debe continuar con la lógica de escribir letras
    return;
  }

  // Tecla ENTER (validar la palabra de la fila actual)

  if (idTecla === "ENTER") {
    // No se puede validar una fila incompleta.
    // letraActual indica cuántas letras se han escrito; debe coincidir con maxLetras.
    if (letraActual < maxLetras) {
      console.log("La palabra no está completa");
      return;
    }

    // Se leen las letras escritas en la fila actual y se juntan en un string
    const palabraIntroducida = leerPalabraFila(intentoActual, maxLetras);

    // Se compara con la palabra secreta y se colorean las casillas:
    // Devuelve true si el jugador ha acertado la palabra completa.
    const resultado = comprobarPalabra(palabraIntroducida, intentoActual);

    // Si el jugador acierta la palabra | true = victoria
    if (resultado) {
      partidaGanada = true;
      guardarResultado(); // Se guarda el resultado en el localStorage
      mostrarPantallaReinicio(true);
      return;
    }

    // falla, pasamos a la siguiente fila
    intentoActual++; // Se baja a la siguiente fila
    letraActual = 0; // Se vuelve a la primera columna

    // Si ya no quedan más intentos, se termina la partida
    if (intentoActual >= maxIntentos) {
      console.log("Sin intentos. La palabra era: " + palabraSecreta);
      guardarResultado(); // Se guarda el resultado en el localStorage
      mostrarPantallaReinicio(false); // false = derrota
    }

    // Se sale de la partida
    return;
  }

  // =====================================================================
  // CASO 3: Letra normal (A-Z, Ñ, Á, É, ...)
  // =====================================================================

  // Si la fila ya está completa, no dejamos escribir más letras en ella.
  // Es necesario pulsar ENTER para validarla antes de pasar a la siguiente.
  if (letraActual >= maxLetras) return;

  // Se selecciona la casilla actual: fila = intentoActual, columna = letraActual
  const arrayBox = document.getElementById(
    "box-" + intentoActual + "-" + letraActual,
  );

  // Protección por si la casilla no existiera (no debería pasar, pero por seguridad)
  if (!arrayBox) return;

  // Se inserta la letra dentro de la casilla y avanzamos a la siguiente columna
  arrayBox.textContent = idTecla;
  letraActual++;
}

// **********************************************************************************************************
// __________________________________LECTURA Y COMPROBACIÓN DE PALABRAS______________________________________
// **********************************************************************************************************

// Lee las letras escritas del jugador de una fila en concreta.
function leerPalabraFila(numFila, numLetras) {
  let palabra = "";
  for (let i = 0; i < numLetras; i++) {
    let box = document.getElementById("box-" + numFila + "-" + i);
    palabra += box.textContent || " ";
  }
  return palabra;
}

// Compara la palabra introducida con la secreta y colorea las cajas
// Devuelve true si el usuario a acertado la palabra
function comprobarPalabra(palabraIntroducida, numFila) {
  const secreta = palabraSecreta;
  const longitud = secreta.length;

  // Se crea un array con las letras de la palabra secreta.
  // Se irán "tachando" (poniendo a null) las letras que ya se hayan emparejado,
  // para no contar dos veces la misma letra al marcar amarillos.
  const letrasDisponibles = secreta.split("");

  // Primera pasada: marcar las letras en posición correcta (verde)
  for (let i = 0; i < longitud; i++) {
    const box = document.getElementById("box-" + numFila + "-" + i);
    const letraUsuario = (box.textContent || "").toUpperCase();

    if (letraUsuario === secreta[i]) {
      box.classList.add("correcta");
      letrasDisponibles[i] = null; // Esa letra ya se ha usado
    }
  }

  // Segunda pasada: marcar letras que existen pero en otra posición (amarillo)
  for (let i = 0; i < longitud; i++) {
    const box = document.getElementById("box-" + numFila + "-" + i);
    const letraUsuario = (box.textContent || "").toUpperCase();

    // Solo se procesa si no fue ya marcada como correcta
    if (box.classList.contains("correcta")) continue;

    const indice = letrasDisponibles.indexOf(letraUsuario);
    if (indice !== -1) {
      box.classList.add("presente");
      letrasDisponibles[indice] = null; // Se consume esa letra
    } else {
      box.classList.add("ausente");
    }
  }

  // Se devuelve true si la palabra coincide exactamente con la secreta
  return palabraIntroducida.toUpperCase() === secreta;
}

// **********************************************************************************************************
// __________________________________REINICIAR_______________________________________________________________
// **********************************************************************************************************
const botonReiniciar = document.querySelector(".botonReiniciar");
const bloqueReinicio = document.querySelector(".reinicio");

// Se ejecuta cuando el jugador agota sus vidas o acierta la palabra.
function mostrarPantallaReinicio(resultado) {
  const mensaje = bloqueReinicio.querySelector("p");
  if (mensaje) {
    mensaje.textContent = resultado
      ? "¡Has ganado!"
      : "Has terminado. La palabra era: " + palabraSecreta;
  }

  cajaPalabra.classList.add("oculto");
  tecladoVirtual.classList.add("oculto");
  bloqueReinicio.classList.remove("oculto");

  // Tras darle click al boton vuelve a la primera configuración.
  // Se usa { once: true } para que el listener no se acumule si se muestra
  // esta pantalla varias veces a lo largo de la sesión.
  botonReiniciar.addEventListener("click", () => {
    bloqueReinicio.classList.add("oculto");
    primeraConfiguracion.classList.remove("oculto");

    // Se resetean los contadores para la siguiente partida
    intentoActual = 0;
    letraActual = 0;
    partidaGanada = false;
    palabraSecreta = "";

    // Se limpian los recuadros nuevamente
    cajaPalabra.innerHTML = "";
  });
}

// **********************************************************************************************************
// __________________________________GUARDAR RESULTADO EN LOCALSTAGE_________________________________________
// **********************************************************************************************************

/* 
Información ha guardar: 
-- 1. Palabra que se tenia que adivinar
-- 2. Intentos que se ha necesitado
-- 3. Fecha de cuando se ha jugado. Formato a seguir -> (dd/mm/yyyy hh:mm:ss)
-- 4. Resultado de la partida del jugador
-- 5. Se mostraran las 10 ultimas partidas jugadas
*/

function calcularFechaActual() {
  // Crear un objeto con la fecha y hora actual
  const ahora = new Date();

  const anio = ahora.getFullYear();
  // El método padStart asegura que los meses/días de un solo dígito tengan un 0 delante (ej: "09" en vez de "9")
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");

  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");

  // Concatenar con guiones y espacios para que sea texto legible
  const fechaActual = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  return fechaActual;
}

function guardarResultado() {
  // Calculamos los intentos usados.
  // intentoActual apunta a la fila donde está jugando.
  // Si ganó: usó (intentoActual + 1) intentos.
  // Si perdió: usó todos los intentos = intentos.value.
  const intentosUsados = partidaGanada
    ? intentoActual + 1
    : parseInt(intentos.value);

  const resultado = {
    palabraSecreta: palabraSecreta,
    intentos: intentosUsados,
    fecha: calcularFechaActual(),
    partidaGanada: partidaGanada,
  };

  // Se recupera el historial
  const historial = JSON.parse(localStorage.getItem("historialPartidas")) || [];

  // Se añade la nueva partida
  historial.push(resultado);

  // Se guarda el array actualizado
  localStorage.setItem("historialPartidas", JSON.stringify(historial));

  // DEBUG
  console.log("Partida guardada: ", resultado);
}

// **********************************************************************************************************
// __________________________________MOSTRAR HISTORIAL (10 ÚLTIMAS PARTIDAS)_________________________________
// **********************************************************************************************************

const bloqueHistorial = document.querySelector(".historial");
const listaHistorial = document.querySelector(".listaHistorial");
const botonVerHistorial = document.querySelector(".botonVerHistorial");
const botonCerrarHistorial = document.querySelector(".botonCerrarHistorial");

// Recupera el historial guardado en localStorage (o array vacío si no hay nada)
function obtenerHistorial() {
  return JSON.parse(localStorage.getItem("historialPartidas")) || [];
}

// Pinta en pantalla las 10 últimas partidas jugadas
function mostrarHistorial() {
  const historial = obtenerHistorial();

  // Si no hay partidas, pone el mesnaej de aviso
  if (historial.length === 0) {
    listaHistorial.innerHTML = "<li>No hay partidas guardadas todavía.</li>";
    return;
  }

  // Se guardan las 10 últimas partidas
  const ultimasDiez = historial.slice(-10);

  // reverse() invierte el array para que la última jugada aparezca primera
  ultimasDiez.reverse();

  listaHistorial.innerHTML = "";
  ultimasDiez.forEach((partida) => {
    const li = document.createElement("li");

    const estado = partida.partidaGanada ? "Ganada" : "Perdida";

    li.textContent =
      `${partida.fecha} — Palabra: ${partida.palabraSecreta} — ` +
      `Intentos: ${partida.intentos} — ${estado}`;

    li.classList.add(partida.partidaGanada ? "ganada" : "perdida");

    listaHistorial.append(li);
  });
}

// Abrir el panel de historial
botonVerHistorial.addEventListener("click", () => {
  mostrarHistorial(); // Pintamos los datos actualizados
  bloqueHistorial.classList.remove("oculto");
});

// Cerrar el panel de historial
botonCerrarHistorial.addEventListener("click", () => {
  bloqueHistorial.classList.add("oculto");
});
