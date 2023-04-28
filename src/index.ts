import express from 'express';
import https from 'https';
import fs from 'fs';
import { Server } from 'socket.io';

let testClass = new TestClass();
testClass.message = "Test";
console.log(testClass.message);

const app = express();
let privateKey = fs.readFileSync( '/etc/letsencrypt/live/anchy.dev/privkey.pem' );
let certificate = fs.readFileSync( '/etc/letsencrypt/live/anchy.dev/fullchain.pem' );

const sslServer = https.createServer({
	key: privateKey,
	cert: certificate
}, app);

const io = new Server(sslServer);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/views/index.html');
});

app.use(express.static(__dirname + '/static'));


io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} connected`);
  });

  socket.on('cmsg', (msg:string) => {
    let args = msg.toLowerCase().split(' ');
    switch(args[0])
    {
      case "echo":
        socket.emit('cmsg', args.slice(1).join(' '));
        break;
    }
    console.log(`User ${socket.id} executed command '${args[0]}'.`);
  });
});

sslServer.listen(443, () => {
  console.log('listening on *:443');
});