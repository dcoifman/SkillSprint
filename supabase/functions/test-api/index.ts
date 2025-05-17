import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import axios from "npm:axios";

serve(async (req: Request) => {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Log environment info
    const envInfo = {
      hasGeminiKey: !!GEMINI_API_KEY,
      keyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'Present' : 'Missing',
      supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing'
    };

    // Test a simple Gemini API call
    let apiTestResult = { success: false, error: null, data: null };
    
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
              maxOutputTokens: 100,
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
        apiTest: apiTestResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        } 
      }
    );
  }
}); 