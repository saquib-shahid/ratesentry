const BASE_URL = 'http://localhost:3000';

async function runDemo() {
  console.log('🤖 Setting up Demo Data...');
  try {
    // 1. Create a Premium Tier
    let tierRes = await fetch(`${BASE_URL}/admin/tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Premium Demo', requestsPerMin: 20 })
    });
    tierRes = await tierRes.json();
    const premiumTierId = tierRes.id;
    console.log(`✅ Created Tier: Premium Demo (Limit 20/min)`);

    // 2. Create a Client using that Tier
    let clientRes = await fetch(`${BASE_URL}/admin/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Demo App Corp', tierId: premiumTierId })
    });
    clientRes = await clientRes.json();
    const apiKey = clientRes.apiKey;
    console.log(`✅ Created Client: Demo App Corp`);
    console.log(`🔑 Assigned API Key: ${apiKey}\n`);

    // 3. Blacklist a random IP to verify it's working
    await fetch(`${BASE_URL}/admin/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BLACKLIST', ipAddress: '9.9.9.9' })
    });
    console.log(`✅ Rule applied: Blacklisted IP 9.9.9.9\n`);

    console.log('🚀 Firing requests to the guarded endpoint...');
    
    // Fire 30 requests quickly (should hit the 20/min limit)
    let successCount = 0;
    let limitCount = 0;
    
    for(let i=1; i<=30; i++) {
        try {
            const res = await fetch(`${BASE_URL}/api/users`, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });
            if (res.status === 429) {
                limitCount++;
                process.stdout.write('🔴 ');
            } else if (res.status === 200) {
                successCount++;
                process.stdout.write('🟢 ');
            } else if (res.status === 404){
                console.log('\n❌ /api/users endpoint not found. The API service needs to be rebooted to pick up the changes!');
                break;
            }
        } catch (err) {
            console.error(err);
        }
        await new Promise(resolve => setTimeout(resolve, 50)); // stagger slightly
    }

    console.log(`\n\n📊 Test complete!`);
    console.log(`Total Allowed: ${successCount}`);
    console.log(`Total Blocked: ${limitCount}`);
    console.log(`\n👉 Look at your RateSentry Dashboard running on port 5173 — you should see these stats and the active clients/rules now!`);
    
  } catch (err) {
    console.error('Error running demo script:', err.message);
  }
}

runDemo();
