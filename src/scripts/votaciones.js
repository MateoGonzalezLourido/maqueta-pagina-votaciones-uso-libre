/*Importar cosas necesarias para el codigo */
import { supabase } from '../supabase/supabase'
import { getBrowserFingerprint } from './datos_usuario_control.js'

/*ALGUNAS VARIABLES O FUNCIONES PARA HACERLAS MAS ACCESIBLES */
const NAME_DT_LOC_BONO_VARIABLE = "bono_variable"
const NAME_DT_LOC_NOMBRE_VARIABLE = "nombre_variable"
const NAME_DT_LOC_VOTACIONES="votaciones"
const CLASS_CHECKED_CHECKBOX_VOTO = "checked"
const CLASS_SEMIDESAPARECER_CHECKBOX_VOTO = "semi-desaparecer"
const CLASS_SEMIAPARECER_CHECKBOX_VOTO = "semi-aparecer"
const CLASS_OPCION_VOTADA = "opcion-votado"
const PARTE_ID_REMPLAZAR_CHECKBOX_VOTO = "checkbox-opcion-encuesta-"
const PARTE_ID_USAR_OPCION_VOTACION = "opcion-encuesta-"
const PARTE_ID_REMPLAZAR_IMG_CHECK = "img-check-votado-"
const PARTE_ID_CONTADOR_VOTANTES= "numero-votantes-bt-lista-"
const TEXTO_CONTADOR_VOTOS = "*Votos: "
const URL_CHECKED_IMG = "/checked.svg"
const TEXTO_VOTO_UNICO="*voto único"
const TEXTO_VOTO_MULTIPLE="*voto múltiple"
const $id_select_encuestas = "select-encuestas"
const PARTE_ID_BT_ANALIZAR_DATOS="bt-analizar-datos-encuesta-"
//supabase datos
const NOMBRE_TABLA_ENCUESTAS = "encuestas"
const NOMBRE_TABLA_VOTACIONES = "encuestas_votaciones"
const NOMBRE_TABLA_DEFECTO_USAR = NOMBRE_TABLA_ENCUESTAS

