const express = require('express');
const app = express();
const https = require('https');

var fs = require("fs");

var privateKey = fs.readFileSync( '/etc/letsencrypt/live/anchy.dev/privkey.pem' );
var certificate = fs.readFileSync( '/etc/letsencrypt/live/anchy.dev/fullchain.pem' );

const sslServer = https.createServer({
	key: privateKey,
	cert: certificate
}, app);

const { Server } = require("socket.io");
const io = new Server(sslServer);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('static'));

io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} connected`);
  });

  socket.on('chat message', (msg) => {
    let args = msg.lower().split(' ');
    switch(args[0])
    {
      case "echo":
        socket.emit('chat message', args.join(' '));
        break;
    }
    console.log(`User ${socket.id} executed command '${args[0]}'.`);
  });
});

sslServer.listen(443, () => {
  console.log('listening on *:443');
});