const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

ws.on('open', () => {
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { returnByValue: true, expression: `
    (function(){
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => b.textContent.includes('Submit') || b.textContent.includes('SUBMIT'));
      if (!submitBtn) return 'SUBMIT BTN NOT FOUND — btns: ' + btns.map(b=>b.textContent.trim().substring(0,20)).join(', ');
      submitBtn.click();
      return 'clicked: ' + submitBtn.textContent.trim().substring(0,30);
    })()
  ` } }));
});

ws.on('message', data => {
  const msg = JSON.parse(data);
  if (msg.result) {
    console.log(msg.result?.result?.value);
    setTimeout(() => ws.close(), 3000);
  }
});
ws.on('close', () => console.log('Done'));
