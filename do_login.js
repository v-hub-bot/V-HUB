// Fill credentials and click Sign In
const inputs = document.querySelectorAll('input');
inputs[0].value = 'VH-7842';
inputs[0].dispatchEvent(new Event('input', {bubbles:true}));
inputs[1].value = 'TempPass123!';
inputs[1].dispatchEvent(new Event('input', {bubbles:true}));

// Find the Sign In button (contains "SIGN IN")
const btns = Array.from(document.querySelectorAll('button'));
const signInBtn = btns.find(b => b.textContent.includes('SIGN IN'));
if (signInBtn) { signInBtn.click(); console.log('Clicked Sign In'); }
else { console.log('Buttons found:', btns.map(b=>b.textContent.trim())); }
