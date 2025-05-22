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
    const sprintId = url.searchParams.get('sprintId'); // New parameter
    
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

    // Scenario 1: sprintId is provided - Fetch specific sprint content
    if (sprintId) {
      // Optional: You might want to also use requestId here if your RLS policies
      // on sprint_contents depend on course ownership or access.
      // For now, assuming sprintId is globally unique and directly accessible if known.
      const { data: sprintContent, error: sprintFetchError } = await supabase
        .from('sprint_contents')
        .select('*') // Selects all columns, including the JSON 'content'
        .eq('id', sprintId)
        .single();

      if (sprintFetchError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch sprint content', details: sprintFetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!sprintContent) {
        return new Response(
          JSON.stringify({ error: 'Sprint content not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ sprintContent }), // Return the full sprint content object
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    
    // Scenario 2: requestId is provided (but not sprintId) - Get specific course with sprint metadata
    if (requestId) {
      const { data: course, error: courseError } = await supabase
        .from('course_generation_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (courseError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch course', details: courseError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
       if (!course) {
        return new Response(
          JSON.stringify({ error: 'Course not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get sprint METADATA (not full content)
      const { data: sprintMetadata, error: sprintMetadataError } = await supabase
        .from('sprint_contents')
        // Select only necessary fields for listing, excluding the large 'content' JSON blob
        .select('id, request_id, module_index, sprint_index, generation_error, created_at') 
        .eq('request_id', requestId)
        .order('module_index', { ascending: true })
        .order('sprint_index', { ascending: true });
      
      // Note: We could also fetch sprint.title from the courseData.course.modules[m].sprints[s].title
      // if it's consistently stored there and up-to-date.
      // Fetching from sprint_contents table directly gives actual stored sprint IDs and their order.

      return new Response(
        JSON.stringify({ 
          course,
          sprintMetadata: sprintMetadata || [], // List of sprint IDs and basic info
          error: sprintMetadataError ? sprintMetadataError.message : null 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    
    // Scenario 3: Otherwise (neither sprintId nor requestId), list all courses with pagination
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');

    let page = parseInt(pageParam || '1', 10);
    let pageSize = parseInt(pageSizeParam || '10', 10);

    // Validate and apply defaults/constraints
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(pageSize) || pageSize < 1) {
      pageSize = 10;
    }
    if (pageSize > 100) { // Max pageSize
      pageSize = 100;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: courses, error, count } = await supabase
      .from('course_generation_requests')
      .select('id, status, status_message, created_at, request_data', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch courses', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return new Response(
      JSON.stringify({ 
        courses,
        pagination: {
          currentPage: page,
          pageSize,
          totalCount,
          totalPages
        }
      }),
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