# Build the definitive service→category map from actual Service entity data
SVC_CAT = {
    # From Service entity (ground truth)
    '69ea749b0daf529bb432bdef': '69d09c14d5ee9e7be9aa301b',  # Home Inspection → Home Services
    '69e533a4d86b8063aacf415e': '69d09c14d5ee9e7be9aa3021',  # Vehicle Transport → Moving
    '69deb9de1564dc5386aff454': '69d09c14d5ee9e7be9aa3020',  # Pet Nail Trimming → Pets
    '69d1822df3b2afb229b5baeb': '69d09c14d5ee9e7be9aa301c',  # Irrigation → Yard
    '69d1822df3b2afb229b5bb0e': '69d181fe57b60e0aecf4067e',  # Notary → Professional
    '69d1822df3b2afb229b5bafb': '69d09c14d5ee9e7be9aa301e',  # Mobile Mechanic → Auto
    '69d1822df3b2afb229b5bb05': '69d09c14d5ee9e7be9aa3020',  # Pet Sitting → Pets
    '69d1822df3b2afb229b5bb07': '69d09c14d5ee9e7be9aa3020',  # Mobile Grooming → Pets
    '69d1822df3b2afb229b5bafa': '69d09c14d5ee9e7be9aa301e',  # Tire Services → Auto
    '69d1822df3b2afb229b5bb0b': '69d09c14d5ee9e7be9aa3021',  # Errand → Moving
    '69d1822df3b2afb229b5bb12': '69d181fe57b60e0aecf4067e',  # Tax Prep → Professional
    '69d1822df3b2afb229b5baee': '69d09c14d5ee9e7be9aa301b',  # Pressure Washing → Home Services
    '69d1822df3b2afb229b5bb0a': '69d09c14d5ee9e7be9aa3021',  # Local Rides → Moving
    '69d1822df3b2afb229b5bb11': '69d181fe57b60e0aecf4067e',  # Business Consulting → Professional
    '69d1822df3b2afb229b5baf9': '69d09c14d5ee9e7be9aa301e',  # Oil Changes → Auto
    '69d1822df3b2afb229b5bae9': '69d09c14d5ee9e7be9aa301c',  # Tree Trimming → Yard
    '69d1822df3b2afb229b5baf8': '69d09c14d5ee9e7be9aa301e',  # Auto Detailing → Auto
    '69d1822df3b2afb229b5baef': '69d09c14d5ee9e7be9aa301b',  # Driveway Repair → Home Services
    '69d1822df3b2afb229b5bb00': '69d09c14d5ee9e7be9aa301f',  # Massage → Personal Care
    '69d1822df3b2afb229b5bb0f': '69d181fe57b60e0aecf4067e',  # IT Support → Professional
    '69d1822df3b2afb229b5baf5': '69d09c14d5ee9e7be9aa301d',  # Battery Replacement → Golf
    '69d1822df3b2afb229b5bb08': '69d09c14d5ee9e7be9aa3021',  # Medical Transport → Moving
    '69d1822df3b2afb229b5bb09': '69d09c14d5ee9e7be9aa3021',  # Airport Transport → Moving
    '69d1822df3b2afb229b5baf1': '69d09c14d5ee9e7be9aa301d',  # Repairs (Golf) → Golf
    '69d1822df3b2afb229b5baf2': '69d09c14d5ee9e7be9aa301d',  # Detailing (Golf) → Golf
    '69d1822df3b2afb229b5baf4': '69d09c14d5ee9e7be9aa301d',  # Improvements/Custom → Golf
    '69d1822df3b2afb229b5baf7': '69d09c14d5ee9e7be9aa301e',  # Auto Repairs → Auto
    '69d1822df3b2afb229b5bb03': '69d09c14d5ee9e7be9aa3020',  # Vet Services → Pets
    '69d1822df3b2afb229b5bb0d': '69d181fe57b60e0aecf4067e',  # Accounting → Professional
    '69d1822df3b2afb229b5baea': '69d09c14d5ee9e7be9aa301c',  # Lawn Fertilization → Yard
    '69d1822df3b2afb229b5baf0': '69d09c14d5ee9e7be9aa301d',  # Rentals (Golf) → Golf
    '69d1822df3b2afb229b5bafc': '69d09c14d5ee9e7be9aa301f',  # Barber/Stylist → Personal Care
    '69d1822df3b2afb229b5baff': '69d09c14d5ee9e7be9aa301f',  # Home Health Aides → Personal Care
    '69d1822df3b2afb229b5bb01': '69d09c14d5ee9e7be9aa301f',  # Personal Trainers → Personal Care
    '69d1822df3b2afb229b5baec': '69d09c14d5ee9e7be9aa301c',  # Landscaping → Yard
    '69d1822df3b2afb229b5baf6': '69d09c14d5ee9e7be9aa301d',  # Tire Services (Golf) → Golf
    '69d1822df3b2afb229b5bafd': '69d09c14d5ee9e7be9aa301f',  # Nail Technicians → Personal Care
    '69d1822df3b2afb229b5bafe': '69d09c14d5ee9e7be9aa301f',  # Spa Services → Personal Care
    '69d1822df3b2afb229b5bb10': '69d181fe57b60e0aecf4067e',  # Legal Services → Professional
    '69d1822df3b2afb229b5baed': '69d09c14d5ee9e7be9aa301c',  # Hardscaping → Yard
    '69d1822df3b2afb229b5bb04': '69d09c14d5ee9e7be9aa3020',  # Grooming → Pets
    '69d1822df3b2afb229b5bb06': '69d09c14d5ee9e7be9aa3020',  # Pet Training → Pets
    '69d1822df3b2afb229b5bb0c': '69d09c14d5ee9e7be9aa3021',  # Courier/Delivery → Moving
    '69d1822df3b2afb229b5bb13': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5bb14': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5bb15': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5bb16': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5bb17': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5bb18': '69d181fe57b60e0aecf4067e',  # Tattoo → Professional
    '69d1822df3b2afb229b5bb19': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5bb1a': '69d181fe57b60e0aecf4067e',
    '69d1822df3b2afb229b5baf3': '69d09c14d5ee9e7be9aa301d',  # Lighting Upgrades (Golf) → Golf
    '69d1822df3b2afb229b5bb02': '69d09c14d5ee9e7be9aa301f',  # Makeup Artists → Personal Care
    '69d1822df3b2afb229b5bada': '69d09c14d5ee9e7be9aa301b',  # Window Install → Home Services
    '69d1822df3b2afb229b5badb': '69d09c14d5ee9e7be9aa301b',  # HVAC → Home Services
    '69d1822df3b2afb229b5bae1': '69d181fe57b60e0aecf4067d',  # Appliance Repair → Home Systems
    '69d1822df3b2afb229b5bae7': '69d09c14d5ee9e7be9aa301c',  # Lawn Mowing → Yard  ← KEY FIX: bae7 is LAWN MOWING not Pest Control!
    '69d1822df3b2afb229b5bade': '69d09c14d5ee9e7be9aa301b',  # Handyman → Home Services
    '69d1822df3b2afb229b5bae0': '69d181fe57b60e0aecf4067d',  # Pest Control → Home Systems  ← bae0 is PEST CONTROL
    '69d1822df3b2afb229b5bae5': '69d181fe57b60e0aecf4067d',  # Smart Home → Home Systems
    '69d1822df3b2afb229b5bad8': '69d09c14d5ee9e7be9aa301b',  # Painting → Home Services
    '69d1822df3b2afb229b5badf': '69d09c14d5ee9e7be9aa301b',  # Security & Home Watch → Home Services
    '69d1822df3b2afb229b5badd': '69d09c14d5ee9e7be9aa301b',  # Roofing → Home Services
    '69d1822df3b2afb229b5bae6': '69d181fe57b60e0aecf4067d',  # Pool & Spa → Home Systems  ← POOL IS HOME SYSTEMS
    '69d1822df3b2afb229b5bad6': '69d09c14d5ee9e7be9aa301b',  # General Repairs → Home Services
    '69d1822df3b2afb229b5bad7': '69d09c14d5ee9e7be9aa301b',  # Cleaning Services → Home Services
    '69d1822df3b2afb229b5bae3': '69d09c14d5ee9e7be9aa301b',  # Flooring → Home Services
    '69d1822df3b2afb229b5bae8': '69d09c14d5ee9e7be9aa301c',  # Sod Installation → Yard  ← bae8 is SOD not Security!
    '69d1822df3b2afb229b5bad9': '69d09c14d5ee9e7be9aa301b',  # Garage Door → Home Services
    '69d1822df3b2afb229b5bae4': '69d181fe57b60e0aecf4067e',  # Home Organization → Professional
    '69d1822df3b2afb229b5badc': '69d09c14d5ee9e7be9aa301b',  # Plumbing → Home Services
    '69d1822df3b2afb229b5bad5': '69d09c14d5ee9e7be9aa301b',  # Home Improvements → Home Services
    '69d1822df3b2afb229b5bae2': '69d181fe57b60e0aecf4067d',  # Electrical → Home Systems
}

