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
  // Click the Provider Hub Sign In button
  const r = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button, a, div[style*="cursor"]'));
    const hub = btns.find(b => b.textContent.includes('PROVIDER') && b.textContent.includes('HUB') && (b.textContent.includes('SIGN') || b.textContent.includes('Sign')));
    if (!hub) {
      // Try finding by text content
      const all = Array.from(document.querySelectorAll('*')).find(e => e.textContent.trim().includes('PROVIDER HUB SIGN IN') && e.children.length < 3);
      if (all) { all.click(); return 'clicked: ' + all.tagName + ' ' + all.textContent.trim().substring(0,40); }
      return 'NOT FOUND — btns: ' + btns.slice(0,10).map(b=>b.textContent.trim().substring(0,20)).join(', ');
    }
    hub.click();
    return 'clicked: ' + hub.textContent.trim().substring(0,40);
  })()`, 200);

  // Wait for navigation
  await new Promise(r => setTimeout(r, 2000));
  
  const url = await send(`window.location.href`, 100);
  console.log('URL after click:', url);
  
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
