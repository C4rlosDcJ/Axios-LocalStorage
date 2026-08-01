import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';

/**
 * COMPONENTE PRINCIPAL (App)
 * Gestiona el estado general de la aplicación, vistas de autenticación (Login/Registro),
 * peticiones con Axios y sincronización con LocalStorage.
 */
export default function App() {
  // Persistencia de la sesión del usuario y preferencia del tema visual en LocalStorage
  const [token, setToken] = useLocalStorage('app_auth_token', null);
  const [user, setUser] = useLocalStorage('app_user_data', null);
  const [theme, setTheme] = useLocalStorage('app_theme', 'dark');

  // Estado para alternar entre el formulario de Login e Inicio de Sesión
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados reactivos de la aplicación
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para los inputs de autenticación (Nombre, Usuario y Contraseña)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Estado para los inputs de creación de tareas
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  // Actualiza el atributo 'data-theme' en el documento HTML cada vez que cambia el tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Carga las tareas del usuario mediante Axios una vez que exista un token válido
  useEffect(() => {
    if (token) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [token]);

  // Cambia el tema entre modo claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  /**
   * MANEJA AUTENTICACIÓN (LOGIN O REGISTRO)
   * Realiza la petición POST a la API utilizando Axios
   */
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const payload = isRegistering ? { name, username, password } : { username, password };

    try {
      const res = await api.post(endpoint, payload);
      // Almacena el token y los datos de usuario devueltos en LocalStorage mediante los setters
      setToken(res.data.token);
      setUser(res.data.user);
      setName('');
      setUsername('');
      setPassword('');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Error de conexión con el servidor. Verifique VITE_API_URL o la red.');
      } else {
        setError('Error al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * CIERRA SESIÓN DE USUARIO
   * Limpia los valores almacenados en LocalStorage
   */
  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  /**
   * OBTENER LISTA DE TAREAS (GET)
   * Axios inyecta automáticamente el token mediante el interceptor de peticiones
   */
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener datos.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * CREAR NUEVA TAREA (POST)
   */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await api.post('/tasks', { title, description, category });
      setTasks([res.data, ...tasks]); // Inserción rápida en el estado local
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar.');
    }
  };

  /**
   * CAMBIAR ESTADO DE CUMPLIMIENTO (PUT)
   */
  const handleToggleComplete = async (task) => {
    try {
      const res = await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      setTasks(tasks.map(t => t.id === task.id ? res.data : t));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar.');
    }
  };

  /**
   * ELIMINAR TAREA (DELETE)
   */
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar.');
    }
  };

  return (
    <div className="app-container">
      {/* Encabezado Superior */}
      <header className="header">
        <div className="brand">
          <span>AXIOS & LOCALSTORAGE</span>
        </div>
        <div className="controls">
          {user && user.username && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              USER: {user.username.toUpperCase()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={toggleTheme}>
            <span>{theme === 'dark' ? 'CLARO' : 'OSCURO'}</span>
          </button>
          {token && (
            <button className="btn btn-danger" onClick={handleLogout}>
              <span>SALIR</span>
            </button>
          )}
        </div>
      </header>

      {/* Renderizado Condicional: Login/Registro o Panel de Tareas */}
      {!token ? (
        <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
          <div className="card">
            <h2 className="card-title">
              <span>{isRegistering ? 'REGISTRO DE USUARIO' : 'INICIAR SESION'}</span>
            </h2>

            <div className="banner banner-info">
              <span>STORAGE: LOCALSTORAGE // CLIENT: AXIOS API</span>
            </div>

            {error && <div className="banner banner-warning">{error}</div>}

            <form onSubmit={handleAuthSubmit}>
              {isRegistering && (
                <div className="form-group">
                  <label className="form-label">NOMBRE COMPLETO</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Carlos Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">USUARIO</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: carlos"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CONTRASEÑA</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading
                  ? (isRegistering ? 'CREANDO CUENTA...' : 'AUTENTICANDO...')
                  : (isRegistering ? 'REGISTRARSE' : 'INICIAR SESION')}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px dashed var(--border-dashed)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta registrada?'}
              </span>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.8rem' }}
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
              >
                {isRegistering ? 'IR A INICIAR SESION' : 'CREAR UNA CUENTA NUEVA'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="main-grid">
          {/* Formulario de Creación de Tareas */}
          <div className="card">
            <h2 className="card-title">
              <span>NUEVO REGISTRO</span>
            </h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">TITULO DE TAREA</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Escriba el título..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CATEGORIA</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">GENERAL</option>
                  <option value="Desarrollo">DESARROLLO</option>
                  <option value="Estudio">ESTUDIO</option>
                  <option value="Personal">PERSONAL</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">DETALLES</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detalles adicionales..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                GUARDAR REGISTRO
              </button>
            </form>
          </div>

          {/* Lista Dinámica de Tareas Registradas */}
          <div className="card">
            <h2 className="card-title">
              <span>REGISTROS SYNCD ({tasks.length})</span>
            </h2>
            
            {error && <div className="banner banner-warning">{error}</div>}

            {loading && tasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PROCESANDO PETICION AXIOS...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>NO HAY REGISTROS DISPONIBLES PARA ESTE USUARIO.</p>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-info">
                      {/* Control Interactivo de Estado */}
                      <div
                        className={`status-toggle ${task.completed ? 'completed' : ''}`}
                        onClick={() => handleToggleComplete(task)}
                        title="Haz clic para cambiar el estado de la tarea"
                      >
                        <span className="switch-dot"></span>
                        <span className="status-text">
                          {task.completed ? 'REALIZADO' : 'PENDIENTE'}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="task-title" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</span>
                          <span className="badge">{task.category}</span>
                        </div>
                        {task.description && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      ELIMINAR
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
