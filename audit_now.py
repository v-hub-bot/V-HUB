import json, sys

# All providers from last read - let me use what we know from the Service entity
# Key category and service IDs
CAT_HOME_SERVICES = '69d09c14d5ee9e7be9aa301b'
CAT_HOME_SYSTEMS = '69d181fe57b60e0aecf4067d'
CAT_YARD = '69d09c14d5ee9e7be9aa301c'
CAT_GOLF = '69d09c14d5ee9e7be9aa301d'
CAT_AUTO = '69d09c14d5ee9e7be9aa301e'
CAT_PERSONAL = '69d09c14d5ee9e7be9aa301f'
CAT_PETS = '69d09c14d5ee9e7be9aa3020'
CAT_MOVING = '69d09c14d5ee9e7be9aa3021'
CAT_PROFESSIONAL = '69d181fe57b60e0aecf4067e'

# Service IDs and their correct category
SVC_TO_CORRECT_CAT = {
    # Home Systems & Utilities
    '69d1822df3b2afb229b5bae6': CAT_HOME_SYSTEMS,  # Pool & Spa
    '69d1822df3b2afb229b5bae2': CAT_HOME_SYSTEMS,  # Electrical
    '69d1822df3b2afb229b5bae7': CAT_HOME_SYSTEMS,  # Pest Control
    '69d1822df3b2afb229b5bae8': CAT_HOME_SYSTEMS,  # Home Watch/Security
    '69d1822df3b2afb229b5bae4': CAT_HOME_SYSTEMS,  # Appliance Repair
    '69d1822df3b2afb229b5bae5': CAT_HOME_SYSTEMS,  # Alarm/Security systems
    # Home Services  
    '69d1822df3b2afb229b5badb': CAT_HOME_SERVICES,  # HVAC
    '69d1822df3b2afb229b5badc': CAT_HOME_SERVICES,  # Plumbing
    '69d1822df3b2afb229b5badd': CAT_HOME_SERVICES,  # Roofing
    '69d1822df3b2afb229b5bade': CAT_HOME_SERVICES,  # Handyman
    '69d1822df3b2afb229b5bae3': CAT_HOME_SERVICES,  # Flooring
    '69d1822df3b2afb229b5bad8': CAT_HOME_SERVICES,  # Painting
    '69d1822df3b2afb229b5bad7': CAT_HOME_SERVICES,  # Cleaning
    '69d1822df3b2afb229b5bad5': CAT_HOME_SERVICES,  # General Remodeling
    '69d1822df3b2afb229b5bad6': CAT_HOME_SERVICES,  # Repairs
    '69d1822df3b2afb229b5bad9': CAT_HOME_SERVICES,  # Window/Gutter
    '69d1822df3b2afb229b5bada': CAT_HOME_SERVICES,  # Screen/Enclosure
    '69d1822df3b2afb229b5badf': CAT_HOME_SERVICES,  # Fence/Gate
    '69d1822df3b2afb229b5baee': CAT_HOME_SERVICES,  # Pressure Washing (home)
    # Yard & Outdoor
    '69d1822df3b2afb229b5bae9': CAT_YARD,  # Lawn Mowing
    '69d1822df3b2afb229b5baea': CAT_YARD,  # Landscaping
    '69d1822df3b2afb229b5baeb': CAT_YARD,  # Irrigation/Sprinklers
    '69d1822df3b2afb229b5baec': CAT_YARD,  # Tree Services
    '69d1822df3b2afb229b5baed': CAT_YARD,  # Outdoor/Patio
    # Auto
    '69d1822df3b2afb229b5baf7': CAT_AUTO,
    '69d1822df3b2afb229b5baf8': CAT_AUTO,
    '69d1822df3b2afb229b5baf9': CAT_AUTO,
    '69d1822df3b2afb229b5bafa': CAT_AUTO,
    '69d1822df3b2afb229b5bafb': CAT_AUTO,
    '69d1822df3b2afb229b5bafc': CAT_AUTO,
    # Golf Carts
    '69d1822df3b2afb229b5baf0': CAT_GOLF,
    '69d1822df3b2afb229b5baf1': CAT_GOLF,
    '69d1822df3b2afb229b5baf2': CAT_GOLF,
    '69d1822df3b2afb229b5baf3': CAT_GOLF,
    '69d1822df3b2afb229b5baf4': CAT_GOLF,
    '69d1822df3b2afb229b5baf5': CAT_GOLF,
    '69d1822df3b2afb229b5baf6': CAT_GOLF,
    # Personal Care
    '69d1822df3b2afb229b5bb00': CAT_PERSONAL,
    '69d1822df3b2afb229b5bb01': CAT_PERSONAL,
    '69d1822df3b2afb229b5bb02': CAT_PERSONAL,
    '69d1822df3b2afb229b5bb03': CAT_PERSONAL,
    # Pets
    '69d1822df3b2afb229b5bb04': CAT_PETS,
    '69d1822df3b2afb229b5bb05': CAT_PETS,
    '69d1822df3b2afb229b5bb06': CAT_PETS,
    '69d1822df3b2afb229b5bb07': CAT_PETS,
    '69deb9de1564dc5386aff454': CAT_PETS,  # Extra pet service
    # Moving/Senior
    '69d1822df3b2afb229b5bb08': CAT_MOVING,
    '69d1822df3b2afb229b5bb09': CAT_MOVING,
    '69d1822df3b2afb229b5bb0a': CAT_MOVING,
    '69d1822df3b2afb229b5bb0b': CAT_MOVING,
    '69d1822df3b2afb229b5bb0c': CAT_MOVING,
    '69d1822df3b2afb229b5bb0d': CAT_MOVING,
    '69d1822df3b2afb229b5bb0e': CAT_MOVING,
    # Professional
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

print("Audit script ready. Loading providers from stdin...")
