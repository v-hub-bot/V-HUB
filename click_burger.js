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
  // Click the burger button (first button, empty text)
  await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    btns[0].click();
    return 'clicked burger';
  })()`, 200);
  
  await new Promise(r => setTimeout(r, 800));
  
  // See what menu items appeared
  const menuItems = await send(`(function(){
    const all = Array.from(document.querySelectorAll('nav a, nav button, [role="menu"] a, [role="menu"] button, aside a, aside button'));
    if(all.length) return JSON.stringify(all.map(e => e.textContent.trim().substring(0,40)));
    // fallback: look for any newly visible links/buttons
    const links = Array.from(document.querySelectorAll('a')).filter(a => a.offsetParent !== null);
    return 'links: ' + JSON.stringify(links.map(a => ({text: a.textContent.trim().substring(0,30), href: a.href?.substring(0,50)})));
  })()`, 300);
  console.log('MENU:', menuItems);

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
