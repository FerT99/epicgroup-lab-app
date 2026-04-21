
// Test content access endpoint

async function test() {
    const baseUrl = 'http://localhost:3001/api/grades/fake-grade-id/content';

    console.log('Testing missing params...');
    const res1 = await fetch(baseUrl);
    console.log(`Missing params: ${res1.status} (Expected 400)`);

    console.log('Testing invalid student access...');
    const res2 = await fetch(`${baseUrl}?userId=fake-user&role=student`);
    console.log(`Invalid student: ${res2.status} (Expected 403)`);

    console.log('Testing invalid professor access...');
    const res3 = await fetch(`${baseUrl}?userId=fake-user&role=professor`);
    console.log(`Invalid professor: ${res3.status} (Expected 403)`);

    console.log('Testing admin access...');
    // Admin access should technically pass the check logic (hasAccess=true) 
    // but might fail at DB query if gradeId doesn't exist (500 or []) or return [] if empty.
    // The code: 
    //   if (role === 'admin') hasAccess = true;
    //   ...
    //   const { data, error } = await supabase...
    // If gradeId is fake, it returns [] (empty list) usually, unless UUID format is invalid for Supabase (could be 500).
    const res4 = await fetch(`${baseUrl}?userId=fake-user&role=admin`);
    console.log(`Admin access: ${res4.status} (Expected 200 or 500 if UUID invalid)`);
}

test();
