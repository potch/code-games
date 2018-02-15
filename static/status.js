
let status = new Socket({
  onMessage: dispatch
});

let playerTemplate = $('#template-player');
let playersEl = $('.players');

function dispatch(msg) {
  switch (msg.type) {
    case 'hello':
      status.send({
        type: 'registerStatus'
      });
      break;
    case 'update':
      console.log(msg);
      update(msg.players);
      break;
    case 'go':
      startTimer();
      break;
    case 'done':
      stopTimer();
      break;
    case 'reset':
      window.location.reload();
      break;
  }
}

function update(players) {
  Array.from(playersEl.children).forEach(el => el.remove());
  players.forEach(p => playersEl.appendChild(renderPlayer(p)));
}

function renderPlayer(player) {
  return stamp(playerTemplate, (el, $) => {
    if (player.finish) {
      if (player.finish === 1) {
        $('.name').textContent = '① ' + player.name;
        $('.status').style.background = '#fc0';
      }
      if (player.finish === 2) {
        $('.name').textContent = '② ' + player.name;
        $('.status').style.background = '#ccd';
      }
      if (player.finish === 3) {
        $('.name').textContent = '③ ' + player.name;
        $('.status').style.background = '#850';
      }
      el.classList.add('finish');
    } else {
      $('.name').textContent = player.name;
    }
    $('.stage').textContent = player.stage + '/5';
    if (player.status) {
      $('.status').classList.add('good');
    } else {
      $('.status').classList.add('bad');
    }
  });
}

let startTime;
let timerEl = $('.timer');
let running = false;
function startTimer() {
  startTime = Date.now();
  running = true;
  timerFrame();
}

function stopTimer() {
  running = false;
}

function timerFrame() {
  let elapsed = Date.now() - startTime;
  let millis = (elapsed % 1000).toString().padStart(3, '0');
  let seconds = ((elapsed / 1000 | 0) % 60).toString().padStart(2, '0');
  let minutes = (elapsed / (1000 * 60) | 0).toString().padStart(2, '0');
  timerEl.textContent = `${minutes}:${seconds}.${millis}`;
  if (running) {
    requestAnimationFrame(timerFrame);
  }
}

window.addEventListener('load', e => status.init());
