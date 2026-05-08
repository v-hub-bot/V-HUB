#!/bin/bash
# Publishes the V-HUB mini app via Base44 API
# Usage: manage_app.sh publish
# 
# IMPORTANT: This saves pages to the app database and triggers a deploy checkpoint.
# The CDN bundle (Vite build) is only rebuilt when Kimberly clicks Publish in the Base44 builder UI.

ACTION=${1:-publish}
APP_ID="69d06ada8019d7e9edf7f8e8"
API_BASE="https://api.base44.app/api/apps"

if [ "$ACTION" = "publish" ]; then
  echo "Saving pages to V-HUB app ($APP_ID)..."
  
  # Build pages object from all JSX files
  PAGES_DIR="/app/pages"
  
  # Use Node.js to build and send the payload (handles large files better than curl)
  node -e "
const https = require('https');
const fs = require('fs');
const path = require('path');

const pages = ['Home', 'Classifieds', 'ListService', 'Privacy', 'Provider', 'ProviderDashboard', 'Terms', 'Wekcadmin'];
const pagesObj = {};

for (const page of pages) {
  const file = path.join('$PAGES_DIR', page + '.jsx');
  if (fs.existsSync(file)) {
    pagesObj[page] = fs.readFileSync(file, 'utf8');
    console.log('  Loaded:', page, '(' + pagesObj[page].length + ' chars)');
  }
}

const body = JSON.stringify({ pages: pagesObj });

const options = {
  hostname: 'api.base44.app',
  path: '/api/apps/$APP_ID',
  method: 'PUT',
  headers: {
    'api_key': process.env.BASE44_API_KEY || '$BASE44_API_KEY',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Pages saved successfully!');
      // Now trigger deploy checkpoint
      const deployOptions = {
        hostname: 'api.base44.app',
        path: '/api/apps/$APP_ID/deploy',
        method: 'POST',
        headers: {
          'api_key': process.env.BASE44_API_KEY || '$BASE44_API_KEY',
          'Content-Type': 'application/json',
          'Content-Length': 2
        }
      };
      const deployReq = https.request(deployOptions, deployRes => {
        let deployData = '';
        deployRes.on('data', d => deployData += d);
        deployRes.on('end', () => {
          if (deployRes.statusCode === 200) {
            const r = JSON.parse(deployData);
            console.log('✅ Deploy checkpoint saved! last_deployed_at:', r.last_deployed_at);
            console.log('');
            console.log('⚠️  NOTE: CDN bundle rebuild requires clicking Publish in Base44 builder UI');
            console.log('   Pages are saved in the database and ready to publish.');
          } else {
            console.log('❌ Deploy failed:', deployRes.statusCode, deployData.substring(0,200));
          }
        });
      });
      deployReq.write('{}');
      deployReq.end();
    } else {
      console.log('❌ Failed to save pages:', res.statusCode, data.substring(0,200));
    }
  });
});
req.on('error', e => console.error('Error:', e));
req.write(body);
req.end();
" 2>&1

  echo "Done!"
fi
