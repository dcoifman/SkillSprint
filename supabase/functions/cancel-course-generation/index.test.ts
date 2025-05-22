import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.217.0/assert/mod.ts";
import { spy, stub, mockSession } from "https://deno.land/std@0.217.0/testing/mock.ts";

// --- BEGIN ASSUMPTION: The main handler function from index.ts is importable ---
// Example: import cancelCourseGenerationHandler from "./index.ts"; 
// For this test, we'll define a placeholder for the handler and test its logic.

// Placeholder for the actual handler function from cancel-course-generation/index.ts
async function cancelCourseGenerationHandler_mock(req: Request, supabaseClientMock: any, denoEnvMock: any): Promise<Response> {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        let requestBody: { requestId?: string };
        try {
            const bodyText = await req.text();
            if (!bodyText) throw new Error("Empty request body");
            requestBody = JSON.parse(bodyText);
            if (!requestBody.requestId) {
                throw new Error("Missing 'requestId' in request body");
            }
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body or missing requestId', details: error.message }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        const { requestId } = requestBody;

        if (!denoEnvMock.get('SUPABASE_URL') || !denoEnvMock.get('SUPABASE_SERVICE_ROLE_KEY')) {
            return new Response(JSON.stringify({ error: 'Server configuration error: Missing environment variables' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { data: requestRecord, error: fetchError } = await supabaseClientMock
            .from('course_generation_requests')
            .select('id, status, status_message')
            .eq('id', requestId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            return new Response(JSON.stringify({ error: 'Failed to fetch request', details: fetchError.message }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        if (!requestRecord) {
            return new Response(JSON.stringify({ error: 'Request not found' }), {
                status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const nonCancellableStatuses = ['completed', 'failed', 'cancelled'];
        if (nonCancellableStatuses.includes(requestRecord.status)) {
            return new Response(JSON.stringify({ message: `Request ${requestId} is already ${requestRecord.status} and cannot be cancelled.`, currentStatus: requestRecord.status }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (requestRecord.status === 'pending' || requestRecord.status === 'processing') {
            const { error: updateError } = await supabaseClientMock
                .from('course_generation_requests')
                .update({ status: 'cancelled', status_message: `Cancellation requested by user at ${new Date().toISOString()}`, updated_at: new Date().toISOString() })
                .eq('id', requestId);

            if (updateError) {
                return new Response(JSON.stringify({ error: 'Failed to cancel request', details: updateError.message }), {
                    status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            return new Response(JSON.stringify({ message: 'Course generation cancellation requested successfully.', requestId: requestId, newStatus: 'cancelled' }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        // Fallback for unhandled status - should ideally not be reached
        return new Response(JSON.stringify({ error: 'Request in unhandled state', currentStatus: requestRecord.status }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Unhandled internal server error', details: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

// --- Mocks ---
let mockSupabaseInstance: any;
let currentMockSession: ReturnType<typeof mockSession>;

function createMockSupabaseClient() {
  const client = {
    fromData: {} as Record<string, any>, 
    fromError: null as any,
    updateShouldError: false, // New flag to control update error

    from: spy((_tableName: string) => client.fromChain),
    fromChain: {
      select: spy((_selectString = '*') => client.fromChain),
      insert: spy((data: any) => Promise.resolve({ data, error: client.fromError })),
      update: spy((data: any) => {
        if (client.updateShouldError) {
            return Promise.resolve({ data: null, error: { message: "Simulated update error", code: "DB_UPDATE_ERR"} });
        }
        return Promise.resolve({ data: [data], error: client.fromError });
      }),
      eq: spy((_column: string, _value: any) => client.fromChain),
      single: spy(() => Promise.resolve({ 
          data: client.fromData['singleRecord'] || null, // Use a generic key for single record
          error: client.fromError 
      })),
    }
  };
  return client;
}

// --- Test Suites ---
Deno.test("--- cancel-course-generation API Endpoint ---", async (t) => {

  t.beforeEach(() => {
    currentMockSession = mockSession();
    mockSupabaseInstance = createMockSupabaseClient();

    currentMockSession.stub(Deno.env, "get", (key: string) => {
      if (key === 'SUPABASE_URL') return 'http://mock-supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-service-key';
      return undefined;
    });
  });

  t.afterEach(() => {
    currentMockSession.restore();
  });

  await t.step("OPTIONS request should return CORS headers", async () => {
    const req = new Request("http://localhost/cancel-course-generation", { method: "OPTIONS" });
    const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 200);
    assertEquals(res.headers.get('Access-Control-Allow-Origin'), '*');
    assertEquals(res.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  });

  await t.step("POST request should include CORS headers in response", async () => {
    // For this check, let's assume a "not found" scenario to quickly get a response
    mockSupabaseInstance.fromData['singleRecord'] = null;
    const req = new Request("http://localhost/cancel-course-generation", { 
        method: "POST", 
        body: JSON.stringify({ requestId: "test-id" }) 
    });
    const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.headers.get('Access-Control-Allow-Origin'), '*');
  });
  
  await t.step("should return 405 for non-POST/OPTIONS request methods", async () => {
    const req = new Request("http://localhost/cancel-course-generation", { method: "GET" });
    const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 405);
    const json = await res.json();
    assertEquals(json.error, 'Method not allowed');
  });

  await t.step("should return 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/cancel-course-generation", { method: "POST", body: "invalid json" });
    const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 400);
    const json = await res.json();
    assertStringIncludes(json.error, 'Invalid JSON body');
  });

  await t.step("should return 400 if requestId is missing in POST body", async () => {
    const req = new Request("http://localhost/cancel-course-generation", { method: "POST", body: JSON.stringify({ foo: "bar" }) });
    const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 400);
    const json = await res.json();
    assertStringIncludes(json.details, "Missing 'requestId'");
  });
  
  await t.step("should return 500 if Supabase env vars are missing", async () => {
    currentMockSession.stub(Deno.env, "get", () => undefined);
    const req = new Request("http://localhost/cancel-course-generation", { 
        method: "POST", 
        body: JSON.stringify({ requestId: "test-id" }) 
    });
    const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 500);
    const json = await res.json();
    assertEquals(json.error, 'Server configuration error: Missing environment variables');
  });


  await Deno.test("--- Cancellation Logic ---", async (t) => {
    const testRequestId = "req-to-cancel-123";

    await t.step("should successfully cancel a 'pending' request", async () => {
      mockSupabaseInstance.fromData['singleRecord'] = { id: testRequestId, status: 'pending', status_message: 'Starting...' };
      mockSupabaseInstance.updateShouldError = false;

      const req = new Request("http://localhost/cancel-course-generation", {
        method: "POST",
        body: JSON.stringify({ requestId: testRequestId }),
      });
      const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 200);
      const json = await res.json();
      assertEquals(json.message, 'Course generation cancellation requested successfully.');
      assertEquals(json.requestId, testRequestId);
      assertEquals(json.newStatus, 'cancelled');

      // Verify Supabase update was called correctly
      const updateCall = mockSupabaseInstance.from('course_generation_requests').update.calls[0];
      assertExists(updateCall);
      assertEquals(updateCall.args[0].status, 'cancelled');
      assertStringIncludes(updateCall.args[0].status_message, 'Cancellation requested by user');
    });

    await t.step("should successfully cancel a 'processing' request", async () => {
      mockSupabaseInstance.fromData['singleRecord'] = { id: testRequestId, status: 'processing', status_message: 'Generating sprints...' };
      mockSupabaseInstance.updateShouldError = false;
      const req = new Request("http://localhost/cancel-course-generation", {
        method: "POST",
        body: JSON.stringify({ requestId: testRequestId }),
      });
      const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 200);
      const json = await res.json();
      assertEquals(json.newStatus, 'cancelled');
    });

    const finalizedStatuses = ['completed', 'failed', 'cancelled'];
    for (const status of finalizedStatuses) {
      await t.step(`should not cancel an already '${status}' request`, async () => {
        mockSupabaseInstance.fromData['singleRecord'] = { id: testRequestId, status: status, status_message: 'Done.' };
        const req = new Request("http://localhost/cancel-course-generation", {
          method: "POST",
          body: JSON.stringify({ requestId: testRequestId }),
        });
        const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
        assertEquals(res.status, 400);
        const json = await res.json();
        assertStringIncludes(json.message, `already ${status} and cannot be cancelled`);
        assertEquals(json.currentStatus, status);
        // Verify update was NOT called
        assertEquals(mockSupabaseInstance.from('course_generation_requests').update.calls.length, 0);
      });
    }

    await t.step("should return 404 if request to cancel is not found", async () => {
      mockSupabaseInstance.fromData['singleRecord'] = null; // Simulate not found
      // Simulate PGRST116 "No rows found" which is not an error for .single() but means no data
      mockSupabaseInstance.fromError = { code: 'PGRST116', message: 'No rows found' }; 
      const req = new Request("http://localhost/cancel-course-generation", {
        method: "POST",
        body: JSON.stringify({ requestId: "nonexistent-id" }),
      });
      const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 404);
      const json = await res.json();
      assertEquals(json.error, 'Request not found');
      mockSupabaseInstance.fromError = null; // Reset for other tests
    });
    
    await t.step("should return 500 if Supabase select fails (non-PGRST116)", async () => {
        mockSupabaseInstance.fromError = { message: "DB connection error", code: "XXYYZ" };
        const req = new Request("http://localhost/cancel-course-generation", {
            method: "POST",
            body: JSON.stringify({ requestId: "req-db-fail" }),
        });
        const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
        assertEquals(res.status, 500);
        const json = await res.json();
        assertEquals(json.error, "Failed to fetch request");
        mockSupabaseInstance.fromError = null;
    });

    await t.step("should return 500 if Supabase update fails", async () => {
      mockSupabaseInstance.fromData['singleRecord'] = { id: testRequestId, status: 'pending', status_message: 'Starting...' };
      mockSupabaseInstance.updateShouldError = true; // Simulate update error

      const req = new Request("http://localhost/cancel-course-generation", {
        method: "POST",
        body: JSON.stringify({ requestId: testRequestId }),
      });
      const res = await cancelCourseGenerationHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 500);
      const json = await res.json();
      assertEquals(json.error, 'Failed to cancel request');
      assertStringIncludes(json.details.message, "Simulated update error");
      mockSupabaseInstance.updateShouldError = false; // Reset for other tests
    });
  });
});
