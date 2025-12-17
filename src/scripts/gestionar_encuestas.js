/*VARIABLES globales*/
import { URL_IMG_AÑADIR_ENCUESTA, $id_select_encuestas, PARTE_ID_ENCUESTA_TITULO, NAME_AJUSTES_ENCUESTA, NAME_KEY_ADMIN_ENCUESTA, MENSAJES_ALERTA_ID } from '../config.js'
import { generar_titulos_encuestas, mostrar_recuento_votos, mostrar_nombre_votantes } from './votaciones.js'
/*funciones de SUPABASE*/
import { conseguir_datos_SUPABASE, añadir_votacion_SUPABASE, actualizar_votacion_SUPABASE } from '../supabase/funciones.js'
/*Varables del archivo */
const ID_BT_ABRIR_PAGINA_ADMIN = "bt-abrir-menu-log-admin"
const ID_BT_AÑADIR_ENCUESTA = "bt-añadir-encuesta"
const ID_BT_VOLVER_HOME = "bt-volver-home"
const ID_MENU_ADMIN = "menu-log-gestionador-encuestas"
const ID_INPUT_KEY_ADMIN = "input-password-admin"
const CLASS_MOSTRAR_MENU = "mostrar-menu-log"
const CLASS_QUITAR_MENU = "quitar-menu-log"
const MENSAJE_ACCESO_CORRECTO = "*Acceso <ROL> ADMIN correcto"
const $pagina_datos_analizados_encuesta = "admin-pagina-datos-analizados-encuesta"
const MENU_BLOQUEO_CONTEXTO = "bloqueo-interacciones-menu-contexto"

