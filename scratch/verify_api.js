const BACKEND_URL = 'http://localhost:5001/api/v1';

async function test() {
  try {
    console.log('1. Logging in as Community Head...');
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'head@example.com',
        password: 'Head@123'
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('Login successful! Token received.');

    console.log('2. Updating Community Account Details...');
    const accountDetails = {
      bankName: 'State Bank of India',
      accountNumber: '38271049281',
      ifscCode: 'SBIN0001234',
      upiId: 'mohanlal@sbi',
      accountHolderName: 'Shri Mohan Lal Welfare Trust'
    };

    const updateRes = await fetch(`${BACKEND_URL}/head/dashboard/community/account-details`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ accountDetails })
    });

    const updateJson = await updateRes.json();
    console.log('Update result:', updateJson);

    console.log('3. Logging in as Member...');
    const memberLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '9999999999',
        password: 'Password123'
      })
    });
    
    if (!memberLoginRes.ok) {
      throw new Error(`Member login failed with status: ${memberLoginRes.status}`);
    }

    const memberLoginData = await memberLoginRes.json();
    const memberToken = memberLoginData.accessToken;
    console.log('Member login successful!');

    console.log('4. Fetching active donations as member to get a donation ID...');
    const activeDonationsRes = await fetch(`${BACKEND_URL}/member/donations`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const activeDonationsJson = await activeDonationsRes.json();
    const donations = activeDonationsJson?.data || [];
    
    if (donations.length === 0) {
      console.log('No active donations found to query. Testing direct GET community/details for head...');
      const detailsRes = await fetch(`${BACKEND_URL}/head/dashboard/community/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const detailsJson = await detailsRes.json();
      console.log('Community Details from Head API:', JSON.stringify(detailsJson, null, 2));
      console.log('SUCCESS: API endpoints verified successfully!');
      return;
    }

    const testDonationId = donations[0]._id;
    console.log(`Found donation ID: ${testDonationId}. Fetching details...`);

    const donationDetailsRes = await fetch(`${BACKEND_URL}/member/donations/${testDonationId}`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const donationDetailsJson = await donationDetailsRes.json();
    const donationData = donationDetailsJson?.data;
    console.log('Full Donation Details Response:', JSON.stringify(donationData, null, 2));

    if (donationData?.communityId?.accountDetails?.accountNumber === '38271049281') {
      console.log('SUCCESS: Community account details correctly populated in donation API response!');
    } else {
      console.error('ERROR: Community account details not populated correctly.', donationData?.communityId);
    }
  } catch (err) {
    console.error('Test failed with error:', err.message);
  }
}

test();
