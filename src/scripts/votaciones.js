/*Importar cosas necesarias para el codigo */
import { getBrowserFingerprint } from './datos_usuario_control.js'
import { MANTENIMIENTO_BASE_DATOS } from './mantenimiento_servidor.js'
/*VARIABLES globales*/
import { VALOR_DEFECTO_NOMBRE_USUARIO, URL_CHECKED_IMG, NAME_DT_LOC_VOTACIONES, NAME_DT_LOC_BONO_VARIABLE, NAME_DT_LOC_NOMBRE_VARIABLE, $id_select_encuestas, PARTE_ID_ENCUESTA_TITULO, MENSAJES_ALERTA_ID } from '../config.js'
/*variables del fichero */
//clases(para animaciones o queryselector)
const CLASS_CHECKED_CHECKBOX_VOTO = "checked"
const CLASS_SEMIDESAPARECER_CHECKBOX_VOTO = "semi-desaparecer"
const CLASS_SEMIAPARECER_CHECKBOX_VOTO = "semi-aparecer"
const CLASS_APARECER_CHECKBOX_VOTO = "aparecer"
const CLASS_DESAPARECER_CHECKBOX_VOTO = "desaparecer"
const CLASS_OPCION_VOTADA = "opcion-votado"
const CLASS_OPCION_NO_VOTADA = "opcion-no-votado"
const CLASS_DISPLAY_FLEX = "flex"
const CLASS_DISPLAY_NONE = "display-none"
//IDs o partes 
const PARTE_ID_REMPLAZAR_CHECKBOX_VOTO = "checkbox-opcion-encuesta-"
const PARTE_ID_USAR_OPCION_VOTACION = "opcion-encuesta-"
const PARTE_ID_REMPLAZAR_IMG_CHECK = "img-check-votado-"
const PARTE_ID_CONTADOR_VOTANTES = "numero-votantes-bt-lista-"
const $ID_PAGINA_DATOS_ANALIZAR_VOTACION = "pagina-datos-analizados-encuesta"
const $MINI_ANALISIS_DATOS = "mini-analisis-opcion"
const PARTE_ID_BT_ANALIZAR_DATOS = "bt-analizar-datos-encuesta-"
//Textos
const TEXTO_CONTADOR_VOTOS = "*Votos: "
const TEXTO_VOTO_UNICO = "*voto único"
const TEXTO_VOTO_MULTIPLE = "*voto múltiple"
const TEXTO_ANALIZAR_DATOS_BT = "Analizar Datos"
const TEXTO_ENCUESTA_ACABADA_SELECT = " (Resultados)"
const TEXTO_ENCUESTA_CERRADA_SELECT = " (cerrada)"
/*FUNCIONES DE SUPABASE */
import { conseguir_datos_SUPABASE, borrar_voto_SUPABASE, añadir_voto_SUPABASE } from '../supabase/funciones.js'

//crear select de las encuestas
export const generar_titulos_encuestas = (data = null, encuesta_id = -1, comparar_fecha = true) => {
    if (data == null) return ``
    let html = ``
    const fecha_actual = new Date()
    data.forEach(encuesta => {
        if (comparar_fecha) {//en el gestionador de encuestas esto no se hace
            const fecha_inicio = new Date(encuesta.duracion_fechas[0])
            if (fecha_inicio > fecha_actual) return;
        }
        let principal = ""
        if (encuesta_id == encuesta.id_encuesta) {//poner una encuesta como principal (la que se seleccionó)
            principal = "selected"
        }
        html += `<option id="${PARTE_ID_ENCUESTA_TITULO}${encuesta.id_encuesta}" value="${encuesta.titulo}" ${principal}>${encuesta.terminada ? "*" : ""}${encuesta.titulo}${encuesta.terminada ? comparar_fecha ? TEXTO_ENCUESTA_ACABADA_SELECT : TEXTO_ENCUESTA_CERRADA_SELECT : ""}</option>`
    })
    return html
}

