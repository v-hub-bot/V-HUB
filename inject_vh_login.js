const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/f45f12a3-b915-49ee-9120-2c9421d37273/devtools/page/F6D93F1298C5A64C7759DD1B64EFFC21?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

ws.on('open', () => {
  const script = `
    (function() {
      const emailInput = document.querySelector('input[placeholder="your@email.com or VH-1234"]');
      const passInput = document.querySelector('input[placeholder="Your V-Hub password"]');
      if (!emailInput || !passInput) return 'INPUTS NOT FOUND';
      function setReactValue(el, value) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setReactValue(emailInput, 'VH-9032');
      setReactValue(passInput, 'TestPass123');
      return 'identifier=' + emailInput.value + ' pass_len=' + passInput.value.length;
    })()
  `;
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    console.log('Set result:', JSON.stringify(msg.result));
    setTimeout(() => {
      ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: `document.querySelector('button[type="submit"]').click(); 'clicked'`, returnByValue: true } }));
    }, 400);
  } else if (msg.id === 2) {
    console.log('Click result:', JSON.stringify(msg.result));
    setTimeout(() => ws.close(), 3000);
  }
});

ws.on('error', (e) => console.error('WS Error:', e.message));
ws.on('close', () => console.log('Done'));
