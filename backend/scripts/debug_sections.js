
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSections() {
    console.log('Testing connection to Supabase...');

    try {
        // 1. Get a grade ID
        console.log('Fetching a grade to get valid ID...');
        const { data: grades, error: gradesError } = await supabase
            .from('grades_levels')
            .select('id, name')
            .limit(1);

        if (gradesError) {
            console.error('Error fetching grades:', gradesError);
            return;
        }

        if (!grades || grades.length === 0) {
            console.log('No grades found. Cannot test section fetching by grade_id.');
            return;
        }

        const grade = grades[0];
        console.log(`Found grade: ${grade.name} (${grade.id})`);

        // 2. Fetch sections for this grade (mimic backend)
        console.log(`Fetching sections for grade_id=${grade.id}...`);
        const { data: sections, error: sectionsError } = await supabase
            .from('sections')
            .select('*')
            .eq('grade_id', grade.id)
            .order('name');

        if (sectionsError) {
            console.error('---------------------------------------------------');
            console.error('ERROR fetching sections with filter:');
            console.error(JSON.stringify(sectionsError, null, 2));
            console.error('---------------------------------------------------');
        } else {
            console.log('Sections fetch success!');
            console.log(`Count: ${sections.length}`);
            if (sections.length > 0) {
                console.log('First section:', JSON.stringify(sections[0], null, 2));
            }
        }

    } catch (err) {
        console.error('Unexpected runtime error:', err);
    }
}

testSections();
