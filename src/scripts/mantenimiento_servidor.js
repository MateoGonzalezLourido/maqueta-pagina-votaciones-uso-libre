import { supabase } from '../supabase/supabase'

export async function MANTENIMIENTO_BASE_DATOS() {
    const votaciones = await conseguir_datos_SUPABASE({});
    // 1. Finalizar votaciones caducadas
    for (const vt of votaciones) {
        if (vt.terminada) continue;

        const ahora = new Date();
        const fin = new Date(vt.duracion_fechas[1]);

        if (fin <= ahora) {
            const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

            // esperar actualización
            await actualizar__encuesta(vt.id_encuesta, {
                terminada: true,
                fecha_terminada: fecha
            });

            if (vt.republicar) {
                await añadir_encuesta({
                    titulo: vt.titulo,
                    opciones: vt.opciones,
                    principal: vt.principal,
                    duracion_fechas: vt.duracion_fechas,
                    republicar: vt.republicar,
                    voto_unico: vt.voto_unico,
                    terminada: false,
                    mostrar_resultados_cerrada: vt.mostrar_resultados_cerrada,
                    datos_anonimos: vt.datos_anonimos,
                    voto_anonimo: vt.voto_anonimo
                });
            }
        }
    }
    // 2. Borrar votaciones expiradas 21 días después
    for (const vt of votaciones) {
        if (!vt.terminada) continue;

        const ahora = new Date();
        const fecha_terminada = new Date(vt.fecha_terminada);
        const limite = new Date(fecha_terminada.getTime() + 21 * 24 * 60 * 60 * 1000);

        if (limite < ahora) {
            await borrar_datos("encuestas", vt.id_encuesta);
            await borrar_datos("encuestas_votaciones", vt.id_encuesta);
        }
    }
}

const añadir_encuesta = async ({ titulo = "Votacion", opciones = [], principal = false, duracion_fechas = [], republicar = false, voto_unico = false, terminada = false, mostrar_resultados_cerrada = true, datos_anonimos = false, voto_anonimo = false, fecha_terminada = null }) => {
    const { data, error } = await supabase
        .from("encuestas")
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