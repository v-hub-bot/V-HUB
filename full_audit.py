import json

# Load all providers from the entity JSON
with open('/app/entities/Provider.json', 'r') as f:
    entity_def = json.load(f)

# The actual category and service IDs from the database
# Category IDs
CAT_HOME_SERVICES = '69d09c14d5ee9e7be9aa301b'      # Home Services (plumbing, HVAC, roofing, flooring, handyman, painting, etc.)
CAT_HOME_SYSTEMS = '69d181fe57b60e0aecf4067d'       # Home Systems & Utilities (pool, electrical, pest, security, appliances)
CAT_YARD = '69d09c14d5ee9e7be9aa301c'               # Yard & Outdoor
CAT_GOLF = '69d09c14d5ee9e7be9aa301d'               # Golf Carts
CAT_AUTO = '69d09c14d5ee9e7be9aa301e'               # Auto Services
CAT_PERSONAL = '69d09c14d5ee9e7be9aa301f'           # Personal Care & Beauty
CAT_PETS = '69d09c14d5ee9e7be9aa3020'               # Pets
CAT_MOVING = '69d09c14d5ee9e7be9aa3021'             # Moving & Senior Services
CAT_PROFESSIONAL = '69d181fe57b60e0aecf4067e'       # Professional Services

# Service IDs - last 4 chars for reference
# Home Services services: bad5-bae3, badb-badf
# Key ones:
SVC_POOL = '69d1822df3b2afb229b5bae6'
SVC_ELECTRICAL = '69d1822df3b2afb229b5bae2'
SVC_PEST = '69d1822df3b2afb229b5bae7'
SVC_SECURITY = '69d1822df3b2afb229b5bae8'
SVC_APPLIANCE = '69d1822df3b2afb229b5bae4'
SVC_HVAC = '69d1822df3b2afb229b5badb'
SVC_PLUMBING = '69d1822df3b2afb229b5badc'
SVC_ROOFING = '69d1822df3b2afb229b5badd'
SVC_HANDYMAN = '69d1822df3b2afb229b5bade'
SVC_FLOORING = '69d1822df3b2afb229b5bae3'
SVC_PAINTING = '69d1822df3b2afb229b5bad8'
SVC_CLEANING = '69d1822df3b2afb229b5bad7'

# These are the services that SHOULD be in Home Systems & Utilities
HOME_SYSTEMS_SVCS = {SVC_POOL, SVC_ELECTRICAL, SVC_PEST, SVC_SECURITY, SVC_APPLIANCE}
# These should be in Home Services
HOME_SERVICES_SVCS = {SVC_HVAC, SVC_PLUMBING, SVC_ROOFING, SVC_HANDYMAN, SVC_FLOORING, SVC_PAINTING, SVC_CLEANING}

print("Category ID map:")
print(f"  Home Services: {CAT_HOME_SERVICES[-4:]}")
print(f"  Home Systems & Utilities: {CAT_HOME_SYSTEMS[-4:]}")
print()
print("Service ID map:")
print(f"  Pool: {SVC_POOL[-4:]}")
print(f"  Electrical: {SVC_ELECTRICAL[-4:]}")
print(f"  Pest: {SVC_PEST[-4:]}")
print(f"  Security/HW: {SVC_SECURITY[-4:]}")
print(f"  Appliance: {SVC_APPLIANCE[-4:]}")
print(f"  HVAC: {SVC_HVAC[-4:]}")
print(f"  Plumbing: {SVC_PLUMBING[-4:]}")
print(f"  Roofing: {SVC_ROOFING[-4:]}")
print(f"  Handyman: {SVC_HANDYMAN[-4:]}")
print(f"  Flooring: {SVC_FLOORING[-4:]}")
print(f"  Painting: {SVC_PAINTING[-4:]}")
print(f"  Cleaning: {SVC_CLEANING[-4:]}")
