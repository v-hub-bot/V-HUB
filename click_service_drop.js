// Find and click the service dropdown
const dropdowns = document.querySelectorAll('div');
let serviceDropdown = null;
for (const d of dropdowns) {
  if (d.textContent.trim() === 'Select a Service...' && d.style.cursor === 'pointer') {
    serviceDropdown = d;
    break;
  }
  if (d.textContent.includes('Select a Service') && d.querySelector) {
    const inner = d.innerHTML;
    if (inner.includes('▼')) { serviceDropdown = d; break; }
  }
}
if (serviceDropdown) {
  serviceDropdown.click();
  console.log('Clicked service dropdown');
} else {
  console.log('Not found, trying parent approach');
  const allDivs = Array.from(document.querySelectorAll('div'));
  const matches = allDivs.filter(d => d.innerText && d.innerText.trim().startsWith('Select a Service'));
  console.log('Found:', matches.length, 'candidates');
  if (matches.length) matches[0].click();
}
