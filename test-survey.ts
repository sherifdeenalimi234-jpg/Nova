
import { createClient } from './lib/supabase/server';
import { createSurvey } from './lib/actions/surveys';

async function testCreateSurvey() {
  console.log('Testing createSurvey...');
  try {
    const result = await createSurvey({
      title: 'Test Survey ' + Date.now(),
      description: 'Test Description',
      status: 'draft'
    });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during testCreateSurvey:', error);
  }
}

testCreateSurvey();
