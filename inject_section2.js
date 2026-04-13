const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

function send(expr, awaitPromise = false) {
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise } }));
}

ws.on('open', () => {
  // Scroll down to reveal Section 2
  send(`window.scrollTo(0, 800); 'scrolled'`);
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (!msg.result) return;
  const val = msg.result?.result?.value;
  console.log(`id=${msg.id}: ${JSON.stringify(val)}`);

  if (msg.id === 1) {
    // Dump the HTML of Section 2 area to see what selectors exist
    setTimeout(() => send(`
      (function(){
        const s2 = document.querySelector('h3') || document.querySelector('[class*="section"]');
        const selects = Array.from(document.querySelectorAll('select')).map(s => ({ id: s.id, name: s.name, opts: Array.from(s.options).slice(0,5).map(o => o.text) }));
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).slice(0,10).map(c => ({ id: c.id, val: c.value, label: c.nextSibling?.textContent || c.parentElement?.textContent?.trim()?.substring(0,30) }));
        return JSON.stringify({ selects, checkboxCount: document.querySelectorAll('input[type="checkbox"]').length, checkboxSample: checkboxes });
      })()`), 600);
  } else {
    ws.close();
  }
});

ws.on('error', e => console.error('WS Error:', e.message));
ws.on('close', () => console.log('Done'));
