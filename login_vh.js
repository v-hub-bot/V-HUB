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

function setInput(sel, val) {
  return `(function(){
    const el = document.querySelector('${sel}');
    if(!el) return 'NOT FOUND';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(el, ${JSON.stringify(val)});
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'set: ' + el.value;
  })()`;
}

ws.on('open', async () => {
  // Login with VH number instead of email
  await send(setInput('input[placeholder="your@email.com or VH-1234"]', 'VH-6048'), 200);
  await send(setInput('input[placeholder="Your V-Hub password"]', 'CleanTest99'), 200);
  
  const r = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Sign In') || b.textContent.includes('SIGN IN'));
    if(btn){ btn.click(); return 'clicked: ' + btn.textContent.trim(); }
    return 'btn not found';
  })()`, 300);

  await new Promise(r => setTimeout(r, 3000));
  const url = await send(`window.location.href`, 100);
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
