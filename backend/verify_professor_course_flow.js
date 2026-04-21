const http = require('http');

const BASE_URL = 'http://127.0.0.1:3001/api';

// Helper to create a unique email
const uniqueId = Date.now();
const professorEmail = `prof_${uniqueId}@test.com`;
const password = 'password123';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3001,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        console.log(`Making request: ${method} http://127.0.0.1:3001/api${path}`);

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = body ? JSON.parse(body) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        console.error(`Request to ${path} failed with status ${res.statusCode}`);
                        console.error(`Response body: ${body}`);
                        reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
                    }
                } catch (e) {
                    console.error(`Failed to parse response from ${path}: ${body}`);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Network error for ${path}: ${e.message}`);
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runVerification() {
    try {
        console.log('--- Starting Verification (HTTP Module) ---');

        // 1. Create Professor
        console.log('1. Creating Professor...');
        const profData = await makeRequest('POST', '/admin/users', {
            email: professorEmail,
            password: password,
            fullName: 'Test Professor',
            role: 'professor'
        });
        const professorId = profData.user?.id || profData.id;
        console.log(`   Professor Created: ${professorId}`);

        // 2. Create Center
        console.log('2. Creating Center...');
        const centerData = await makeRequest('POST', '/admin/centers', {
            name: `Test Center ${uniqueId}`,
            address: '123 Test St',
            type: 'school'
        });
        const centerId = centerData.id;
        console.log(`   Center Created: ${centerId}`);

        // 3. Assign Professor
        console.log('3. Assigning Professor...');
        await makeRequest('POST', `/admin/centers/${centerId}/professors`, {
            userId: professorId
        });
        console.log('   Professor Assigned.');

        // 4. Create Grade
        console.log('4. Creating Grade...');
        const gradeData = await makeRequest('POST', '/admin/grades', {
            name: '1st Grade',
            level: 'Primary',
            center_id: centerId
        });
        const gradeId = gradeData.id;
        console.log(`   Grade Created: ${gradeId}`);

        // 5. Create Section
        console.log('5. Creating Section...');
        const sectionData = await makeRequest('POST', '/admin/sections', {
            name: 'Section A',
            grade_id: gradeId
        });
        const sectionId = sectionData.id;
        console.log(`   Section Created: ${sectionId}`);

        // 6. Verify Professor Centers
        console.log('6. Verifying GET /api/professors/:id/centers ...');
        const centers = await makeRequest('GET', `/professors/${professorId}/centers`);

        console.log(`   Centers found: ${centers.length}`);
        if (centers.length === 0 || centers[0].id !== centerId) {
            throw new Error('Professor center assignment verification failed!');
        }
        console.log('   ✅ Center fetch verification SUCCESS.');

        // 7. Verify Hierarchy
        console.log('7. Verifying Hierarchy Fetch...');
        const hierarchy = await makeRequest('GET', `/admin/centers/${centerId}/hierarchy`);

        const grades = hierarchy.grades || [];
        const sections = grades[0]?.sections || [];

        console.log(`   Grades found: ${grades.length}`);
        console.log(`   Sections found in first grade: ${sections.length}`);

        if (sections.length > 0 && sections[0].id === sectionId) {
            console.log('   ✅ Hierarchy fetch verification SUCCESS.');
        } else {
            throw new Error('Hierarchy verification failed: Section not found.');
        }

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('!!! Verification Failed !!!');
        console.error(error);
        process.exit(1);
    }
}

runVerification();
