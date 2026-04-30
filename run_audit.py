import subprocess, json

# The data I need to audit - read from the entity API
# Category and service mappings
CAT_HOME_SERVICES = '69d09c14d5ee9e7be9aa301b'
CAT_HOME_SYSTEMS = '69d181fe57b60e0aecf4067d'
CAT_YARD = '69d09c14d5ee9e7be9aa301c'
CAT_GOLF = '69d09c14d5ee9e7be9aa301d'
CAT_AUTO = '69d09c14d5ee9e7be9aa301e'
CAT_PERSONAL = '69d09c14d5ee9e7be9aa301f'
CAT_PETS = '69d09c14d5ee9e7be9aa3020'
CAT_MOVING = '69d09c14d5ee9e7be9aa3021'
CAT_PROFESSIONAL = '69d181fe57b60e0aecf4067e'

# Service ID → correct category
# Strategy: use the FIRST (primary) service ID to determine which category the provider belongs in
# The category should match the primary service
SVC_CAT_MAP = {
    # HOME SYSTEMS & UTILITIES
    '69d1822df3b2afb229b5bae6': CAT_HOME_SYSTEMS,  # Pool & Spa Services
    '69d1822df3b2afb229b5bae2': CAT_HOME_SYSTEMS,  # Electrical & Lighting
    '69d1822df3b2afb229b5bae7': CAT_HOME_SYSTEMS,  # Pest Control
    '69d1822df3b2afb229b5bae8': CAT_HOME_SYSTEMS,  # Home Watch / Security
    '69d1822df3b2afb229b5bae4': CAT_HOME_SYSTEMS,  # Appliance Repair
    '69d1822df3b2afb229b5bae5': CAT_HOME_SYSTEMS,  # Alarm Systems
    # HOME SERVICES
    '69d1822df3b2afb229b5badb': CAT_HOME_SERVICES,  # HVAC
    '69d1822df3b2afb229b5badc': CAT_HOME_SERVICES,  # Plumbing
    '69d1822df3b2afb229b5badd': CAT_HOME_SERVICES,  # Roofing
    '69d1822df3b2afb229b5bade': CAT_HOME_SERVICES,  # Handyman
    '69d1822df3b2afb229b5bae3': CAT_HOME_SERVICES,  # Flooring
    '69d1822df3b2afb229b5bad8': CAT_HOME_SERVICES,  # Painting
    '69d1822df3b2afb229b5bad7': CAT_HOME_SERVICES,  # Cleaning Services
    '69d1822df3b2afb229b5bad5': CAT_HOME_SERVICES,  # Remodeling/Renovation
    '69d1822df3b2afb229b5bad6': CAT_HOME_SERVICES,  # General Repairs
    '69d1822df3b2afb229b5bad9': CAT_HOME_SERVICES,  # Windows/Gutters
    '69d1822df3b2afb229b5bada': CAT_HOME_SERVICES,  # Screen/Enclosure
    '69d1822df3b2afb229b5badf': CAT_HOME_SERVICES,  # Fencing/Gates
    '69d1822df3b2afb229b5baee': CAT_HOME_SERVICES,  # Pressure Washing
    # YARD & OUTDOOR
    '69d1822df3b2afb229b5bae9': CAT_YARD,  # Lawn Mowing
    '69d1822df3b2afb229b5baea': CAT_YARD,  # Landscaping
    '69d1822df3b2afb229b5baeb': CAT_YARD,  # Irrigation/Sprinklers
    '69d1822df3b2afb229b5baec': CAT_YARD,  # Tree Services
    '69d1822df3b2afb229b5baed': CAT_YARD,  # Outdoor/Patio
    # GOLF CARTS
    '69d1822df3b2afb229b5baf0': CAT_GOLF,
    '69d1822df3b2afb229b5baf1': CAT_GOLF,
    '69d1822df3b2afb229b5baf2': CAT_GOLF,
    '69d1822df3b2afb229b5baf3': CAT_GOLF,
    '69d1822df3b2afb229b5baf4': CAT_GOLF,
    '69d1822df3b2afb229b5baf5': CAT_GOLF,
    '69d1822df3b2afb229b5baf6': CAT_GOLF,
    # AUTO SERVICES
    '69d1822df3b2afb229b5baf7': CAT_AUTO,
    '69d1822df3b2afb229b5baf8': CAT_AUTO,
    '69d1822df3b2afb229b5baf9': CAT_AUTO,
    '69d1822df3b2afb229b5bafa': CAT_AUTO,
    '69d1822df3b2afb229b5bafb': CAT_AUTO,
    '69d1822df3b2afb229b5bafc': CAT_AUTO,
    # PERSONAL CARE
    '69d1822df3b2afb229b5bb00': CAT_PERSONAL,
    '69d1822df3b2afb229b5bb01': CAT_PERSONAL,
    '69d1822df3b2afb229b5bb02': CAT_PERSONAL,
    '69d1822df3b2afb229b5bb03': CAT_PERSONAL,
    # PETS
    '69d1822df3b2afb229b5bb04': CAT_PETS,
    '69d1822df3b2afb229b5bb05': CAT_PETS,
    '69d1822df3b2afb229b5bb06': CAT_PETS,
    '69d1822df3b2afb229b5bb07': CAT_PETS,
    '69deb9de1564dc5386aff454': CAT_PETS,
    # MOVING & SENIOR
    '69d1822df3b2afb229b5bb08': CAT_MOVING,
    '69d1822df3b2afb229b5bb09': CAT_MOVING,
    '69d1822df3b2afb229b5bb0a': CAT_MOVING,
    '69d1822df3b2afb229b5bb0b': CAT_MOVING,
    '69d1822df3b2afb229b5bb0c': CAT_MOVING,
    '69d1822df3b2afb229b5bb0d': CAT_MOVING,
    '69d1822df3b2afb229b5bb0e': CAT_MOVING,
    # PROFESSIONAL SERVICES
    '69d1822df3b2afb229b5bb0f': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb10': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb11': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb12': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb13': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb14': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb15': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb16': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb17': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb18': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb19': CAT_PROFESSIONAL,
    '69d1822df3b2afb229b5bb1a': CAT_PROFESSIONAL,
}

