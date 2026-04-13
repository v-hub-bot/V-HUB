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
    console.log(`[${msg.id}] ${String(val).substring(0,400)}`);
    pending[msg.id](val);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  await new Promise(r => setTimeout(r, 1000));

  // Check current URL / view
  const url = await send(`window.location.href`, 100);
  
  // Find and click Edit My Profile button
  const btnResult = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /edit.*profile/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked edit'; }
    return 'not found. Buttons: ' + btns.map(b=>b.textContent.trim().substring(0,25)).join(' | ');
  })()`, 300);

  await new Promise(r => setTimeout(r, 2000));

  // Change years in business
  await send(`(function(){
    const inputs = Array.from(document.querySelectorAll('input'));
    const el = inputs.find(i => i.value === '8');
    if(!el) return 'years field not found';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(el, '15');
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'years changed to: ' + el.value;
  })()`, 200);

  // Scroll down to Save button and click it
  await send(`window.scrollTo(0,800); 'scrolled'`, 200);

  await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /save/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked Save: ' + btn.textContent.trim(); }
    return 'save btn not found. Buttons: ' + btns.map(b=>b.textContent.trim().substring(0,25)).join(' | ');
  })()`, 400);

  // Wait for save to complete
  await new Promise(r => setTimeout(r, 4000));

  // Check result
  const body = await send(`document.body.innerText.substring(0, 600)`, 100);

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
