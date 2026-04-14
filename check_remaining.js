// From the read_entities result, extract all providers and their services
const providers = [
  { name: "Bill's Naills", services: ['69d1822df3b2afb229b5bafd'], id: '69dd9e2c62456d0a07b3848b' },
  { name: "Sunshine Pool Service", services: ['69d1822df3b2afb229b5bae6'], id: '69dd5f9e41585a352dd19a28' },
  { name: "Sunrise Pool Service", services: ['69d1822df3b2afb229b5bad7'], id: '69dd55d66d7f18916bb875c2' },
  { name: "Crochet kitty", services: ['69d1822df3b2afb229b5bafc'], id: '69dd4deb42c5521a2a7eb145' },
  { name: "Bill's Barber", services: ['69d1822df3b2afb229b5bafc'], id: '69dd4ca49b2392ea5da64e6a' },
  { name: "Test Plumbing Co", services: ['69d1822df3b2afb229b5badc'], id: '69dd442c6d7f18916bb86fb5' },
  { name: "Bill's Pool Service", services: ['69d1822df3b2afb229b5bae6'], id: '69dd3cc5d13ba04d964e4b5b' },
  { name: "Bill's grooming", services: ['69d1822df3b2afb229b5bb04','69d1822df3b2afb229b5bb07'], id: '69dc3f19730ddd6468207511' },
  { name: "Tall Man Lawn Service", services: ['69d1822df3b2afb229b5bae7','69d1822df3b2afb229b5bae8','69d1822df3b2afb229b5bae9','69d1822df3b2afb229b5baec'], id: 'JUST_FIXED' },
  // remaining from truncated output — need to check
];

const legacyPattern = /^s\d+$/;

providers.forEach(p => {
  const broken = p.services.filter(s => legacyPattern.test(s));
  if (broken.length > 0) {
    console.log(`BROKEN: ${p.name} → ${broken.join(', ')}`);
  } else {
    console.log(`OK: ${p.name}`);
  }
});
