import json

# Raw data from the query - need to filter for those with emails
providers = [
{"email":"contact@thevillagesgo.com","business_name":"The Villages Go","vh_number":"VH-2253","id":"69e5e6c3cffbf1538ff3496a"},
{"email":"rsurette@alternativehhcma.com","business_name":"Alternative Home Health Care — Medical Transport","vh_number":"VH-1414","id":"69e5e6c3cffbf1538ff3496b"},
{"email":"info@gaelynnshomecare.com","business_name":"Gaelynn's Home Care Transport","vh_number":"VH-6200","id":"69e5e6c3cffbf1538ff3496c"},
{"email":"support@floridacouriers.com","business_name":"Florida Couriers — The Villages","vh_number":"VH-4290","id":"69e5e6c3cffbf1538ff3496d"},
{"email":"info@villagesav.com","business_name":"Villages AV — Smart Home Installation","vh_number":"VH-8167","id":"69e5e6c3cffbf1538ff3496e"},
{"email":"info@galaxyhomesolutions.com","business_name":"Galaxy Home Solutions","vh_number":"VH-4868","id":"69e5e6c3cffbf1538ff3496f"},
{"email":"support@vivint.com","business_name":"Vivint Smart Home — The Villages","vh_number":"VH-5622","id":"69e5e6c3cffbf1538ff34970"},
{"email":"makeroomwithrenee@gmail.com","business_name":"Make Room with Renée","vh_number":"VH-5231","id":"69e5e6c3cffbf1538ff34971"},
{"email":"MQorganize@gmail.com","business_name":"Professional Organizer of The Villages — Margey","vh_number":"VH-7064","id":"69e5e6c3cffbf1538ff34972"},
{"email":"kimberly@abundantlifeorganizing.com","business_name":"Abundant Life Organizing","vh_number":"VH-6864","id":"69e5e6c3cffbf1538ff34973"},
{"email":"eric@millhornlaw.com","business_name":"Millhorn Law Firm","vh_number":"VH-3933","id":"69e5e6c3cffbf1538ff34974"},
{"email":"info@bcnlawfirm.com","business_name":"BCN Law Firm — The Villages","vh_number":"VH-4739","id":"69e5e6c3cffbf1538ff34975"},
{"email":"fisherlawservice@gmail.com","business_name":"Attorney Fisher — The Villages","vh_number":"VH-3411b","id":"69e5e6c3cffbf1538ff34976"},
{"email":"info@northstarusa.com","business_name":"NorthStar Business Consultants","vh_number":"VH-9681","id":"69e5e6c3cffbf1538ff34977"},
{"email":"info@holisticbusinessconsultants.com","business_name":"Holistic Business Consultants","vh_number":"VH-2163","id":"69e5e6c3cffbf1538ff34978"},
{"email":"info@liquidlightsleds.com","business_name":"Liquid Lights — Golf Cart LED","vh_number":"VH-3065","id":"69e5e6c3cffbf1538ff34979"},
{"email":"info@bestgolfbattery.com","business_name":"BEST Battery — Golf Cart Accessories & Lighting","vh_number":"VH-5582","id":"69e5e6c3cffbf1538ff3497a"},
{"email":"jbgolfcartsllc@gmail.com","business_name":"JB Golf Carts — Lighting & Custom Upgrades","vh_number":"VH-2882","id":"69e5e6c3cffbf1538ff3497b"},
{"email":"Alec@chessarisod.com","business_name":"Chessari Sod & Landscaping","vh_number":"VH-7426","id":"69e5d39da3b4c49d1bdfb6b5"},
{"email":"TheVillages@thesodlot.com","business_name":"The Sod Lot — The Villages","vh_number":"VH-4703","id":"69e5d39da3b4c49d1bdfb6b6"},
{"email":"thevillagesfertigator@gmail.com","business_name":"Fertigator Lawn Care","vh_number":"VH-2867","id":"69e5d39da3b4c49d1bdfb6b7"},
{"email":"Fernviewnursery@aol.com","business_name":"Fernview Farm Lawn Fertilization","vh_number":"VH-7905","id":"69e5d39da3b4c49d1bdfb6b8"},
{"email":"info@innovativeconcretefl.com","business_name":"Innovative Concrete FL","vh_number":"VH-3800","id":"69e5d39da3b4c49d1bdfb6ba"},
{"email":"contact@instantcarfix.com","business_name":"Local Mobile Mechanic — The Villages","vh_number":"VH-6477","id":"69e5d39da3b4c49d1bdfb6bb"},
{"email":"info@hemacpa.com","business_name":"Hema Rupnarain CPA PA","vh_number":"VH-9880","id":"69e5d374a3b4c49d1bdfb68f"},
{"email":"info@villagetaxusa.com","business_name":"Village Tax & Accounting Solutions LLC","vh_number":"VH-7053","id":"69e5d374a3b4c49d1bdfb690"},
{"email":"jh.dki@jhnet.com","business_name":"Jackson Hewitt Tax Service — The Villages","vh_number":"VH-3040","id":"69e5d374a3b4c49d1bdfb691"},
{"email":"info@villagesnotary.com","business_name":"Villages Notary","vh_number":"VH-6600","id":"69e5d374a3b4c49d1bdfb692"},
{"email":"elisac06@aol.com","business_name":"Elise's Mobile Notary","vh_number":"VH-1428","id":"69e5d374a3b4c49d1bdfb693"},
{"email":"myvillagesnotary@gmail.com","business_name":"The Villages Mobile Notary","vh_number":"VH-1231","id":"69e5d374a3b4c49d1bdfb694"},
{"email":"support@pcwizardsthevillages.com","business_name":"PC Wizards — The Villages","vh_number":"VH-4293","id":"69e5d374a3b4c49d1bdfb695"},
{"email":"joe@computercentralfl.com","business_name":"Computer Central FL","vh_number":"VH-3855","id":"69e5d374a3b4c49d1bdfb696"},
{"email":"steve@villagescomputerguy.com","business_name":"The Villages Computer Guy","vh_number":"VH-4672","id":"69e5d374a3b4c49d1bdfb697"},
{"email":"Info@campbellsk9s.com","business_name":"Campbells Canine Training","vh_number":"VH-4887","id":"69e5d374a3b4c49d1bdfb698"},
{"email":"catzk9@gmail.com","business_name":"Cat the Dog Trainer","vh_number":"VH-7347","id":"69e5d374a3b4c49d1bdfb699"},
{"email":"NikiTudge@DogSmith.com","business_name":"DogSmith — The Villages","vh_number":"VH-5060","id":"69e5d374a3b4c49d1bdfb69a"},
{"email":"Hello@thedogtrainingspot.com","business_name":"The Dog Training Spot LLC","vh_number":"VH-7540","id":"69e5d374a3b4c49d1bdfb69b"},
{"email":"thevillages@barkbusters.com","business_name":"Bark Busters — The Villages","vh_number":"VH-2275","id":"69e5d374a3b4c49d1bdfb69c"},
{"email":"pawsanimalhosp@gmail.com","business_name":"Paws Animal Hospital — Home Vet Calls","vh_number":"VH-2439","id":"69e5d374a3b4c49d1bdfb69d"},
{"email":"info@happyhomepetcare.com","business_name":"Happy Home Pet Care","vh_number":"VH-6524","id":"69e5d374a3b4c49d1bdfb69e"},
{"email":"thevillages@seniorhelpers.com","business_name":"Senior Helpers — The Villages","vh_number":"VH-3232","id":"69e5d374a3b4c49d1bdfb6a0"},
{"email":"bertram@bertrampest.com","business_name":"Bertram Pest Solutions","vh_number":"VH-6051","id":"69e5d337a3b4c49d1bdfb673"},
{"email":"wecare@masseyservices.com","business_name":"Massey Services — The Villages","vh_number":"VH-9991","id":"69e5d337a3b4c49d1bdfb674"},
{"email":"michaelstermiteandpest@gmail.com","business_name":"Michael's Termite & Pest Control","vh_number":"VH-4783","id":"69e5d337a3b4c49d1bdfb675"},
{"email":"info@merylspestcontrolservice.com","business_name":"Meryl's Pest Control Service","vh_number":"VH-1977","id":"69e5d337a3b4c49d1bdfb676"},
{"email":"info@agoodneighborfl.com","business_name":"A Good Neighbor Pest & Pool","vh_number":"VH-5799","id":"69e5d337a3b4c49d1bdfb677"},
{"email":"chuckie1960@icloud.com","business_name":"Appliance Repair Specialists — The Villages","vh_number":"VH-1859","id":"69e5d337a3b4c49d1bdfb678"},
{"email":"Villagesappliancerepair@gmail.com","business_name":"Villages Refrigerator & Appliance Repair","vh_number":"VH-3411","id":"69e5d337a3b4c49d1bdfb679"},
{"email":"incredible17x@gmail.com","business_name":"Bob's Appliance Repair","vh_number":"VH-7100","id":"69e5d337a3b4c49d1bdfb67a"},
{"email":"info@jonathansappliance.com","business_name":"Jonathan's Appliance Services","vh_number":"VH-5629b","id":"69e5d337a3b4c49d1bdfb67b"},
{"email":"jeffrapier76@gmail.com","business_name":"Jeff's Appliance Service","vh_number":"VH-6518","id":"69e5d337a3b4c49d1bdfb67c"},
{"email":"office@JJElectricians.com","business_name":"JJ Electricians LLC","vh_number":"VH-2680","id":"69e5d337a3b4c49d1bdfb67d"},
{"email":"fceelectric@gmail.com","business_name":"Family's Choice Electrical Repair","vh_number":"VH-3794","id":"69e5d337a3b4c49d1bdfb67e"},
{"email":"Gary@sunstatepower.com","business_name":"Sunstate Power — The Villages","vh_number":"VH-5010","id":"69e5d337a3b4c49d1bdfb67f"},
{"email":"info@mikescottplumbing.com","business_name":"Mike Scott Plumbing — The Villages","vh_number":"VH-9111","id":"69e5d307a3b4c49d1bdfb65f"},
{"email":"johnsonbrothersplumbing@gmail.com","business_name":"Johnson Brothers Plumbing","vh_number":"VH-2088","id":"69e5d307a3b4c49d1bdfb660"},
{"email":"reception@millerandsonsplumbing.net","business_name":"Miller & Sons Plumbing","vh_number":"VH-5533","id":"69e5d307a3b4c49d1bdfb661"},
{"email":"info@msaccfl.com","business_name":"M&S Air Conditioning","vh_number":"VH-9178","id":"69e5d307a3b4c49d1bdfb662"},
{"email":"info@desantisac.com","business_name":"DeSantis AC & Appliances","vh_number":"VH-5700","id":"69e5d307a3b4c49d1bdfb663"},
{"email":"info@diamondgac.com","business_name":"Diamond G AC & Heating","vh_number":"VH-2967","id":"69e5d307a3b4c49d1bdfb664"},
{"email":"info@garagedoorsthevillages.com","business_name":"Garage Doors The Villages","vh_number":"VH-8986","id":"69e5d307a3b4c49d1bdfb665"},
{"email":"info@veteransgds.com","business_name":"Veterans Garage Door","vh_number":"VH-3925","id":"69e5d307a3b4c49d1bdfb666"},
{"email":"info@expertsgaragedoor.com","business_name":"Experts Garage Door Service","vh_number":"VH-6819","id":"69e5d307a3b4c49d1bdfb667"},
{"email":"info@mrfixitdoors.com","business_name":"Mr. Fix It Garage Doors","vh_number":"VH-5025","id":"69e5d307a3b4c49d1bdfb668"},
{"email":"info@village.cleaning","business_name":"The Villages Cleaning Co.","vh_number":"VH-3310","id":"69e5d307a3b4c49d1bdfb66a"},
{"email":"info@groometransportation.com","business_name":"Groome Transportation — The Villages","vh_number":"VH-9664","id":"69e5d2e4a3b4c49d1bdfb649"},
{"email":"info@bluelineservicesfl.com","business_name":"Blue Line Transportation Services","vh_number":"VH-3912","id":"69e5d2e4a3b4c49d1bdfb64b"},
{"email":"info@villagevip.net","business_name":"VIP Transportation Group","vh_number":"VH-8275","id":"69e5d2e4a3b4c49d1bdfb64c"},
{"email":"info@carttocarsdetailing.com","business_name":"Cart To Cars Mobile Detailing","vh_number":"VH-6966","id":"69e5d2d1a3b4c49d1bdfb63c"},
{"email":"info@doorstep-detail.com","business_name":"Doorstep Detail Inc.","vh_number":"VH-5629","id":"69e5d2d1a3b4c49d1bdfb63e"},
{"email":"sparkleeffectdetailing@gmail.com","business_name":"Sparkle Effect Mobile Detailing","vh_number":"VH-1974","id":"69e5d2d1a3b4c49d1bdfb63f"},
{"email":"info@signaturecartdetailing.com","business_name":"Signature Cart Detailing","vh_number":"VH-8782","id":"69e5d2d1a3b4c49d1bdfb641"},
{"email":"info@healinghandswellnessforlife.com","business_name":"Healing Hands Wellness for Life","vh_number":"VH-7506","id":"69e5d2a4a3b4c49d1bdfb620"},
{"email":"info@legacyclinicofchiropractic.com","business_name":"Legacy Clinic of Chiropractic & Massage","vh_number":"VH-2590","id":"69e5d2a4a3b4c49d1bdfb622"},
{"email":"info@comfortkeepers.com","business_name":"Comfort Keepers Home Care","vh_number":"VH-8870","id":"69e5d2a4a3b4c49d1bdfb623"},
{"email":"thevillages@visitingangels.com","business_name":"Visiting Angels — The Villages","vh_number":"VH-3702","id":"69e5d2a4a3b4c49d1bdfb624"},
{"email":"info@homewellcares.com","business_name":"HomeWell Care Services — The Villages","vh_number":"VH-3400","id":"69e5d2a4a3b4c49d1bdfb625"},
{"email":"lavienailsthevillages@gmail.com","business_name":"LaVie Nails & Spa","vh_number":"VH-5239","id":"69e5d2a4a3b4c49d1bdfb62a"},
]

# Filter only those with real emails
with_email = [p for p in providers if p.get('email') and '@' in p.get('email','')]
print(f"Providers with emails ready for self-managed: {len(with_email)}")

# Generate temp password for each
import hashlib, random, string

def gen_password():
    chars = string.ascii_letters + string.digits + "!@#"
    return ''.join(random.choices(chars, k=10))

output = []
for p in with_email:
    pw = "VHub" + ''.join(random.choices(string.digits, k=4)) + "!"
    output.append({
        "id": p["id"],
        "vh_number": p["vh_number"],
        "business_name": p["business_name"],
        "email": p["email"],
        "temp_password": pw
    })

with open('/app/self_managed_batch.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Written {len(output)} providers to self_managed_batch.json")
print("Sample:", json.dumps(output[0], indent=2))
