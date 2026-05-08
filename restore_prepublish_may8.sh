#!/bin/bash
echo "🔄 Restoring pre-publish May 8 checkpoint..."

for f in Home Classifieds ListService Privacy Provider ProviderDashboard Terms Wekcadmin; do
  if [ -f "/app/pages/$f.jsx.prepublish_may8" ]; then
    cp "/app/pages/$f.jsx.prepublish_may8" "/app/pages/$f.jsx"
    echo "  ✅ Restored $f.jsx"
  fi
done

echo ""
echo "📤 Pushing pages to Base44 API..."
node -e "
const https = require('https');
const fs = require('fs');

const pages = ['Home','Classifieds','ListService','Privacy','Provider','ProviderDashboard','Terms','Wekcadmin'];
const pagesObj = {};
pages.forEach(p => {
  const path = '/app/pages/' + p + '.jsx';
  if (fs.existsSync(path)) pagesObj[p] = fs.readFileSync(path, 'utf8');
});

const body = JSON.stringify({ pages: pagesObj });
const options = {
  hostname: 'api.base44.app',
  path: '/api/apps/69d06ada8019d7e9edf7f8e8',
  method: 'PUT',
  headers: {
    'api_key': 'f5bac1d6da1e407187de2cde7e8d103a',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};
const req = https.request(options, res => {
  let d = '';
  res.on('data', x => d += x);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Pages saved! Triggering deploy...');
      // Now deploy
      const deployBody = '{}';
      const dOpts = {
        hostname: 'api.base44.app',
        path: '/api/apps/69d06ada8019d7e9edf7f8e8/deploy',
        method: 'POST',
        headers: {
          'api_key': 'f5bac1d6da1e407187de2cde7e8d103a',
          'Content-Type': 'application/json',
          'Content-Length': 2
        }
      };
      const dr = https.request(dOpts, dres => {
        let dd = '';
        dres.on('data', x => dd += x);
        dres.on('end', () => console.log('✅ Deploy triggered! Status:', dres.statusCode));
      });
      dr.write(deployBody);
      dr.end();
    } else {
      console.log('❌ Failed:', res.statusCode, d.substring(0,200));
    }
  });
});
req.write(body);
req.end();
" 2>&1
