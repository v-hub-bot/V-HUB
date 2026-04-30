# This will be used as a data source — we already have the data from the read_entities call
# Let me parse it from the truncated output and work with what we have
# Instead, let's use the Service entity to understand the actual mapping

import json

# Check what Service entity data we have
try:
    with open('/app/entities/Service.json', 'r') as f:
        svc_def = json.load(f)
    print("Service entity definition:", json.dumps(svc_def, indent=2)[:500])
except Exception as e:
    print(f"Error: {e}")
