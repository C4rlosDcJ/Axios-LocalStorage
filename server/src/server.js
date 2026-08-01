/**
 * SERVIDOR BACKEND (NODE.JS + EXPRESS)
 * API RESTful con autenticación basada en tokens y persistencia en memoria.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de middlewares globales
app.use(cors()); // Habilita CORS para peticiones desde el cliente React
app.use(express.json()); // Parsea el cuerpo de las peticiones en formato JSON

/**
 * BASE DE DATOS SIMULADA EN MEMORIA
 */
let users = [
  {
    id: 'usr-1',
    name: 'Usuario Demo',
    username: 'demo',
    password: '123456',
    token: 'token-usr-1'
  }
];

let tasks = [
  {
    id: '1',
    userId: 'usr-1',
    title: 'Aprender Axios e Interceptores',
    description: 'Estudiar cómo interceptar peticiones y respuestas para adjuntar tokens',
    completed: true,
    category: 'Estudio',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: 'usr-1',
    title: 'Implementar almacenamiento en LocalStorage',
    description: 'Guardar preferencias de interfaz y caché de sesión en el navegador',
    completed: false,
    category: 'Desarrollo',
    createdAt: new Date().toISOString()
  }
];

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Protege endpoints verificando el encabezado 'Authorization: Bearer <token>'
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token faltante o formato inválido.' });
  }

  const token = authHeader.split(' ')[1];
  const user = users.find(u => u.token === token);
  
  if (!user) {
    return res.status(403).json({ error: 'Token inválido o sesión expirada.' });
  }

  // Inyectar el usuario autenticado en el objeto de la petición (req)
  req.user = user;
  next();
};

/**
 * ENDPOINT: POST /api/auth/register
 * Permite registrar un nuevo usuario en la aplicación
 */
app.post('/api/auth/register', (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Verificar si el usuario ya existe
  const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'El nombre de usuario ya está registrado.' });
  }

  // Crear usuario con su respectivo token único
  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    username,
    password,
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`
  };

  users.push(newUser);

  res.status(201).json({
    message: 'Usuario registrado exitosamente',
    token: newUser.token,
    user: { id: newUser.id, name: newUser.name, username: newUser.username }
  });
});

/**
 * ENDPOINT: POST /api/auth/login
 * Autentica credenciales y retorna un token de sesión
 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Por favor complete todos los campos.' });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(400).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  // Asignar un nuevo token a la sesión activa
  user.token = `token-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  return res.json({
    message: 'Autenticación exitosa',
    token: user.token,
    user: { id: user.id, name: user.name, username: user.username }
  });
});

/**
 * ENDPOINT: GET /api/tasks (PROTEGIDO)
 * Obtiene únicamente las tareas pertenecientes al usuario autenticado
 */
app.get('/api/tasks', authMiddleware, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

/**
 * ENDPOINT: POST /api/tasks (PROTEGIDO)
 * Crea una nueva tarea asociada al usuario autenticado
 */
app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description, category } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }

  const newTask = {
    id: String(Date.now()),
    userId: req.user.id,
    title,
    description: description || '',
    category: category || 'General',
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  res.status(201).json(newTask);
});

/**
 * ENDPOINT: PUT /api/tasks/:id (PROTEGIDO)
 * Actualiza el estado o información de una tarea existente
 */
app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, description, category, completed } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id && t.userId === req.user.id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarea no encontrada o no pertenece al usuario.' });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(category !== undefined && { category }),
    ...(completed !== undefined && { completed })
  };

  res.json(tasks[taskIndex]);
});

/**
 * ENDPOINT: DELETE /api/tasks/:id (PROTEGIDO)
 * Elimina una tarea perteneciente al usuario autenticado
 */
app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const initialLength = tasks.length;
  
  tasks = tasks.filter(t => !(t.id === id && t.userId === req.user.id));

  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Tarea no encontrada.' });
  }

  res.json({ message: 'Tarea eliminada exitosamente', id });
});

// Inicialización del servidor HTTP
app.listen(PORT, () => {
  console.log(`[BACKEND] Servidor ejecutándose en http://localhost:${PORT}`);
});
