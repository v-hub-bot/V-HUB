const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/3b15232b-c954-4517-aa4e-efcefce01b55/devtools/page/2F30F9B2E6ED4B9B9AE5A4397C1FFFDE?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const pending = {};

function send(expr, delay = 200) {
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
  // Click first button (burger)
  await send(`document.querySelectorAll('button')[0].click(); 'clicked burger'`, 200);
  await new Promise(r => setTimeout(r, 1000));
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
