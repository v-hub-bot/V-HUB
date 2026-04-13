const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
const queue = [];
let running = false;

function send(expr, delay = 300) {
  return new Promise(resolve => {
    queue.push({ expr, delay, resolve });
    if (!running) runNext();
  });
}

function runNext() {
  if (!queue.length) { running = false; return; }
  running = true;
  const { expr, delay, resolve } = queue.shift();
  setTimeout(() => {
    const msgId = id++;
    ws.send(JSON.stringify({ id: msgId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
    ws._pendingResolves = ws._pendingResolves || {};
    ws._pendingResolves[msgId] = (val) => { resolve(val); runNext(); };
  }, delay);
}

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.result && ws._pendingResolves?.[msg.id]) {
    const val = msg.result?.result?.value;
    console.log(`[${msg.id}] ${typeof val === 'string' ? val.substring(0,150) : JSON.stringify(val)?.substring(0,150)}`);
    ws._pendingResolves[msg.id](val);
    delete ws._pendingResolves[msg.id];
  }
});

ws.on('open', async () => {
  // Scroll into view of Section 2
  await send(`window.scrollTo(0, 700); 'ok'`, 100);

  // Find and click the INNER clickable div of Home Services (first accordion header span)
  const clickResult = await send(`(function(){
    // The clickable header is the first child div of each accordion item
    const spans = Array.from(document.querySelectorAll('span')).filter(s => s.textContent.trim() === '🏠 Home Services');
    if (!spans.length) return 'span NOT FOUND';
    const headerDiv = spans[0].closest('div[style*="cursor: pointer"]') || spans[0].parentElement;
    if (!headerDiv) return 'headerDiv NOT FOUND';
    headerDiv.click();
    return 'clicked: ' + headerDiv.textContent.trim().substring(0,40);
  })()`, 400);

  // Wait for expansion, then check what's inside
  const afterClick = await send(`(function(){
    const spans = Array.from(document.querySelectorAll('span')).filter(s => s.textContent.trim() === '🏠 Home Services');
    if (!spans.length) return 'not found';
    const section = spans[0].closest('div[style*="overflow: hidden"]')?.parentElement;
    if (!section) return 'section parent not found';
    return section.outerHTML.substring(0, 2000);
  })()`, 600);

  // Look for any service item divs that appeared
  const services = await send(`(function(){
    // Find all clickable items inside expanded sections (usually styled divs with cursor:pointer not being headers)
    const allClickable = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
    return JSON.stringify(allClickable.slice(0,20).map(d => d.textContent.trim().substring(0,40)));
  })()`, 300);

  console.log('SERVICES CLICKABLE:', services);
  ws.close();
});

ws.on('error', e => console.error('Error:', e.message));
ws.on('close', () => console.log('Done'));
