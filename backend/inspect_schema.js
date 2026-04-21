
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    try {
        console.log('--- COLUMNS ---');

        const { error: pError } = await supabase.from('sections').select('professor_id').limit(1);
        if (pError) console.log('sections.professor_id ERROR:', pError.message);
        else console.log('sections.professor_id EXISTS');

        const { error: cpError } = await supabase.from('courses').select('professor_id').limit(1);
        if (cpError) console.log('courses.professor_id ERROR:', cpError.message);
        else console.log('courses.professor_id EXISTS');

        const { error: spTableError } = await supabase.from('section_professors').select('*').limit(1);
        if (spTableError) console.log('section_professors TABLE ERROR:', spTableError.message);
        else console.log('section_professors TABLE EXISTS');

    } catch (e) {
        console.error(e);
    }
}

inspect();
