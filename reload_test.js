const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/4ee05d9e-3396-4c8e-a4aa-156831c37d1a/devtools/page/3DC106FB47C44FFBE3A3CECA9562CE47?debug=true';
const ws = new WebSocket(wsUrl);
ws.on('open', () => {
  // Hard reload
  ws.send(JSON.stringify({ id: 1, method: 'Page.reload', params: { ignoreCache: true } }));
  setTimeout(() => ws.close(), 2000);
});
ws.on('close', () => console.log('reloaded'));
