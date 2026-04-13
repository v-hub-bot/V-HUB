const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const pending = {};

function send(expr, delay = 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      const mid = id++;
      ws.send(JSON.stringify({ id: mid, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
      pending[mid] = resolve;
    }, delay);
  });
}

ws.on('message', data => {
  const msg = JSON.parse(data);
  if (pending[msg.id]) {
    const val = msg.result?.result?.value;
    console.log(`[${msg.id}] ${String(val).substring(0,300)}`);
    pending[msg.id](val);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  // Get all the visible clickable items in the areas dropdown to find village names
  const items = await send(`(function(){
    const allClickable = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    // Get ALL of them so we can find real village names
    return JSON.stringify(allClickable.map((d,i) => ({i, text: d.textContent.trim().substring(0,40)})));
  })()`, 200);
  console.log('ALL CLICKABLE:', items);

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
