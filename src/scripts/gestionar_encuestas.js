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
const $pagina_datos_analizados_encuesta = "admin-pagina-datos-analizados-encuesta"
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
const actualizar__encuesta = async (id_encuesta, datos_cambiar) => {
    const { error } = await supabase
        .from(NOMBRE_TABLA_ENCUESTAS)
        .update(datos_cambiar)
        .eq("id_encuesta", id_encuesta);

    if (error) {
        console.error("Error al cambiar datos de la encuesta:", error)
    }
}
// TODO: algo pendiente
function verificar_acceso_admin(entrada) {//132546781535
    if (entrada = 1) {
        return true
    }
    return false
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
function sanitizar_datos(datos) {
    let texto_recibido = datos
    texto_recibido = texto_recibido.replace(/\n+/g, "").replace(/\s+/g, " ").replace(/[<>#;!$%_]/g, "")

    return datos
}
function recoger_datos() {
    const datos_recogidos = {}
    //recoger datos
    datos_recogidos.titulo = sanitizar_datos(document.querySelector("#input-titulo").value)
    //datos opciones
    datos_recogidos.opciones = []
    const opciones = (document.querySelector("#input-opciones").value).split(",")
    opciones.forEach(e => {
        datos_recogidos.opciones.push(sanitizar_datos(e))
    })
    datos_recogidos.voto_unico = document.querySelector("#input-votounico").checked
    datos_recogidos.principal = document.querySelector("#input-principal").checked
    //fecha inicio fin
    datos_recogidos.duracion_fechas = ["", ""]
    datos_recogidos.duracion_fechas[0] = document.querySelector("#input-fecha-inicio").value
    datos_recogidos.duracion_fechas[1] = document.querySelector("#input-fecha-fin").value

    datos_recogidos.republicar = document.querySelector("#input-republicar").checked
    datos_recogidos.mostrar_resultados_cerrada = document.querySelector("#input-mostrarresultados").checked
    datos_recogidos.voto_anonimo = document.querySelector("#input-anonimo").checked
    datos_recogidos.datos_anonimos = document.querySelector("#input-datos_anonimos").checked

    return datos_recogidos
}
function comprobar_actualizar_datos(id_encuesta,datos_guardados) {
    let nuevos_datos_guardado = datos_guardados
    const datos = recoger_datos()
    const datos_cambiar = {}
    //meter datos para comparar
    if (datos_guardados.titulo != datos.titulo) {
        datos_cambiar.titulo = datos.titulo
        nuevos_datos_guardado.titulo = datos.titulo
    }
    if (datos_guardados.opciones.toString() != datos.opciones.toString()) {
        datos_cambiar.opciones = datos.opciones
        nuevos_datos_guardado.opciones = datos.opciones
    }
    if (datos_guardados.principal != datos.principal) {
        datos_cambiar.principal = datos.principal
        nuevos_datos_guardado.principal = datos.principal
    }
    //fechas inicio fin
    /*const fechas = [datos.duracion_fechas[0], datos.duracion_fechas[1]]
    if (encuesta[0].duracion_fechas != datos.duracion_fechas){
        datos_cambiar.duracion_fechas = fechas
        nuevos_datos_guardado.duracion_fechas = datos.duracion_fechas
    }*/

    if (datos_guardados.republicar != datos.republicar) {
        datos_cambiar.republicar = datos.republicar
        nuevos_datos_guardado.republicar = datos.republicar
    }
    if (datos_guardados.voto_unico != datos.voto_unico) {
        datos_cambiar.voto_unico = datos.voto_unico
        nuevos_datos_guardado.voto_unico = datos.voto_unico
    }
    if (datos_guardados.mostrar_resultados_cerrada != datos.mostrar_resultados_cerrada) {
        datos_cambiar.mostrar_resultados_cerrada = datos.mostrar_resultados_cerrada
        nuevos_datos_guardado.mostrar_resultados_cerrada = datos.mostrar_resultados_cerrada
    }
    if (datos_guardados.datos_anonimos != datos.datos_anonimos) {
        datos_cambiar.datos_anonimos = datos.datos_anonimos
        nuevos_datos_guardado.datos_anonimos = datos.datos_anonimos
    }
    if (datos_guardados.voto_anonimo != datos.voto_anonimo) {
        datos_cambiar.voto_anonimo = datos.voto_anonimo
        nuevos_datos_guardado.voto_anonimo = datos.voto_anonimo
    }
    //actualizar base de datos(si hay algun cambio)
    //actualizar local
    if (Object.keys(datos_cambiar).length > 0) {
        window.sessionStorage.setItem("Ajustes_encuesta", JSON.stringify(nuevos_datos_guardado))
        actualizar__encuesta(id_encuesta, datos_cambiar)
    }
}
const Generar_configurador_encuesta = (id_encuesta) => {
    conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
        //guardar datos en local
        window.sessionStorage.setItem("Ajustes_encuesta", JSON.stringify(encuesta[0]))
        const principal = encuesta[0].principal ? "checked" : ""
        const republicar = encuesta[0].republicar ? "checked" : ""
        const votounico = encuesta[0].voto_unico ? "checked" : ""
        const mostrarresultados = encuesta[0].mostrar_resultados_cerrada ? "checked" : ""
        const datosanonimos = encuesta[0].datos_anonimos ? "checked" : ""
        const votoanonimo = encuesta[0].voto_anonimo ? "checked" : ""

        document.querySelector("#cuerpo-cosas").innerHTML = `
        <div class="apartado">
            <h3>>Principales</h3>
            <div>
                <label for="input-titulo">Título</label>
                <input type="text" id="input-titulo" value="${encuesta[0].titulo}" placeholder="Sin Título">
            </div>
            <div class="apartado-opciones">
                <span>Opciones</span>
                <textarea id="input-opciones" placeholder="opcion1, opcion2, ...">${encuesta[0].opciones}</textarea>
            </div>
            <div>
            <label for="input-votounico">Voto único
                <input type="checkbox"id="input-votounico"${votounico}>
            </label>
            </div>
        </div>
        <div class="apartado">
            <h3>>Configuraciones</h3>
            <div>
            <label for="input-principal">*Principal      
                <input type="checkbox" id="input-principal" ${principal}>
            </label>
            </div>
            <div>
                <label for="input-fecha-inicio">*Fecha inicio</label>
                <input type="datetime-local" id="input-fecha-inicio"placeholder="dd/mm/yy" value="${encuesta[0].duracion_fechas[0]}">
            </div>
            <div>
                <label for="input-fecha-fin">*Fecha fin</label>
                <input type="datetime-local" id="input-fecha-fin"placeholder="dd/mm/yy" value="${encuesta[0].duracion_fechas[1]}">
            </div>
            <div>
                <label for="input-republicar">*Republicar
                    <input type="checkbox" id="input-republicar"${republicar}>
                </label>
            </div>
            <div>
                <label for="input-mostrarresultados">*Mostrar resultados finales
                    <input type="checkbox" id="input-mostrarresultados"${mostrarresultados}>
                </label>
            </div>
        </div>
        <div class="apartado">
            <h3>>Privacidad</h3>
            <div>
                <label for="input-anonimo">Voto anónimo</br>(no se guarda el nombre del votante)
                    <input type="checkbox" id="input-anonimo"${votoanonimo}>
                </label>
            </div>
            <div>
                <label for="input-datos_anonimos">Resultados visibles solo para admin
                    <input type="checkbox" id="input-datos_anonimos"${datosanonimos}>
                </label>
            </div>
        </div>
        <div class="opciones-encuesta-principales">
            <button id="bt-cerrar-encuesta">Cerrar votacion</button>
            <button id="bt-guardar-cambios-encuesta">Guardar cambios</button>
            <button id="bt-cancelar-cambios-encuesta">Cancelar cambios</button>
        </div>
        `
        //reiniciar cambios
        if (document.querySelector("#bt-cancelar-cambios-encuesta")) {
            document.querySelector("#bt-cancelar-cambios-encuesta").addEventListener("click", (e) => {
                e.stopPropagation()
                menu_confirmacion().then(res => {
                    const menu = document.querySelector("#bloqueo-interacciones-menu-contexto");
                    if (menu) menu.remove()
                    if (res) {
                        reiniciar_ajustes_anteriores(id_encuesta)
                    }
                })

            })
        }
        //guardar cambios
        if (document.querySelector("#bt-guardar-cambios-encuesta")) {
            document.querySelector("#bt-guardar-cambios-encuesta").addEventListener("click", (e) => {
                e.stopPropagation()
                menu_confirmacion().then(res => {
                    const menu = document.querySelector("#bloqueo-interacciones-menu-contexto");
                    if (menu) menu.remove()
                    if (res) {//pedir los datos
                        let datos_guardados = JSON.parse(window.sessionStorage.getItem("Ajustes_encuesta"))
                        if (datos_guardados != null && datos_guardados.id_encuesta != id_encuesta) {
                            conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
                                comprobar_actualizar_datos(encuesta)

                            })
                        }
                        else {//usar datos ya existentes
                            comprobar_actualizar_datos(id_encuesta,datos_guardados)
                        }
                    }
                })

            })
        }
        //cerrar votacion
        if (document.querySelector("#bt-cerrar-encuesta")) {
            document.querySelector("#bt-cerrar-encuesta").addEventListener("click", (e) => {
                e.stopPropagation()
                menu_confirmacion().then(res => {
                    const menu = document.querySelector("#bloqueo-interacciones-menu-contexto");
                    if (menu) menu.remove()
                    if (res) {
                        actualizar__encuesta(id_encuesta, { "terminada": true })
                    }
                })

            })
        }
    })
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
            html += `<table><caption><strong>Votantes</strong> (más a menos votado)</caption><tr><td>Opción</td><td>Votantes</td></tr>`
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
            html += "</table>"
            return html
        }
        return (`<div class="head-pagina-datos"><h3>${encuesta[0].titulo}</h3></div>
                    <table>
                    <caption><strong>Recuento de votos</strong></br>(más a menos votado)</caption>
                    ${mostrar_recuento_votos()}
                    </table>
                    ${!encuesta[0].voto_anonimo ? mostrar_nombre_votantes() : ""}
                    `)
    }
    conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
        conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_VOTACIONES }).then((votaciones) => {
            document.querySelector("#cuerpo-cosas").innerHTML = `
                <div id="${$pagina_datos_analizados_encuesta}">
                ${Datos_completar(encuesta, votaciones)}
                </div>`
        })
    })
}