const generar_opciones_encuestas = (encuestas, encuesta_id, contador_votaciones, opciones_votadas = []) => {
    let html_opciones = ``
    encuestas.forEach(encuesta => {//para buscar la encuesta que esta seleccionada
        if (encuesta.id_encuesta == encuesta_id && encuesta.terminada == false) {//esta es la encuesta que estamos mirando
            const fecha_actual = new Date()
            const fecha_inicio = new Date(encuesta.duracion_fechas[0])
            if (fecha_inicio > fecha_actual) return;//aun no empezo
            for (let i = 0; i < encuesta.opciones.length; i++) {//para mostrar las opciones de la encuesta seleccionada
                //mirar si votaste esa opcion
                let checked = false
                if (opciones_votadas != undefined && opciones_votadas.length >= 1) {
                    checked = opciones_votadas.find(x => x == i)
                    if (checked != undefined) checked = true
                }
                //mirar que indice del contador corresponde
                let indice = -1
                if (contador_votaciones != undefined) {
                    indice = contador_votaciones.findIndex(x => x.id == i)
                }
                let contador = 0
                if (indice != -1 && contador_votaciones != undefined) {
                    contador = contador_votaciones[indice].votantes.length
                }
                //esto es para bloquear o no las animaciones de los check al iniciar la pagina 
                const display = checked ? "block" : "none"
                const clase = display == "block" ? CLASS_CHECKED_CHECKBOX_VOTO : CLASS_SEMIDESAPARECER_CHECKBOX_VOTO
                const clase_opcion = display == "block" ? CLASS_OPCION_VOTADA : CLASS_OPCION_NO_VOTADA
                html_opciones += `<div class="opcion-votacion ${clase_opcion}"id="${PARTE_ID_USAR_OPCION_VOTACION}${i}">
                            <div>
                                <h3>${encuesta.opciones[i]}</h3>
                                <span class="text-contador-votos" id="${PARTE_ID_CONTADOR_VOTANTES}${encuesta.id_encuesta}-${i}">*Votos: ${contador}</span>
                            </div>
                            <div class="sub-2 " id="${PARTE_ID_REMPLAZAR_CHECKBOX_VOTO + encuesta.id_encuesta}-${i}">
                            <img  id="${PARTE_ID_REMPLAZAR_IMG_CHECK}${encuesta.id_encuesta}-${i}" class="img-checked ${clase}"src="${URL_CHECKED_IMG}" alt=""draggable="false" loading="lazy">
                            </div>
                </div>`
            }
        }
    })
    return html_opciones
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
//fragmento de codigo para el recuento de votos propios hechos
function mirar_opciones_votadas(votaciones) {
    let opciones_votadas = []
    //mirar que opciones votaste(usando usuario)
    const id = getBrowserFingerprint()
    votaciones.forEach(vt => {
        if (vt.id_nombre == id) {
            opciones_votadas.push(vt.opcion_votada_encuesta)
        }
    })
    return opciones_votadas
}
//ES EL "MAIN" O "CONTROLADOR" DE LAS ENCUESTAS 
export const mostrar_recuento_votos = (contador_votaciones, encuesta) => {
    let html = ``
    html += `<tr><td>Opción</td><td>nºvotos</td><td>nºbonos</br>(confirmados)</td></tr>`
    let opciones_ordenadas_mayor = contador_votaciones.sort((x, y) => y.votantes.length - x.votantes.length)
    opciones_ordenadas_mayor.forEach(datos_op => {
        let recuento_bonos = 0
        datos_op.votantes.forEach(vt => {
            if (vt.bono) recuento_bonos++
        })
        html += `<tr>
        <td>${encuesta.opciones[datos_op.id]}</td>
        <td>${[datos_op.votantes.length]}</td>
        <td>${recuento_bonos}</td>
        </tr>`
    })
    return html
}
export const mostrar_nombre_votantes = (contador_votaciones, encuesta) => {
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
                    <td>${encuesta.opciones[datos_op.id]}</td>
                    <td>${usuarios}</td>
                    </tr>`
    })
    html += "</table>"
    return html
}
function generar_encuestas(data = null, encuesta_id = null, contador_votaciones = null, opciones_votadas = null) {
    const inicio_votacion_encontrada = data.find(x => x.id_encuesta == encuesta_id)
    let datos_anonimos = null
    let votacion_anonima = null
    let terminada = null
    if (inicio_votacion_encontrada) {
        datos_anonimos = inicio_votacion_encontrada.datos_anonimos
        votacion_anonima = inicio_votacion_encontrada.voto_anonimo
        terminada = inicio_votacion_encontrada.terminada
    }
    if (terminada || data == null) {//votacion terminada o no hay datos
        document.querySelector("#main").innerHTML = `
        <select id="${$id_select_encuestas}">
        ${generar_titulos_encuestas(data, encuesta_id)}
        </select>`
    }
    else {//votacion sin terminar
        const datos_anonimos = data.datos_anonimos
        const votacion_anonima = data.voto_anonimo
        let voto_unico = data.find(x => x.id_encuesta == encuesta_id)
        if (voto_unico) voto_unico = voto_unico.voto_unico ? TEXTO_VOTO_UNICO : TEXTO_VOTO_MULTIPLE
        let caracteristicas_votacion = ""
        if (datos_anonimos) caracteristicas_votacion += "<span class='tipo-voto'>*resultados privados</span>"
        if (votacion_anonima) caracteristicas_votacion += "<span class='tipo-voto'>*voto anónimo</span>"
        document.querySelector("#main").innerHTML = `
        <select id="${$id_select_encuestas}">
        ${generar_titulos_encuestas(data, encuesta_id)}
        </select>
        <div class="div-juntar-todo-cuerpo-opciones">
        <span class="tipo-voto">${voto_unico ? voto_unico : ""}</span>
        ${caracteristicas_votacion}
        <section class="cuerpo-opciones">
        ${generar_opciones_encuestas(data, encuesta_id, contador_votaciones, opciones_votadas)}
        </section></div>
        `
    }
    if (!datos_anonimos) {
        document.querySelector("#main").innerHTML += `
        <section id="datos-analizar">
        <button id="${PARTE_ID_BT_ANALIZAR_DATOS}${encuesta_id}" class="bt-analizar-datos">${TEXTO_ANALIZAR_DATOS_BT}</button>
        </section>
        `
    }
    //evento cambio de encuesta
    if (document.querySelector(`#${$id_select_encuestas}`)) {
        document.querySelector(`#${$id_select_encuestas}`).addEventListener("change", (e) => {
            const titulo_escogido = e.target.selectedOptions[0].id.replace(PARTE_ID_ENCUESTA_TITULO, "")
            const encuesta_escogida = data.find(x => x.id_encuesta == titulo_escogido)
            //registro de votos: hacer un recuento de los datos separados por opcion
            conseguir_datos_SUPABASE({ encuesta_id: encuesta_escogida.id_encuesta, tabla: "votaciones", datos_recibir: ["id_encuesta", "id_nombre", "id_encuesta", "opcion_votada_encuesta", ...(votacion_anonima || datos_anonimos ? [] : ["nombre_votante"]), "bono_votante"] }).then((votaciones) => {
                let contador_votaciones = contador_votos(votaciones)
                let opciones_votadas = mirar_opciones_votadas(votaciones)
                //crear datos guardado de las votaciones de la encuesta para reducir solicitudes a la base de datos
                if (!datos_anonimos) {
                    window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(votaciones))
                }
                //actualizar pagina
                generar_encuestas(data, encuesta_escogida.id_encuesta, contador_votaciones, opciones_votadas)
            })
        })
    }
    //evento opciones votar 
    if (document.querySelectorAll(".sub-2")) {
        document.querySelectorAll(".sub-2").forEach(boton => {
            //animacion de los checkbox
            const id_img = boton.firstElementChild.id
            boton.addEventListener("mouseenter", () => {
                if (!document.querySelector(`#${id_img}`).classList.contains(CLASS_CHECKED_CHECKBOX_VOTO)) {
                    document.querySelector(`#${id_img}`).style.display = "block"
                    document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)
                    document.querySelector(`#${id_img}`).classList.add(CLASS_SEMIAPARECER_CHECKBOX_VOTO)
                }
            })
            boton.addEventListener("mouseleave", () => {
                if (!document.querySelector(`#${id_img}`).classList.contains(CLASS_CHECKED_CHECKBOX_VOTO)) {
                    document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIAPARECER_CHECKBOX_VOTO)
                    document.querySelector(`#${id_img}`).classList.add(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)
                }
            })
            boton.addEventListener("transitionend", () => {
                if (getComputedStyle(document.querySelector(`#${id_img}`)).opacity == "0") {
                    document.querySelector(`#${id_img}`).style.display = "none";
                }
                else {
                    document.querySelector(`#${id_img}`).style.display = "block";
                }
            })
            //evento votar
            boton.addEventListener("click", (e) => {
                const id_seleccionado = (e.target.id).replace(PARTE_ID_REMPLAZAR_CHECKBOX_VOTO, "").replace(PARTE_ID_REMPLAZAR_IMG_CHECK, "").split("-") //[id encuesta,opcion encuesta]
                function votar(voto_unico) {
                    //animaciones
                    function marcarVoto(boton, id_seleccionado) {
                        const id_img = boton.firstElementChild.id
                        document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)

                        document.querySelector(`#${id_img}`).classList.add(CLASS_CHECKED_CHECKBOX_VOTO)
                        document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.remove(CLASS_OPCION_NO_VOTADA)
                        document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.add(CLASS_OPCION_VOTADA)
                    }
                    function desmarcarVoto(boton, id_seleccionado) {
                        const id_img = boton.firstElementChild.id
                        document.querySelector(`#${id_img}`).classList.remove(CLASS_CHECKED_CHECKBOX_VOTO)
                        document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIAPARECER_CHECKBOX_VOTO)
                        document.querySelector(`#${id_img}`).classList.add(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)
                        document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.remove(CLASS_OPCION_VOTADA)
                        document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.add(CLASS_OPCION_NO_VOTADA)

                    }
                    function actualizar_contador(contador, id_encuesta, opcion_votada) {
                        //actualizar contador votos
                        const id_contador = `${PARTE_ID_CONTADOR_VOTANTES}${id_encuesta}-${opcion_votada}`
                        document.querySelector(`#${id_contador}`).innerHTML = TEXTO_CONTADOR_VOTOS + contador
                    }
                    //id del usuario
                    const id_nombre = getBrowserFingerprint()
                    //ver si ya existe ese voto
                    conseguir_datos_SUPABASE({ encuesta_id: encuesta_id, tabla: "votaciones" }).then(votaciones => {
                        //recoger datos
                        let existe = votaciones.find(x => x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1])
                        let unico_voto_realizado = null
                        if (voto_unico) {
                            unico_voto_realizado = votaciones.find(x => x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0])
                        }
                        //eventos
                        if (existe && (!voto_unico || (unico_voto_realizado && unico_voto_realizado.id_encuesta == id_seleccionado[0] && unico_voto_realizado.opcion_votada_encuesta == id_seleccionado[1]))) {

                            //mostrar cambios en el html(esto se ejecuta a la vez que la funcion borrar)
                            desmarcarVoto(boton, id_seleccionado)
                            //actualizar cache votos
                            const GUARDADO_REPUESTO = votaciones
                            const datos_votos_guardar = votaciones.filter(x => !(x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                            if (!votacion_anonima) {
                                window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))
                            }
                            const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                            actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])

                            borrar_voto_SUPABASE({ id_nombre: id_nombre.toString(), id_encuesta: Number(id_seleccionado[0]), opcion_votada_encuesta: Number(id_seleccionado[1]) }).then((error) => {
                                if (error) {//si falla
                                    //mostrar cambios en el html
                                    marcarVoto(boton, id_seleccionado)
                                    const datos_votos_guardar = GUARDADO_REPUESTO
                                    if (!votacion_anonima) {
                                        window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))
                                    }
                                    const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                    actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])
                                    document.querySelector("#app").insertAdjacentHTML("afterbegin", `
                                    <div id="${MENSAJES_ALERTA_ID}" style="display:flex">
                                    <span>No se pudo borrar❌</span>
                                    </div>
                                    `)
                                    document.querySelector(`#${MENSAJES_ALERTA_ID}`).style.display = "flex"
                                    setTimeout(() => {
                                        document.querySelector(`#${MENSAJES_ALERTA_ID}`).style.display = "none"
                                    }, 1500)
                                }
                            })

                        }
                        else if (!existe && (!voto_unico || !unico_voto_realizado)) {
                            let nombre_votante = "anónimo"
                            if (!votacion_anonima) {
                                nombre_votante = window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE) ? window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE) : "anónimo"
                                nombre_votante = nombre_votante.replace(/\n+/g, "").replace(/\s+/g, " ").replace(/[0-9|.<>,#;]/g, "").replaceAll("no bono", "").replaceAll("(bono)", "").replaceAll("bono", "")
                            }
                            let bono_votante = window.localStorage.getItem(NAME_DT_LOC_BONO_VARIABLE)
                            if (bono_votante != "true") bono_votante = false
                            marcarVoto(boton, id_seleccionado)
                            //actualizar cache votos
                            const datos_votos_guardar = votaciones
                            datos_votos_guardar.push({ "id_nombre": String(id_nombre), "id_encuesta": Number(id_seleccionado[0]), "opcion_votada_encuesta": Number(id_seleccionado[1]), "nombre_votante": nombre_votante, "bono_votante": Boolean(bono_votante) })
                            window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))
                            const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                            actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])
                            añadir_voto_SUPABASE({
                                id_encuesta: id_seleccionado[0], opcion_votada_encuesta: id_seleccionado[1], nombre_votante: nombre_votante, bono_votante: Boolean(bono_votante)
                            }).then((error) => {
                                if (error) {//si falla
                                    //mostrar cambios en el html
                                    desmarcarVoto(boton, id_seleccionado)
                                    //actualizar cache votos
                                    const datos_votos_guardar = votaciones
                                    datos_votos_guardar.pop()
                                    window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))
                                    const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                    actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])
                                    document.querySelector("#app").insertAdjacentHTML("afterbegin", `
                                    <div id="${MENSAJES_ALERTA_ID}" style="display:flex">
                                    <span>No se pudo contar voto❌</span>
                                    </div>
                                    `)
                                    document.querySelector(`#${MENSAJES_ALERTA_ID}`).style.display = "flex"
                                    setTimeout(() => {
                                        document.querySelector(`#${MENSAJES_ALERTA_ID}`).style.display = "none"
                                    }, 1500)
                                }
                            })
                        }
                    })
                }
                const encuesta_seleccionada = data.find(x => x.id_encuesta == id_seleccionado[0])
                votar(encuesta_seleccionada.voto_unico)
            })
        })
    }
    //evento analizar datos
    const $bt_analizar_datos = document.querySelector(`#${PARTE_ID_BT_ANALIZAR_DATOS}${encuesta_id}`)
    if ($bt_analizar_datos && encuesta_id != null && ((!data.terminada && !datos_anonimos) || (data.terminada && data.mostrar_resultados_cerrada && !datos_anonimos))) {
        $bt_analizar_datos.addEventListener("click", () => {
            const $pagina_datos_analizados_encuesta = document.querySelector(`#${$ID_PAGINA_DATOS_ANALIZAR_VOTACION}`)
            $bt_analizar_datos.style.cursor = "progress"//puntero cargando
            conseguir_datos_SUPABASE({ encuesta_id: encuesta_id, tabla: "encuestas", datos_recibir: ["titulo", "opciones"] }).then(([encuesta]) => {
                conseguir_datos_SUPABASE({ encuesta_id: encuesta_id, tabla: "votaciones", datos_recibir: ["opcion_votada_encuesta", "nombre_votante", "bono_votante"] }).then(votaciones => {
                    $bt_analizar_datos.style.cursor = "pointer"//quitar puntero cargando
                    const contador_votaciones = contador_votos(votaciones)
                    $pagina_datos_analizados_encuesta.innerHTML = `<div class="head-pagina-datos"><div><h3>${encuesta.titulo}</h3></div><span id="bt-salir-pagina-datos">Salir</span></div>
                    <table>
                    <caption><strong>Recuento de votos</strong></br>(más a menos votado)</caption>
                    ${mostrar_recuento_votos(contador_votaciones, encuesta)}
                    </table>
                    ${!data.voto_anonimo ? mostrar_nombre_votantes(contador_votaciones, encuesta) : ""}
                    `

                    //mostrar página flotante
                    const $alineador_pagina_datos_analizados_encuesta = document.querySelector("#alineador-pagina-datos-analizados-encuesta")
                    $alineador_pagina_datos_analizados_encuesta.classList.remove(CLASS_DISPLAY_NONE)
                    $alineador_pagina_datos_analizados_encuesta.classList.add(CLASS_DISPLAY_FLEX)
                    //eventos salir
                    document.querySelector("#bt-salir-pagina-datos").addEventListener("click", () => {
                        $alineador_pagina_datos_analizados_encuesta.classList.remove(CLASS_DISPLAY_FLEX)
                        $alineador_pagina_datos_analizados_encuesta.classList.add(CLASS_DISPLAY_NONE)
                    })
                })
            })
        })
    }
    //evento ver datos opcion
    if (!datos_anonimos && document.querySelectorAll(".text-contador-votos")) {
        document.querySelectorAll(".text-contador-votos").forEach(contador => {
            let timeEvent;
            let timeEvent2;
            contador.addEventListener("mouseenter", () => {
                timeEvent = setTimeout(() => {
                    clearTimeout(timeEvent2)
                    if (document.querySelector(`#${$MINI_ANALISIS_DATOS}`)) {
                        document.querySelectorAll(`.${$MINI_ANALISIS_DATOS}`).forEach(item => {
                            item.remove()
                        })
                    }
                    let id = contador.id.replace(PARTE_ID_CONTADOR_VOTANTES, "").split("-")//[id encuesta,opcion encuesta]
                    function mostrar_datos_resumen(contador, contador_bono, nombres_mostrar) {
                        document.querySelector("#main").insertAdjacentHTML("afterend", `<div  id="${$MINI_ANALISIS_DATOS}"class="${$MINI_ANALISIS_DATOS} ${CLASS_APARECER_CHECKBOX_VOTO}">
                        <table>
                        <tr>
                        <td>Votos</td>
                        <td>Bonos</td>
                        <td>Nombres</td>
                        </tr>
                        <tr>
                        <td >${contador}</td>
                        <td>${contador_bono}</td>
                        <td>${nombres_mostrar}</td>
                        </tr>
                        </table>
                            </div>`)
                    }
                    //mirar si ya hay datos creados
                    let datos_guardado = window.sessionStorage.getItem(NAME_DT_LOC_VOTACIONES) ? JSON.parse(window.sessionStorage.getItem(NAME_DT_LOC_VOTACIONES)) : []

                    //mirar si existe datos sobre mi encuesta-opcion
                    const datos_opcion_buscar = datos_guardado.find(x => x.id == id[0] && x.opcion == id[1])
                    if (datos_opcion_buscar) {//existen datos de guardado
                        mostrar_datos_resumen(datos_opcion_buscar.datos.contador, datos_opcion_buscar.datos.contador_bono, datos_opcion_buscar.datos.nombres_mostrar, datos_opcion_buscar.voto_anonimo)
                    }
                    else {//no existe: crear + actualizar
                        const votaciones = JSON.parse(window.sessionStorage.getItem(NAME_DT_LOC_VOTACIONES)) //acceder a los datos de guardado de las votaciones
                        let contador = 0
                        let contador_bono = 0
                        let nombres = {
                            "anonimos": 0,
                            "identificados": []
                        }
                        votaciones.forEach(e => {
                            if (e.id_encuesta == id[0] && e.opcion_votada_encuesta == id[1]) {
                                if (e.bono_votante) contador_bono++
                                contador++
                                if (e.nombre_votante != VALOR_DEFECTO_NOMBRE_USUARIO) {
                                    nombres.identificados.push(e.nombre_votante)
                                }
                                else {
                                    nombres.anonimos++
                                }
                            }

                        })
                        //voto anonimo
                        let nombres_mostrar = ""
                        if (nombres.anonimos != 0) {
                            nombres_mostrar = `${VALOR_DEFECTO_NOMBRE_USUARIO}: ${nombres.anonimos}`
                        }
                        let primero = true
                        nombres.identificados.forEach(n => {
                            if (primero && nombres.anonimos == 0) {
                                nombres_mostrar += `${n}`
                                primero = false
                            }
                            else {
                                nombres_mostrar += `</br>${n}`
                            }

                        })
                        //mostrar datos
                        mostrar_datos_resumen(contador, contador_bono, nombres_mostrar)
                    }
                }, 1500)

            })
            contador.addEventListener("mouseleave", () => {
                clearTimeout(timeEvent)
                if (document.querySelector(`#${$MINI_ANALISIS_DATOS}`)) {
                    document.querySelector(`#${$MINI_ANALISIS_DATOS}`).classList.remove(CLASS_APARECER_CHECKBOX_VOTO)
                    document.querySelector(`#${$MINI_ANALISIS_DATOS}`).classList.add(CLASS_DESAPARECER_CHECKBOX_VOTO)
                    document.querySelector(`#${$MINI_ANALISIS_DATOS}`).addEventListener("animationend", () => {
                        if (getComputedStyle(document.querySelector(`#${$MINI_ANALISIS_DATOS}`)).opacity === "0") {
                            document.querySelector(`#${$MINI_ANALISIS_DATOS}`).style.display = "none";
                        }
                    })
                }
            })
        })
    }
}

