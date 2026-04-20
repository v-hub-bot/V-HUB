import subprocess, json, random

# All new providers (from recent batch additions) with emails that need welcome emails
# These all have notes=None meaning no welcome sent yet
new_providers = [
    {"vh": "VH-9320", "name": "The Villages Golf Cars", "email": "", "id": "69e5aec329e0f634097b525f"},
    {"vh": "VH-1419", "name": "All About Carts", "email": "", "id": "69e5aec329e0f634097b5260"},
    {"vh": "VH-2770", "name": "CartFixer Mobile Golf Cart Repair", "email": "cartfixer@gmail.com", "id": "69e5aec329e0f634097b5261"},
    {"vh": "VH-2529", "name": "The Villages Outdoor", "email": "TheVillagesOutdoor@TheVillages.com", "id": "69e5aec329e0f634097b5263"},
    {"vh": "VH-4124", "name": "Battery Boys", "email": "brad@batteryboys.us", "id": "69e5aec329e0f634097b5264"},
    {"vh": "VH-2835", "name": "Angela Perez Landscaping", "email": "angelaperezlandscaping@gmail.com", "id": "69e5ade60db31f5a4e76e99b"},
    {"vh": "VH-6591", "name": "Finney's Professional Services", "email": "Fppw92@gmail.com", "id": "69e5ade60db31f5a4e76e99c"},
    {"vh": "VH-1063", "name": "West Orange Roofing", "email": "info@westorangeroofing.com", "id": "69e5ade60db31f5a4e76e99e"},
    {"vh": "VH-1754", "name": "Q Services LLC", "email": "info@qservicesllc.com", "id": "69e5ade60db31f5a4e76e9a0"},
    {"vh": "VH-3642", "name": "Windows of Central Florida", "email": "windowsofcfl@gmail.com", "id": "69e5ade60db31f5a4e76e9a1"},
    {"vh": "VH-1817", "name": "A-1 Devon Irrigation", "email": "devonirrigation@gmail.com", "id": "69e5ade60db31f5a4e76e9a4"},
    {"vh": "VH-3968", "name": "Exterior Experts LLC", "email": "info@eehousewashing.com", "id": "69e5ad490db31f5a4e76e950"},
    {"vh": "VH-3005", "name": "Thomas's Handyman Service", "email": "hello@thomashandymanservice.com", "id": "69e5ad490db31f5a4e76e951"},
    {"vh": "VH-0455", "name": "VillagersHome WatchPlus", "email": "randyk053@gmail.com", "id": "69e5ad490db31f5a4e76e954"},
    {"vh": "VH-3076", "name": "D&D Golf Cart Rentals LLC", "email": "ddcartrentals@yahoo.com", "id": "69e5ad490db31f5a4e76e955"},
    {"vh": "VH-5353", "name": "Advanced Pool & Spa Sales", "email": "advancedcompanies@yahoo.com", "id": "69e5ad280db31f5a4e76e934"},
    {"vh": "VH-6440", "name": "Ramsey's Pressure Washing", "email": "", "id": ""},  # no email
    {"vh": "VH-6435", "name": "Sunshine Awnings", "email": "sellarspatch@aol.com", "id": ""},
    {"vh": "VH-8699", "name": "J.A. Pavers LLC", "email": "japavers@gmail.com", "id": ""},
    {"vh": "VH-8388", "name": "Helping Hand Moving Services", "email": "Helpinghandmovingservices@gmail.com", "id": ""},
    {"vh": "VH-5138", "name": "Craine-N-Sons", "email": "crainesmoving@gmail.com", "id": ""},
    {"vh": "VH-9777", "name": "McWilliams Painting", "email": "mcwilliamspaintingplus@gmail.com", "id": ""},
    {"vh": "VH-5995", "name": "Premier Painting — Call Trina", "email": "", "id": ""},  # no email found
    {"vh": "VH-8683", "name": "AB Landscaping & Tree Services LLC", "email": "ablandscaping04@gmail.com", "id": ""},
    {"vh": "VH-3424", "name": "Hector Damas Landscaping", "email": "harlidamas37@gmail.com", "id": ""},
    {"vh": "VH-0006", "name": "S&W Roofing LLC", "email": "Hello@SWRoofingLLC.com", "id": ""},
]

# Filter only those with emails
with_email = [p for p in new_providers if p["email"]]
no_email = [p for p in new_providers if not p["email"]]

print("Will send to:", len(with_email))
print("No email:", [p["vh"] for p in no_email])
for p in with_email:
    print(f"  {p['vh']} | {p['name']} | {p['email']}")
