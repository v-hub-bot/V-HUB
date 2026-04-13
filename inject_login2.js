const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/9ceb8dde-e2ba-4295-a2d2-780e482af5ac/devtools/page/858353BB53FBB0E9F0BF75AD4B05E99C?debug=true';
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
      setReactValue(emailInput, 'tony@sunrisepools.com');
      setReactValue(passInput, 'TestPass123');
      return 'email=' + emailInput.value + ' pass_len=' + passInput.value.length;
    })()
  `;
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    console.log('Set result:', JSON.stringify(msg.result));
    // Click the submit button
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: `document.querySelector('button[type="submit"]').click(); 'clicked'`, returnByValue: true } }));
  } else if (msg.id === 2) {
    console.log('Click result:', JSON.stringify(msg.result));
    setTimeout(() => ws.close(), 2000);
  }
});

ws.on('error', (e) => console.error('WS Error:', e.message));
ws.on('close', () => console.log('Done'));