CAT_NAMES = {
    CAT_HOME_SERVICES: 'Home Services',
    CAT_HOME_SYSTEMS: 'Home Systems & Utilities',
    CAT_YARD: 'Yard & Outdoor',
    CAT_GOLF: 'Golf Carts',
    CAT_AUTO: 'Auto Services',
    CAT_PERSONAL: 'Personal Care & Beauty',
    CAT_PETS: 'Pets',
    CAT_MOVING: 'Moving & Senior Services',
    CAT_PROFESSIONAL: 'Professional Services',
}

# Read providers from the saved JSON dump
with open('/app/providers_live.json', 'r') as f:
    providers = json.load(f)

mismatches = []
no_services = []
unknown_svcs = []

for p in providers:
    svcs = p.get('services') or []
    cat = p.get('category_id', '')
    name = p.get('business_name', '?')
    pid = p.get('id', '')
    
    if not svcs:
        no_services.append(name)
        continue
    
    # Determine expected category from primary service
    primary_svc = svcs[0]
    expected_cat = SVC_CAT_MAP.get(primary_svc)
    
    # Check all services for consistency
    all_expected = set()
    for s in svcs:
        ec = SVC_CAT_MAP.get(s)
        if ec:
            all_expected.add(ec)
        else:
            unknown_svcs.append(f"{name}: unknown svc {s[-4:]}")
    
    if not expected_cat:
        continue  # Unknown service, skip
    
    # If the provider's category doesn't match, it's a mismatch
    if cat != expected_cat:
        # But check if all services agree on a different category
        if len(all_expected) == 1:
            true_cat = list(all_expected)[0]
        else:
            true_cat = expected_cat  # Use primary
        
        if cat != true_cat:
            mismatches.append({
                'id': pid,
                'name': name,
                'current_cat': CAT_NAMES.get(cat, cat[-4:]),
                'correct_cat': CAT_NAMES.get(true_cat, true_cat[-4:]),
                'correct_cat_id': true_cat,
                'svcs': [s[-4:] for s in svcs]
            })

print(f"Total providers: {len(providers)}")
print(f"No services: {len(no_services)}")
print(f"MISMATCHES FOUND: {len(mismatches)}")
print()
print("=== MISMATCHES ===")
for m in sorted(mismatches, key=lambda x: x['current_cat']):
    print(f"  {m['name']}: {m['current_cat']} → {m['correct_cat']} (svcs: {m['svcs']}) [{m['id'][-8:]}]")

if unknown_svcs[:5]:
    print(f"\nUnknown service IDs (first 5):")
    for u in unknown_svcs[:5]:
        print(f"  {u}")

# Save fixes
with open('/app/mismatch_fixes.json', 'w') as f:
    json.dump(mismatches, f, indent=2)
print(f"\nFixes saved to mismatch_fixes.json")
