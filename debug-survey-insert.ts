import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInsert() {
    const payload = {
      creator_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      title: 'Debug Survey ' + Date.now(),
      description: 'Debugging insertion failure',
      status: 'published', // This was the status being passed in the broken flow
      settings: { anonymous: false, one_response_per_participant: true },
      questions: []
    };

    console.log('--- DEBUG INFO ---');
    console.log('Target Table: surveys');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
        .from('surveys')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.log('--- ERROR RESPONSE ---');
        console.log(JSON.stringify(error, null, 2));
    } else {
        console.log('--- SUCCESS RESPONSE ---');
        console.log('Survey ID:', data.id);
        console.log('Inserted Row:', JSON.stringify(data, null, 2));
    }
}

debugInsert();
