
// Test full create professor flow

async function testFlow() {
    const centerId = 'dc2e6d5f-a1f4-4a28-9906-e6f0a24aea01'; // ID form logs/previous script
    const uniqueEmail = `prof_test_${Date.now()}@example.com`;

    try {
        console.log('1. Creating user...');
        const createRes = await fetch('http://localhost:3001/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'password123',
                fullName: 'Test Professor ' + Date.now(),
                role: 'professor'
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create User Failed: ${createRes.status} - ${err}`);
        }

        const userData = await createRes.json();
        console.log('User created:', userData.user.id);
        const userId = userData.user.id;

        console.log('2. Assigning professor...');
        const assignRes = await fetch(`http://localhost:3001/api/admin/centers/${centerId}/professors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!assignRes.ok) {
            const err = await assignRes.text();
            throw new Error(`Assign Professor Failed: ${assignRes.status} - ${err}`);
        }
        console.log('Professor assigned.');

        console.log('3. Fetching professors (This is where it likely failed before)...');
        const listRes = await fetch(`http://localhost:3001/api/admin/centers/${centerId}/professors`);

        if (!listRes.ok) {
            const err = await listRes.text();
            throw new Error(`List Professors Failed: ${listRes.status} - ${err}`);
        }

        const list = await listRes.json();
        console.log(`Success! Found ${list.length} professors.`);

        const found = list.find(p => p.email === uniqueEmail);
        if (found) {
            console.log('Newly created professor found in list.');
        } else {
            console.error('Newly created professor NOT found in list.');
        }

    } catch (error) {
        console.error('Test Flow Error Details:', error);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testFlow();
