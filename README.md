# maqueta-pagina-votaciones-uso-libre
una pagina para votaciones, que cualquiera puede copiar para uso propio

#Caracteristicas

crea votaciones
diseño responsive
cosigo fácil de adaptar

##como funciona

#*Tecnologías usadas:

Vite

js/html/css

supabase

#*Como usarlo:
clona el proyecto
instala dependencias > npm install
crea un archivo .env con las variables
[
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_KEY=tu_key
]
ejecutarlo localhost: npm run dev (en la raiz del proyecto)

o npm run dev --host (para crear un enlace por ip privada para que accedan otros de tu red)

#*Estructura:
/public/ > imagenes
/src/ > main(donde debes importar todo el cosigo que quieres que se ejecute en la pagina)

/src/scripts/ > las funciones de la pagina(en ella hay un .js que controla los datos del usuario[nombre, bono , generador id].
En el otro .js están todas las otras funciones de la página .

Si quieres usar funciones de un .js en otro debes importar o la funcion o el .js en ese otro .js donde lo quieres.

Gran parte de nombres de elementos, variables del localstorage y algun otro dato; estan arriva de la pagina .js para hacer todo un poco mas accesible

