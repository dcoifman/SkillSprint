import axios from "axios";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

async function testGeminiAPI() {
  console.log('Testing Gemini API connection...');
  console.log('API Key present:', !!GEMINI_API_KEY);
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return;
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: "Return 'API test successful' if you can read this message."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      }
    );

    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

// Run the test
testGeminiAPI(); 