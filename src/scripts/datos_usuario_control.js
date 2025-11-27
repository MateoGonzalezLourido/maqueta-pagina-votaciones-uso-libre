let $bt_usuario, $menu_usuario, $nombre_usuario, $bono_usuario

document.addEventListener("DOMContentLoaded", () => {
    $bt_usuario = document.querySelector("#bt-usuario")
    $menu_usuario = document.querySelector("#menu-usuario")

    $bt_usuario.addEventListener("click", (e) => {
        e.stopPropagation()
        flip_flop_menu()
    })
    //evento para actualizar datos
    $nombre_usuario = document.querySelector("#input-nombre-usuario")
    $bono_usuario = document.querySelector("#input-bono-usuario")

    $nombre_usuario.addEventListener("change", () => { actualizar_nombre() })

    $bono_usuario.addEventListener("change", () => { actualizar_bono() })
})

function flip_flop_menu() {
    if (!$menu_usuario.classList.contains("abierto")) {
        //coger datos
        const nombre_usuario = window.localStorage.getItem("nombre_variable")
        let bono_usuario = window.localStorage.getItem("bono_variable")

        $nombre_usuario.value = nombre_usuario
        if (bono_usuario == "true") $bono_usuario.checked = bono_usuario

        $bt_usuario.classList.add("cerrado")
        $menu_usuario.classList.add("abierto")

        //quitar al pulsar fuera del menu
        function cerrar_menu(e) {
            if (!$menu_usuario.contains(e.target)) {
                $menu_usuario.classList.remove("abierto")
                $bt_usuario.classList.remove("cerrado")
                globalThis.removeEventListener("click", cerrar_menu);
            }
        }
        setTimeout(() => {
            globalThis.addEventListener("click", cerrar_menu);
        }, 0);
    }
    else {
        $menu_usuario.classList.remove("abierto")
        $bt_usuario.classList.remove("cerrado")
    }
}

function actualizar_nombre() {
    const nombre_variable = "nombre_usuario"
    const valor_defecto = "anónimo"
    const valor_repuesto = !window.localStorage.getItem(nombre_variable) ? valor_defecto : window.localStorage.getItem(nombre_variable)
    let valor = $nombre_usuario.value.replace(/\n+/g, "").replace(/\s+/g, " ").replace(/[0-9|.<>,#;]/g, "").replaceAll("no bono", "").replaceAll("(bono)", "").replaceAll("bono", "")
    if (valor.length < 1) {
        valor = valor_repuesto
    }
    //parchear
    try {//intentar actualizar
        window.localStorage.setItem("nombre_variable", valor.slice(0, 40).toString())
    }
    catch {//establecer el anterior
        window.localStorage.setItem("nombre_variable", valor_repuesto)
    }
}

function actualizar_bono() {
    const bono_variable = "bono_usuario"
    const valor_defecto = false

    const valor_repuesto = !window.localStorage.getItem(bono_variable) ? valor_defecto : window.localStorage.getItem(bono_variable)
    const valor = $bono_usuario.checked ? $bono_usuario.checked : valor_repuesto
    //parchear
    try {//intentar actualizar
        window.localStorage.setItem("bono_variable", valor.toString())
    }
    catch {//establecer el anterior
        window.localStorage.setItem("bono_variable", valor_repuesto)
    }
}

//juega con la probabilidad para tratar de reducir que alguien tenga el mismo id
export function getBrowserFingerprint() {
    // Canvas + WebGL (muy útil para fingerprint)
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

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
        navigator.userAgent,                       // info del navegador
        navigator.language,                        // idioma
        navigator.languages.join(','),             // idiomas adicionales
        navigator.platform,                        // plataforma (Windows, Linux, Android…)
        navigator.vendor,                          // fabricante del navegador
        navigator.hardwareConcurrency,             // núcleos de CPU
        screen.colorDepth,                         // profundidad de color
        Intl.DateTimeFormat().resolvedOptions().timeZone, // zona horaria
        window.devicePixelRatio,                   // densidad de píxeles
        webglInfo                                  // info GPU/driver
    ].join('||');

    // Hash simple para crear un ID único
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const chr = data.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash)
}