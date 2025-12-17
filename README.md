# maqueta-pagina-votaciones-uso-libre

Una pagina para votaciones, que cualquiera puede copiar para uso propio

Funciona correctamente en cualquier dispositivo y es muy fácil de copiarla y adaptarla


##Caracteristicas

-crea y gestiona votaciones rápidamente
-diseño responsive y muy fácil de editar
-código fácil de adaptar


##como funciona

###Tecnologías y lenguajes usados:

-Vite
-js/html/css
-Base de datos usada en el código: supabase


###Como usarlo:
1-clona el proyecto2-Instala node dependencias > npm install
3-Instala Vite > npm create vite@latest
3-y supabase > npm install -g supabase
4-Crea un archivo .env con las variables:
[
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_KEY=tu_key
VITE_ADMIN_KEY= un pin cualquiera
]

⚠️ Aviso: En este código se está usando VITE_ADMIN_KEY en frontend, lo cual no es seguro para producción porque se vuelve público.

#Ejecutarlo localhost: npm run dev (en la raiz del proyecto)

##Estructura de SUPABASE:

###-> tablas: encuestas , encuestas_votaciones

####tabla[ encuestas ]:

{

id_encuesta:int8(identity-primary key-unique),

titulo:text,

opciones: text[],

principal:bool,

duracion_fechas:timestamp[inicio,fin],

republicar:bool,

voto_unico:bool,

terminada:bool,

mostrar_resultados_cerrada:bool,

datos_anonimos:bool,

voto_anonimo:bool,

fecha_terminada:date(por defecto: null)

}

####tabla[ encuestas_votaciones ]:

{

id:int8(identity-primary key-unique),

id_nombre:text,

id_encuesta:int8,

opcion_votada_encuesta:int8,

nombre_votante:text,

bono_votante:bool

}

##Mantenimiento de la base de datos:

Esta se hace mantenimiento autonomamente cuando alguien se conecta a la página. Es un parche al no usar un servidor que la gestione constantemente.
