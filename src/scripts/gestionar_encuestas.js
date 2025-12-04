/*Importar cosas necesarias para el codigo */
import { supabase } from '../supabase/supabase'

/*VARIABLES */
const ID_BT_ABRIR_PAGINA_ADMIN = "bt-abrir-menu-log-admin"
const ID_BT_AÑADIR_ENCUESTA = "bt-añadir-encuesta"
const ID_BT_VOLVER_HOME = "bt-volver-home"
const ID_MENU_ADMIN = "menu-log-gestionador-encuestas"
const ID_INPUT_KEY_ADMIN = "input-password-admin"
const CLASS_MOSTRAR_MENU = "mostrar-menu-log"
const CLASS_QUITAR_MENU = "quitar-menu-log"
const MENSAJE_ACCESO_CORRECTO = "*Acceso <ROLE> ADMIN correcto"
const URL_IMG_AÑADIR_ENCUESTA = ""
const $id_select_encuestas = "select-encuestas"
const $alineador_pagina_datos_analizados_encuesta = "alineador-pagina-datos-analizados-encuesta"
const $pagina_datos_analizados_encuesta = "pagina-datos-analizados-encuesta"
//Valores por defecto 
const VALOR_DEFECTO_NOMBRE_USUARIO = "anónimo"
//supabse datos
const NOMBRE_TABLA_ENCUESTAS = "encuestas"
const NOMBRE_TABLA_VOTACIONES = "encuestas_votaciones"
const NOMBRE_TABLA_DEFECTO_USAR = NOMBRE_TABLA_ENCUESTAS
//funciones de SUPABASE
const conseguir_datos_SUPABASE = async ({ encuesta_id = null, tabla = NOMBRE_TABLA_DEFECTO_USAR }) => {
    let query = supabase.from(tabla).select("*");
    if (encuesta_id) query = query.eq("id_encuesta", encuesta_id);

    const { data, error } = await query;
    if (error) {
        console.log("ERROR al recibir datos de las encuestas:", error)
        return []
    }
    return data
}


const borrar_votacion_encuesta = async (id_nombre, id_encuesta, opcion_votada_encuesta) => {
    const { error } = await supabase
        .from(NOMBRE_TABLA_VOTACIONES)
        .delete()
        .eq('id_nombre', id_nombre)
        .eq('id_encuesta', id_encuesta)
        .eq("opcion_votada_encuesta", opcion_votada_encuesta);

    if (error) {
        console.error("Error al borrar el voto:", error)
    }
}
const añadir_votacion_encuesta = async ({ id_nombre, id_encuesta, opcion_votada_encuesta, nombre_votante, bono_votante }) => {
    const { error } = await supabase
        .from(NOMBRE_TABLA_VOTACIONES)
        .insert([
            {
                "id_nombre": id_nombre,
                "id_encuesta": id_encuesta,
                "opcion_votada_encuesta": opcion_votada_encuesta,
                "nombre_votante": nombre_votante,
                "bono_votante": bono_votante
            }
        ]);

    if (error) {
        console.error("Error al añadir voto:", error);
    }
}
// TODO: algo pendiente
function verificar_acceso_admin(entrada) {//132546781535
    if (entrada = 1) {
        return true
    }
    return false
}

