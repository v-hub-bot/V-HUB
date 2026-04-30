import json

# Ground-truth service→category map (from Service entity)
SVC_CAT = {
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
    '69d1822df3b2afb229b5baf1': '69d09c14d5ee9e7be9aa301d',  # Golf Repairs → Golf
    '69d1822df3b2afb229b5baf2': '69d09c14d5ee9e7be9aa301d',  # Golf Detailing → Golf
    '69d1822df3b2afb229b5baf4': '69d09c14d5ee9e7be9aa301d',  # Golf Improvements → Golf
    '69d1822df3b2afb229b5baf7': '69d09c14d5ee9e7be9aa301e',  # Auto Repairs → Auto
    '69d1822df3b2afb229b5bb03': '69d09c14d5ee9e7be9aa3020',  # Vet Services → Pets
    '69d1822df3b2afb229b5bb0d': '69d181fe57b60e0aecf4067e',  # Accounting → Professional
    '69d1822df3b2afb229b5baea': '69d09c14d5ee9e7be9aa301c',  # Lawn Fertilization → Yard
    '69d1822df3b2afb229b5baf0': '69d09c14d5ee9e7be9aa301d',  # Golf Rentals → Golf
    '69d1822df3b2afb229b5bafc': '69d09c14d5ee9e7be9aa301f',  # Barber/Stylist → Personal Care
    '69d1822df3b2afb229b5baff': '69d09c14d5ee9e7be9aa301f',  # Home Health Aides → Personal Care
    '69d1822df3b2afb229b5bb01': '69d09c14d5ee9e7be9aa301f',  # Personal Trainers → Personal Care
    '69d1822df3b2afb229b5baec': '69d09c14d5ee9e7be9aa301c',  # Landscaping → Yard
    '69d1822df3b2afb229b5baf6': '69d09c14d5ee9e7be9aa301d',  # Golf Tires → Golf
    '69d1822df3b2afb229b5bafd': '69d09c14d5ee9e7be9aa301f',  # Nail Tech → Personal Care
    '69d1822df3b2afb229b5bafe': '69d09c14d5ee9e7be9aa301f',  # Spa Services → Personal Care
    '69d1822df3b2afb229b5bb10': '69d181fe57b60e0aecf4067e',  # Legal → Professional
    '69d1822df3b2afb229b5baed': '69d09c14d5ee9e7be9aa301c',  # Hardscaping → Yard
    '69d1822df3b2afb229b5bb04': '69d09c14d5ee9e7be9aa3020',  # Grooming → Pets
    '69d1822df3b2afb229b5bb06': '69d09c14d5ee9e7be9aa3020',  # Pet Training → Pets
    '69d1822df3b2afb229b5bb0c': '69d09c14d5ee9e7be9aa3021',  # Courier → Moving
    '69d1822df3b2afb229b5baf3': '69d09c14d5ee9e7be9aa301d',  # Golf Lighting → Golf
    '69d1822df3b2afb229b5bb02': '69d09c14d5ee9e7be9aa301f',  # Makeup Artists → Personal Care
    '69d1822df3b2afb229b5bada': '69d09c14d5ee9e7be9aa301b',  # Window Install → Home Services
    '69d1822df3b2afb229b5badb': '69d09c14d5ee9e7be9aa301b',  # HVAC → Home Services
    '69d1822df3b2afb229b5bae1': '69d181fe57b60e0aecf4067d',  # Appliance Repair → Home Systems
    '69d1822df3b2afb229b5bae7': '69d09c14d5ee9e7be9aa301c',  # Lawn Mowing → Yard
    '69d1822df3b2afb229b5bade': '69d09c14d5ee9e7be9aa301b',  # Handyman → Home Services
    '69d1822df3b2afb229b5bae0': '69d181fe57b60e0aecf4067d',  # Pest Control → Home Systems
    '69d1822df3b2afb229b5bae5': '69d181fe57b60e0aecf4067d',  # Smart Home → Home Systems
    '69d1822df3b2afb229b5bad8': '69d09c14d5ee9e7be9aa301b',  # Painting → Home Services
    '69d1822df3b2afb229b5badf': '69d09c14d5ee9e7be9aa301b',  # Security & Home Watch → Home Services
    '69d1822df3b2afb229b5badd': '69d09c14d5ee9e7be9aa301b',  # Roofing → Home Services
    '69d1822df3b2afb229b5bae6': '69d181fe57b60e0aecf4067d',  # Pool & Spa → Home Systems
    '69d1822df3b2afb229b5bad6': '69d09c14d5ee9e7be9aa301b',  # General Repairs → Home Services
    '69d1822df3b2afb229b5bad7': '69d09c14d5ee9e7be9aa301b',  # Cleaning Services → Home Services
    '69d1822df3b2afb229b5bae3': '69d09c14d5ee9e7be9aa301b',  # Flooring → Home Services
    '69d1822df3b2afb229b5bae8': '69d09c14d5ee9e7be9aa301c',  # Sod Installation → Yard
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

# Providers from the read_entities call - paste the key ones we got
# I'll simulate this by saving the structured data
providers_data = []

# Read from a saved file if available
try:
    with open('/app/live_providers.json', 'r') as f:
        providers_data = json.load(f)
    print(f"Loaded {len(providers_data)} providers from file")
except:
    print("No saved provider file - need to load from API")

