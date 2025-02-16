import Koa from 'koa';
import http from 'http';
import { Server } from 'socket.io';
import cors from '@koa/cors';

const app = new Koa();
app.use(cors());

const server = http.createServer(app.callback());
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

interface User {
  socketId: string;
  name: string;
}

const users: User[] = [];

io.on('connection', (socket) => {
  console.log(`Nuevo usuario conectado: ${socket.id}`);

  // Manejar cuando un usuario se une al chat
  socket.on('join', (name: string) => {
    users.push({ socketId: socket.id, name });
  
    console.log('Usuarios en línea:', users); // Debug
    io.emit('users', users); // Enviar lista actualizada de usuarios a todos
  });

  // Manejar mensajes privados
  socket.on('privateMessage', ({ recipientId, message }) => {
    console.log(`Mensaje privado de ${socket.id} a ${recipientId}: ${message}`);
    io.to(recipientId).emit('privateMessage', {
      senderId: socket.id,
      message,
    });
  });

  // Cuando un usuario se desconecta
  socket.on('disconnect', () => {
    const index = users.findIndex((user) => user.socketId === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
      io.emit('users', users); // Enviar lista actualizada de usuarios
    }
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});