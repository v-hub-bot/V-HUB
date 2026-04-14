// Legacy short codes mapped to service names based on the old numbering system
// Derived from the actual Service records in the DB

// Real service IDs from DB (fetched above):
const realServices = {
  "Painting (Interior/Exterior)": "69d1822df3b2afb229b5bad8",
  "Cleaning Services (Home & Pool)": "69d1822df3b2afb229b5bad7",
  "General Repairs": "69d1822df3b2afb229b5bad6",
  "Home Improvements": "69d1822df3b2afb229b5bad5",
  "Window Installation/Repair": "69d1822df3b2afb229b5bada",
  "HVAC": "69d1822df3b2afb229b5badb",
  "Plumbing": "69d1822df3b2afb229b5badc",
  "Roofing": "69d1822df3b2afb229b5badd",
  "Garage Door Services": "69d1822df3b2afb229b5bad9",
  "Handyman Services": "69d1822df3b2afb229b5bade",
  "Security & Home Watch": "69d1822df3b2afb229b5badf",
  "Pest Control": "69d1822df3b2afb229b5bae0",
  "Appliance Repair": "69d1822df3b2afb229b5bae1",
  "Electrical & Lighting": "69d1822df3b2afb229b5bae2",
  "Flooring (Tile, Wood, Carpet)": "69d1822df3b2afb229b5bae3",
  "Home Organization": "69d1822df3b2afb229b5bae4",
  "Smart Home Installation": "69d1822df3b2afb229b5bae5",
  "Pool & Spa Services": "69d1822df3b2afb229b5bae6",
  "Lawn Mowing": "69d1822df3b2afb229b5bae7",
  "Sod Installation": "69d1822df3b2afb229b5bae8",
  "Tree Trimming & Pruning/Removal": "69d1822df3b2afb229b5bae9",
  "Lawn Fertilization": "69d1822df3b2afb229b5baea",
  "Landscaping": "69d1822df3b2afb229b5baec",
  "Hardscaping": "69d1822df3b2afb229b5baed",
  "Pressure Washing": "69d1822df3b2afb229b5baee",
  "Driveway Repair/Cleaning/Painting": "69d1822df3b2afb229b5baef",
  "Irrigation/Sprinkler Services": "69d1822df3b2afb229b5baeb",
  "Hair Stylists": "69d1822df3b2afb229b5bafc",
  "Nail Technicians": "69d1822df3b2afb229b5bafd",
  "Spa Services": "69d1822df3b2afb229b5bafe",
  "Home Health Aides": "69d1822df3b2afb229b5baff",
  "Massage Therapists": "69d1822df3b2afb229b5bb00",
  "Personal Trainers": "69d1822df3b2afb229b5bb01",
  "Makeup Artists": "69d1822df3b2afb229b5bb02",
  "Veterinary Services": "69d1822df3b2afb229b5bb03",
  "Grooming": "69d1822df3b2afb229b5bb04",
  "Pet Sitting/Walking": "69d1822df3b2afb229b5bb05",
  "Pet Training": "69d1822df3b2afb229b5bb06",
  "Mobile Grooming": "69d1822df3b2afb229b5bb07",
  "Medical Transport": "69d1822df3b2afb229b5bb08",
  "Airport Transport": "69d1822df3b2afb229b5bb09",
  "Local Rides": "69d1822df3b2afb229b5bb0a",
  "Errand Services": "69d1822df3b2afb229b5bb0b",
  "Courier/Delivery Services": "69d1822df3b2afb229b5bb0c",
  "Accounting & Bookkeeping": "69d1822df3b2afb229b5bb0d",
  "Notary Services": "69d1822df3b2afb229b5bb0e",
  "IT Support": "69d1822df3b2afb229b5bb0f",
  "Legal Services": "69d1822df3b2afb229b5bb10",
  "Business Consulting": "69d1822df3b2afb229b5bb11",
  "Tax Preparation": "69d1822df3b2afb229b5bb12",
  "Rentals": "69d1822df3b2afb229b5baf0",
  "Repairs": "69d1822df3b2afb229b5baf1",
  "Detailing": "69d1822df3b2afb229b5baf2",
  "Improvements/Customizations": "69d1822df3b2afb229b5baf4",
  "Lighting Upgrades": "69d1822df3b2afb229b5baf3",
  "Battery Replacement": "69d1822df3b2afb229b5baf5",
  "Tire Services (Golf Cart)": "69d1822df3b2afb229b5baf6",
  "Auto Detailing": "69d1822df3b2afb229b5baf8",
  "Auto Repairs": "69d1822df3b2afb229b5baf7",
  "Oil Changes": "69d1822df3b2afb229b5baf9",
  "Mobile Mechanic": "69d1822df3b2afb229b5bafb",
  "Tire Services (Auto)": "69d1822df3b2afb229b5bafa",
};