const conseguir_datos_SUPABASE = async ({ encuesta_id = null, tabla = NOMBRE_TABLA_DEFECTO_USAR }) => {
    let query = supabase.from(tabla).select("*");
    if (encuesta_id) query = query.eq("id_encuesta", encuesta_id);

    const { data, error } = await query;
    if (error) {
        console.log(
            tabla === NOMBRE_TABLA_ENCUESTAS
                ? "Error al recibir datos encuestas:"
                : "Error al recibir votaciones encuestas:",
            error
        )
        return []
    }

    if (tabla === NOMBRE_TABLA_ENCUESTAS) {
        if (!data || data.length === 0) {
            console.log("No hay encuestas!")
        } else if (!data[0].opciones || data[0].opciones.length === 0) {
            console.log("No hay opciones!")
        }
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
const generar_opciones_encuestas = (encuestas, encuesta_id, contador_votaciones, opciones_votadas = []) => {
    let html_opciones = ``
    encuestas.forEach(encuesta => {//para buscar la encuesta que esta seleccionada
        if (encuesta.id_encuesta == encuesta_id) {//esta es la encuesta que estamos mirando
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
                const clase_opcion = display == "block" ? CLASS_OPCION_VOTADA : ""
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
function generar_encuestas(data, encuesta_id, contador_votaciones, opciones_votadas) {
    let voto_unico = data.find(x => x.id_encuesta == encuesta_id)
    voto_unico = voto_unico.voto_unico ? TEXTO_VOTO_UNICO : TEXTO_VOTO_MULTIPLE
    document.querySelector("#main").innerHTML = `
        <select id="${$id_select_encuestas}">
        ${generar_titulos_encuestas(data, encuesta_id)}
        </select>
        <div class="div-juntar-todo-cuerpo-opciones">
        <span class="tipo-voto">${voto_unico}</span>
        <section class="cuerpo-opciones">
        ${generar_opciones_encuestas(data, encuesta_id, contador_votaciones, opciones_votadas)}
        </section></div>
        <section id="datos-analizar">
        <button id="${PARTE_ID_BT_ANALIZAR_DATOS}${encuesta_id}" class="bt-analizar-datos">Analizar Datos</button>
        </section>
        `
    //evento cambio de encuesta
    document.querySelector(`#${$id_select_encuestas}`).addEventListener("change", (e) => {
        const titulo_escogido = e.target.value
        const encuesta_escogida = data.find(x => x.titulo == titulo_escogido)
        //registro de votos: hacer un recuento de los datos separados por opcion
        conseguir_datos_SUPABASE({ "encuesta_id": encuesta_escogida.id_encuesta, "tabla": NOMBRE_TABLA_VOTACIONES }).then((votaciones) => {
            let contador_votaciones = contador_votos(votaciones, encuesta_escogida.id_encuesta)
            let opciones_votadas = mirar_opciones_votadas(votaciones, encuesta_escogida.id_encuesta)
            //crear datos guardado de las votaciones de la encuesta para reducir solicitudes a la base de datos
            window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(votaciones))
            //actualizar pagina
            generar_encuestas(data, encuesta_escogida.id_encuesta, contador_votaciones, opciones_votadas)
        })
    })
    //evento opciones votar 
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
                function actualizar_contador(contador, id_encuesta, opcion_votada) {
                    //actualizar contador votos
                    const id_contador = `${PARTE_ID_CONTADOR_VOTANTES}${id_encuesta}-${opcion_votada}`
                    document.querySelector(`#${id_contador}`).innerHTML = TEXTO_CONTADOR_VOTOS + contador
                }
                const id_nombre = getBrowserFingerprint()
                //ver si ya existe ese voto
                conseguir_datos_SUPABASE({ "encuesta_id": encuesta_id, "tabla": NOMBRE_TABLA_VOTACIONES }).then(votaciones => {
                    let existe = votaciones.find(x => x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1])
                    let unico_voto_realizado;
                    if (voto_unico) {
                        unico_voto_realizado = votaciones.find(x => x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0])
                    }
                    if (!voto_unico || (voto_unico && !unico_voto_realizado)) {
                        if (existe) {//ya se ha botado -> borrar de la base de datos
                            borrar_votacion_encuesta(id_nombre.toString(), Number(id_seleccionado[0]), Number(id_seleccionado[1])).then(() => {
                                //mostrar cambios en el html
                                const id_img = boton.firstElementChild.id
                                document.querySelector(`#${id_img}`).classList.remove(CLASS_CHECKED_CHECKBOX_VOTO)
                                document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIAPARECER_CHECKBOX_VOTO)
                                document.querySelector(`#${id_img}`).classList.add(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)

                                document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.remove(CLASS_OPCION_VOTADA)
                                document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.add("opcion-no-votado")
                                //actualizar cache votos
                                const datos_votos_guardar = votaciones.filter(x => !(x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))

                                const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])
                            })
                        }
                        else {//crear voto
                            let nombre_votante = window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE) ? window.localStorage.getItem(NAME_DT_LOC_NOMBRE_VARIABLE) : "anónimo"
                            nombre_votante = nombre_votante.replace(/\n+/g, "").replace(/\s+/g, " ").replace(/[0-9|.<>,#;]/g, "").replaceAll("no bono", "").replaceAll("(bono)", "").replaceAll("bono", "")
                            let bono_votante = window.localStorage.getItem(NAME_DT_LOC_BONO_VARIABLE)
                            if (bono_votante != "true") bono_votante = false
                            const datos_enviar_voto = {
                                "id_nombre": id_nombre, "id_encuesta": id_seleccionado[0], "opcion_votada_encuesta": id_seleccionado[1], "nombre_votante": nombre_votante, "bono_votante": Boolean(bono_votante)
                            }
                            añadir_votacion_encuesta(datos_enviar_voto).then(() => {
                                //mostrar cambios en el html
                                const id_img = boton.firstElementChild.id
                                document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)

                                document.querySelector(`#${id_img}`).classList.add(CLASS_CHECKED_CHECKBOX_VOTO)
                                document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.remove("opcion-no-votado")
                                document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.add(CLASS_OPCION_VOTADA)
                                //actualizar cache votos
                                const datos_votos_guardar = votaciones
                                datos_votos_guardar.push({ "id_nombre": String(id_nombre), "id_encuesta": Number(id_seleccionado[0]), "opcion_votada_encuesta": Number(id_seleccionado[1]), "nombre_votante": nombre_votante, "bono_votante": Boolean(bono_votante) })
                                window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))

                                const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])
                            })

                        }
                    }
                    else {
                        if (unico_voto_realizado.id_encuesta == id_seleccionado[0] && unico_voto_realizado.opcion_votada_encuesta == id_seleccionado[1]) {//es la opcion votada-> borrar
                            borrar_votacion_encuesta(id_nombre.toString(), Number(id_seleccionado[0]), Number(id_seleccionado[1])).then(() => {
                                //mostrar cambios en el html
                                const id_img = boton.firstElementChild.id
                                document.querySelector(`#${id_img}`).classList.remove(CLASS_CHECKED_CHECKBOX_VOTO)
                                document.querySelector(`#${id_img}`).classList.remove(CLASS_SEMIAPARECER_CHECKBOX_VOTO)
                                document.querySelector(`#${id_img}`).classList.add(CLASS_SEMIDESAPARECER_CHECKBOX_VOTO)
                                document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.remove(CLASS_OPCION_VOTADA)
                                document.querySelector(`#${PARTE_ID_USAR_OPCION_VOTACION}${id_seleccionado[1]}`).classList.add("opcion-no-votado")
                                //actualizar cache votos
                                const datos_votos_guardar = votaciones.filter(x => !(x.id_nombre == id_nombre && x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(datos_votos_guardar))

                                const contador_votos = datos_votos_guardar.filter(x => (x.id_encuesta == id_seleccionado[0] && x.opcion_votada_encuesta == id_seleccionado[1]))
                                actualizar_contador(contador_votos.length, id_seleccionado[0], id_seleccionado[1])
                            })
                        }
                    }
                })
            }
            conseguir_datos_SUPABASE({ "encuesta_id": id_seleccionado[0], "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
                votar(encuesta[0].voto_unico)
            })
        })
    })

    //evento analizar datos
    const $bt_analizar_datos = document.querySelector(`#${PARTE_ID_BT_ANALIZAR_DATOS}${encuesta_id}`)
    $bt_analizar_datos.addEventListener("click", () => {
        $bt_analizar_datos.style.cursor = "progress"//puntero cargando
        conseguir_datos_SUPABASE({ "encuesta_id": encuesta_id, "tabla": NOMBRE_TABLA_ENCUESTAS }).then(encuesta => {
            conseguir_datos_SUPABASE({ "encuesta_id": encuesta_id, "tabla": NOMBRE_TABLA_VOTACIONES }).then(votaciones => {
                $bt_analizar_datos.style.cursor = "pointer"//quitar puntero cargando
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
                            usuarios += `*anónimos (bonos: ${usuario_datos.anonimos.bonos} de ${usuario_datos.anonimos.totales})`
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

                const $pagina_datos_analizados_encuesta = document.querySelector("#pagina-datos-analizados-encuesta")
                $pagina_datos_analizados_encuesta.innerHTML = `<div class="head-pagina-datos"><div><h3>${encuesta[0].titulo}</h3></div><span id="bt-salir-pagina-datos">Salir</span></div>
                    <table>
                    <caption><strong>Recuento de votos</strong></br>(más a menos votado)</caption>
                    ${mostrar_recuento_votos()}
                    </table>
                    <table>
                    <caption><strong>Votantes</strong> (más a menos votado)</caption>
                    ${mostrar_nombre_votantes()}
                    </table>`

                //mostrar página flotante
                const $alineador_pagina_datos_analizados_encuesta = document.querySelector("#alineador-pagina-datos-analizados-encuesta")
                $alineador_pagina_datos_analizados_encuesta.classList.remove("display-none")
                $alineador_pagina_datos_analizados_encuesta.classList.add("flex")
                //eventos salir
                document.querySelector("#bt-salir-pagina-datos").addEventListener("click", () => {
                    $alineador_pagina_datos_analizados_encuesta.classList.remove("flex")
                    $alineador_pagina_datos_analizados_encuesta.classList.add("display-none")
                })
            })
        })
    })
    //evento ver datos opcion
    document.querySelectorAll(".text-contador-votos").forEach(contador => {
        let timeEvent;
        let timeEvent2;
        contador.addEventListener("mouseenter", () => {
            timeEvent = setTimeout(() => {
                clearTimeout(timeEvent2)
                if (document.querySelector('#mini-analisis-opcion')) {
                    document.querySelectorAll('.mini-analisis-opcion').forEach(item => {
                        item.remove()
                    })
                }
                let id = contador.id.replace(PARTE_ID_CONTADOR_VOTANTES, "").split("-")//[id encuesta,opcion encuesta]
                function mostrar_datos_resumen(contador, contador_bono, nombres_mostrar) {
                    document.querySelector("#main").insertAdjacentHTML("afterend", `<div  id="mini-analisis-opcion"class="mini-analisis-opcion aparecer">
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
                    mostrar_datos_resumen(datos_opcion_buscar.datos.contador, datos_opcion_buscar.datos.contador_bono, datos_opcion_buscar.datos.nombres_mostrar)
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
                            if (e.nombre_votante != "anónimo") {
                                nombres.identificados.push(e.nombre_votante)
                            }
                            else {
                                nombres.anonimos++
                            }
                        }

                    })
                    let nombres_mostrar = ""
                    if (nombres.anonimos != 0) {
                        nombres_mostrar = `anónimos: ${nombres.anonimos}`
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
                    //crear datos guardado para evitar todo el proceso (ultimas 5 opciones vistas)
                    //se pasa del limite?->primero borramos y luego añadimos (por si la memoria esta justa no tener problemas)
                    const limite_opciones_guardadas = 10
                    if (datos_guardado.length >= limite_opciones_guardadas) {//esta en el limite(borrar el primero porque es el mas viejo creado)
                        datos_guardado.opciones.shift()
                    }
                    //añadir datos
                    datos_guardado.push({ "id": id[0], "opcion": id[1], "datos": { "contador": contador, "contador_bono": contador_bono, "nombres_mostrar": nombres_mostrar } })
                    window.sessionStorage.setItem("datos_guardado_encuestas_opciones_ultimas", JSON.stringify(datos_guardado))
                    //mostrar datos
                    mostrar_datos_resumen(contador, contador_bono, nombres_mostrar)
                }
            }, 1500)

        })
        contador.addEventListener("mouseleave", () => {
            clearTimeout(timeEvent)
            if (document.querySelector('#mini-analisis-opcion')) {
                document.querySelector("#mini-analisis-opcion").classList.remove("aparecer")
                document.querySelector("#mini-analisis-opcion").classList.add("desaparecer")
                document.querySelector('#mini-analisis-opcion').addEventListener("transitionend", () => {
                    if (getComputedStyle(document.querySelector('#mini-analisis-opcion')).opacity === "0") {
                        document.querySelector('#mini-analisis-opcion').style.display = "none";
                    }
                })
            }
        })

    })
}

globalThis.addEventListener("DOMContentLoaded", () => {
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
        conseguir_datos_SUPABASE({ "encuesta_id": encuesta_id, "tabla": NOMBRE_TABLA_VOTACIONES }).then((votaciones) => {
            //registro de votos: hacer un recuento de los datos separados por opcion
            let contador_votaciones = contador_votos(votaciones)
            //crear/mostrar opciones de la encuesta para votar y sus votos
            let opciones_votadas = mirar_opciones_votadas(votaciones)
            //opciones
            window.sessionStorage.setItem(NAME_DT_LOC_VOTACIONES, JSON.stringify(votaciones))
            generar_encuestas(data, encuesta_id, contador_votaciones, opciones_votadas)
        })
    })
})

