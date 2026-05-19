# V-HUB Banned Provider List

Providers permanently banned from the V-HUB directory. If any name, email, or phone matches on a new signup, immediately alert kimberlycook1980@gmail.com.

## Banned Individuals

### 1. Karmen Becker / Karmen Madden
- **Emails:** karmenmaddog@gmail.com, martinezweedcontrol@gmail.com
- **Phones:** 352-261-9825, 352-246-0789
- **Business names:** Karmen's Weed Control, Karmen Madden - Weed & Lawn Care, Martinez Weed Control
- **Reason:** Previously removed from directory. Do not re-admit under any name or alias.

### 2. Jerome Robinson
- **Name:** Jerome Robinson
- **Business:** Handyman services (no formal business name known)
- **Location:** The Villages, FL area
- **Email:** unknown
- **Phone:** unknown
- **Reason:** Consumer complaint — hired to repair a roof fan, quoted 2 hours, ran 7 hours + $125 part (~$1,100 total). Fan stopped working the next day. Refused to stand behind his work. Complaint publicly posted in The Villages Florida Community Facebook group. Added to ban list: May 19, 2026.

## Instructions for Ban Check Automation
On every new Provider signup (entity create event), check:
- owner_name contains any banned name (case-insensitive)
- email matches any banned email
- phone matches any banned phone

If match found → immediately email kimberlycook1980@gmail.com with full provider details and reason for flag.
