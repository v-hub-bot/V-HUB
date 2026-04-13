const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/4ee05d9e-3396-4c8e-a4aa-156831c37d1a/devtools/page/3DC106FB47C44FFBE3A3CECA9562CE47?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const pending = {};

function send(method, params, delay = 100) {
  return new Promise(resolve => {
    setTimeout(() => {
      const mid = id++;
      ws.send(JSON.stringify({ id: mid, method, params }));
      pending[mid] = resolve;
    }, delay);
  });
}
function eval_(expr, delay=100) {
  return send('Runtime.evaluate', { expression: expr, returnByValue: true }, delay)
    .then(r => r?.result?.value ?? r?.result?.description);
}

ws.on('message', data => {
  const msg = JSON.parse(data);
  if (pending[msg.id]) { pending[msg.id](msg.result); delete pending[msg.id]; }
  if (msg.method === 'Network.requestWillBeSent') {
    const url = msg.params?.request?.url || '';
    if (url.includes('functions/')) {
      console.log('REQ:', msg.params?.request?.method, url.substring(url.lastIndexOf('/')+1));
    }
  }
  if (msg.method === 'Network.responseReceived') {
    const url = msg.params?.response?.url || '';
    if (url.includes('functions/') || url.includes('entities/')) {
      console.log('RES:', msg.params?.response?.status, url.substring(url.lastIndexOf('/')+1));
    }
  }
});

ws.on('open', async () => {
  await send('Network.enable', {}, 100);
  
  // Hard reload
  await send('Page.reload', { ignoreCache: true }, 200);
  await new Promise(r => setTimeout(r, 3000));

  // Login
  await eval_(`(function(){
    const inputs = Array.from(document.querySelectorAll('input'));
    const email = inputs.find(i => i.type === 'email' || i.placeholder?.includes('email') || i.placeholder?.includes('VH'));
    const pass = inputs.find(i => i.type === 'password');
    if(!email || !pass) return 'inputs not found';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(email, 'tom@blueheronfl.com'); email.dispatchEvent(new Event('input',{bubbles:true}));
    setter.call(pass, 'TestEdit99'); pass.dispatchEvent(new Event('input',{bubbles:true}));
    return 'filled';
  })()`, 300);

  await eval_(`(function(){
    const btn = Array.from(document.querySelectorAll('button')).find(b => /sign in/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked sign in'; }
    return 'no sign in btn';
  })()`, 300);

  await new Promise(r => setTimeout(r, 3000));

  // Click Edit My Profile
  const editResult = await eval_(`(function(){
    const btn = Array.from(document.querySelectorAll('button')).find(b => /edit.*profile/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked edit'; }
    return 'no edit btn. btns: ' + Array.from(document.querySelectorAll('button')).map(b=>b.textContent.trim().substring(0,20)).join(' | ');
  })()`, 500);
  console.log('Edit:', editResult);

  await new Promise(r => setTimeout(r, 2000));

  // Click Save (no changes needed — just test the flow)
  const saveResult = await eval_(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /^save/i.test(b.textContent.trim()));
    if(btn){ btn.click(); return 'clicked save: ' + btn.textContent.trim(); }
    return 'no save. btns: ' + btns.map(b=>b.textContent.trim().substring(0,20)).join(' | ');
  })()`, 400);
  console.log('Save:', saveResult);

  await new Promise(r => setTimeout(r, 5000));

  const finalBody = await eval_(`document.body.innerText.substring(0, 400)`, 100);
  console.log('Final body:', finalBody);

  ws.close();
});
ws.on('error', e => console.error('WS error:', e.message));
ws.on('close', () => console.log('Done'));
