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
  function setVal(sel, val) {
    return `(function(){
      const el = document.querySelector('${sel}');
      if(!el) return 'NOT FOUND: ${sel}';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(el, ${JSON.stringify(val)});
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
      return 'set: '+el.value;
    })()`;
  }

  await send(setVal('input[placeholder="your@email.com or VH-1234"]', 'sandra@mapleleafclean.com'));
  await send(setVal('input[placeholder="Your V-Hub password"]', 'CleanTest99'));
  const r = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('SIGN IN') || b.textContent.includes('Sign In'));
    if(btn){btn.click(); return 'clicked: '+btn.textContent.trim();}
    return 'not found';
  })()`, 300);
  
  await new Promise(r => setTimeout(r, 2500));
  const url = await send(`window.location.href`);
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
