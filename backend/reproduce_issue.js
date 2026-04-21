
// Use fetch native (Node 18+)

async function reproduce() {
    try {
        console.log('Fetching centers...');
        const centersRes = await fetch('http://localhost:3001/api/admin/centers');
        if (!centersRes.ok) throw new Error(`Failed to fetch centers: ${centersRes.status}`);
        const centers = await centersRes.json();
        console.log(`Found ${centers.length} centers.`);

        for (const center of centers) {
            console.log(`Checking professors for center: ${center.name} (${center.id})`);
            const profRes = await fetch(`http://localhost:3001/api/admin/centers/${center.id}/professors`);

            if (profRes.status === 500) {
                console.error('!!! CRITICAL: 500 Error reproduced !!!');
                try {
                    const errorJson = await profRes.json();
                    console.error('Error details:', JSON.stringify(errorJson, null, 2));
                } catch (e) {
                    console.error('Could not parse error JSON');
                    // console.error(await profRes.text());
                }
            } else if (!profRes.ok) {
                console.error(`Error ${profRes.status} fetching professors`);
            } else {
                const profs = await profRes.json();
                console.log(`Success. Found ${profs.length} professors.`);
            }
        }
    } catch (error) {
        console.error('Script error:', error);
    }
}

reproduce();
