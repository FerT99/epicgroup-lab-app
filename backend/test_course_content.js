const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3001';

// Helper for requests
async function request(method, path, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    console.log(`REQUEST: ${method} ${path}`);
    const res = await fetch(`${API_URL}${path}`, options);
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText} - ${await res.text()}`);
    }
    try {
        return await res.json();
    } catch {
        return {};
    }
}

async function runTests() {
    console.log('--- STARTING COURSE CONTENT API TESTS ---');

    try {
        // 0. Fetch valid IDs to test with
        console.log('0. Fetching valid IDs...');

        // Get Centers
        const centers = await request('GET', '/api/admin/centers');
        if (!centers || centers.length === 0) throw new Error('No centers found');
        const CENTER_ID = centers[0].id;
        console.log(`Using Center: ${centers[0].name} (${CENTER_ID})`);

        // Get Grades
        const grades = await request('GET', `/api/admin/centers/${CENTER_ID}/grades`);
        if (!grades || grades.length === 0) throw new Error('No grades found');
        const GRADE_ID = grades[0].id;
        console.log(`Using Grade: ${grades[0].name} (${GRADE_ID})`);

        // Get Sections
        const sections = await request('GET', `/api/admin/grades/${GRADE_ID}/sections`);
        let section;
        if (!sections || sections.length === 0) {
            console.log('No sections found. Creating temporary section...');
            section = await request('POST', '/api/admin/sections', {
                grade_id: GRADE_ID,
                name: 'Test Section ' + Date.now(),
                max_students: 30,
                is_active: true
            });
        } else {
            section = sections[0];
        }
        console.log(`Using Section: ${section.name} (${section.id})`);

        // 2. Create Module
        console.log('\n2. Creating Module...');
        const newModule = await request('POST', `/api/admin/sections/${section.id}/modules`, {
            title: 'Test Module ' + Date.now(),
            order_index: 0
        });
        console.log('Module Created:', newModule.id, newModule.title);

        // 3. Add Item to Module
        console.log('\n3. Adding Item to Module...');
        const newItem = await request('POST', `/api/admin/modules/${newModule.id}/items`, {
            type: 'link',
            title: 'Test Link Item',
            description: 'A test link',
            content_url: 'https://example.com',
            order_index: 0
        });
        console.log('Item Created:', newItem.id, newItem.title);

        // 4. Fetch Modules with Items
        console.log('\n4. Fetching Modules...');
        const modules = await request('GET', `/api/admin/sections/${section.id}/modules`);
        console.log(`Fetched ${modules.length} modules`);

        const fetchedModule = modules.find(m => m.id === newModule.id);
        if (!fetchedModule) throw new Error('Created module not found in list');

        console.log('Module found in list.');
        console.log('Validating items...');

        let foundItem = false;
        if (fetchedModule.items && fetchedModule.items.length > 0) {
            const item = fetchedModule.items.find(i => i.id === newItem.id);
            if (item) {
                console.log(`Item found: ${item.title}`);
                foundItem = true;
            }
        }

        if (!foundItem) console.error('Created ITEM not found in module items list!');

        // 5. Update Module
        console.log('\n5. Updating Module...');
        const updatedModule = await request('PUT', `/api/admin/modules/${newModule.id}`, {
            title: newModule.title + ' (Updated)'
        });
        console.log('Module Updated:', updatedModule.title);

        // 6. Delete Item
        console.log('\n6. Deleting Item...');
        await request('DELETE', `/api/admin/items/${newItem.id}`);
        console.log('Item deleted.');

        // 7. Delete Module
        console.log('\n7. Deleting Module...');
        await request('DELETE', `/api/admin/modules/${newModule.id}`);
        console.log('Module deleted.');

        console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    }
}

runTests();
