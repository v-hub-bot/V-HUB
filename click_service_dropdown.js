// Click the service dropdown button
const btns = document.querySelectorAll('button, div');
let serviceBtn = null;
for (const el of btns) {
  if (el.textContent && el.textContent.trim() === 'Select a Service...' && el.style && el.style.cursor) {
    serviceBtn = el;
    break;
  }
}
if (serviceBtn) {
  serviceBtn.click();
  'clicked service dropdown';
} else {
  'not found - trying different selector';
}
