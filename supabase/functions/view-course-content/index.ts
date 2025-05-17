import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.21.0";

serve(async (req) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    
    // Get URL parameters
    const url = new URL(req.url);
    const requestId = url.searchParams.get('requestId');
    
    // Get Supabase connection details
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // If requestId is provided, get specific course
    if (requestId) {
      const { data: course, error } = await supabase
        .from('course_generation_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch course', details: error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get sprint content if available
      const { data: sprintContents, error: sprintError } = await supabase
        .from('sprint_contents')
        .select('*')
        .eq('request_id', requestId);
      
      return new Response(
        JSON.stringify({ 
          course,
          sprintContents: sprintContents || [],
          sprintError: sprintError ? sprintError.message : null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    
    // Otherwise, list all courses
    const { data: courses, error } = await supabase
      .from('course_generation_requests')
      .select('id, status, status_message, created_at, request_data')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch courses', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ courses }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Unhandled error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 