import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const router = express.Router();

// get a fresh access token from Salesforce using Client Credentials Flow
async function getSalesforceToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.SALESFORCE_CLIENT_ID,
    client_secret: process.env.SALESFORCE_CLIENT_SECRET,
  });

  const res = await fetch(`${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!res.ok) {
    throw new Error('Failed to authenticate with Salesforce');
  }

  return res.json(); // { access_token, instance_url, ... }
}

// create an Account + linked Contact in Salesforce for the current user
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { companyName, phone, notes } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { access_token, instance_url } = await getSalesforceToken();

    // Step 1: create the Account
    const accountRes = await fetch(`${instance_url}/services/data/v60.0/sobjects/Account`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: companyName || `${user.name} - CV Platform Account`,
      }),
    });

    if (!accountRes.ok) {
      const errBody = await accountRes.text();
      throw new Error(`Salesforce Account creation failed: ${errBody}`);
    }

    const account = await accountRes.json(); // { id, success, ... }

    // Step 2: create the Contact, linked to that Account
    const [firstName, ...rest] = (user.firstName || user.name || 'Unknown').split(' ');
    const lastName = user.lastName || rest.join(' ') || 'Candidate';

    const contactRes = await fetch(`${instance_url}/services/data/v60.0/sobjects/Contact`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FirstName: firstName,
        LastName: lastName,
        Email: user.email,
        Phone: phone || undefined,
        Description: notes || undefined,
        AccountId: account.id,
      }),
    });

    if (!contactRes.ok) {
      const errBody = await contactRes.text();
      throw new Error(`Salesforce Contact creation failed: ${errBody}`);
    }

    const contact = await contactRes.json();

    res.status(201).json({
      accountId: account.id,
      contactId: contact.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;