const menu_confirmacion = () => {
    return new Promise((resolve) => {
        // si ya existe, eliminar
        const menu = document.querySelector("#bloqueo-interacciones-menu-contexto");
        if (menu) menu.remove()

        // crear menú
        document.querySelector("#main").insertAdjacentHTML("afterend", `
            <div id="bloqueo-interacciones-menu-contexto">
            <div id="menu-contexto">
                <span>*Confirmar acción*</span>
                <div>
                <button id="cancelar-accion-bt">cancelar</button>
                <button id="confirmar-accion-bt">confirmar</button>
                </div>
            </div>
            </div>
        `)


        // función cerrar y resolver
        const Cerrar_menu_confirmacion = (valor) => {
            if (!menu) resolve(valor)
            else {
                menu.remove()
                resolve(valor) // resuelve la promesa con true o false
            }
        }

        // confirmar
        document.querySelector("#confirmar-accion-bt").addEventListener("click", (e) => {
            e.stopPropagation();
            Cerrar_menu_confirmacion(true);
        })

        // cancelar
        document.querySelector("#cancelar-accion-bt").addEventListener("click", (e) => {
            e.stopPropagation();
            Cerrar_menu_confirmacion(false);
        });
    });
}
function reiniciar_ajustes_anteriores(id_encuesta) {
    conseguir_datos_SUPABASE({ "encuesta_id": id_encuesta, "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
        document.querySelector("#input-titulo").value = encuesta[0].titulo
        document.querySelector("#input-opciones").value = encuesta[0].opciones
        document.querySelector("#input-votounico").checked = encuesta[0].voto_unico
        document.querySelector("#input-principal").checked = encuesta[0].principal
        document.querySelector("#input-fecha-inicio").value = encuesta[0].duracion_fechas[0]
        document.querySelector("#input-fecha-fin").value = encuesta[0].duracion_fechas[1]
        document.querySelector("#input-republicar").checked = encuesta[0].republicar
        document.querySelector("#input-mostrarresultados").checked = encuesta[0].mostrar_resultados_cerrada
        document.querySelector("#input-anonimo").checked = encuesta[0].voto_anonimo
        document.querySelector("#input-datos_anonimos").checked = encuesta[0].datos_anonimos
    })
}
//generador principal
const Generar_cuerpo_configurador_votacion = (data, id_encuesta, opcion) => {
    const opcion1 = opcion == 1 ? "usando" : "no-usando"
    const opcion2 = opcion == 2 ? "usando" : "no-usando"
    function Generar_cuerpo(opcion) {
        if (opcion == 1) {
            Generar_configurador_encuesta(id_encuesta)
        }
        else if (opcion == 2) {
            document.querySelector("#cuerpo-cosas").style.padding = "0px ";
            Generar_resultados_encuesta(id_encuesta)
        }
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
        <div class="opciones-administrador">
            <button id="configurar-bt" class="bt-opciones-admin-encuesta ${opcion1}">Configurar</button>
            <button id="resultados-bt" class="bt-opciones-admin-encuesta ${opcion2}">Resultados</button>
            </div>
            <section id="cuerpo-cosas"class="cuerpo-ajustes">
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
    //salir pagina principal
    document.querySelector("#bt-volver-home").addEventListener("click", () => {
        location.reload()
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