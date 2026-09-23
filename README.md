# Wordle Jolasa / Wordle en Español

Una web interactiva del juego de palabras **Wordle**, desarrollada con (**HTML5**, **CSS3** y **JavaScript**). El juego obtiene palabras aleatorias en español en tiempo real mediante una API externa, permite personalizar la dificultad y guarda el registro de partidas localmente.

---

## Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Cómo Jugar](#-cómo-jugar)
  - [Reglas y Código de Colores](#reglas-y-código-de-colores)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionamiento y Arquitectura](#-funcionamiento-y-arquitectura)
  - [1. Configuración Dinámica de Partida](#1-configuración-dinámica-de-partida)
  - [2. Obtención de Palabras (API)](#2-obtención-de-palabras-api)
  - [3. Soporte Dual de Entrada (Físico y Virtual)](#3-soporte-dual-de-entrada-físico-y-virtual)
  - [4. Algoritmo de Validación en Dos Pasadas](#4-algoritmo-de-validación-en-dos-pasadas)
  - [5. Persistencia del Historial (`localStorage`)](#5-persistencia-del-historial-localstorage)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Posibles Mejoras Futuras](#-posibles-mejoras-futuras)
- [Autor](#-autor)

---

## Características Principales

- **Dificultad Configurable**:
  - **Número de intentos**: Selecciona entre **2 y 7 intentos**.
  - **Longitud de la palabra**: Configura palabras de **3 a 9 letras**.
- **Generación Dinámica de Tablero**: La cuadrícula se adapta automáticamente en filas y columnas según la configuración seleccionada.
- **Conexión con API Externa**: Obtiene palabras aleatorias en español con la longitud exacta mediante `random-word-api`.
- **Doble Modo de Entrada**:
  - **Teclado Virtual**: En pantalla, adaptado al español (incluye la **Ñ** y fila especial para vocales acentuadas **Á, É, Í, Ó, Ú**).
  - **Teclado Físico**: Detección nativa de eventos de teclado (`keydown`) con filtro por expresiones regulares.
- **Historial de Partidas Persistente**:
  - Almacena automáticamente los resultados en el almacenamiento local del navegador (`localStorage`).
  - Modal para consultar las **últimas 10 partidas jugadas** con fecha, hora, palabra secreta, intentos empleados y estado (ganada/perdida).
- **Diseño Moderno e Intuitivo**:
  - Animaciones y transiciones suaves al interactuar con botones y teclas.
  - Diseño adaptable centrado y limpio con CSS Grid y Flexbox.

---

## Cómo Jugar

1. **Configura tu partida**: En la pantalla de inicio, selecciona el número de intentos deseados y la cantidad de letras que tendrá la palabra secreta.
2. Pulsa en **Jugar** para iniciar la partida y generar el tablero.
3. Introduce letras utilizando tu teclado físico o pulsando los botones del teclado virtual en pantalla.
4. Pulsa **ENTER** para enviar tu intento o **DEL / Retroceso** para corregir letras.
5. Al finalizar, la pantalla de resumen te indicará si has ganado o perdido (revelando la palabra secreta) y te permitirá volver a jugar o consultar tu historial.

### Reglas y Código de Colores

Cada vez que envíes una palabra completa, las casillas cambiarán de color según la precisión del intento:

| Color | Estado | Significado |
| :--- | :--- | :--- |
| **Verde** (`#6aaa64`) | **Correcta** | La letra está en la palabra secreta y en la **posición exacta**. |
| **Amarillo** (`#c9b458`) | **Presente** | La letra está en la palabra secreta, pero en una **posición distinta**. |
| **Gris** (`#787c7e`) | **Ausente** | La letra **no forma parte** de la palabra secreta (o ya se han contabilizado todas sus apariciones). |

---

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica de la aplicación, formularios de selección y contenedores modales.
- **CSS3**:
  - Maquetación avanzada mediante **CSS Grid** y **Flexbox**.
  - Transiciones fluidas (`transition: transform, background-color`).
  - Paleta de colores inspirada en la versión oficial de Wordle.
- **JavaScript**:
  - Peticiones asíncronas con la API nativa `fetch` y sintaxis `async/await`.
  - Manipulación dinámica del DOM (`document.createElement`, `classList`, etc.).
  - Gestión de eventos de teclado físico (`keydown`) y delegación de eventos virtuales (`click`).
  - Persistencia de datos en cliente mediante `window.localStorage` (formato JSON).
- **API Externa**: [Random Word API](https://random-word-api.herokuapp.com/) para la generación de palabras en español.

---

## Estructura del Proyecto

```plaintext
Wordle_Jokua/
├── index.html        # Estructura principal del juego, teclado virtual y modales
├── css/
│   └── styles.css    # Hojas de estilo: diseño de cuadrículas, teclado y estados visuales
├── js/
│   └── code.js       # Lógica del juego: conexión API, eventos, validación y localStorage
└── README.md         # Documentación detallada del proyecto
```

---

## Funcionamiento y Arquitectura

### 1. Configuración Dinámica de Partida
El usuario selecciona el número de intentos y el tamaño de palabra en elementos `<select>`. Al pulsar `Jugar`, la función `generarCuadrados(letras, intentos)` construye la matriz de celdas en el DOM asignando identificadores únicos del tipo:
```text
box-[fila]-[columna]   (ej: box-0-2 para la 3ª letra del 1º intento)
```

### 2. Obtención de Palabras (API)
Se utiliza una función asíncrona que consulta el endpoint:
```javascript
https://random-word-api.herokuapp.com/word?number=1&lang=es&length={numLetras}
```
Si la petición tiene éxito, la palabra se normaliza a mayúsculas para unificar comparaciones. Si ocurre un fallo de conexión, se captura la excepción en el bloque `catch`.

### 3. Soporte Dual de Entrada (Físico y Virtual)
Ambos métodos de entrada convergen en la misma función controladora `procesarTecla(idTecla)`:
- **Teclado físico**: Escucha el evento global `window.addEventListener('keydown')`, normaliza las teclas de control (`Enter` ➔ `ENTER`, `Backspace`/`Delete` ➔ `DEL`) y valida mediante la expresión regular `/^[A-ZÑ]$/`.
- **Teclado virtual**: Escucha los clics sobre los botones que contienen la clase `.tecla`.

### 4. Algoritmo de Validación en Dos Pasadas
Para evitar falsos positivos con letras repetidas (un problema común al implementar Wordle), la función `comprobarPalabra` ejecuta un algoritmo en dos fases:
1. **Primera pasada (Verdes)**: Comprueba las coincidencias exactas en posición (`letraUsuario === secreta[i]`). Las letras acertadas se descartan del array auxiliar asignándoles `null`.
2. **Segunda pasada (Amarillos y Grises)**: Para las casillas restantes, busca si la letra existe en el array auxiliar de letras disponibles. Si existe, la marca de amarillo y la consume (`null`). En caso contrario, se marca como gris.

### 5. Persistencia del Historial (`localStorage`)
Al terminar una partida (por victoria o por agotar los intentos), se genera un objeto con el siguiente formato:
```json
{
  "palabraSecreta": "ARBOL",
  "intentos": 4,
  "fecha": "2026-09-23 10:15:30",
  "partidaGanada": true
}
```
Este objeto se inserta en un array guardado bajo la clave `"historialPartidas"`. Al abrir el panel de historial, se recuperan y renderizan las **últimas 10 partidas** en orden cronológico inverso.

## Autor

Desarrollado por [Egoitz20](https://github.com/Egoitz20).
