
let server = new Socket({
  onMessage: dispatch
});

let state = 'idle';

function dispatch(msg) {
  switch (msg.type) {
    case 'hello':
      break;
    case 'set':
      state = 'set';
      $('.ready').textContent = 'Set...';
      editor.value = msg.prompt;
      server.send({ type: 'ready' });
      break;
    case 'go':
      state = 'live';
      hideScreen('.ready');
      break;
    case 'correct':
      $('.correct').classList.remove('waited');
      showScreen('.correct');
      break;
    case 'prompt':
      editor.value = msg.prompt;
      $('.correct').classList.add('waited');
      $('.continue').focus();
      break;
    case 'final':
      $('.correct').classList.add('final');
      $('.done').focus();
      break;
    case 'reset':
      window.location.reload();
      break;
  }
}

$('.lobby').addEventListener('submit', function (e) {
  e.preventDefault();
  if (state === 'idle') {
    state = 'ready';
    server.send({
      type: 'registerPlayer',
      name: $('#playername').value
    });
    hideScreen('.lobby');
  }
});

$('.continue').addEventListener('click', function (e) {
  hideScreen('.correct');
  $('.correct').classList.remove('waited');
  server.send({
    type: 'advance'
  });
  editor.focus();
});

$('.done').addEventListener('click', function (e) {
  showScreen('.finished');
  hideScreen('.correct');
  $('.correct').classList.remove('final');
  server.send({
    type: 'finish'
  });
});

function showScreen(c) {
  $(c).classList.remove('hideme');
}

function hideScreen(c) {
  $(c).classList.add('hideme');
}

class Editor {
  constructor(container) {
    this.el = document.createElement('div');
    this.cm = new CodeMirror(container, {
      mode: 'javascript',
      theme: "solarized",
      tabMode: "indent",
      lineWrapping: true,
      lineNumbers: true
    });

    let editor = this;
    this.cm.on('changes', function (...args) {
      if ('onchange' in editor && typeof editor.onchange == 'function') {
        editor.onchange(...args);
      }
    });
  }

  focus () {
    this.cm.focus();
  }

  get value() {
    return this.cm.getValue();
  }

  set value(v) {
    this.cm.setValue(v);
  }
}

let editor = new Editor($('.editor'));

editor.onchange = function () {
  if (state === 'live') {
    server.send({
      type: 'try',
      content: editor.value
    });
  }
}

window.addEventListener('load', e => server.init());
