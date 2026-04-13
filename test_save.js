const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/4ee05d9e-3396-4c8e-a4aa-156831c37d1a/devtools/page/3DC106FB47C44FFBE3A3CECA9562CE47?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const pending = {};

function send(expr, delay = 100) {
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

function setInput(labelText, val) {
  return `(function(){
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    const el = inputs.find(i => i.value && i.value.includes(${JSON.stringify(labelText)})) 
             || inputs.find(i => i.placeholder && i.placeholder.toLowerCase().includes(${JSON.stringify(labelText.toLowerCase().substring(0,8))}));
    if(!el) return 'NOT FOUND: ' + ${JSON.stringify(labelText)};
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set 
                || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
    setter.call(el, ${JSON.stringify(val)});
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'set: ' + el.value.substring(0,60);
  })()`;
}

ws.on('open', async () => {
  // Change years in business from 8 to 12
  await send(`(function(){
    const inputs = Array.from(document.querySelectorAll('input'));
    const el = inputs.find(i => i.value === '8');
    if(!el) return 'not found value=8';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(el, '12');
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'years changed to: ' + el.value;
  })()`, 200);

  // Change phone number
  await send(`(function(){
    const inputs = Array.from(document.querySelectorAll('input'));
    const el = inputs.find(i => i.value === '352-555-0199');
    if(!el) return 'phone not found';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(el, '352-555-9999');
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'phone changed to: ' + el.value;
  })()`, 200);

  // Click Save button
  await send(`(function(){
    const btn = Array.from(document.querySelectorAll('button')).find(b => /save/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked save: ' + btn.textContent.trim(); }
    return 'save btn not found';
  })()`, 400);

  await new Promise(r => setTimeout(r, 3000));

  // Check for success message or error
  const body = await send(`document.body.innerText.substring(0, 500)`, 200);

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
