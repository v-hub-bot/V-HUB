const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/4ee05d9e-3396-4c8e-a4aa-156831c37d1a/devtools/page/3DC106FB47C44FFBE3A3CECA9562CE47?debug=true';
const ws = new WebSocket(wsUrl);
ws.on('open', () => {
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: `window.scrollTo(0,0); 'ok'`, returnByValue: true } }));
});
ws.on('message', data => { const m = JSON.parse(data); if(m.id===1) setTimeout(()=>ws.close(),800); });
ws.on('close', () => console.log('done'));
