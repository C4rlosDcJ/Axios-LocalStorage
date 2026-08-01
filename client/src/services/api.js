import axios from 'axios';

/**
 * CONFIGURACIÓN CENTRALIZADA DE AXIOS
 * Instancia del cliente HTTP apuntando a la URL base del servidor backend.
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
// Normalizar URL para evitar errores 404 por falta del prefijo /api o barras inclinadas al final
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
  baseURL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR DE PETICIONES (REQUEST INTERCEPTOR)
 * Se ejecuta automáticamente ANTES de enviar cada solicitud HTTP.
 * Extrae el token guardado en LocalStorage y lo incluye en el encabezado 'Authorization: Bearer <token>'.
 */
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('app_auth_token');
    if (token) {
      try {
        token = JSON.parse(token); // Parsea el token almacenado como JSON string
      } catch (e) {
        // En caso de texto plano
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPUESTAS (RESPONSE INTERCEPTOR)
 * Se ejecuta automáticamente AL RECIBIR una respuesta del servidor.
 * Maneja errores globales como 401 (No autorizado) o 403 (Prohibido) limpiando la sesión.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Si el token es inválido o expiró, limpia LocalStorage y recarga la vista
      localStorage.removeItem('app_auth_token');
      localStorage.removeItem('app_user_data');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
