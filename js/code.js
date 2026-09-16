const boton = document.querySelector(".botonJugar");
const primeraConfiguracion = document.querySelector(".primeraConfiguracion");
const tecladoVirtual = document.querySelector(".tecladoVirtual");

boton.addEventListener("click", () => {
  primeraConfiguracion.classList.add("oculto");
  tecladoVirtual.classList.remove("oculto");
});
