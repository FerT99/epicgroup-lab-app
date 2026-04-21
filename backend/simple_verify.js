const http = require('http');

function request(method, path, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: 3001,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${body}`));
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    try {
        console.log('Creating Professor...');
        const prof = await request('POST', '/admin/users', {
            email: `prof_${Date.now()}@test.com`,
            password: 'password',
            fullName: 'Simple Verify',
            role: 'professor'
        });
        const profId = prof.user?.id || prof.id;
        console.log(`Professor ID: ${profId}`);

        console.log('Fetching Centers (should be empty)...');
        const centers = await request('GET', `/professors/${profId}/centers`);
        console.log('Centers:', JSON.stringify(centers));

        if (Array.isArray(centers) && centers.length === 0) {
            console.log('SUCCESS: Got empty array as expected for new professor.');
        } else {
            console.error('FAILURE: Expected empty array.');
            process.exit(1);
        }

    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    }
}

run();
