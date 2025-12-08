import { supabase } from '../supabase/supabase'


export async function MANTENIMIENTO_BASE_DATOS() {
    conseguir_datos_SUPABASE({}).then((votaciones) => {
        //hay votaciones terminadas sin terminar?
        votaciones.forEach(vt => {
            if (vt.terminada) return;//cerrar este ciclo
            const fecha_hora_actual = new Date().toLocaleString()
            const fecha_hora_fin_votacion = new Date(vt.duracion_fechas[1])

            if (fecha_hora_fin_votacion >= fecha_hora_actual) {//finalizar votación
                //actualizar base datos

                const fecha = `${fecha_hora_actual.getFullYear()}-${String(fecha_hora_actual.getMonth() + 1).padStart(2, '0')}-${String(fecha_hora_actual.getDate()).padStart(2, '0')}`;

                actualizar__encuesta(vt.id_encuesta, { "terminada": true, "fecha_terminada": fecha.toString() })
                //hay que republicar la votacion?
                if (vt.republicar) {//crear otra encuesta con los mismos datos pero distinto ID
                    añadir_encuesta({
                        "titulo": vt.titulo,
                        "opciones": vt.opciones,
                        "principal": vt.principal,
                        "duracion_fechas": vt.duracion_fechas,
                        "republicar": vt.republicar,
                        "voto_unico": vt.voto_unico,
                        "terminada": false,
                        "mostrar_resultados_cerrada": vt.mostrar_resultados_cerrada,
                        "datos_anonimos": vt.datos_anonimos,
                        "voto_anonimo": vt.voto_anonimo
                    })
                }
            }
        })
        //hay votaciones terminadas que los datos guardados ya pasaron 3semanas?
        votaciones.forEach(vt => {
            if (!vt.terminada) return; //terminar este ciclo
            const fecha_actual = new Date()
            const fecha_terminada = new Date(vt.fecha_terminada)
            const f_limite = fecha_terminada.setDate(fecha_terminada.getDate() + 21)//fecha limite
            if (f_limite < fecha_actual) {
                //borrar votacion +votos de esa votacion
                borrar_datos("encuestas", vt.id_encuesta)//encuesta
                borrar_datos("encuestas_votaciones", vt.id_encuesta)//votos encuesta
            }
        })
    })
}
const añadir_encuesta = async ({ titulo = "Votacion", opciones = [], principal = false, duracion_fechas = [], republicar = false, voto_unico = false, terminada = false, mostrar_resultados_cerrada = true, datos_anonimos = false, voto_anonimo = false, fecha_terminada = null }) => {
    const { data, error } = await supabase
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
    if (error) {
        console.error("Error de MANTENIMIENTO al añadir voto:", error);
    }
}
const actualizar__encuesta = async (id_encuesta, datos_cambiar) => {
    const { error } = await supabase
        .from("encuestas")
        .update(datos_cambiar)
        .eq("id_encuesta", id_encuesta);

    if (error) {
        console.error("Error de MANTENIMIENTO al cambiar datos de la encuesta:", error)
    }
}
const borrar_datos = async (tabla, id_encuesta) => {
    const { error } = await supabase
        .from(tabla)
        .delete()
        .eq('id_encuesta', id_encuesta);
    if (error) {
        console.error("Error MANTENIMIENTO al borrar datos:", error)
    }
}
const conseguir_datos_SUPABASE = async ({ encuesta_id = null, tabla = "encuestas" }) => {
    let query = supabase.from(tabla).select("*");
    if (encuesta_id) query = query.eq("id_encuesta", encuesta_id);

    const { data, error } = await query;
    if (error) {
        console.log("Error MANTENIMIENTO RECIBIR DATOS")
        return []
    }
    return data
}