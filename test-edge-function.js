// Test script for Edge Function diagnostics
const testSupabaseFunction = async () => {
  try {
    // Replace with your Supabase URL and anon key
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return;
    }
    
    console.log('Testing Edge Function: test-api');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/test-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({})
    });
    
    const statusCode = response.status;
    const data = await response.json();
    
    console.log('Status Code:', statusCode);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.apiTest && data.apiTest.success) {
      console.log('✅ Gemini API is working properly!');
      console.log('API Response:', data.apiTest.data);
    } else {
      console.log('❌ Gemini API test failed!');
      if (data.apiTest && data.apiTest.error) {
        console.log('Error:', data.apiTest.error);
      }
    }
    
    console.log('\nEnvironment Information:');
    if (data.environment) {
      console.log('- Gemini API Key:', data.environment.hasGeminiKey ? 'Present' : 'Missing');
      console.log('- Supabase URL:', data.environment.supabaseUrl);
      console.log('- Supabase Service Key:', data.environment.supabaseServiceKey);
    }
    
  } catch (error) {
    console.error('Error testing Edge Function:', error);
  }
};

// Run the test
testSupabaseFunction(); 