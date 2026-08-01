# Aplicacion Fullstack React con Axios, LocalStorage y Node.js/Express

Aplicacion web educativa y funcional construida con arquitectura Frontend/Backend. Demuestra la implementacion practica de **Axios** para clientes HTTP e interceptores, **LocalStorage** para persistencia reactiva de estado y sesiones de usuario, y un servidor backend con **Express.js** e interfaz basada en Nothing OS design system (monocromatico, sin emojis).

---

## Tabla de Contenidos

- [Caracteristicas](#caracteristicas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Instalacion y Configuracion](#instalacion-y-configuracion)
- [Estructura del Codigo](#estructura-del-codigo)
- [Endpoints de la API](#endpoints-de-la-api)
- [Uso de Axios y LocalStorage](#uso-de-axios-y-localstorage)
- [Licencia](#licencia)

---

## Caracteristicas

- **Autenticacion Completa**: Registro de nuevos usuarios e inicio de sesion con manejo de tokens.
- **Cliente HTTP Centralizado**: Uso de Axios con interceptores automaticos para peticiones y respuestas.
- **Persistencia en LocalStorage**: Guardado dinamico de tokens de sesion y tema visual (Modo Claro / Modo Oscuro).
- **Control de Tareas (CRUD)**: Creacion, lectura, actualizacion de estado interactivo y eliminacion de tareas.
- **Diseno Nothing OS**: Estilizado tecnico monocromatico con fuentes pixeladas para titulos y tipografia Space Grotesk.
- **Codigo Documentado**: Comentarios JSDoc en frontend y backend explicando la logica y flujo de datos.

---

## Arquitectura del Proyecto

El proyecto esta dividido en dos partes principales:

```text
/
├── client/              # Aplicacion Frontend (Vite + React)
│   ├── src/
│   │   ├── hooks/       # Custom Hooks (useLocalStorage.js)
│   │   ├── services/    # Instancia de Axios e Interceptores (api.js)
│   │   ├── App.jsx      # Componente principal e interfaz de usuario
│   │   └── index.css    # Sistema de diseno y estilos CSS
│   └── package.json
│
├── server/              # Servidor Backend (Node.js + Express)
│   ├── src/
│   │   └── server.js    # API REST, autenticacion y controladores CRUD
│   └── package.json
│
└── README.md            # Documentacion principal del repositorio
```

---

## Instalacion y Configuracion

### Prerrequisitos

- Node.js (v16.0.0 o superior)
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Configurar e Iniciar el Backend

```bash
cd server
npm install
npm start
```
El servidor backend se iniciara en `http://localhost:4000`.

### 3. Configurar e Iniciar el Frontend

Abre una nueva terminal en la raiz del proyecto y ejecuta:

```bash
cd client
npm install
npm run dev
```
La aplicacion frontend estara disponible en `http://localhost:5173`.

---

## Endpoints de la API

| Metodo | Endpoint | Descripcion | Requiere Token |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registra un nuevo usuario | No |
| `POST` | `/api/auth/login` | Inicia sesion y retorna un token | No |
| `GET` | `/api/tasks` | Obtiene las tareas del usuario autenticado | Si |
| `POST` | `/api/tasks` | Crea una nueva tarea | Si |
| `PUT` | `/api/tasks/:id` | Actualiza estado/detalles de una tarea | Si |
| `DELETE` | `/api/tasks/:id` | Elimina una tarea especifica | Si |

---

## Uso de Axios y LocalStorage

### Interceptor de Peticiones (Axios)

El cliente Axios extrae el token guardado en LocalStorage y lo inyecta automaticamente en el encabezado de cada solicitud:

```javascript
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('app_auth_token');
    if (token) {
      token = JSON.parse(token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Custom Hook (useLocalStorage)

Sincroniza reactivamente el estado de React con el almacenamiento local del navegador:

```javascript
const [token, setToken] = useLocalStorage('app_auth_token', null);
```

---

## Credenciales de Prueba

Si deseas probar el sistema sin registrar un nuevo usuario:

- **Usuario**: `demo`
- **Contrasena**: `123456`
