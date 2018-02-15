
function stamp(template, cb) {
  let frag = document.importNode(template.content, true);
  let el = frag.firstElementChild;
  cb(el, sel => el.querySelector(sel));
  return frag;
}

function $(selector, parent=document) {
  return parent.querySelector(selector);
}

function $$(selector, parent=document) {
  return Array.from(parent.querySelectorAll(selector));
}

class Socket {
  constructor ({ onMessage }) {
    this.ready = false;
    this.onMessage = onMessage;
  }

  init() {
    this.socket = new WebSocket('ws://' + location.host);

    // Connection opened
    this.socket.addEventListener('open', event => {
      console.log('connected!');
      this.ready = true;
    });

    // Listen for messages
    this.socket.addEventListener('message', event => {
      try {
        let msg = JSON.parse(event.data);
        this.onMessage.call(null, msg);
      } catch (e) {
        console.error(e);
        console.warn('bad message recieved:' + event.data);
      }
    });
  }

  send(msg) {
    if (this.ready) {
      this.socket.send(JSON.stringify(msg));
    }
  }
}
