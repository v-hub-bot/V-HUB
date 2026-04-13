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
  // Click indices 29, 30, 31 (Chitty Chatty, Citrus Grove, Dabney)
  const r = await send(`(function(){
    const allClickable = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    const targets = [29, 30, 31];
    const clicked = [];
    targets.forEach(i => {
      if (allClickable[i]) {
        allClickable[i].click();
        clicked.push(allClickable[i].textContent.trim().substring(0,30));
      }
    });
    return 'clicked: ' + clicked.join(', ');
  })()`, 200);

  // Verify selections
  await send(`(function(){
    const allClickable = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    const selected = allClickable.filter(d => d.textContent.includes('✓')).map(d => d.textContent.trim().substring(0,40));
    return 'selected: ' + selected.join(' | ');
  })()`, 400);

  // Now scroll to bottom and submit
  await send(`window.scrollTo(0, 9999); 'scrolled'`, 300);
  
  // Click submit
  const submitResult = await send(`(function(){
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Submit') || b.textContent.includes('SUBMIT'));
    if (!btn) return 'NOT FOUND';
    btn.click();
    return 'SUBMITTED: ' + btn.textContent.trim().substring(0,30);
  })()`, 500);

  console.log('SUBMIT:', submitResult);
  // Wait for response
  await new Promise(r => setTimeout(r, 3000));
  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