//iniciador de codigo
globalThis.addEventListener("DOMContentLoaded", () => {
    MANTENIMIENTO_BASE_DATOS()
        .then(() => {
            return conseguir_datos_SUPABASE({ tabla: "encuestas", datos_recibir: ["id_encuesta", "titulo", "opciones", "principal", "duracion_fechas", "voto_unico", "terminada", "mostrar_resultados_cerrada", "datos_anonimos", "voto_anonimo"] })
        })
        .then(async (data) => {
            const fecha_actual = new Date()
            let encuesta_id = data.find(x => x.principal && !x.terminada && fecha_actual >= new Date(x.duracion_fechas[0]))
            if (encuesta_id) encuesta_id = encuesta_id.id_encuesta
            else {
                encuesta_id = data.find(x => x.principal && (fecha_actual >= new Date(x.duracion_fechas[0])))
                if (!encuesta_id) encuesta_id = data.find(x => !x.terminada && (fecha_actual >= new Date(x.duracion_fechas[0])))
                if (!encuesta_id) encuesta_id = data.find(x => x.terminada)

                encuesta_id = encuesta_id?.id_encuesta ?? null

            }
            if (encuesta_id == null) {
                alert("NO HAY VOTACIONES disponibles")
            }
            return conseguir_datos_SUPABASE({
                encuesta_id:
                    encuesta_id,
                tabla: "votaciones"
            }).then(votaciones => ({ data, encuesta_id, votaciones }))
        })
        .then(({ data, encuesta_id, votaciones }) => {
            const contador_votaciones = contador_votos(votaciones)
            const opciones_votadas = mirar_opciones_votadas(votaciones)

            const datos_anonimos =
                data.find(x => x.id_encuesta == encuesta_id)?.voto_anonimo

            if (!datos_anonimos) {
                sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(votaciones))
            }
            generar_encuestas(data, encuesta_id, contador_votaciones, opciones_votadas)
        })
})
