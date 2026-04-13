const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

ws.on('open', () => {
  // Get outerHTML of the first accordion section that has expanded
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { returnByValue: true, expression: `
    (function(){
      // Find the Home Services section by heading text
      const allDivs = Array.from(document.querySelectorAll('div'));
      const homeSection = allDivs.find(d => d.textContent.trim().startsWith('🏠') && d.children.length > 1);
      if (!homeSection) return 'HOME SECTION NOT FOUND';
      return homeSection.outerHTML.substring(0, 3000);
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