CAT_NAMES = {
    '69d09c14d5ee9e7be9aa301b': 'Home Services',
    '69d181fe57b60e0aecf4067d': 'Home Systems & Utilities',
    '69d09c14d5ee9e7be9aa301c': 'Yard & Outdoor',
    '69d09c14d5ee9e7be9aa301d': 'Golf Carts',
    '69d09c14d5ee9e7be9aa301e': 'Auto Services',
    '69d09c14d5ee9e7be9aa301f': 'Personal Care & Beauty',
    '69d09c14d5ee9e7be9aa3020': 'Pets',
    '69d09c14d5ee9e7be9aa3021': 'Moving & Senior Services',
    '69d181fe57b60e0aecf4067e': 'Professional Services',
}

print("KEY FINDINGS:")
print(f"  bae7 = Lawn Mowing (category: Yard & Outdoor)")
print(f"  bae8 = Sod Installation (category: Yard & Outdoor)")
print(f"  bae0 = Pest Control (category: Home Systems)")
print(f"  bae1 = Appliance Repair (category: Home Systems)")
print(f"  bae6 = Pool & Spa (category: Home Systems)")
print(f"  bae2 = Electrical (category: Home Systems)")
print(f"  badf = Security & Home Watch (category: Home Services)")
print()

# Now let's check: what category should a provider be in based on their services?
# The rule: use the primary (first) service's category as the provider's category
# BUT some providers have services spanning categories - we use primary service

print("The issue Kimberly reported: 'pools in lawn'")
print("→ Pool service ID is bae6, which belongs to Home Systems & Utilities")
print("→ If a provider has category 'Yard & Outdoor' but has bae6, that's a mismatch")
print()
print("Let's check which service IDs have wrong category assignments in the database...")
