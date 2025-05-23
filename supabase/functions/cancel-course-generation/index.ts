// @deno-types="https://deno.land/std@0.177.0/http/server.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @deno-types="npm:@supabase/supabase-js@2.21.0"
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.21.0";

console.log("cancel-course-generation function booting up");

// Define a simple interface for the expected request body
interface CancelRequestBody {
  requestId: string;
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Adjust for specific origins in production
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    let requestBody: CancelRequestBody;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      requestBody = JSON.parse(bodyText);
      if (!requestBody.requestId) {
        throw new Error("Missing 'requestId' in request body");
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(JSON.stringify({ error: 'Invalid JSON body or missing requestId', details: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { requestId } = requestBody;
    console.log(`Processing cancellation for requestId: ${requestId}`);

    // Get Supabase connection details from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key
    const supabase: SupabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch the current course generation request
    const { data: requestRecord, error: fetchError } = await supabase
      .from('course_generation_requests')
      .select('id, status, status_message')
      .eq('id', requestId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: "Query returned no rows"
      console.error(`Error fetching request ${requestId}:`, fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch request', details: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!requestRecord) {
      console.log(`Request ${requestId} not found.`);
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Current status for ${requestId}: ${requestRecord.status}`);

    // Check current status for cancellation eligibility
    const nonCancellableStatuses = ['completed', 'failed', 'cancelled'];
    if (nonCancellableStatuses.includes(requestRecord.status)) {
      const message = `Request ${requestId} is already ${requestRecord.status} and cannot be cancelled.`;
      console.log(message);
      return new Response(JSON.stringify({ message, currentStatus: requestRecord.status }), {
        status: 400, // Bad Request, as the action cannot be performed
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If status is pending or processing, update to cancelled
    if (requestRecord.status === 'pending' || requestRecord.status === 'processing') {
      const newStatus = 'cancelled';
      const newStatusMessage = `Cancellation requested by user at ${new Date().toISOString()}`;
      
      const { error: updateError } = await supabase
        .from('course_generation_requests')
        .update({ 
          status: newStatus, 
          status_message: newStatusMessage,
          updated_at: new Date().toISOString() 
        })
        .eq('id', requestId);

      if (updateError) {
        console.error(`Error updating request ${requestId} to cancelled:`, updateError);
        return new Response(JSON.stringify({ error: 'Failed to cancel request', details: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Request ${requestId} successfully marked as cancelled.`);
      return new Response(JSON.stringify({ 
        message: 'Course generation cancellation requested successfully.', 
        requestId: requestId,
        newStatus: newStatus 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Should not be reached if logic is correct, but as a fallback:
    console.warn(`Request ${requestId} in unhandled state: ${requestRecord.status}`);
    return new Response(JSON.stringify({ error: 'Request in unhandled state', currentStatus: requestRecord.status }), {
      status: 500, // Internal server error for unhandled state
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Unhandled error in cancel-course-generation:", error);
    return new Response(JSON.stringify({ error: 'Unhandled internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
