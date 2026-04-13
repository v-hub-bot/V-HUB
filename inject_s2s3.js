const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;
let steps = [];
let stepIdx = 0;

function send(expr, awaitPromise = false) {
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise } }));
}

function next() {
  if (stepIdx < steps.length) {
    const s = steps[stepIdx++];
    setTimeout(() => { send(s.expr); }, s.delay || 300);
  } else {
    setTimeout(() => ws.close(), 500);
  }
}

ws.on('open', () => {
  steps = [
    // 1. Scroll to section 2
    { expr: `window.scrollTo(0,600); 'scrolled'` },

    // 2. Click "Home Services" accordion to expand it
    { expr: `(function(){
      const hdrs = Array.from(document.querySelectorAll('div')).filter(d => d.textContent.trim().match(/^🏠\\s*Home Services/));
      if (hdrs.length) { hdrs[0].click(); return 'clicked Home Services'; }
      return 'NOT FOUND';
    })()`, delay: 400 },

    // 3. Check what checkboxes appeared inside Home Services
    { expr: `(function(){
      const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      return JSON.stringify(cbs.slice(0,15).map(c => ({val: c.value, checked: c.checked, label: c.closest('label')?.textContent?.trim()?.substring(0,40) || c.id})));
    })()`, delay: 500 },

    // 4. Click the first visible unchecked checkbox (Cleaning Services)
    { expr: `(function(){
      const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      const cleaning = cbs.find(c => c.closest('label')?.textContent?.toLowerCase().includes('cleaning'));
      if (cleaning) { cleaning.click(); return 'clicked: ' + cleaning.closest('label')?.textContent?.trim()?.substring(0,40); }
      // fallback: click first checkbox
      if (cbs[0]) { cbs[0].click(); return 'clicked first: ' + cbs[0].value; }
      return 'no checkboxes found';
    })()`, delay: 400 },

    // 5. Scroll to Section 3 — Areas
    { expr: `window.scrollTo(0,1100); 'scrolled to areas'` },

    // 6. Click the areas dropdown to expand it
    { expr: `(function(){
      const dropdwn = Array.from(document.querySelectorAll('div')).find(d => d.textContent.trim().startsWith('📍') && d.textContent.includes('Select areas'));
      if (dropdwn) { dropdwn.click(); return 'clicked areas dropdown'; }
      return 'areas dropdown NOT FOUND';
    })()`, delay: 500 },

    // 7. See what area options are available
    { expr: `(function(){
      const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      return JSON.stringify({ total: cbs.length, sample: cbs.slice(0,8).map(c => c.closest('label')?.textContent?.trim()?.substring(0,40) || c.value) });
    })()`, delay: 600 },

    // 8. Select first 3 area checkboxes
    { expr: `(function(){
      const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(c => !c.checked);
      const picked = cbs.slice(0, 3);
      picked.forEach(c => c.click());
      return 'selected ' + picked.length + ' areas: ' + picked.map(c => c.closest('label')?.textContent?.trim()?.substring(0,25) || c.value).join(', ');
    })()`, delay: 400 },

    // 9. Scroll to Section 4 — login email
    { expr: `window.scrollTo(0,1600); 'scrolled to login'` },

    // 10. Fill login email
    { expr: `(function(){
      const inputs = Array.from(document.querySelectorAll('input[type="email"]'));
      const loginInput = inputs.find(i => i.placeholder && i.placeholder.toLowerCase().includes('log in'));
      if (!loginInput) return 'login email NOT FOUND — placeholders: ' + inputs.map(i=>i.placeholder).join(' | ');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(loginInput, 'sandra@mapleleafclean.com');
      loginInput.dispatchEvent(new Event('input', {bubbles:true}));
      loginInput.dispatchEvent(new Event('change', {bubbles:true}));
      return 'login email set: ' + loginInput.value;
    })()`, delay: 400 },
  ];

  steps[0] && send(steps[0].expr);
  stepIdx = 1;
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (!msg.result) return;
  const val = msg.result?.result?.value;
  console.log(`Step ${msg.id}: ${typeof val === 'string' ? val.substring(0,200) : JSON.stringify(val)}`);
  next();
});

ws.on('error', e => console.error('WS Error:', e.message));
ws.on('close', () => console.log('All steps done'));
