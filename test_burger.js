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
  // 1. Sign out
  await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const so = btns.find(b => b.textContent.trim() === 'Sign Out');
    if(so){so.click(); return 'signed out';} return 'no sign out btn';
  })()`, 200);
  
  // 2. Navigate to home
  await send(`window.location.href = '/Home'; 'navigating'`, 800);
  
  // Wait for home to load
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Click the burger menu (≡ button)
  const r3 = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const burger = btns.find(b => b.textContent.includes('≡') || b.innerHTML.includes('menu') || b.getAttribute('aria-label')?.toLowerCase().includes('menu'));
    if(!burger) {
      // Try by position — burger is usually top right
      const allBtns = Array.from(document.querySelectorAll('button'));
      return 'btns: ' + allBtns.map(b => b.textContent.trim().substring(0,15) + '|' + b.className.substring(0,20)).join(', ');
    }
    burger.click();
    return 'clicked burger: ' + burger.textContent.trim().substring(0,20);
  })()`, 500);

  await new Promise(r => setTimeout(r, 1000));
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
