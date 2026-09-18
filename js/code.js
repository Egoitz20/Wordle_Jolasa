"use strict";

// **********************************************************************************************************
// __________________________________BOTON JUGAR Y GENERACIÓN DE CUADRADOS___________________________________
// **********************************************************************************************************

const botonJugar = document.querySelector(".botonJugar");
const primeraConfiguracion = document.querySelector(".primeraConfiguracion");
const cajaPalabra = document.querySelector(".cajaPalabra");
let letras = "";
let intentos = "";

// Interacción al darle boton de "Jugar", oculta el div principal y visualiza el teclado y los cuadrados del juego
botonJugar.addEventListener("click", () => {
  primeraConfiguracion.classList.add("oculto");
  cajaPalabra.classList.remove("oculto");
  tecladoVirtual.classList.remove("oculto");

  letras = document.getElementById("letras");
  intentos = document.getElementById("intentos");
  console.log("Intentos: ", intentos.value, " Letras: ", letras.value);
  generarCuadrados(letras.value, intentos.value); // el .value devuelve el valor seleccionado
});

// Función que dinamicamente añade inputs segun la longitud del numero de letras seleccionado
// Y agrega filas segun el numero de intentos seleccionado.
function generarCuadrados(letras, intentos) {
  // innerHTML añade al html el contenido nuevo
  cajaPalabra.innerHTML = "";

  for (let i = 0; i < intentos; i++) {
    let linea = document.createElement("div"); // 
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
  // Se recoge en una variable la tecla presionada
  const teclaPresionada = e.key.toUpperCase();

  //Para que no salte error en el depurador y solo detecte teclas especificas (Ej. F5)
  // Solo mira las teclas de la A a la Z y Ñ incluida
  const validacionTecla = /^[A-ZÑ]$/.test(teclaPresionada);

  //Se reutiliza la función de procesarTecla() para que escriba dentro de los recuadros
  // Se valida si la letra pulsada corresponde con la regla.
  if (validacionTecla) {
    procesarTecla(teclaPresionada);
  }
});

// **********************************************************************************************************
// __________________________________FUNCIÓN PARA LA INTERACCION DE TECLAS___________________________________
// **********************************************************************************************************

// Controla donde posicionar la letra seleccionada,
// si se llega al final de la fila continua con la siguiente fila
function procesarTecla(idTecla) {
  const maxLetras = parseInt(letras.value);
  const maxIntentos = parseInt(intentos.value);

  // Si los intentos se han agotado, no procesan mas teclas.
  if (intentoActual >= maxIntentos) {
    return;
  }

  // DEBUG
  console.log(
    "Se ha pulsado la tecla con ID: " +
      idTecla +
      " Se ha escrito en la fila " +
      intentoActual,
  );

  // Se selecciona el recuadro actual
  const arrayBox = document.getElementById(
    "box-" + intentoActual + "-" + letraActual,
  );

  arrayBox.textContent = idTecla; // Se inserta el texto dentro del recuadro
  letraActual++; // Se pasa al siguiente recuadro

  // Se comprueba si se ha rellenado el ultimo recuadro
  if (letraActual === maxLetras) {
    // DEBUG
    console.log(
      "Fila " + intentoActual + " completada, pasando al siguiente intento.",
    );

    intentoActual++; // Siguiente fila
    letraActual = 0; // Se restablece el cursor de la primera columna
  }

  // Se finaliza el juego
  if (intentoActual >= maxIntentos) {
    mostrarPantallaReinicio();
  }
}

// **********************************************************************************************************
// __________________________________REINICIAR_______________________________________________________________
// **********************************************************************************************************
const botonReiniciar = document.querySelector(".botonReiniciar");
const bloqueReinicio = document.querySelector(".reinicio");

// Se ejecuta cuando el jugador agota sus vidas.
function mostrarPantallaReinicio() {
  bloqueReinicio.classList.remove("oculto");
  cajaPalabra.classList.add("oculto");
  tecladoVirtual.classList.add("oculto");

  // Tras darle click al boton vuelve a la primera configuración
  botonReiniciar.addEventListener("click", () => {
    bloqueReinicio.classList.add("oculto");
    primeraConfiguracion.classList.remove("oculto");

    // Se resetean los contadores para la siguiente partida
    intentoActual = 0;
    letraActual = 0;

    // Se limpian los recuadros nuevamente
    cajaPalabra.innerHTML = "";
  });
}

// ************************************************************************************
// __________________________________CONEXIÓN API______________________________________
// ************************************************************************************

const API = "https://random-word-api.herokuapp.com/all?lang=es";
// Se declara la función con async
async function obtenerPalabras() {
  try {
    // 'await fetch' va a buscar los datos a la API y se queda espereando a que respondan
    const respuesta = await fetch(API);

    // 'await respuesta.json' traduce la respuesta a un Array de plabaras JavaScript
    const palabras = await respuesta.json();

    console.log("Palabras recibidas:", palabras);
    console.log("Total de palabras:", palabras.length);
    console.log("Primera palabra:", palabras[0]);
  } catch (error) {
    console.error("Hubo un error al conectar con la API:", error);
  }
}

// https://random-word-api.herokuapp.com/word?number=1&lang=es&length=5
