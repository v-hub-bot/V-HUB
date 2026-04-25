#!/bin/bash

# Send welcome email to provider when approved
EMAIL="$1"
VH_NUMBER="$2"
OWNER_NAME="$3"
BUSINESS_NAME="$4"

SENDGRID_API_KEY="${SENDGRID_API_KEY}"
DASHBOARD_URL="https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard"

# Create JSON payload using Python to handle escaping properly
python3 << 'PYSCRIPT'
import json
import os
import subprocess

email = os.environ.get('EMAIL')
vh_number = os.environ.get('VH_NUMBER')
owner_name = os.environ.get('OWNER_NAME')
business_name = os.environ.get('BUSINESS_NAME')
dashboard_url = os.environ.get('DASHBOARD_URL')
sendgrid_key = os.environ.get('SENDGRID_API_KEY')

html_body = f"""<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <h2 style="color: #E8431A;">Welcome to V-HUB, {owner_name}!</h2>
  <p>Your listing for <strong>{business_name}</strong> has been approved and is now live in The Villages directory.</p>

  <h3 style="color: #00BFA5;">Your Account Information</h3>
  <ul style="font-size: 16px;">
    <li><strong>Account Number:</strong> {vh_number}</li>
    <li><strong>Email:</strong> {email}</li>
  </ul>

  <h3 style="color: #00BFA5;">Access Your Provider Hub</h3>
  <p>Visit your Provider Hub to manage your profile, view customer leads, and track your analytics:</p>
  <p><a href="{dashboard_url}" style="background-color: #E8431A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Provider Hub</a></p>

  <h3 style="color: #00BFA5;">How to Sign In</h3>
  <ol>
    <li>Visit the link above or go to {dashboard_url}</li>
    <li>Click <strong>"Provider Hub"</strong> to access the login page</li>
    <li>Sign in using either:
      <ul>
        <li>Your account number: <strong>{vh_number}</strong></li>
        <li>Your email: <strong>{email}</strong></li>
      </ul>
    </li>
    <li>Enter the password you created during signup</li>
    <li>You're in! Manage your profile and view customer inquiries</li>
  </ol>

  <h3 style="color: #00BFA5;">Your Free Trial</h3>
  <p>You have a 45-day free trial to explore all features. After that, your account will be $12/month to stay listed.</p>

  <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666;">
    If you have any questions, reply to this email or contact us at <strong>admin@v-hub.us</strong>.
  </p>
  <p style="color: #666;">Welcome to The Villages' trusted local directory! 🏘️</p>
</div>"""

payload = {
  "personalizations": [
    {
      "to": [{"email": email, "name": owner_name}],
      "subject": f"Welcome to V-HUB, {business_name}! Your Account is Live"
    }
  ],
  "from": {"email": "admin@v-hub.us", "name": "V-HUB"},
  "content": [
    {
      "type": "text/html",
      "value": html_body
    }
  ]
}

# Send via curl
json_str = json.dumps(payload)
result = subprocess.run([
  'curl', '-X', 'POST', 'https://api.sendgrid.com/v3/mail/send',
  '-H', f'Authorization: Bearer {sendgrid_key}',
  '-H', 'Content-Type: application/json',
  '-d', json_str
], capture_output=True, text=True)

print(f"✓ Email sent to {email}")
PYSCRIPT

