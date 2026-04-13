const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/4ee05d9e-3396-4c8e-a4aa-156831c37d1a/devtools/page/3DC106FB47C44FFBE3A3CECA9562CE47?debug=true';
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
  // scroll down first
  await send(`window.scrollTo(0, 800); 'scrolled'`, 200);
  await new Promise(r => setTimeout(r, 500));
  
  const result = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /edit.*profile/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked: ' + btn.textContent.trim(); }
    return 'not found — buttons: ' + btns.map(b=>b.textContent.trim().substring(0,30)).join(' | ');
  })()`, 300);
  
  await new Promise(r => setTimeout(r, 2000));
  const url = await send(`window.location.href`, 100);
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
