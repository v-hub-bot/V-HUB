const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
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
  const r = await send(`(function(){
    // Find by partial text match
    const all = Array.from(document.querySelectorAll('button, a'));
    const hub = all.find(e => e.textContent.includes('Provider') && e.textContent.includes('Hub'));
    if (hub) { hub.click(); return 'clicked button: ' + hub.textContent.trim().substring(0,50); }
    
    // Fallback: find any element with "provider" and "hub" 
    const allEls = Array.from(document.querySelectorAll('*'));
    const found = allEls.find(e => e.children.length < 4 && e.textContent.toLowerCase().includes('provider hub sign'));
    if (found) { found.click(); return 'clicked element: ' + found.tagName + ' ' + found.textContent.trim().substring(0,40); }
    return 'not found';
  })()`, 200);

  await new Promise(r => setTimeout(r, 2000));
  const url = await send(`window.location.href`, 100);
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
