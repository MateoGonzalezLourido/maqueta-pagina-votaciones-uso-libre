/*SUPABASE FUNCIONES */
import { añadir_votacion_SUPABASE, actualizar_votacion_SUPABASE, borrar_voto_SUPABASE, borrar_votacion_SUPABASE, conseguir_datos_SUPABASE } from '../supabase/funciones.js'
/*ESTO ES UN PARCHE AL NO TENER MANTENIMIENTO ACTIVO EN EL SERVIDOR
NO SERA 100% PRECISO EN LAS FECHAS YA QUE ESTO SE EJECUTA CUANDO UN USUARIO SE CONECTA A LA PÁGINA, POR LO QUE UNA ENCUESTA QUE ESTA HECHA PARA LUNES-VIERNES SI SE TERMINA Y EL PRIMERO SE METE EL MARTES LAS FECHAS SE MOVERÍAN A MARTES-SÁBADO, SI ESTO NO ES TAN IMPORTANTE O ES UNA PÁGINA MUY VISITADA DIARIAMENTE ESTE PROBLEMA DESAPARECERÍA.
*/
export async function MANTENIMIENTO_BASE_DATOS() {
    const votaciones = await conseguir_datos_SUPABASE({ tabla: "encuestas" });
    // 1. Finalizar votaciones caducadas
    for (const vt of votaciones) {
        if (vt.terminada) continue;

        const ahora = new Date()
        const fin = new Date(vt.duracion_fechas[1])

        if (fin <= ahora) {
            const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`

            // esperar actualización
            await actualizar_votacion_SUPABASE({
                id_encuesta: vt.id_encuesta, datos_cambiar: {
                    terminada: true,
                    fecha_terminada: fecha,
                    principal: false
                }, mantenimiento: true
            });

            if (vt.republicar) {
                //replicar fechas pero moviendolas para la fecha actual (las horas no cambian, se replican las mismas que se usaron)
                const fecha_actual = new Date()
                const fecha_inicio_usada = new Date(vt.duracion_fechas[0])
                const fecha_fin_usada = new Date(vt.duracion_fechas[1])
                const diferencia_fechas = fecha_fin_usada - fecha_inicio_usada

                fecha_actual.setHours(fecha_inicio_usada.getHours(), fecha_inicio_usada.getMinutes(), fecha_inicio_usada.getSeconds(), fecha_inicio_usada.getMilliseconds())


                const fecha_fin_cambiar = new Date(fecha_actual.getTime() + diferencia_fechas)

                let fechas_establecidas = [fecha_actual.toISOString(), fecha_fin_cambiar.toISOString()]

                await añadir_votacion_SUPABASE({
                    titulo: vt.titulo,
                    opciones: vt.opciones,
                    principal: vt.principal,
                    duracion_fechas: fechas_establecidas,
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

        const ahora = new Date()
        const fecha_terminada = new Date(vt.fecha_terminada)
        const limite = new Date(fecha_terminada.getTime() + 21 * 24 * 60 * 60 * 1000)

        if (limite <= ahora) {//borrar datos
            await borrar_voto_SUPABASE({ id_encuesta: vt.id_encuesta })
            await borrar_votacion_SUPABASE({ id_encuesta: vt.id_encuesta })
        }
    }
}