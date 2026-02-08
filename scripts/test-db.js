
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Fix for loading .env from parent dir in type module
import fs from 'fs';
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env')));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Fetching rooms...');
    const { data, error } = await supabase.from('rooms').select('*');

    if (error) {
        console.error('Error fetching rooms:', error);
    } else {
        console.log(`Success! Found ${data.length} rooms.`);
        if (data.length > 0) {
            console.log('Sample room:', data[0].name);
        } else {
            console.log('The "rooms" table is empty. Did you run the seed script?');
        }
    }
}

testConnection();
