const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const pending = {};

function send(expr, delay = 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      const msgId = id++;
      ws.send(JSON.stringify({ id: msgId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
      pending[msgId] = resolve;
    }, delay);
  });
}

ws.on('message', data => {
  const msg = JSON.parse(data);
  if (pending[msg.id]) {
    const val = msg.result?.result?.value;
    console.log(`[${msg.id}] ${String(val).substring(0, 200)}`);
    pending[msg.id](val);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  // 1. Click "Cleaning Services" item
  const r1 = await send(`(function(){
    const items = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    const cleaning = items.find(d => d.textContent.trim() === 'Cleaning Services');
    if (!cleaning) return 'NOT FOUND';
    cleaning.click();
    return 'clicked Cleaning Services';
  })()`, 200);

  // 2. Verify it's selected (look for checkmark or background change)
  await send(`(function(){
    const items = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    const cleaning = items.find(d => d.textContent.trim().includes('Cleaning Services'));
    return cleaning ? 'style: ' + cleaning.getAttribute('style').substring(0,100) : 'not found';
  })()`, 400);

  // 3. Click areas dropdown
  const r3 = await send(`(function(){
    const items = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    const areas = items.find(d => d.textContent.includes('Select areas'));
    if (!areas) return 'areas dropdown NOT FOUND';
    areas.click();
    return 'clicked areas dropdown';
  })()`, 400);

  // 4. See what area items appeared
  const areaItems = await send(`(function(){
    const items = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    return JSON.stringify(items.map(d => d.textContent.trim().substring(0,30)).filter(t => !t.includes('▼') && !t.includes('▲') && t.length > 2));
  })()`, 600);
  console.log('AREA ITEMS:', areaItems);

  // 5. Click first 3 area items (skip service items which are already selected)
  await send(`(function(){
    const items = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    // Skip items that are category headers (contain emoji+▲/▼) and service names
    // Area items come after the areas dropdown header
    const areaDropdownIdx = items.findIndex(d => d.textContent.includes('Select areas') || d.textContent.includes('Areas Served'));
    const serviceNames = ['Home Improvements','General Repairs','Cleaning Services','Painting','Garage Door','Window','HVAC','Plumbing','Roofing','Home Watch'];
    const areaItems = items.filter((d,i) => {
      const t = d.textContent.trim();
      // skip: category headers (have ▲▼), service names, dropdown header
      if (t.includes('▲') || t.includes('▼')) return false;
      if (serviceNames.some(s => t.includes(s))) return false;
      if (t.length < 3) return false;
      return true;
    });
    const picked = areaItems.slice(0, 3);
    picked.forEach(d => d.click());
    return 'clicked ' + picked.length + ' areas: ' + picked.map(d => d.textContent.trim().substring(0,20)).join(', ');
  })()`, 400);

  // 6. Scroll to submit and take final screenshot
  await send(`window.scrollTo(0, 9999); 'scrolled to bottom'`, 300);

  ws.close();
});

ws.on('error', e => console.error(e.message));
ws.on('close', () => console.log('Done'));
