const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/3b15232b-c954-4517-aa4e-efcefce01b55/devtools/page/2F30F9B2E6ED4B9B9AE5A4397C1FFFDE?debug=true';
const ws = new WebSocket(wsUrl);
ws.on('open', () => {
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: `window.scrollTo(0, 800); 'ok'`, returnByValue: true } }));
});
ws.on('message', data => { const m = JSON.parse(data); if(m.id===1) setTimeout(()=>ws.close(),800); });
ws.on('close', () => console.log('done'));
