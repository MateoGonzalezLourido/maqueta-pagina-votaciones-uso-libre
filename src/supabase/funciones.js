//importar supabase
import { supabase } from '../supabase/supabase.js'
//supabase datos
const NOMBRE_TABLA_ENCUESTAS = "encuestas"
const NOMBRE_TABLA_VOTACIONES = "encuestas_votaciones"
const NOMBRE_TABLA_DEFECTO_USAR = NOMBRE_TABLA_ENCUESTAS
//textos
const TEXTO_MANTENIMIENTO = "(MANTENIMIENTO)"
const ERROR_FALTA_DATOS = "Falta de datos para completar la acción"
//funcion para id dispositivo
import { getBrowserFingerprint } from '../scripts/datos_usuario_control.js'

/*FUNCIONES SUPABASE */

export const conseguir_datos_SUPABASE = async ({ encuesta_id = null, tabla = NOMBRE_TABLA_DEFECTO_USAR, datos_recibir = [], mantenimiento = false }) => {
    //tabla puede ser "encuestas" o "votaciones" o la tabla por defecto(parametro)
    if (tabla == "votaciones") tabla = NOMBRE_TABLA_VOTACIONES
    else if (tabla == "encuestas") tabla = NOMBRE_TABLA_ENCUESTAS
    //datos recibir
    if (datos_recibir.length == 0) datos_recibir = "*"
    else datos_recibir = datos_recibir.join(",")
    //conseguir datos
    let query = supabase.from(tabla).select(datos_recibir);
    if (encuesta_id) query = query.eq("id_encuesta", encuesta_id);

    const { data, error } = await query;
    //control error
    if (error) {
        console.error(
            tabla === NOMBRE_TABLA_ENCUESTAS
                ? `Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al recibir datos encuestas:`
                : `Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al recibir votaciones encuestas:`,
            error
        )
        //devolver array vacio para evitar errores
        return []
    }
    //control datos vacios
    if (tabla === NOMBRE_TABLA_ENCUESTAS && !mantenimiento) {
        if (!data || data.length === 0) {
            console.error("No hay encuestas!")
        } else if (data[0].opciones && data[0].opciones.length === 0) {
            console.error("No hay opciones!")
        }
    }
    //devolver datos
    return data
}
export const borrar_voto_SUPABASE = async ({ id_nombre = null, id_encuesta = null, opcion_votada_encuesta = null, mantenimiento = false }) => {
    if (!id_nombre && !id_encuesta && !opcion_votada_encuesta) {//cancelar acción
        console.error(`Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al borrar el voto:`, ERROR_FALTA_DATOS)
        return;
    }
    //borrar
    const { error } = await supabase
        .from(NOMBRE_TABLA_VOTACIONES)
        .delete()
        .eq('id_nombre', id_nombre)
        .eq('id_encuesta', id_encuesta)
        .eq("opcion_votada_encuesta", opcion_votada_encuesta);
    //control errores
    if (error) {
        console.error(`Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al borrar el voto:`, error)
        return true
    }
}
export const borrar_votacion_SUPABASE = async ({ id_encuesta = null, mantenimiento = false }) => {
    if (!id_encuesta) {//cancelar acción
        console.error(`Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al borrar votacion:`, ERROR_FALTA_DATOS)
        return;
    }
    //borrar
    const { error } = await supabase
        .from(NOMBRE_TABLA_VOTACIONES)
        .delete()
        .eq('id_encuesta', id_encuesta);
    //control errores
    if (error) {
        console.error(`Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al borrar votacion:`, error)
    }
}
export const añadir_votacion_SUPABASE = async ({ titulo = "Sin Título", opciones = [], principal = false, duracion_fechas = [], republicar = false, voto_unico = false, terminada = false, mostrar_resultados_cerrada = true, datos_anonimos = false, voto_anonimo = false, mantenimiento = false }) => {
    //verificar que el título no se repita, si es asi añadir un (nºrepetidos+1)
    const data_titulos = await conseguir_datos_SUPABASE({ tabla: "encuestas", datos_recibir: ["titulo", "terminada"] })
    let repetidos = 0
    data_titulos.forEach(t => {
        if (t.titulo == titulo && !t.terminada) repetidos++;
    })
    if (repetidos > 0) titulo += `(${repetidos})`
    //completar acción
    const { error } = await supabase
        .from(NOMBRE_TABLA_ENCUESTAS)
        .insert([
            {
                "titulo": titulo,
                "opciones": opciones,
                "principal": principal,
                "duracion_fechas": duracion_fechas,
                "republicar": republicar,
                "voto_unico": voto_unico,
                "terminada": terminada,
                "mostrar_resultados_cerrada": mostrar_resultados_cerrada,
                "datos_anonimos": datos_anonimos,
                "voto_anonimo": voto_anonimo
            }
        ]);
    //control error
    if (error) {
        console.error(`Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al añadir voto:`, error);
    }
}
export const añadir_voto_SUPABASE = async ({ id_encuesta = null, opcion_votada_encuesta = null, nombre_votante = null, bono_votante = null }) => {
    if (!id_encuesta || !opcion_votada_encuesta || !nombre_votante || !bono_votante) {//cancelar acción
        console.error("Error al añadir voto:", ERROR_FALTA_DATOS)
        return;
    }
    //completar acción
    const { error } = await supabase
        .from(NOMBRE_TABLA_VOTACIONES)
        .insert([
            {
                "id_nombre": getBrowserFingerprint(),
                "id_encuesta": id_encuesta,
                "opcion_votada_encuesta": opcion_votada_encuesta,
                "nombre_votante": nombre_votante,
                "bono_votante": bono_votante
            }
        ]);
    //control error
    if (error) {
        console.error("Error al añadir voto:", error)
        return true;
    }
}
export const actualizar_votacion_SUPABASE = async ({ id_encuesta = null, datos_cambiar = {}, mantenimiento = false }) => {
    if (!id_encuesta || !datos_cambiar) {
        console.error("Error al actualizar:", ERROR_FALTA_DATOS)
        return;
    }
    const { error } = await supabase
        .from(NOMBRE_TABLA_ENCUESTAS)
        .update(datos_cambiar)
        .eq("id_encuesta", id_encuesta);

    if (error) {
        console.error(`Error ${mantenimiento ? TEXTO_MANTENIMIENTO : ""} al cambiar datos de la encuesta:`, error)
    }
}
