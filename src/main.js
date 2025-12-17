import './styles/style.css'
import './styles/style_mobil.css'
import './scripts/datos_usuario_control.js'
import './scripts/votaciones.js'
import './scripts/gestionar_encuestas.js'

/*CODIGO */
const URL_REPOSITORIO_ORIGINAL = "https://github.com/MateoGonzalezLourido/maqueta-pagina-votaciones-uso-libre"

document.querySelector('#app').innerHTML = `
  <div id="bt-abrir-menu-log-admin"><span>*ADMIN*</span></div>
  <div class="usuario">
    <div id="bt-usuario"><span>*Datos Usuario*</span></div>
      <div id="menu-usuario">
        <div>
          <label for="input-nombre-usuario">Nombre:</label>
          <input type="text" placeholder="<anónimo>"value="" id="input-nombre-usuario">
          </div>
          <div>
          <label for="input-bono-usuario">Bono:</label>
          <input type="checkbox"id="input-bono-usuario">
        </div>
        <div class="nota-menu-usuario">*para actualizar estos datos en las votaciones ya hechas debes vover a hacer la votación</div>
      </div>
  </div>

  <main id="main"></main>
  <div class="display-none" id="alineador-pagina-datos-analizados-encuesta">
  <div id="pagina-datos-analizados-encuesta"></div>
  </div>
  <div class="footer"><a href="${URL_REPOSITORIO_ORIGINAL}">Github repositorio</a></div>
  <div id="menu-log-gestionador-encuestas" class="display-none"><input id="input-password-admin" type="password" inputmode="numeric" pattern="\d*"  value=""placeholder="*ADMIN KEY" autocomplete="on"></div>
`

//!!!! importante quitar esto si quieres desarrollar la pagina-> bloquea el inspection y otros contextmenu (este bloqueo se metio porque en el telefono al pulsar en la imagen para votar saltaba un contextmenu y afecta a la comodidad del uso de la pagina en el telefono) No bloquea el F12 
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
}, { passive: false });
