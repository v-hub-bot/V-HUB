const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

ws.on('open', () => {
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { returnByValue: true, expression: `
    (function(){
      // Find highlighted/error fields
      const errorDivs = Array.from(document.querySelectorAll('div[style*="border"]')).filter(d => {
        const style = d.getAttribute('style') || '';
        return style.includes('red') || style.includes('#8B1A1A') || style.includes('#c0392b') || style.includes('rgb(139') || style.includes('2px solid');
      });
      // Also check for any red text error messages
      const redText = Array.from(document.querySelectorAll('div,span,p')).filter(e => {
        const s = e.getAttribute('style') || '';
        return (s.includes('color: red') || s.includes('color: rgb(139') || s.includes('#8B1A1A')) && e.textContent.trim().length > 2;
      }).map(e => e.textContent.trim().substring(0, 80));

      // Check what the current state of key fields/selections are
      const servicesSelected = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'))
        .filter(d => d.textContent.includes('✓'))
        .map(d => d.textContent.trim().substring(0,40));
      
      const areaCheckmarks = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).length;
      
      return JSON.stringify({ redText, servicesSelected, areaCheckmarks, errorDivCount: errorDivs.length });
    })()
  ` } }));
});

ws.on('message', data => {
  const msg = JSON.parse(data);
  if (msg.result) {
    console.log(msg.result?.result?.value);
    ws.close();
  }
});
ws.on('close', () => console.log('Done'));
