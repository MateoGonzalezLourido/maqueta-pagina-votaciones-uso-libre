/*variables globales*/
import { NAME_DT_LOC_BONO_VARIABLE, NAME_DT_LOC_NOMBRE_VARIABLE, VALOR_DEFECTO_NOMBRE_USUARIO, VALOR_DEFECTO_BONO_USUARIO, NAME_ID_USUARIO_ALEATORIO } from '../config.js'
import { conseguir_datos_SUPABASE } from '../supabase/funciones.js'
/*variables del fichero */
//IDs o partes
const $ID_BT_USUARIO = "bt-usuario"
const $ID_MENU_USUARIO = "menu-usuario"
const $ID_INPUT_NOMBRE_USUARIO = "input-nombre-usuario"
const $ID_INPUT_BONO_USUARIO = "input-bono-usuario"
//clases
const CLASS_CERRAR_MENU = "cerrado"
const CLASS_ABRIR_MENU = "abierto"

/*CODIGO */
let $bt_usuario, $menu_usuario, $nombre_usuario, $bono_usuario
document.addEventListener("DOMContentLoaded", () => {
    $bt_usuario = document.querySelector(`#${$ID_BT_USUARIO}`)
    $menu_usuario = document.querySelector(`#${$ID_MENU_USUARIO}`)

    $bt_usuario.addEventListener("click", (e) => {
        e.stopPropagation()
        flip_flop_menu()
    })
    //evento para actualizar datos
    $nombre_usuario = document.querySelector(`#${$ID_INPUT_NOMBRE_USUARIO}`)
    $bono_usuario = document.querySelector(`#${$ID_INPUT_BONO_USUARIO}`)

    $nombre_usuario.addEventListener("change", () => { actualizar_nombre() })

    $bono_usuario.addEventListener("change", () => { actualizar_bono() })
})

function flip_flop_menu() {
    if (!$menu_usuario.classList.contains("abierto")) {
        //coger datos
        const nombre_usuario = window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE)
        let bono_usuario = window.localStorage.getItem(NAME_DT_LOC_BONO_VARIABLE)

        $nombre_usuario.value = nombre_usuario
        if (bono_usuario == "true") $bono_usuario.checked = bono_usuario

        $bt_usuario.classList.add(CLASS_CERRAR_MENU)
        $menu_usuario.classList.add(CLASS_ABRIR_MENU)

        //quitar al pulsar fuera del menu
        function cerrar_menu(e) {
            if (!$menu_usuario.contains(e.target)) {
                $menu_usuario.classList.remove(CLASS_ABRIR_MENU)
                $bt_usuario.classList.remove(CLASS_CERRAR_MENU)
                globalThis.removeEventListener("click", cerrar_menu);
            }
        }
        setTimeout(() => {
            globalThis.addEventListener("click", cerrar_menu);
        }, 0);
    }
    else {
        $menu_usuario.classList.remove(CLASS_ABRIR_MENU)
        $bt_usuario.classList.remove(CLASS_CERRAR_MENU)
    }
}

function actualizar_nombre() {
    const valor_repuesto = !window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE) ? VALOR_DEFECTO_NOMBRE_USUARIO : window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE)
    let valor = $nombre_usuario.value.replace(/\n+/g, "").replace(/\s+/g, " ").replace(/[0-9|.<>!$%,#;]/g, "").replaceAll("no bono", "").replaceAll("(bono)", "").replaceAll("bono", "")
    if (valor.length < 1) {
        valor = valor_repuesto
    }
    //parchear
    try {//intentar actualizar
        window.localStorage.setItem(NAME_DT_LOC_NOMBRE_VARIABLE, valor.slice(0, 40).toString())
    }
    catch {//establecer el anterior
        window.localStorage.setItem(NAME_DT_LOC_NOMBRE_VARIABLE, valor_repuesto)
    }
}

function actualizar_bono() {
    const valor_repuesto = !(window.localStorage.getItem(NAME_DT_LOC_BONO_VARIABLE)) ? VALOR_DEFECTO_BONO_USUARIO : window.localStorage.getItem(NAME_DT_LOC_BONO_VARIABLE)
    const valor = $bono_usuario.checked == true ? "true" : "false"
    //parchear
    try {//intentar actualizar
        window.localStorage.setItem(NAME_DT_LOC_BONO_VARIABLE, valor)
    }
    catch {//establecer el anterior
        window.localStorage.setItem(NAME_DT_LOC_BONO_VARIABLE, valor_repuesto)
    }
}

//generar de id (trata de perdurar lo maximo posible, para que no cambie)
export function getBrowserFingerprint() {
    function no_funciona() {
        const ID_USUARIO_GUARDADO = window.localStorage.getItem(NAME_ID_USUARIO_ALEATORIO)
        if (ID_USUARIO_GUARDADO) {//existe?
            return ID_USUARIO_GUARDADO
        }
        else {//no existe?
            const id = conseguir_datos_SUPABASE({ tabla: "votaciones", datos_recibir: ["id_nombre"] }).then((IDS) => {
                let id_nuevo = "n9n"//meter algo por defecto para identificar
                while (true) {
                    id_nuevo += Math.floor(Math.random() * 10) + min
                    if (!(IDS.includes(id_nuevo))) break;//si no existe
                }
                //guardar para la proxima
                window.localStorage.setItem(NAME_ID_USUARIO_ALEATORIO, id_nuevo)

                resolve(id_nuevo);
            })
            return id;
        }
    }
    try {
        // Canvas + WebGL (muy útil para fingerprint)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        let webglInfo = '';
        if (gl) {
            webglInfo = [
                gl.getParameter(gl.RENDERER),
                gl.getParameter(gl.VENDOR),
                gl.getParameter(gl.VERSION)
            ].join('|');
        }

        // Datos que incluyen lo que pediste
        const data = [
            navigator.language,                        // idioma
            navigator.languages.join(','),             // idiomas adicionales
            navigator.platform,                        // plataforma (Windows, Linux, Android…)
            navigator.vendor,                          // fabricante del navegador
            navigator.hardwareConcurrency,             // núcleos de CPU
            navigator.maxTouchPoints,                  // hardware
            screen.colorDepth,                         // profundidad de color
            Intl.DateTimeFormat().resolvedOptions().timeZone, // zona horaria
            window.devicePixelRatio,                   // densidad de píxeles   
        ].join('||');

        // Hash simple para crear un ID único
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const chr = data.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        if (Math.abs(hash).length < 4 || (!hash)) {
            no_funciona()
        }
        else {
            return Math.abs(hash)
        }
    }
    catch {//el navegador no lo soporta- darle uno que no entre en el rango de los otros
        no_funciona()
    }
}