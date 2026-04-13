const WebSocket = require('ws');
const wsUrl = 'wss://connect.browserbase.com/debug/78a7a397-a131-4056-b60e-c34084f70033/devtools/page/2E1F05566CA049FDDCF7568A8ABA048B?debug=true';
const ws = new WebSocket(wsUrl);
let id = 1;

function send(expr) {
  ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
}

function setVal(selector, value) {
  return `(function(){
    const el = document.querySelector('${selector}');
    if (!el) return 'NOT FOUND: ${selector}';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
    return 'OK: ${selector} = ' + el.value;
  })()`;
}

function setTextarea(selector, value) {
  return `(function(){
    const el = document.querySelector('${selector}');
    if (!el) return 'NOT FOUND: ${selector}';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
    return 'OK textarea = ' + el.value.substring(0,30);
  })()`;
}

const steps = [];
let stepIdx = 0;

ws.on('open', () => {
  // Fill Section 1 fields
  steps.push(() => send(setVal('input[placeholder="e.g. Sunshine Landscaping"]', 'Maple Leaf Cleaning Co.')));
  steps.push(() => send(setVal('input[placeholder="Your full name"]', 'Sandra Kowalski')));
  steps.push(() => send(setVal('input[placeholder="(352) 555-0000"]', '352-555-0456')));
  steps.push(() => send(setVal('input[placeholder="you@example.com"]', 'sandra@mapleleafclean.com')));
  steps.push(() => send(setVal('input[placeholder="www.yourbusiness.com"]', 'www.mapleleafclean.com')));
  steps.push(() => send(setVal('input[placeholder="Street, City, FL ZIP"]', '1200 Buena Vista Blvd, The Villages, FL 32162')));
  steps.push(() => send(setVal('input[placeholder="e.g. 8"]', '6')));
  steps.push(() => send(setTextarea('textarea', 'Professional residential cleaning services for Villages homeowners. We offer weekly, bi-weekly, and one-time deep cleans. Fully insured and background-checked.')));

  steps.push(() => {
    // Set password field
    send(`(function(){
      const inputs = document.querySelectorAll('input[type="password"]');
      if (!inputs.length) return 'NO PASSWORD FIELDS';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inputs[0], 'CleanTest99');
      inputs[0].dispatchEvent(new Event('input', {bubbles:true}));
      inputs[0].dispatchEvent(new Event('change', {bubbles:true}));
      if (inputs[1]) {
        setter.call(inputs[1], 'CleanTest99');
        inputs[1].dispatchEvent(new Event('input', {bubbles:true}));
        inputs[1].dispatchEvent(new Event('change', {bubbles:true}));
      }
      return 'passwords set, count=' + inputs.length;
    })()`);
  });
  steps[0]();
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id && msg.result) {
    console.log(`Step ${msg.id}: ${JSON.stringify(msg.result?.result?.value || msg.result)}`);
    stepIdx++;
    if (stepIdx < steps.length) {
      setTimeout(() => steps[stepIdx](), 200);
    } else {
      // All fields set — take stock before scrolling down
      console.log('All Section 1 fields filled. Done.');
      ws.close();
    }
  }
});

ws.on('error', e => console.error('WS Error:', e.message));
ws.on('close', () => console.log('WS closed'));
