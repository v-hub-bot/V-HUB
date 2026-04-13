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
    console.log(`[${msg.id}] ${String(val).substring(0,200)}`);
    pending[msg.id](val);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  // Click "Provider Hub" link in the open burger menu
  await send(`(function(){
    const links = Array.from(document.querySelectorAll('a'));
    const hub = links.find(a => a.textContent.trim() === 'Provider Hub');
    if(hub){ hub.click(); return 'clicked Provider Hub link: ' + hub.href; }
    return 'NOT FOUND — links: ' + links.map(a => a.textContent.trim().substring(0,20)).join(', ');
  })()`, 200);

  await new Promise(r => setTimeout(r, 2000));
  const url = await send(`window.location.href`, 100);
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
