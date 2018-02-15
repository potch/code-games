const { prompts, solutions, compare } = require('./prompts');

let players = [];

let sockets = {};

let status = null;
let control = null;

function addSocket(id, socket) {
  sockets[id] = socket;
  console.log('hello', id);
}

function removeSocket(id) {
  sockets[id] = null;
  console.log('lost', id);
}

let state = 'idle';
let finish = 0;

function dispatch(msg, id) {
  console.log(msg.type + ' from ' + id);
  switch (msg.type) {
    case 'reset':
      state = 'idle';
      players = [];
      try {
        Object.values(sockets).forEach(
          s => s.send(JSON.stringify({ type: 'reset' }))
        );
      } catch (e) {
        console.warn('socket is gone');
      }
      control = null;
      finish = 0;
      status = null;
      sockets = {};
      break;
    case 'registerStatus':
      status = id;
      break;
    case 'registerPlayer':
      players.push({
        name: msg.name,
        stage: 0,
        status: false,
        id: id,
        finish: null
      });
      break;
    case 'registerControl':
      control = id;
      break;
    case 'set':
      if (state === 'idle') {
        state = 'set';
        console.log(prompts[0]);
        broadcast({
          type: 'set',
          prompt: prompts[0]
        });
      }
      break;
    case 'go':
      if (state === 'set') {
        state = 'live';
        players.forEach(p => {
          p.status = false,
          p.stage = 1
        });
        send(status, { type: 'go' });
        broadcast({ type: 'go' });
      }
      break;
    case 'ready':
      if (state === 'set') {
        let player = playerById(id);
        player.status = true;
      }
      break;
    case 'advance':
      if (state === 'live') {
        let player = playerById(id);
        console.log(id, ' advanced to ' + player.stage);
        player.stage++;
        player.status = false;
      }
      break;
    case 'finish':
      if (state === 'live') {
        let player = playerById(id);
        player.finish = ++finish;
        console.log(id, ' finish ' + finish);
        let done = players.reduce((done, p) => !!p.finish && done, true);
        if (done) {
          send(status, { type: 'done' });
        }
      }
      break;
    case 'try':
      if (state === 'live') {
        let player = playerById(id);
        if (compare(msg.content, solutions[player.stage - 1])) {
          send(id, { type: 'correct' });
          player.status = true;
          if (player.stage < prompts.length) {
            setTimeout(function () {
              send(id, {
                type: 'prompt',
                prompt: prompts[player.stage]
              });
            }, 1000);
          } else {
            setTimeout(function () {
              send(id, {
                type: 'final'
              });
            }, 1000);
          }
        }
      }
      break;
  }
  if (status) {
    send(status, {
      type: 'update',
      players: Object.values(players)
    });
  }
}


function playerById(id) {
  return players.filter(p => p.id === id)[0];
}

function broadcast(msg) {
  players.forEach(p => send(p.id, msg));
}

function send(id, msg) {
  sockets[id].send(JSON.stringify(msg));
}

module.exports = { dispatch, addSocket, removeSocket };
