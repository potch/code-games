/* jshint esnext:true */
function Debounce(fn, ms) {
  this.timeout = null;
  this.fn = fn;
  this.ms = ms;
}
Debounce.prototype.start = function () {
  this.timeout = setTimeout(this.fn, this.ms);
};
Debounce.prototype.reset = function () {
  this.abort();
  this.start();
};
Debounce.prototype.abort = function () {
  clearTimeout(this.timeout);
};

var baseConfig = {
  mode: 'text/javascript',
  theme: "solarized",
  tabMode: "indent",
  lineWrapping: true,
  lineNumbers: true,
  matchBrackets: true
};

function Editor(config) {
  var editor = this;
  this.el = document.createElement('div');
  this.el.className = 'editor ' + (config.className || config.mode);
  this.config = Object.assign(baseConfig, config);
  this.cm = new CodeMirror(this.el, this.config);

  config.container.appendChild(this.el);

  this.cm.on('changes', function (...args) {
    if ('onchange' in editor && typeof editor.onchange == 'function') {
      editor.onchange(...args);
    }
  });
  this.widgets = [];
}
Editor.prototype.value = function () {
  return this.cm.getValue();
};

var editorPane = document.querySelector('.editors');

var restoreDoc = localStorage.getItem('current');

try {
  restoreDoc = JSON.parse(restoreDoc);
} catch (e) {
  console.log('bummer');
}

if (!restoreDoc) {
  restoreDoc = {};
}

var editors = {
  css: new Editor({
    mode: 'css',
    container: editorPane,
    value: restoreDoc.css || ''
  }),
  javascript: new Editor({
    mode: 'javascript',
    container: editorPane,
    value: restoreDoc.javascript || ''
  }),
  html: new Editor({
    className: 'html',
    mode: 'text/html',
    container: editorPane,
    value: restoreDoc.html || ''
  })
};

var widgets = [];

var changed = new Debounce(run, 500);
var saver = new Debounce(save, 1000);

function onChange() {
  changed.reset();
  saver.reset();
}

editors.javascript.onchange = onChange;
editors.css.onchange = onChange;
editors.html.onchange = onChange;

run();

function save() {
  var doc = {
    javascript: editors.javascript.value(),
    css: editors.css.value(),
    html: editors.html.value()
  };
  localStorage.setItem('current', JSON.stringify(doc));
}

function run() {
  var script = editors.javascript.value();
  var css = editors.css.value();
  var html = editors.html.value();
  while (widgets.length) {
    widgets.pop().clear();
  }
  var scriptURL = URL.createObjectURL(new Blob([script], { type: 'text/javascript' }));
  var cssURL = URL.createObjectURL(new Blob([css], { type: 'text/css' }));
  var doc = `
    <html>
      <head>
        <meta charset=utf8>
        <link rel="stylesheet" href="${cssURL}">
      </head>
      <body>
        ${html}
        <script>
          window.onerror = function (msg, file, line, col, error) {
            window.top.postMessage({
              type: 'error',
              msg: msg,
              line: line,
              col: col,
              stack: error.stack.split('\\n')
            }, '*');
          };
        </script>
        <script src="${scriptURL}"></script>
      </body>
    </html>
  `;
  var file = new Blob([doc], { type: 'text/html' });
  var htmlUrl = URL.createObjectURL(file);
  document.querySelector('.runner').src = htmlUrl;
}

window.addEventListener('message', function(e) {
  var data = e.data;
  if (data.type === 'error') {
    widgets.push(editors.javascript.cm.addLineWidget(data.line-1, errorWidget(data)));
  }
});

document.addEventListener('keydown', function (e) {
  if (e.metaKey) {
    if (e.key === '1') {
      showPane('javascript');
      e.preventDefault();
    }
    if (e.key === '2') {
      showPane('css');
      e.preventDefault();
    }
    if (e.key === '3') {
      showPane('html');
      e.preventDefault();
    }
  }
});

function showPane(name) {
  var panes = document.querySelectorAll('.editor');
  for (var i = 0; i < panes.length; i++) {
    if (panes[i].classList.contains(name)) {
      panes[i].style.display = 'block';
    } else {
      panes[i].style.display = 'none';
    }
  }
  editors[name].cm.refresh();
}

function errorWidget(err) {
  var widget = document.createElement('pre');
  widget.className = 'error widget';
  widget.innerHTML = err.msg;
  widget.innerHTML += '\n' + err.stack.join('\n');
  return widget;
}

showPane('javascript');
