const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const pending = {};

function send(expr, delay = 300) {
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
    console.log(`[${msg.id}] ${String(val).substring(0,250)}`);
    pending[msg.id](val);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  // Scroll to areas section
  await send(`window.scrollTo(0, 1000); 'ok'`, 100);

  // Find the areas dropdown and open it — look for the specific "Select areas" div
  await send(`(function(){
    const allDivs = Array.from(document.querySelectorAll('div'));
    const dropdown = allDivs.find(d => d.textContent.trim().startsWith('📍') && d.textContent.includes('Select areas'));
    if (!dropdown) return 'NOT FOUND';
    dropdown.click();
    return 'opened areas dropdown';
  })()`, 400);

  // Now look for actual checkbox inputs that appeared
  const cbInfo = await send(`(function(){
    const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    return JSON.stringify({ count: cbs.length, sample: cbs.slice(0,8).map(c => ({ val: c.value, label: c.closest('label')?.textContent?.trim()?.substring(0,30) })) });
  })()`, 700);

  // Also look at what area items are visible as clickable divs now
  const areaItems = await send(`(function(){
    // After opening areas, look for individual village items
    // They should be below the areas dropdown header
    const allClickable = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    return JSON.stringify(allClickable.slice(0,30).map(d => d.textContent.trim().substring(0,35)));
  })()`, 300);
  console.log('AREA ITEMS NOW:', areaItems);

  // Try to get the full areas section HTML
  const areasHtml = await send(`(function(){
    const allDivs = Array.from(document.querySelectorAll('div'));
    const areaSection = allDivs.find(d => {
      const text = d.textContent;
      return text.includes('SECTION 3') && text.includes('Areas You Serve');
    });
    return areaSection ? areaSection.outerHTML.substring(0, 3000) : 'not found';
  })()`, 300);
  console.log('AREAS HTML:', areasHtml.substring(0, 1000));

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
