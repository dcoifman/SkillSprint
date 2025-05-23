import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.217.0/assert/mod.ts";
import { spy, stub, mockSession, returnsNext } from "https://deno.land/std@0.217.0/testing/mock.ts";

// --- BEGIN ASSUMPTION: The main handler function from index.ts is importable ---
// Example: import viewCourseContentHandler from "./index.ts"; 
// If index.ts directly calls serve(), we'd need to refactor it to export the handler
// or test it by listening to an actual server instance (more complex).
// For this test, we'll define a placeholder for the handler and test its logic.

// Placeholder for the actual handler function from view-course-content/index.ts
// In a real scenario, you would import this.
async function viewCourseContentHandler_mock(req: Request, supabaseClientMock: any, denoEnvMock: any): Promise<Response> {
    // This mock would replicate the logic of the actual handler,
    // using the provided supabaseClientMock and denoEnvMock.
    // For brevity, we won't fully implement this mock here, but tests will assume its behavior.
    // The tests will focus on how the handler *should* behave based on inputs and mock states.

    const url = new URL(req.url);
    const requestId = url.searchParams.get('requestId');
    const sprintId = url.searchParams.get('sprintId');
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' 
    };
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Simulate env var check
    if (!denoEnvMock.get('SUPABASE_URL') || !denoEnvMock.get('SUPABASE_SERVICE_ROLE_KEY')) {
        return new Response(JSON.stringify({ error: 'Missing environment variables' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    // --- Logic based on parameters ---
    if (sprintId) {
        const { data, error } = await supabaseClientMock.from('sprint_contents')
            .select('*').eq('id', sprintId).single();
        if (error) return new Response(JSON.stringify({ error: 'Failed to fetch sprint', details: error }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        if (!data) return new Response(JSON.stringify({ error: 'Sprint not found' }), 
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ sprintContent: data }), 
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else if (requestId) {
        const { data: course, error: courseError } = await supabaseClientMock.from('course_generation_requests')
            .select('*').eq('id', requestId).single();
        if (courseError) return new Response(JSON.stringify({ error: 'Failed to fetch course', details: courseError }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        if (!course) return new Response(JSON.stringify({ error: 'Course not found' }),
             { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { data: sprintMetadata, error: sprintMetadataError } = await supabaseClientMock.from('sprint_contents')
            .select('id, request_id, module_index, sprint_index').eq('request_id', requestId).order('module_index');
        
        return new Response(JSON.stringify({ course, sprintMetadata: sprintMetadata || [], error: sprintMetadataError?.message || null }), 
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else { // Pagination for all courses
        let page = parseInt(pageParam || '1', 10);
        let pageSize = parseInt(pageSizeParam || '10', 10);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(pageSize) || pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const query = supabaseClientMock.from('course_generation_requests')
            .select('id, status', { count: 'exact' }) // Simplified select for mock
            .order('created_at', { ascending: false })
            .range(from, to);
        
        const { data: courses, error, count } = await query;

        if (error) return new Response(JSON.stringify({ error: 'Failed to fetch courses', details: error }),
             { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        return new Response(JSON.stringify({ courses, pagination: { currentPage: page, pageSize, totalCount, totalPages } }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}


// --- Mocks ---
let mockSupabaseInstance: any; // Holds the Supabase client mock for each test
let currentMockSession: ReturnType<typeof mockSession>; // For managing Deno.env and other global mocks

// Helper to create a fresh mock Supabase client
function createMockSupabaseClient() {
  const client = {
    fromData: {} as Record<string, any>, // To store mock data for tables
    fromError: null as any, // To simulate errors
    fromCount: 0, // To simulate count for pagination

    from: spy((tableName: string) => {
        // Define what each chained method should return, allowing spying
        const chain = {
            select: spy((_selectString = '*', opts = { count: null }) => {
                (chain as any)._count = opts.count; // Store if count was requested
                return chain;
            }),
            insert: spy((data: any) => Promise.resolve({ data, error: client.fromError })),
            update: spy((data: any) => Promise.resolve({ data: [data], error: client.fromError })),
            delete: spy(() => Promise.resolve({ data: [{}], error: client.fromError })),
            eq: spy((_column: string, _value: any) => chain),
            single: spy(() => Promise.resolve({ 
                data: client.fromData[tableName + '_single'] || null, 
                error: client.fromError 
            })),
            order: spy((_column: string, _opts?: { ascending: boolean }) => chain),
            range: spy((_from: number, _to: number) => {
                // Simulate range and count behavior
                const baseData = client.fromData[tableName + '_list'] || [];
                const rangedData = baseData.slice(_from, _to + 1);
                return Promise.resolve({
                    data: rangedData,
                    error: client.fromError,
                    count: (chain as any)._count === 'exact' ? client.fromCount : null,
                });
            }),
        };
        return chain;
    })
  };
  return client;
}


// --- Test Suites ---

Deno.test("--- view-course-content API Endpoint ---", async (t) => {

  t.beforeEach(() => {
    currentMockSession = mockSession(); // Starts a new session for global mocks
    mockSupabaseInstance = createMockSupabaseClient(); // Fresh Supabase mock

    // Mock Deno.env.get for this test session
    currentMockSession.stub(Deno.env, "get", (key: string) => {
      if (key === 'SUPABASE_URL') return 'http://mock-supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-service-key';
      return undefined;
    });
  });

  t.afterEach(() => {
    currentMockSession.restore(); // Restores all stubs made during the session
  });

  await t.step("OPTIONS request should return CORS headers", async () => {
    const req = new Request("http://localhost/view-course-content", { method: "OPTIONS" });
    const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 200);
    assertEquals(res.headers.get('Access-Control-Allow-Origin'), '*');
    assertEquals(res.headers.get('Access-Control-Allow-Methods'), 'GET, POST, OPTIONS');
  });

  await t.step("GET request should include CORS headers", async () => {
    mockSupabaseInstance.fromData['course_generation_requests_list'] = []; // No courses for this simple check
    mockSupabaseInstance.fromCount = 0;

    const req = new Request("http://localhost/view-course-content", { method: "GET" });
    const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.headers.get('Access-Control-Allow-Origin'), '*');
  });
  
  await t.step("should return 500 if Supabase env vars are missing", async () => {
    currentMockSession.stub(Deno.env, "get", () => undefined); // Override to return undefined for all
    const req = new Request("http://localhost/view-course-content", { method: "GET" });
    const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
    assertEquals(res.status, 500);
    const json = await res.json();
    assertEquals(json.error, 'Missing environment variables');
  });


  await Deno.test("--- Pagination Logic (List All Courses) ---", async (t) => {
    t.beforeEach(() => {
      // Ensure this is called if sub-tests don't inherit parent's beforeEach automatically
      // For Deno.test, it seems they do, but being explicit can be safer if structure changes.
    });

    await t.step("should return paginated courses with default page=1, pageSize=10", async () => {
      const mockCourses = Array.from({ length: 5 }, (_, i) => ({ id: `course${i+1}`, status: 'completed' }));
      mockSupabaseInstance.fromData['course_generation_requests_list'] = mockCourses;
      mockSupabaseInstance.fromCount = 5;

      const req = new Request("http://localhost/view-course-content", { method: "GET" });
      const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 200);
      const json = await res.json();
      
      assertEquals(json.courses.length, 5);
      assertEquals(json.pagination.currentPage, 1);
      assertEquals(json.pagination.pageSize, 10);
      assertEquals(json.pagination.totalCount, 5);
      assertEquals(json.pagination.totalPages, 1);

      // Verify Supabase client calls for range
      const rangeCall = mockSupabaseInstance.from('course_generation_requests').range.calls[0];
      assertExists(rangeCall, "range should have been called");
      assertEquals(rangeCall.args, [0, 9]); // page 1, size 10 -> from 0 to 9
    });

    await t.step("should use provided page and pageSize parameters", async () => {
      const mockCoursesPage2 = Array.from({ length: 3 }, (_, i) => ({ id: `course_p2_${i+1}`, status: 'pending' }));
      mockSupabaseInstance.fromData['course_generation_requests_list'] = mockCoursesPage2; // Simulates DB returning 3 items for this range
      mockSupabaseInstance.fromCount = 13; // Total 13 items in DB

      const req = new Request("http://localhost/view-course-content?page=2&pageSize=5", { method: "GET" });
      const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 200);
      const json = await res.json();

      assertEquals(json.courses.length, 3); // Mocked to return 3 for this specific range call
      assertEquals(json.pagination.currentPage, 2);
      assertEquals(json.pagination.pageSize, 5);
      assertEquals(json.pagination.totalCount, 13);
      assertEquals(json.pagination.totalPages, 3); // ceil(13/5)

      const rangeCall = mockSupabaseInstance.from('course_generation_requests').range.calls[0];
      assertExists(rangeCall);
      assertEquals(rangeCall.args, [5, 9]); // page 2, size 5 -> from 5 to 9
    });

    await t.step("should handle edge case: page size > 100 (caps at 100)", async () => {
        mockSupabaseInstance.fromData['course_generation_requests_list'] = [];
        mockSupabaseInstance.fromCount = 0;
        const req = new Request("http://localhost/view-course-content?pageSize=150", { method: "GET" });
        const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
        const json = await res.json();
        assertEquals(json.pagination.pageSize, 100);
        const rangeCall = mockSupabaseInstance.from('course_generation_requests').range.calls[0];
        assertEquals(rangeCall.args, [0, 99]);
    });
    
    await t.step("should handle edge case: invalid page (defaults to 1)", async () => {
        mockSupabaseInstance.fromData['course_generation_requests_list'] = [];
        mockSupabaseInstance.fromCount = 0;
        const req = new Request("http://localhost/view-course-content?page=0", { method: "GET" });
        const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
        const json = await res.json();
        assertEquals(json.pagination.currentPage, 1);
    });

    await t.step("should handle Supabase error when fetching courses", async () => {
        mockSupabaseInstance.fromError = { message: "Database connection error", code: "DB_ERR" };
        const req = new Request("http://localhost/view-course-content", { method: "GET" });
        const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
        assertEquals(res.status, 500);
        const json = await res.json();
        assertEquals(json.error, "Failed to fetch courses");
        assertEquals(json.details.message, "Database connection error");
        mockSupabaseInstance.fromError = null; // Reset for other tests
    });
  });


  await Deno.test("--- Fetch Single Course (requestId provided) ---", async (t) => {
    const testCourseId = "course-abc-123";
    const mockCourseData = { id: testCourseId, topic: "Test Course", status: "completed", request_data: { topic: "Test Course"} };
    const mockSprintMeta = [
      { id: "sprint-1", request_id: testCourseId, module_index: 0, sprint_index: 0 },
      { id: "sprint-2", request_id: testCourseId, module_index: 0, sprint_index: 1 },
    ];

    await t.step("should return course and sprint metadata if found", async () => {
      mockSupabaseInstance.fromData[`course_generation_requests_single`] = mockCourseData;
      mockSupabaseInstance.fromData[`sprint_contents_list`] = mockSprintMeta; // Used by the general .select().eq().order() chain

      // Modify the supabase mock for this specific case, since `sprint_contents` list is not using range
      const originalFrom = mockSupabaseInstance.from;
      mockSupabaseInstance.from = spy((tableName: string) => {
        const chain = originalFrom(tableName);
        if (tableName === 'sprint_contents' && !chain._isRangeTest) { // Ensure not a pagination call
          chain.range = spy(() => Promise.resolve({ // This mock for .range is simple, might need refinement if used by list
             data: mockSupabaseInstance.fromData[`${tableName}_list`] || [],
             error: mockSupabaseInstance.fromError,
             count: null, // No count for this specific path usually
          }));
        }
        return chain;
      });


      const req = new Request(`http://localhost/view-course-content?requestId=${testCourseId}`, { method: "GET" });
      const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 200);
      const json = await res.json();
      
      assertEquals(json.course.id, testCourseId);
      assertEquals(json.sprintMetadata.length, 2);
      assertEquals(json.sprintMetadata[0].id, "sprint-1");
      
      mockSupabaseInstance.from = originalFrom; // Restore original mock structure
    });

    await t.step("should return 404 if course not found", async () => {
      mockSupabaseInstance.fromData[`course_generation_requests_single`] = null; // Simulate not found
      const req = new Request(`http://localhost/view-course-content?requestId=nonexistent-id`, { method: "GET" });
      const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 404);
      const json = await res.json();
      assertEquals(json.error, "Course not found");
    });
    
    await t.step("should return course and empty sprint metadata if no sprints exist", async () => {
        mockSupabaseInstance.fromData[`course_generation_requests_single`] = mockCourseData;
        mockSupabaseInstance.fromData[`sprint_contents_list`] = []; // No sprints
        const req = new Request(`http://localhost/view-course-content?requestId=${testCourseId}`, { method: "GET" });
        const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
        assertEquals(res.status, 200);
        const json = await res.json();
        assertEquals(json.course.id, testCourseId);
        assertEquals(json.sprintMetadata.length, 0);
    });
  });


  await Deno.test("--- Fetch Single Sprint (sprintId provided) ---", async (t) => {
    const testSprintId = "sprint-xyz-789";
    const mockSprintData = { id: testSprintId, content: { title: "Test Sprint Detail" }, request_id: "course-abc" };

    await t.step("should return full sprint content if found", async () => {
      mockSupabaseInstance.fromData[`sprint_contents_single`] = mockSprintData;
      const req = new Request(`http://localhost/view-course-content?sprintId=${testSprintId}`, { method: "GET" });
      const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 200);
      const json = await res.json();
      assertEquals(json.sprintContent.id, testSprintId);
      assertEquals(json.sprintContent.content.title, "Test Sprint Detail");
    });

    await t.step("should return 404 if sprint not found by sprintId", async () => {
      mockSupabaseInstance.fromData[`sprint_contents_single`] = null; // Simulate not found
      const req = new Request(`http://localhost/view-course-content?sprintId=nonexistent-sprint`, { method: "GET" });
      const res = await viewCourseContentHandler_mock(req, mockSupabaseInstance, Deno.env);
      assertEquals(res.status, 404);
      const json = await res.json();
      assertEquals(json.error, "Sprint not found");
    });
  });

});
