DOCUMENTACIÓN PROYECTO REACT: 

Integrantes: Eloy Gonzalés, Corina Heras

INTRODUCCIÓN: 
Este proyecto es una billetera virtual diseñada para ofrecer a sus usuarios un control sencillo y eficiente de sus ingresos y egresos a lo largo del tiempo. La aplicación permite regitrar, actualizar, y gestionar transacciones según las necesidades del usuario.

El sistema cuenta con una interfaz minimalista y fácil de usar, compuesta por dos pantallas principales: 

1. Home = Muestra un resumen de las transacciones realizadas si es que las hay, y su balance actual

2. Formulario de registro: Permite agregar, editar y actualizar los eventos financieros del usuario. 

La plataforma está pensada para brindar una experiencia intuitiva, asegurando que los usuarios puedan visualizar sus movimientos financieros de manera clara y organizada, ayudándolos a mejorar la administración de su dinero.



EJECUCÍON: 
1. Creación del Proyecto en ReactJS
para la ejecucíon de nuestro proyecto de manera local se siguieron los siguientes pasos, comenzando por la creacion de nuestro proyecto en ReactJS con el siguiente comando en la terminal:

```js
npm create vite@latest
# 1. Escriba el nombre del proyecto
# 2. Seleccione la opción React
# 3. Seleccione la opción TypeScript

# Ingresar al directorio del proyecto
cd nombre_proyecto

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo 
npm run dev

# Instalar dep para poder usar alias en tsconfig.json y vite.config.ts
npm i @types/node -D
```

2. Implementación de `tailwind` y prefijo `cd:

.Instalar TailwindCSS, PostCSS y Autoprefixer:


```js
npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p
```

.A continuación, se creó el archivo `tailwind.config.js` en la raíz del proyecto.


```js
/** @type {import('tailwindcss').Config} */
export default {
 
  content: [
    './index.html','./src/**/*.{js,ts,jsx,tsx}'  
  ],
  //Usar prefijos en las clases puedes ser util para evitar
  prefix:'cd-',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

2. Clonar el Repositorio

Se creó un repositorio público en GitHub y compartimos el enlace para que otros puedan acceder al código. Luego, se clonó el proyecto en nuestra máquina local con el siguiente comando: 

```js
git clone https://github.com/EloyG3186/Walletfy_Project.git
cd Walletfy_Project
```

DESPLIEGUE:

```js
https://walletfy-project.pages.dev/
```

El despliegue de la aplicación se realizó con la ayuda de CloudFlare Pages, pero antes fue necesario realizar algunas modificaciones en el proyecto para garantizar su correcto funcionamiento en producción. A continuación, se detallan los pasos que fueron necesarios para el despliegue de el proyecto usando React con TypeScript. 

1. Preparación del Proyecto 
Antes de desplegarlo, se ejecuta el siguiente comando en terminal 

```js 
npm install 
```
```js 
npm run build
``` 


2. Iniciar sesión el cloud Flare y continuar siguiendo los pasos de la carpeta ```js despliegueCloudFlare ``` 

```js
Walletfy_project/despliegueCloudFlare/paso1.png...
```






