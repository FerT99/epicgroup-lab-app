const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = 'http://localhost:3001/api/admin';

async function testSectionProfessors() {
    console.log('Running Section Professors Test...');

    // 1. Get a random section and a random user (professor)
    const { data: section } = await supabase.from('sections').select('id, name').limit(1).single();
    if (!section) {
        console.error('No sections found to test with.');
        return;
    }
    console.log(`Using Section: ${section.name} (${section.id})`);

    const { data: user } = await supabase.from('users').select('id, email').limit(1).single();
    if (!user) {
        console.error('No users found to test with.');
        return;
    }
    console.log(`Using User: ${user.email} (${user.id})`);

    // 2. Fetch initial professors
    try {
        console.log('\nFetching initial professors...');
        const res1 = await fetch(`${API_URL}/sections/${section.id}/professors`);
        const professors1 = await res1.json();
        console.log('Initial professors count:', professors1.length);
    } catch (e) {
        console.error('Error fetching professors:', e.message);
    }

    // 3. Assign professor
    try {
        console.log('\nAssigning professor...');
        const res2 = await fetch(`${API_URL}/sections/${section.id}/professors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        const assignData = await res2.json();
        if (res2.ok) {
            console.log('Professor assigned successfully:', assignData);
        } else {
            console.error('Failed to assign professor:', assignData);
        }
    } catch (e) {
        console.error('Error assigning professor:', e.message);
    }

    // 4. Fetch again to verify
    try {
        console.log('\nVerifying assignment...');
        const res3 = await fetch(`${API_URL}/sections/${section.id}/professors`);
        if (!res3.ok) {
            console.error('Fetch failed:', res3.status, await res3.text());
            return;
        }
        const professors3 = await res3.json();
        console.log('Professors count after assignment:', Array.isArray(professors3) ? professors3.length : 'Not an array');
        if (!Array.isArray(professors3)) {
            console.error('Response is not an array:', professors3);
            return;
        }
        const assigned = professors3.find(p => p.id === user.id);
        if (assigned) {
            console.log('✅ Professor found in list!');
        } else {
            console.error('❌ Professor NOT found in list!');
        }
    } catch (e) {
        console.error('Error verifying assignment:', e.message);
    }

    // 5. Unassign professor
    try {
        console.log('\nUnassigning professor...');
        const res4 = await fetch(`${API_URL}/sections/${section.id}/professors/${user.id}`, {
            method: 'DELETE'
        });
        if (res4.ok) {
            console.log('Professor unassigned successfully');
        } else {
            console.error('Failed to unassign professor:', res4.status, await res4.text());
        }
    } catch (e) {
        console.error('Error unassigning professor:', e.message);
    }

    // 6. Final verification
    try {
        console.log('\nFinal verification...');
        const res5 = await fetch(`${API_URL}/sections/${section.id}/professors`);
        if (!res5.ok) {
            console.error('Fetch failed:', res5.status, await res5.text());
            return;
        }
        const professors5 = await res5.json();
        console.log('Professors count after unassignment:', Array.isArray(professors5) ? professors5.length : 'Not an array');

        if (!Array.isArray(professors5)) {
            console.error('Response is not an array:', professors5);
            return;
        }

        const assigned = professors5.find(p => p.id === user.id);
        if (!assigned) {
            console.log('✅ Professor successfully removed from list!');
        } else {
            console.error('❌ Professor STILL in list!');
        }
    } catch (e) {
        console.error('Error final verification:', e.message);
    }
}

testSectionProfessors();
