import Koa from 'koa';
import Router from 'koa-router';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = new Koa();
const router = new Router();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Lista de usuarios conectados
const users: { id: string; name: string }[] = [];

// Rutas básicas para KOA
router.get('/', (ctx) => {
  ctx.body = 'WebSocket and KOA server running!';
});

app.use(router.routes());
app.use(router.allowedMethods());

// WebSocket: Manejo de conexión y desconexión
io.on('connection', (socket) => {
  console.log(`Nuevo usuario conectado: ${socket.id}`);

  // Escuchar cuando un usuario ingrese su nombre
  socket.on('register', (name: string) => {
    // Agregar usuario a la lista
    users.push({ id: socket.id, name });

    // Actualizar lista para todos los clientes
    io.emit('updateUsers', users);

    console.log(`${{name}} se ha unido al chat.`);
  });

  // Manejar desconexiones
  socket.on('disconnect', () => {
    const userIndex = users.findIndex((user) => user.id === socket.id);

    if (userIndex !== -1) {
      const username = users[userIndex].name;
      users.splice(userIndex, 1); // Remover usuario

      // Actualizar lista para todos los clientes
      io.emit('updateUsers', users);

      console.log(`${{username}} se ha desconectado.`);
    }
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});