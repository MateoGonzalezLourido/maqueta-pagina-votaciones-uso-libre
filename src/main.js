import './style.css'
import './scripts/datos_usuario_control.js'
import './scripts/votaciones.js'

/*CODIGO */
const URL_REPOSITORIO_ORIGINAL = "https://github.com/MateoGonzalezLourido/maqueta-pagina-votaciones-uso-libre"

document.querySelector('#app').innerHTML = `
  <div class="usuario">
    <div id="bt-usuario"><span>*Datos Usuario*</span></div>
      <div id="menu-usuario">
      <div>
        <label for="nombre">Nombre:</label>
        <input name="nombre" type="text" placeholder="<anónimo>"value="" id="input-nombre-usuario">
        </div>
        <div>
        <label for="bono">Bono:</label>
        <input name="bono" type="checkbox"id="input-bono-usuario">
        </div>
      </div>
  </div>

  <main id="main"></main>
  <div class="display-none" id="alineador-pagina-datos-analizados-encuesta">
  <div id="pagina-datos-analizados-encuesta"></div>
  </div>
  <div class="footer"><a href="${URL_REPOSITORIO_ORIGINAL}">Github repositorio</a></div>
`

//!!!! importante quitar esto si quieres desarrollar la pagina-> bloquea el inspection y otros contextmenu (este bloqueo se metio porque en el telefono al pulsar en la imagen para votar saltaba un contextmenu y afecta a la comodidad del uso de la pagina en el telefono)
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
}, { passive: false });