// Legacy short code map - based on old sequential numbering
// s1-s17 = Home Services, s18-s26 = Lawn/Outdoor, s27-s36 = Golf Cart, 
// s37-s45 = Personal Care, s46-s51 = Pets, s52-s56 = Transport, s57-s63 = Professional, s64+ = pool/home
const legacyMap = {
  "s1": "69d1822df3b2afb229b5bad5",   // Home Improvements
  "s2": "69d1822df3b2afb229b5bad6",   // General Repairs
  "s3": "69d1822df3b2afb229b5bad7",   // Cleaning Services
  "s4": "69d1822df3b2afb229b5bad8",   // Painting
  "s5": "69d1822df3b2afb229b5bad9",   // Garage Door
  "s6": "69d1822df3b2afb229b5bada",   // Window Installation
  "s7": "69d1822df3b2afb229b5badb",   // HVAC
  "s8": "69d1822df3b2afb229b5badc",   // Plumbing
  "s9": "69d1822df3b2afb229b5badd",   // Roofing
  "s10": "69d1822df3b2afb229b5bade",  // Handyman
  "s11": "69d1822df3b2afb229b5badf",  // Security
  "s12": "69d1822df3b2afb229b5bae0",  // Pest Control
  "s13": "69d1822df3b2afb229b5bae1",  // Appliance Repair
  "s14": "69d1822df3b2afb229b5bae2",  // Electrical
  "s15": "69d1822df3b2afb229b5bae3",  // Flooring
  "s16": "69d1822df3b2afb229b5bae4",  // Home Organization
  "s17": "69d1822df3b2afb229b5bae5",  // Smart Home
  "s18": "69d1822df3b2afb229b5bae6",  // Pool & Spa
  "s19": "69d1822df3b2afb229b5bae7",  // Lawn Mowing
  "s20": "69d1822df3b2afb229b5bae8",  // Sod Installation
  "s21": "69d1822df3b2afb229b5bae9",  // Tree Trimming
  "s22": "69d1822df3b2afb229b5baea",  // Lawn Fertilization
  "s23": "69d1822df3b2afb229b5baeb",  // Irrigation
  "s24": "69d1822df3b2afb229b5baec",  // Landscaping
  "s25": "69d1822df3b2afb229b5baed",  // Hardscaping
  "s26": "69d1822df3b2afb229b5baee",  // Pressure Washing
  "s27": "69d1822df3b2afb229b5baef",  // Driveway Repair
  "s28": "69d1822df3b2afb229b5baf0",  // Rentals (golf cart)
  "s29": "69d1822df3b2afb229b5baf1",  // Repairs (golf cart)
  "s30": "69d1822df3b2afb229b5baf2",  // Detailing (golf cart)
  "s31": "69d1822df3b2afb229b5baf3",  // Lighting Upgrades
  "s32": "69d1822df3b2afb229b5baf4",  // Improvements/Customizations
  "s33": "69d1822df3b2afb229b5baf5",  // Battery Replacement
  "s34": "69d1822df3b2afb229b5baf6",  // Tire Services (golf cart)
  "s35": "69d1822df3b2afb229b5baf7",  // Auto Repairs
  "s36": "69d1822df3b2afb229b5baf8",  // Auto Detailing
  "s37": "69d1822df3b2afb229b5baf9",  // Oil Changes
  "s38": "69d1822df3b2afb229b5bafa",  // Tire Services (auto)
  "s39": "69d1822df3b2afb229b5bafb",  // Mobile Mechanic
  "s40": "69d1822df3b2afb229b5bafc",  // Hair Stylists
  "s41": "69d1822df3b2afb229b5bafd",  // Nail Technicians
  "s42": "69d1822df3b2afb229b5bafe",  // Spa Services
  "s43": "69d1822df3b2afb229b5baff",  // Home Health Aides
  "s44": "69d1822df3b2afb229b5bb00",  // Massage Therapists
  "s45": "69d1822df3b2afb229b5bb01",  // Personal Trainers
  "s46": "69d1822df3b2afb229b5bb02",  // Makeup Artists
  "s47": "69d1822df3b2afb229b5bb03",  // Veterinary Services
  "s48": "69d1822df3b2afb229b5bb04",  // Grooming (pets)
  "s49": "69d1822df3b2afb229b5bb05",  // Pet Sitting/Walking
  "s50": "69d1822df3b2afb229b5bb06",  // Pet Training
  "s51": "69d1822df3b2afb229b5bb07",  // Mobile Grooming
  "s52": "69d1822df3b2afb229b5bb08",  // Medical Transport
  "s53": "69d1822df3b2afb229b5bb09",  // Airport Transport
  "s54": "69d1822df3b2afb229b5bb0a",  // Local Rides
  "s55": "69d1822df3b2afb229b5bb0b",  // Errand Services
  "s56": "69d1822df3b2afb229b5bb0c",  // Courier/Delivery
  "s57": "69d1822df3b2afb229b5bb0d",  // Accounting
  "s58": "69d1822df3b2afb229b5bb0e",  // Notary
  "s59": "69d1822df3b2afb229b5bb0f",  // IT Support
  "s60": "69d1822df3b2afb229b5bb10",  // Legal Services
  "s61": "69d1822df3b2afb229b5bb11",  // Business Consulting
  "s62": "69d1822df3b2afb229b5bb12",  // Tax Preparation
  "s63": "69d1822df3b2afb229b5bae6",  // Pool & Spa (alt)
  "s64": "69d1822df3b2afb229b5bae6",  // Pool & Spa Services
};

console.log(JSON.stringify(legacyMap, null, 2));
