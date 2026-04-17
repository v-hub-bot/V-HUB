// Login to Provider Dashboard
const form = document.querySelector('form');
const inputs = document.querySelectorAll('input');
const btns = document.querySelectorAll('button');
console.log('inputs:', inputs.length, Array.from(inputs).map(i => i.type + ':' + i.placeholder));
console.log('buttons:', btns.length, Array.from(btns).map(b => b.textContent.trim().substring(0,30)));
