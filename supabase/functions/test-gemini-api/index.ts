import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import axios from "npm:axios";

serve(async (req) => {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: corsHeaders
      });
    }
    
    // For testing POST request handling with course data
    if (req.method === 'POST') {
      try {
        const requestData = await req.json();
        console.log('Received POST data:', requestData);
        
        // If there's courseRequest data, do a simple Gemini prompt with it
        if (requestData.courseRequest) {
          const { topic, audience, level, duration, goals } = requestData.courseRequest;
          
          // Only attempt Gemini call if we have API key
          if (GEMINI_API_KEY) {
            try {
              // Create a simple prompt based on the course request
              const prompt = `Generate a very brief outline (3-4 bullet points max) for a course on ${topic} 
              for ${audience} at ${level} level, with duration ${duration} and goals: ${goals}.`;
              
              const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
                {
                  contents: [
                    {
                      parts: [
                        { text: prompt }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500
                  }
                },
                { timeout: 10000 }
              );
              
              return new Response(
                JSON.stringify({
                  message: 'Course generation test successful',
                  courseRequest: requestData.courseRequest,
                  requestId: crypto.randomUUID(),
                  outline: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No outline generated',
                  status: 'success'
                }),
                {
                  status: 200,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              );
            } catch (error) {
              return new Response(
                JSON.stringify({
                  error: 'Gemini API error',
                  details: error.message,
                  response: error.response?.data
                }),
                {
                  status: 500,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              );
            }
          }
        }
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON payload',
            details: error.message
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Default response with API test
    // Log environment info
    const envInfo = {
      hasGeminiKey: !!GEMINI_API_KEY,
      keyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'Present' : 'Missing',
      supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing'
    };
    
    // Test a simple Gemini API call
    let apiTestResult = {
      success: false,
      error: null,
      data: null
    };
    
    if (GEMINI_API_KEY) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: "Hello, please respond with 'API is working properly' if you receive this message."
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100
            }
          },
          {
            timeout: 10000
          }
        );
        
        apiTestResult = {
          success: true,
          error: null,
          data: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No text returned'
        };
      } catch (error) {
        apiTestResult = {
          success: false,
          error: {
            message: error.message,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data
            } : null
          },
          data: null
        };
      }
    }
    
    // Return results
    return new Response(
      JSON.stringify({
        message: 'API test complete',
        environment: envInfo,
        apiTest: apiTestResult,
        usage: "POST courseRequest data to test course generation"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Unhandled error in test function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      }
    );
  }
}); 