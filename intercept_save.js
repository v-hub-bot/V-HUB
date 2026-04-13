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
  if (pending[msg.id]) {
    pending[msg.id](msg.result);
    delete pending[msg.id];
  }
  // Log network requests
  if (msg.method === 'Network.requestWillBeSent') {
    const url = msg.params?.request?.url || '';
    if (url.includes('base44') || url.includes('Provider')) {
      console.log('REQUEST:', msg.params?.request?.method, url.substring(0, 120));
      const body = msg.params?.request?.postData;
      if (body) console.log('  BODY:', body.substring(0, 200));
    }
  }
  if (msg.method === 'Network.responseReceived') {
    const url = msg.params?.response?.url || '';
    if (url.includes('base44') || url.includes('Provider')) {
      console.log('RESPONSE:', msg.params?.response?.status, url.substring(0, 120));
    }
  }
});

ws.on('open', async () => {
  // Enable network tracking
  await send('Network.enable', {}, 100);
  await new Promise(r => setTimeout(r, 500));

  // Click edit
  await eval_(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /edit.*profile/i.test(b.textContent));
    if(btn){ btn.click(); return 'clicked'; }
    return 'not found';
  })()`, 300);

  await new Promise(r => setTimeout(r, 1500));

  // Click Save
  const saveResult = await eval_(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => /^save/i.test(b.textContent.trim()));
    if(btn){ btn.click(); return 'clicked save: ' + btn.textContent.trim(); }
    return 'no save btn. All: ' + btns.map(b=>b.textContent.trim().substring(0,20)).join(' | ');
  })()`, 300);
  console.log('Save click result:', saveResult);

  await new Promise(r => setTimeout(r, 5000));

  // Check for error message
  const msg2 = await eval_(`document.body.innerText.substring(0, 300)`, 100);
  console.log('Body:', msg2);

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