function generar_select_encuestas() {

}
function generar_opciones_encuesta() {

}
function actualizar_pagina(encuesta_id) {
    document.querySelector("#app").innerHTML = `
    <div><span id="${ID_BT_VOLVER_HOME}"><-HOME-></span></div>
            <main>
            <section><select>${generar_select_encuestas(encuesta_id)}</select><div id="${ID_BT_AÑADIR_ENCUESTA}"><img class="img-añadir-encuesta" src="${URL_IMG_AÑADIR_ENCUESTA}" alt=""></div></section>
            <section>
            ${generar_opciones_encuesta()}
            </section>
            <section><button>Guardar Cambios</button></section>            
            </main>
        `
}
const generar_titulos_encuestas = (data, encuesta_id) => {
    let html = ``
    data.forEach(encuesta => {
        let principal = ""
        if (encuesta_id == encuesta.id_encuesta) {//poner una encuesta como principal (la que se seleccionó)
            principal = "selected"
        }
        html += `<option value="${encuesta.titulo}" ${principal}>${encuesta.titulo}</option>`
    })
    return html
}
//fragmento de codigo para el recuento de votos generales
function contador_votos(votaciones) {
    let contador_votaciones = []
    votaciones.forEach(vt => {
        //buscar si ya existe registro
        const indice = contador_votaciones.findIndex(x => x.id == vt.opcion_votada_encuesta)
        if (indice != -1) {//contar voto
            contador_votaciones[indice].votantes.push({ "nombre": vt.nombre_votante, "bono": vt.bono_votante })
        }
        else {//crear registro
            contador_votaciones.push({
                "id": vt.opcion_votada_encuesta,
                "votantes": [{ "nombre": vt.nombre_votante, "bono": vt.bono_votante }]
            })
        }
    })
    return contador_votaciones
}
const Generar_configurador_encuesta = (id_encuesta) => {
    let html = ``

    return html
}
const Generar_resultados_encuesta = (id_encuesta) => {
    //evento analizar datos
    const Datos_completar = (encuesta, votaciones) => {
        document.querySelector("#main").style.cursor = "progress"//puntero cargando
        document.querySelector("#main").style.cursor = "default"//quitar puntero cargando
        const contador_votaciones = contador_votos(votaciones)
        const mostrar_recuento_votos = () => {
            let html = ``
            html += `<tr><td>Opción</td><td>nºvotos</td><td>nºbonos</br>(confirmados)</td></tr>`
            let opciones_ordenadas_mayor = contador_votaciones.sort((x, y) => y.votantes.length - x.votantes.length)
            opciones_ordenadas_mayor.forEach(datos_op => {
                let recuento_bonos = 0
                datos_op.votantes.forEach(vt => {
                    if (vt.bono) recuento_bonos++
                })
                html += `<tr>
                            <td>${encuesta[0].opciones[datos_op.id]}</td>
                            <td>${[datos_op.votantes.length]}</td>
                            <td>${recuento_bonos}</td>
                            </tr>`
            })
            return html
        }
        const mostrar_nombre_votantes = () => {
            let html = ``
            html += `<tr><td>Opción</td><td>Votantes</td></tr>`
            let opciones_ordenadas_mayor = contador_votaciones.sort((x, y) => y.votantes.length - x.votantes.length)
            opciones_ordenadas_mayor.forEach(datos_op => {
                let usuario_datos = {
                    "identificados": [],
                    "anonimos": {
                        "totales": 0,
                        "bonos": 0
                    }
                }
                datos_op.votantes.forEach(vt => {
                    if (vt.nombre != "anónimo") {
                        if (vt.bono == true) {
                            usuario_datos.identificados.push(`${vt.nombre}(bono)`)
                        }
                        else {
                            usuario_datos.identificados.push(vt.nombre)
                        }
                    }
                    else {
                        usuario_datos.anonimos.totales++
                        if (vt.bono == true) usuario_datos.anonimos.bonos++
                    }
                })
                let usuarios = ``
                if (usuario_datos.anonimos.totales != 0) {
                    usuarios += `*${VALOR_DEFECTO_NOMBRE_USUARIO} (bonos: ${usuario_datos.anonimos.bonos} de ${usuario_datos.anonimos.totales})`
                    if (usuario_datos.identificados.length != 0) {
                        usuarios += "</br>"
                    }
                }
                usuario_datos.identificados.forEach(us => {
                    usuarios += `${us}</br>`
                })
                html += `<tr>
                            <td>${encuesta[0].opciones[datos_op.id]}</td>
                            <td>${usuarios}</td>
                            </tr>`
            })
            return html
        }
        return (`<div class="head-pagina-datos"><h3>${encuesta[0].titulo}</h3></div>
                    <table>
                    <caption><strong>Recuento de votos</strong></br>(más a menos votado)</caption>
                    ${mostrar_recuento_votos()}
                    </table>
                    <table>
                    <caption><strong>Votantes</strong> (más a menos votado)</caption>
                    ${mostrar_nombre_votantes()}
                    </table>`)
    }
    conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
        conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_VOTACIONES }).then((votaciones) => {
            document.querySelector("#cuerpo-cosas").innerHTML = `
                <div id="${$pagina_datos_analizados_encuesta}" style="width:calc(100% - 28px) !important">
                ${Datos_completar(encuesta, votaciones)}
                </div>`
        })
    })
}
//generador principal
const Generar_cuerpo_configurador_votacion = (data, id_encuesta, opcion) => {
    const opcion1 = opcion == 1 ? "usando" : "no-usando"
    const opcion2 = opcion == 2 ? "usando" : "no-usando"
    function Generar_cuerpo(opcion) {
        if (opcion == 1) Generar_configurador_encuesta(id_encuesta)
        else if (opcion == 2) Generar_resultados_encuesta(id_encuesta)
    }

    document.querySelector("#main").innerHTML = `
    <section>
        <select id="${$id_select_encuestas}">
            ${generar_titulos_encuestas(data, id_encuesta)}
        </select>
        <div id="${ID_BT_AÑADIR_ENCUESTA}">
            <img class="img-añadir-encuesta" src="${URL_IMG_AÑADIR_ENCUESTA}" alt="">
        </div>
    </section>
        <div class="div-juntar-todo-cuerpo-opciones">
            <button id="configurar-bt" class="bt-opciones-admin-encuesta ${opcion1}">Configurar</button>
            <button id="resultados-bt" class="bt-opciones-admin-encuesta ${opcion2}">Resultados</button>
            <section id="cuerpo-cosas"class="cuerpo-opciones">
            </section>
        </div>`
    //completar cuerpo
    Generar_cuerpo(opcion)
    //eventos cambiar cuerpo main
    document.querySelector("#configurar-bt").addEventListener("click", () => {
        if (opcion != 1) {
            Generar_cuerpo_configurador_votacion(data, id_encuesta, 1)
        }
    })
    document.querySelector("#resultados-bt").addEventListener("click", () => {
        if (opcion != 2) {
            Generar_cuerpo_configurador_votacion(data, id_encuesta, 2)
        }
    })
    //evento cambio de encuesta
    document.querySelector(`#${$id_select_encuestas}`).addEventListener("change", (e) => {
        const titulo_escogido = e.target.value
        const encuesta_escogida = data.find(x => x.titulo == titulo_escogido)
        Generar_cuerpo_configurador_votacion(data, encuesta_escogida, 1)
    })
}
//animacion
function cerrar_log() {
    document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).classList.remove("display-none")
    document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).blur()
    document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).value = ""
    document.querySelector(`#${ID_MENU_ADMIN}`).classList.remove(CLASS_MOSTRAR_MENU)
    document.querySelector(`#${ID_MENU_ADMIN}`).classList.add(CLASS_QUITAR_MENU)
}
//iniciador
globalThis.addEventListener("DOMContentLoaded", () => {
    document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).addEventListener("click", () => {
        document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).classList.add("display-none")
        if (document.querySelector(`#${ID_MENU_ADMIN}`)) {
            document.querySelector(`#${ID_MENU_ADMIN}`).classList.remove(CLASS_QUITAR_MENU)
            document.querySelector(`#${ID_MENU_ADMIN}`).classList.add(CLASS_MOSTRAR_MENU)
            document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).focus()
            document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).addEventListener("blur", () => {
                cerrar_log()
            })
            document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const entrada_key_log = (document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).value.replace(/[.\\/;,!#{}%&$"'*]/g, " ").trim()).toString()
                    if (verificar_acceso_admin(entrada_key_log)) {
                        console.log(MENSAJE_ACCESO_CORRECTO)
                        //poner una como principal
                        conseguir_datos_SUPABASE({}).then(data => {
                            //escoger una encuesta como principal(si hay solo una principal esa es, sino se coge la primera que llegue)
                            //esto se hace solo al inicio, luego solo se pone la que se seleccione
                            let encuesta_id = data.find(x => x.principal == true)
                            if (!encuesta_id) {
                                encuesta_id = data[0].id_encuesta
                            }
                            else {
                                encuesta_id = encuesta_id.id_encuesta
                            }
                            document.querySelector("#app").innerHTML = `
                            <div><span id="${ID_BT_VOLVER_HOME}"><-HOME-></span></div>
                            <main id="main">
                            </main>
                            `
                            //completar main
                            Generar_cuerpo_configurador_votacion(data, encuesta_id, 1)
                        })
                    }
                    else {
                        cerrar_log()
                    }
                }
            })
        }
    })
})