/*ACTUALMENTE ESTA ADMIN KEY ESTA PUBLICA */
function verificar_acceso_admin(entrada) {
    const key = import.meta.env.VITE_ADMIN_KEY
    if ((entrada * 6) == key) {//el *6 esta hecho para que asi no llegue con simplemente ver el import arriba de todo y tengan que buscar por el código esta función
        window.localStorage.setItem(NAME_KEY_ADMIN_ENCUESTA, entrada)
        return true
    }
    return false
}
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
    datos_recogidos.duracion_fechas = [document.querySelector("#input-fecha-inicio").value, document.querySelector("#input-fecha-fin").value]
    //fechas validas?
    const fecha_actual = new Date()
    const fecha_cambiada_inicio = new Date(datos_recogidos.duracion_fechas[0])
    const fecha_cambiada_fin = new Date(datos_recogidos.duracion_fechas[1])
    if ((fecha_actual >= fecha_cambiada_fin) || (fecha_cambiada_inicio >= fecha_cambiada_fin)) return ({ "datos_recogidos": {}, "error": true })
    datos_recogidos.republicar = document.querySelector("#input-republicar").checked
    datos_recogidos.mostrar_resultados_cerrada = document.querySelector("#input-mostrarresultados").checked
    datos_recogidos.voto_anonimo = document.querySelector("#input-anonimo").checked
    datos_recogidos.datos_anonimos = document.querySelector("#input-datos_anonimos").checked

    return ({ "datos_recogidos": datos_recogidos, "error": false })
}
function comprobar_actualizar_datos(id_encuesta, datos_guardados) {
    let nuevos_datos_guardado = datos_guardados
    const datos_recogidos = recoger_datos()
    if (datos_recogidos.error) {
        document.querySelector("#text-fechas-validas").style.display = "block"
        return;
    }
    else {
        document.querySelector("#text-fechas-validas").style.display = "none"
    }
    const datos = datos_recogidos.datos_recogidos
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
    const fechas = datos.duracion_fechas
    if (datos_guardados.duracion_fechas[0] != fechas[0] || datos_guardados.duracion_fechas[1] != fechas[1]) {
        datos_cambiar.duracion_fechas = fechas
        nuevos_datos_guardado.duracion_fechas = fechas
    }
    //poner fechas por defecto

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
        window.sessionStorage.setItem(NAME_AJUSTES_ENCUESTA, JSON.stringify(nuevos_datos_guardado))
        actualizar_votacion_SUPABASE({ id_encuesta: id_encuesta, datos_cambiar: datos_cambiar }).then(() => {
            document.querySelector("#app").insertAdjacentHTML("afterbegin", `
                <div id="${MENSAJES_ALERTA_ID}" style="display:flex">
                <span>Cambios realizados✅</span>
                </div>
                `)
            document.querySelector(`#${MENSAJES_ALERTA_ID}`).style.display = "flex"
            setTimeout(() => {
                document.querySelector(`#${MENSAJES_ALERTA_ID}`).style.display = "none"
            }, 1500)
        })
    }
}
const menu_confirmacion = () => {
    return new Promise((resolve) => {
        // si ya existe, eliminar
        if (document.querySelector(`#${MENU_BLOQUEO_CONTEXTO}`)) document.querySelector(`#${MENU_BLOQUEO_CONTEXTO}`).remove()

        // crear menú
        document.querySelector("#main").insertAdjacentHTML("afterend", `
            <div id="${MENU_BLOQUEO_CONTEXTO}">
            <div id="menu-contexto">
                <span>*Confirmar acción*</span>
                <div>
                <button id="cancelar-accion-bt">cancelar</button>
                <button id="confirmar-accion-bt">confirmar</button>
                </div>
            </div>
            </div>
        `)
        document.querySelector("#confirmar-accion-bt").focus()

        // función cerrar y resolver
        const Cerrar_menu_confirmacion = (valor) => {
            if (!document.querySelector(`#${MENU_BLOQUEO_CONTEXTO}`)) resolve(valor)
            else {
                document.querySelector(`#${MENU_BLOQUEO_CONTEXTO}`).remove()
                resolve(valor) // resuelve la promesa con true o false
            }
        }

        // confirmar
        document.querySelector("#confirmar-accion-bt").addEventListener("click", (e) => {
            e.stopPropagation()
            Cerrar_menu_confirmacion(true)
        })

        // cancelar
        document.querySelector("#cancelar-accion-bt").addEventListener("click", (e) => {
            e.stopPropagation()
            Cerrar_menu_confirmacion(false)
        });
    })
}
function reiniciar_ajustes_anteriores(id_encuesta) {
    conseguir_datos_SUPABASE({ encuesta_id: id_encuesta, tabla: "encuestas", datos_recibir: ["titulo", "opciones", "voto_unico", "principal", "duracion_fechas", "republicar", "mostrar_resultados_cerrada", "voto_anonimo", "datos_anonimos"] }).then(([encuesta]) => {
        document.querySelector("#input-titulo").value = encuesta.titulo
        document.querySelector("#input-opciones").value = encuesta.opciones
        document.querySelector("#input-votounico").checked = encuesta.voto_unico
        document.querySelector("#input-principal").checked = encuesta.principal
        document.querySelector("#input-fecha-inicio").value = encuesta.duracion_fechas[0]
        document.querySelector("#input-fecha-fin").value = encuesta.duracion_fechas[1]
        document.querySelector("#input-republicar").checked = encuesta.republicar
        document.querySelector("#input-mostrarresultados").checked = encuesta.mostrar_resultados_cerrada
        document.querySelector("#input-anonimo").checked = encuesta.voto_anonimo
        document.querySelector("#input-datos_anonimos").checked = encuesta.datos_anonimos
    })
}
//opcion 1
const Generar_configurador_encuesta = (encuesta_id) => {
    conseguir_datos_SUPABASE({ encuesta_id: encuesta_id, tabla: "encuestas", datos_recibir: ["titulo", "opciones", "principal", "duracion_fechas", "republicar", "voto_unico", "terminada", "mostrar_resultados_cerrada", "datos_anonimos", "voto_anonimo"] }).then(([encuesta]) => {
        if (encuesta.terminada) {
            document.querySelector("#cuerpo-cosas").innerHTML = `<div class="alineador-bt-abrir-encuesta">
            <button id="bt-abrir-encuesta">Reabrir Votacion</button>
            </div>`
            //evento reabrir votación
            document.querySelector("#bt-abrir-encuesta").addEventListener("click", (e) => {
                e.stopPropagation()
                menu_confirmacion().then(res => {
                    const menu = document.querySelector("#bloqueo-interacciones-menu-contexto");
                    if (menu) menu.remove()
                    if (res) {
                        actualizar_votacion_SUPABASE({ id_encuesta: encuesta_id, datos_cambiar: { "terminada": false, "fecha_terminada": null } }).then(() => {
                            //actualizar pantalla
                            Generar_configurador_encuesta(encuesta_id)
                        })
                    }
                })

            })
        }
        else {
            //guardar datos en local
            window.sessionStorage.setItem(NAME_AJUSTES_ENCUESTA, JSON.stringify(encuesta))
            const principal = encuesta.principal ? "checked" : ""
            const republicar = encuesta.republicar ? "checked" : ""
            const votounico = encuesta.voto_unico ? "checked" : ""
            const mostrarresultados = encuesta.mostrar_resultados_cerrada ? "checked" : ""
            const datosanonimos = encuesta.datos_anonimos ? "checked" : ""
            const votoanonimo = encuesta.voto_anonimo ? "checked" : ""
            const d = new Date()
            const f = new Date();
            f.setDate(f.getDate() + 7);

            const fecha_actual = String(d.getDate()).padStart(2, "0") + "-" +
                String(d.getMonth() + 1).padStart(2, "0") + "-" +
                String(d.getFullYear()) + "T" +
                String(d.getHours()).padStart(2, "0") + ":" +
                String(d.getMinutes()).padStart(2, "0");

            const fecha_final = String(f.getDate()).padStart(2, "0") + + "-" +
                String(f.getMonth() + 1).padStart(2, "0") + "-" +
                String(f.getFullYear()) + "T" +
                String(f.getHours()).padStart(2, "0") + ":" +
                String(f.getMinutes()).padStart(2, "0");
            const fecha_inicio = encuesta.duracion_fechas[0] != "" ? encuesta.duracion_fechas[0] : fecha_actual
            const fecha_fin = encuesta.duracion_fechas[1] != "" ? encuesta.duracion_fechas[1] : fecha_final
            document.querySelector("#cuerpo-cosas").innerHTML = `
            <div class="apartado">
                <h3>>Principales</h3>
                <div>
                    <label for="input-titulo">Título</label>
                    <input type="text" id="input-titulo" value="${encuesta.titulo}" placeholder="Sin Título">
                </div>
                <div class="apartado-opciones">
                    <span>Opciones</span>
                    <textarea id="input-opciones" placeholder="opcion1, opcion2, ...">${encuesta.opciones}</textarea>
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
                    <input type="datetime-local" id="input-fecha-inicio"placeholder="dd/mm/yy" value="${fecha_inicio}">
                </div>
                <div>
                    <label for="input-fecha-fin">*Fecha fin</label>
                    <input type="datetime-local" id="input-fecha-fin"placeholder="dd/mm/yy" value="${fecha_fin}">
                </div>      
                <div id="text-fechas-validas" style="display:none;color:red">*Introduce fechas válidas</div>
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
                            reiniciar_ajustes_anteriores(encuesta_id)
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
                            let datos_guardados = JSON.parse(window.sessionStorage.getItem(NAME_AJUSTES_ENCUESTA))
                            if (datos_guardados != null && datos_guardados.id_encuesta != encuesta_id) {
                                conseguir_datos_SUPABASE({ encuesta_id: encuesta_id, tabla: "encuestas", datos_recibir: ["titulo", "opciones", "principal", "duracion_fechas", "republicar", "voto_unico", "mostrar_resultados_cerrada", "datos_anonimos", "voto_anonimo"] }).then(([encuesta]) => {
                                    comprobar_actualizar_datos(encuesta_id, encuesta)
                                })
                            }
                            else {//usar datos ya existentes
                                comprobar_actualizar_datos(encuesta_id, datos_guardados)
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
                            const fecha_hora_actual = new Date()
                            const fecha = `${fecha_hora_actual.getFullYear()}-${String(fecha_hora_actual.getMonth() + 1).padStart(2, '0')}-${String(fecha_hora_actual.getDate()).padStart(2, '0')}`;

                            actualizar_votacion_SUPABASE({ id_encuesta: encuesta_id, datos_cambiar: { "terminada": true, "fecha_terminada": fecha.toString() } }).then(() => {
                                Generar_configurador_encuesta(encuesta_id)
                            })
                        }
                    })

                })
            }
        }
    })
}
//opcion 2
const Generar_resultados_encuesta = (id_encuesta) => {
    //evento analizar datos
    const Datos_completar = (encuesta, votaciones) => {
        document.querySelector("#main").style.cursor = "progress"//puntero cargando
        document.querySelector("#main").style.cursor = "default"//quitar puntero cargando
        const contador_votaciones = contador_votos(votaciones)
        return (`<div class="head-pagina-datos"><h3>${encuesta.titulo}</h3></div>
                    <table>
                    <caption><strong>Recuento de votos</strong></br>(más a menos votado)</caption>
                    ${mostrar_recuento_votos(contador_votaciones, encuesta)}
                    </table>
                    ${!encuesta.voto_anonimo ? mostrar_nombre_votantes(contador_votaciones, encuesta) : ""}
        `)
    }
    conseguir_datos_SUPABASE({ encuesta_id: id_encuesta, tabla: "encuestas", datos_recibir: ["titulo", "opciones"] }).then(([encuesta]) => {
        conseguir_datos_SUPABASE({ encuesta_id: id_encuesta, tabla: "votaciones", datos_recibir: ["opcion_votada_encuesta", "nombre_votante", "bono_votante"] }).then((votaciones) => {
            document.querySelector("#cuerpo-cosas").innerHTML = `
                <div id="${$pagina_datos_analizados_encuesta}">
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
        if (opcion == 1) {
            Generar_configurador_encuesta(id_encuesta)
        }
        else if (opcion == 2) {
            document.querySelector("#cuerpo-cosas").style.padding = "0px ";
            Generar_resultados_encuesta(id_encuesta)
        }
    }

    document.querySelector("#main").innerHTML = `
    <section class="inicio-admin">
        <select id="${$id_select_encuestas}" class="select-gestionar-encuestas">
            ${generar_titulos_encuestas(data, id_encuesta, false)}
        </select>
        <div id="${ID_BT_AÑADIR_ENCUESTA}">
            <img draggable="false" class="img-añadir-encuesta" src="${URL_IMG_AÑADIR_ENCUESTA}" alt="crear">
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
        const titulo_escogido = e.target.selectedOptions[0].id.replace(PARTE_ID_ENCUESTA_TITULO, "")
        Generar_cuerpo_configurador_votacion(data, titulo_escogido, 1)
    })
    //salir pagina principal
    document.querySelector("#bt-volver-home").addEventListener("click", () => {
        location.reload()
    })
    //crear votacion
    document.querySelector(`#${ID_BT_AÑADIR_ENCUESTA}`).addEventListener("click", () => {
        document.querySelector("#main").insertAdjacentHTML("afterend", `
            <div id="bloqueador-acciones-crear-votacion">
                <div class="menu-crear-votacion">
                    <div>
                        <label for="input-titulo-crear-votacion">Título</label>
                        <input id="input-titulo-crear-votacion" type="text" value=""placeholder="Ej: Fecha del partido">
                    </div>
                    <div>
                        <label for="input-opciones-crear-votacion">Opciones</label>
                        <textarea id="input-opciones-crear-votacion" ></textarea>
                    </div>
                    <div>
                        <label for="input-voto-unico-crear-votacion">Voto único
                        <input id="input-voto-unico-crear-votacion" type="checkbox">
                        </label>
                    </div>
                    <div id="text-datos-incompletos"style="display:none">*Rellena el titulo y opciones de la votación</div>
                    <div class="opciones-crear-votacion-menu">
                    <button id="bt-cancelar-crear-votacion">Cancelar</button>
                    <button id="bt-confirmar-crear-votacion">Crear</button>
                    </div>
                </div>
                </div>
            `)
        //evento cancelar creacion votacion
        document.querySelector("#bt-cancelar-crear-votacion").addEventListener("click", () => {
            document.querySelector("#bloqueador-acciones-crear-votacion").remove()
        })
        //evento crear votacion
        document.querySelector("#bt-confirmar-crear-votacion").addEventListener("click", () => {
            //validar datos
            const titulo_votacion = sanitizar_datos(document.querySelector("#input-titulo-crear-votacion").value)
            let opciones = (document.querySelector("#input-opciones-crear-votacion").value).split(",")
            for (let i = 0; i < opciones.length; i++) {
                opciones[i] = sanitizar_datos(opciones[i])
            }
            const voto_unico_votacion = document.querySelector("#input-voto-unico-crear-votacion").checked
            if (titulo_votacion.length > 0 && opciones.length > 0 && (voto_unico_votacion == false || voto_unico_votacion == true)) {
                //crear votacion
                const d = new Date()
                const f = new Date();
                f.setDate(f.getDate() + 7);

                const fecha_actual = String(d.getFullYear()) + "-" +
                    String(d.getMonth() + 1).padStart(2, "0") + "-" +
                    String(d.getDate()).padStart(2, "0") + "T" +
                    String(d.getHours()).padStart(2, "0") + ":" +
                    String(d.getMinutes()).padStart(2, "0");

                const fecha_final = String(f.getFullYear()) + "-" +
                    String(f.getMonth() + 1).padStart(2, "0") + "-" +
                    String(f.getDate()).padStart(2, "0") + "T" +
                    String(f.getHours()).padStart(2, "0") + ":" +
                    String(f.getMinutes()).padStart(2, "0");
                añadir_votacion_SUPABASE({ titulo: titulo_votacion, opciones: opciones, voto_unico: voto_unico_votacion, duracion_fechas: [fecha_actual, fecha_final] }).then(() => {
                    conseguir_datos_SUPABASE({ tabla: "encuestas", datos_recibir: ["id_encuesta", "titulo", "principal", "terminada"] }).then(encuestas => {
                        document.querySelector(`#${$id_select_encuestas}`).innerHTML = generar_titulos_encuestas(encuestas, id_encuesta, false)
                        document.querySelector("#bloqueador-acciones-crear-votacion").remove()
                    })

                })
            }
            else {//los campos estan incompletos
                document.querySelector("#text-datos-incompletos").style.display = "block"
            }
        })
    })
}
//animacion del input admin key
function cerrar_log() {
    document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).classList.remove("display-none")
    document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).blur()
    document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).value = ""
    document.querySelector(`#${ID_MENU_ADMIN}`).classList.remove(CLASS_MOSTRAR_MENU)
    document.querySelector(`#${ID_MENU_ADMIN}`).classList.add(CLASS_QUITAR_MENU)
}
//iniciador
globalThis.addEventListener("DOMContentLoaded", () => {
    //evento input contraseña admin
    document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).addEventListener("click", () => {
        //animaciones
        document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).classList.add("display-none")
        document.querySelector(`#${ID_MENU_ADMIN}`).classList.remove(CLASS_QUITAR_MENU)
        document.querySelector(`#${ID_MENU_ADMIN}`).classList.add(CLASS_MOSTRAR_MENU)
        document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).focus()
        document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).addEventListener("blur", () => {
            cerrar_log()
        })
        //trozo de codigo
        function evento_key_admin_entrada() {
            document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).addEventListener("keydown", e => {
                if (["Enter", "Go", "Done", "Search", "Send", "Next"].includes(e.key)) {
                    ejecutar()
                }
            })
        }
        //comprobar si hay contraseña guardada
        const key_guardada = window.localStorage.getItem(NAME_KEY_ADMIN_ENCUESTA)
        if (key_guardada) {//si ya se introdució una contraseña antes
            if (verificar_acceso_admin(Number(key_guardada))) {
                document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).value = key_guardada
                const entrada_key_log = (document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).value.replace(/[.\\/;,!#{}%&$"'*]/g, " ").trim()).toString()
                if (verificar_acceso_admin(entrada_key_log)) {
                    console.log(`%c${MENSAJE_ACCESO_CORRECTO}`, "color: green; font-weight: bold;");
                    //poner una como principal
                    conseguir_datos_SUPABASE({ tabla: "encuestas" }).then(data => {
                        //escoger una encuesta como principal(si hay solo una principal esa es, sino se coge la primera que llegue)
                        //esto se hace solo al inicio, luego solo se pone la que se seleccione
                        let encuesta_id = data.find(x => x.principal && !x.terminada == true);
                        if (encuesta_id) encuesta_id = encuesta_id.id_encuesta;
                        else {
                            encuesta_id = data.find(x => x.principal == true);
                            encuesta_id = encuesta_id ? encuesta_id.id_encuesta : data[0]?.id_encuesta ?? null;
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
            else {
                evento_key_admin_entrada()
            }
        }
        else {//si no hay contraseñas guardadas
            evento_key_admin_entrada()
        }
    })
})