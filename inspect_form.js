const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

ws.on('open', () => {
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { returnByValue: true, expression: `
    (function(){
      const btns = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().substring(0,40));
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,div[style*="font-weight"]')).slice(0,15).map(e => e.textContent.trim().substring(0,50));
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({type: i.type, placeholder: i.placeholder, value: i.value.substring(0,20)}));
      return JSON.stringify({btns, headings, inputCount: inputs.length, inputs: inputs.slice(0,20)});
    })()
  ` } }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.result) {
    console.log(msg.result?.result?.value);
    ws.close();
  }
});
ws.on('close', () => console.log('Done'));
