import json, subprocess, sys

# Run a curl to get all providers via entity API
# Use the SDK pattern we know works
result = subprocess.run([
    'node', '-e', '''
const { createClient } = require("npm:@base44/sdk@0.8.23");
const client = createClient({ appId: "69d062aca815ce8e697894b1" });
client.asServiceRole.entities.Provider.list({ limit: 500 }).then(r => {
  console.log(JSON.stringify(r));
}).catch(e => console.error(e.message));
'''
], capture_output=True, text=True, cwd='/app')
print(result.stdout[:200] if result.stdout else "Error: " + result.stderr[:200])
