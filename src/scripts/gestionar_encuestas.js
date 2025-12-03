/*Importar cosas necesarias para el codigo */
import { supabase } from '../supabase/supabase'
import { serve } from "https://deno.land/std/http/server.ts";

/*VARIABLES */
const NOMBRE_TABLA_DEFECTO_USAR = "encuestas"
const ID_BT_ABRIR_PAGINA_ADMIN = "bt-abrir-menu-log-admin"
const ID_BT_AÑADIR_ENCUESTA = "bt-añadir-encuesta"
const ID_BT_VOLVER_HOME = "bt-volver-home"
const ID_MENU_ADMIN = "menu-log-gestionador-encuestas"
const ID_INPUT_KEY_ADMIN = "input-password-admin"
const CLASS_MOSTRAR_MENU = "mostrar-menu-log"
const CLASS_QUITAR_MENU = "quitar-menu-log"
const MENSAJE_ACCESO_CORRECTO = "*Acceso <ROLE> ADMIN correcto"
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

function verificar_acceso_admin(entrada) {//132546781535
    const ADMIN_KEY = Deno.env.get("ADMIN_KEY");
    if (adminKey == entrada) return true
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
function cerrar_log() {
    document.querySelector(`#${ID_BT_ABRIR_PAGINA_ADMIN}`).classList.remove("display-none")
    document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).blur()
    document.querySelector(`#${ID_INPUT_KEY_ADMIN}`).value = ""
    document.querySelector(`#${ID_MENU_ADMIN}`).classList.remove(CLASS_MOSTRAR_MENU)
    document.querySelector(`#${ID_MENU_ADMIN}`).classList.add(CLASS_QUITAR_MENU)
}
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
                        document.querySelector("#app").innerHTML = `
                    <div><span id="${ID_BT_VOLVER_HOME}"><-HOME-></span></div>
                    <main>
                    <section><select>${generar_select_encuestas(encuesta_id)}</select><div id="${ID_BT_AÑADIR_ENCUESTA}"><img class="img-añadir-encuesta" src="${URL_IMG_AÑADIR_ENCUESTA}" alt=""></div></section>
                    </main>`

                    }
                    else {
                        cerrar_log()
                    }
                }
            })
        }
    })
})