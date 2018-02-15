const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const game = require('./game');

const app = express();

app.use(express.static('static'));

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let socketId = 0;

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);

  let id = ++socketId;

  game.addSocket(id, ws);

  ws.on('message', function incoming(message) {
    try {
      let msg = JSON.parse(message);
      game.dispatch(msg, id);
    } catch (e) {
      console.error(e);
      console.warn('invalid message: ', message);
    }
  });

  ws.on('close', function () {
    game.removeSocket(id);
  });

  ws.send(JSON.stringify({ type: 'hello' }));
});

server.listen(process.env.PORT || 8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
