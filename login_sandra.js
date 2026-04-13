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
    console.log(`[${msg.id}] ${String(val).substring(0,200)}`);
    pending[msg.id](val);
    delete pending[msg.id];
  }
});

function setInput(placeholder, val) {
  return `(function(){
    const el = Array.from(document.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.includes(${JSON.stringify(placeholder.split(' ')[0])}));
    if(!el) return 'NOT FOUND placeholder containing: ${placeholder.split(' ')[0]}';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(el, ${JSON.stringify(val)});
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'set ok: ' + el.value;
  })()`;
}

ws.on('open', async () => {
  await new Promise(r => setTimeout(r, 1500));
  await send(setInput('your@email', 'tom@blueheronfl.com'), 100);
  await send(setInput('V-Hub password', 'TestEdit99'), 100);
  await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /sign in/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked sign in'; }
    return 'btn not found — ' + btns.map(b=>b.textContent.trim().substring(0,20)).join(', ');
  })()`, 300);
  await new Promise(r => setTimeout(r, 3000));
  const url = await send(`window.location.href`, 100);
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
