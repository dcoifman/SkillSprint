import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.21.0";
import axios from "npm:axios";

// Create a global fs stub to replace node:fs functionality
// This is needed because Gemini API tries to use fs.readFileSync which isn't available in Deno
const fs = {
  readFileSync: (p: string, e = "utf-8") => {
    console.log(`Stub: Called readFileSync with path: ${p}, encoding: ${e}`);
    return p;
  },
  promises: {
    readFile: async (path: string) => {
      console.log(`Stub: Called promises.readFile with path: ${path}`);
      return path;
    }
  },
  existsSync: () => false,
  statSync: () => ({ isFile: () => true })
};

// Add fs to global scope
// @ts-ignore - Adding fs to global scope to handle imports by Gemini API
(globalThis as any).fs = fs;

// Types
interface CourseRequest {
  topic: string;
  audience: string;
  level: string;
  duration: string;
  goals: string;
}

interface GenerationRequest {
  requestId: string;
  courseRequest: CourseRequest;
}

// Configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Enhanced logging function
async function logDebug(supabase: any, requestId: string, message: string, data?: any) {
  console.log(`[DEBUG] RequestID ${requestId}: ${message}`, data ? JSON.stringify(data) : '');
  
  // Also update the request with detailed status
  const updates: {
    status_message: string;
    updated_at: string;
    [key: string]: any;
  } = {
    status_message: `${message}${data ? ' - ' + JSON.stringify(data) : ''}`,
    updated_at: new Date().toISOString()
  };
  
  try {
    await supabase
      .from('course_generation_requests')
      .update(updates)
      .eq('id', requestId);
  } catch (error) {
    console.error(`[ERROR] Failed to update status for ${requestId}:`, error);
  }
}

// Prompt templates
const PROMPT_TEMPLATES = {
  COURSE_OUTLINE: `Create a comprehensive outline for a course on "{topic}" with the following parameters:
- Target audience: {audience}
- Skill level: {level}
- Estimated course duration: {duration}
- Learning goals: {goals}

Format the response as a JSON object with the following structure:
{
  "title": "Course title",
  "description": "A compelling 2-3 sentence description of the course",
  "learningObjectives": ["objective1", "objective2", "objective3"],
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "Brief description of this module",
      "sprints": [
        {
          "title": "Sprint 1 Title",
          "description": "Brief description of this sprint",
          "duration": "5-15 minutes",
          "contentOutline": ["Point 1", "Point 2", "Point 3"]
        }
      ]
    }
  ]
}

Keep sprints short (5-15 minutes) and focused on specific learning outcomes.
Include a variety of teaching methods across different sprints: text explanations, visual diagrams, interactive exercises, case studies, quizzes, reflection activities, and practical applications.
Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.`,

  SPRINT_CONTENT: `Create detailed content for a sprint titled "{title}" that is part of the "{module}" module in the "{course}" course.
This sprint should cover: {outline}
Target audience: {audience}
Skill level: {level}
Duration target: {duration} minutes

Format the response as a JSON object with the following structure:
{
  "title": "Sprint title",
  "introduction": "A brief engaging introduction to the sprint topic (2-3 sentences)",
  "content": [
    {
      "type": "text",
      "value": "Educational content segment 1"
    },
    {
      "type": "key_point",
      "value": "Important concept to highlight"
    },
    {
      "type": "example",
      "value": "A practical example demonstrating the concept"
    },
    {
      "type": "visual_tree",
      "value": "Description of hierarchical relationship or concept tree, using '->' to indicate relationships"
    },
    {
      "type": "activity",
      "value": "An interactive activity or exercise for learner engagement"
    },
    {
      "type": "reflection",
      "value": "A prompt for self-reflection to deepen understanding"
    }
  ],
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this answer is correct",
      "type": "multiple_choice" 
    },
    {
      "question": "Fill in the blank question?",
      "correctAnswer": "The correct answer text",
      "type": "fill_blank"
    },
    {
      "question": "Drag and drop these concepts in the correct order",
      "options": ["Item A", "Item B", "Item C", "Item D"],
      "correctOrder": [2, 0, 3, 1], 
      "type": "ordering"
    }
  ],
  "summary": "A concise summary of what was learned in this sprint (2-3 sentences)",
  "nextSteps": "Suggestion for what to learn next"
}

Include at least one visual tree and one non-multiple-choice assessment.
Vary teaching methods and assessment types across the content.
Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.`
};

// Helper to strip code fences from Gemini responses
function stripCodeFences(response: string): string {
  let clean = response.trim();
  
  // Remove code fences
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  
  try {
    // Check if it's valid JSON first
    JSON.parse(clean);
    return clean;
  } catch (e) {
    // If not valid JSON, try to fix common issues
    console.log(`JSON parse error: ${e.message}. Attempting to fix...`);
    
    // Fix line breaks inside strings
    clean = clean.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/, (match) => {
      return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    });
    
    // Fix missing commas between properties
    clean = clean.replace(/"\s*\n\s*"/g, '",\n"');
    
    // Fix missing commas between array items
    clean = clean.replace(/}\s*{/g, '}, {');
    
    // Fix missing commas in arrays
    clean = clean.replace(/]\s*\[/g, '], [');
    
    // Fix trailing commas before closing brackets
    clean = clean.replace(/,(\s*[\]}])/g, '$1');
    
    // Fix unescaped quotes in strings
    clean = clean.replace(/"([^"]*)(?<!\\)"/g, (match, p1) => {
      return '"' + p1.replace(/(?<!\\)"/g, '\\"') + '"';
    });
    
    try {
      // Final validation
      JSON.parse(clean);
      console.log("Successfully fixed JSON");
    } catch (e) {
      console.log(`Still invalid JSON after fixes: ${e.message}`);
      // Last resort - try a more aggressive approach
      clean = clean.replace(/(\w+):/g, '"$1":'); // Ensure property names are quoted
      clean = clean.replace(/,\s*}/g, '}'); // Remove trailing commas
      clean = clean.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
    }
    
    return clean;
  }
}

// Generate content using Gemini API
async function generateContent(supabase: any, requestId: string, prompt: string, temperature = 0.7): Promise<string> {
  await logDebug(supabase, requestId, 'Checking GEMINI_API_KEY configuration');
  
  if (!GEMINI_API_KEY) {
    const error = 'GEMINI_API_KEY environment variable is not set';
    await logDebug(supabase, requestId, 'API Key Error', { error });
    throw new Error(error);
  }
  
  try {
    await logDebug(supabase, requestId, 'Preparing Gemini API request', {
      temperature,
      promptLength: prompt.length,
      apiEndpoint: 'generativelanguage.googleapis.com'
    });

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 32768, // Using 32k tokens as requested
        topP: 0.95,
        topK: 64,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    await logDebug(supabase, requestId, 'Sending request to Gemini API');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        timeout: 30000 // Add 30s timeout to prevent hanging
      }
    );
    
    await logDebug(supabase, requestId, 'Received response from Gemini API', {
      status: response.status,
      hasContent: !!response.data?.candidates?.[0]?.content,
      responseSize: JSON.stringify(response.data).length
    });
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    await logDebug(supabase, requestId, 'Error generating content', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      axiosError: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : undefined
    });
    throw error;
  }
}

// Update the status of a course generation request
async function updateRequestStatus(
  supabase: any, 
  requestId: string, 
  status: string, 
  statusMessage?: string, 
  progress?: number,
  errorMessage?: string,
  courseData?: any
) {
  const updates: {
    status: string;
    updated_at: string;
    status_message?: string;
    progress?: number;
    error_message?: string;
    course_data?: any;
    content_generated?: boolean;
  } = {
    status,
    updated_at: new Date().toISOString()
  };
  
  if (statusMessage) updates.status_message = statusMessage;
  if (progress !== undefined) updates.progress = progress;
  if (errorMessage) updates.error_message = errorMessage;
  if (courseData) {
    updates.course_data = courseData;
    updates.content_generated = true;
  }
  
  await logDebug(supabase, requestId, 'Updating request status', { updates });
  
  const { data, error } = await supabase
    .from('course_generation_requests')
    .update(updates)
    .eq('id', requestId);
    
  if (error) {
    await logDebug(supabase, requestId, 'Error updating request status', { error });
  }
  
  return { data, error };
}

// Main generation logic for course content
async function generateCourseContent(
  supabase: any,
  requestId: string,
  courseRequest: CourseRequest
): Promise<any> {
  try {
    await logDebug(supabase, requestId, 'Starting course generation', { courseRequest });
    
    // 1. Update status to processing
    await updateRequestStatus(
      supabase, 
      requestId, 
      'processing', 
      'Generating course outline...',
      5
    );
    
    // 2. Generate course outline
    await logDebug(supabase, requestId, 'Preparing course outline prompt');
    
    const filledPrompt = PROMPT_TEMPLATES.COURSE_OUTLINE
      .replace('{topic}', courseRequest.topic)
      .replace('{audience}', courseRequest.audience)
      .replace('{level}', courseRequest.level)
      .replace('{duration}', courseRequest.duration)
      .replace('{goals}', courseRequest.goals);
    
    await logDebug(supabase, requestId, 'Filled prompt template', {
      promptLength: filledPrompt.length,
      replacements: {
        topic: courseRequest.topic,
        audience: courseRequest.audience,
        level: courseRequest.level,
        duration: courseRequest.duration,
        goals: courseRequest.goals
      }
    });
    
    const outlineResponse = await generateContent(supabase, requestId, filledPrompt, 0.7);
    await logDebug(supabase, requestId, 'Received outline response', {
      responseLength: outlineResponse.length
    });
    
    const cleanOutlineResponse = stripCodeFences(outlineResponse);
    await logDebug(supabase, requestId, 'Cleaned outline response', {
      cleanedLength: cleanOutlineResponse.length
    });
    
    let courseData: any;
    try {
      courseData = JSON.parse(cleanOutlineResponse);
      await logDebug(supabase, requestId, 'Successfully parsed course outline JSON', {
        modules: courseData.modules?.length,
        title: courseData.title
      });
    } catch (parseError) {
      await logDebug(supabase, requestId, 'Error parsing course outline JSON', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        rawResponse: cleanOutlineResponse
      });
      
      await updateRequestStatus(
        supabase,
        requestId,
        'failed',
        'Failed to parse course outline',
        0,
        'Invalid JSON response from AI model'
      );
      return { error: 'Failed to parse course outline' };
    }
    
    // 3. Update status with progress
    await updateRequestStatus(
      supabase,
      requestId,
      'processing',
      'Course outline generated. Generating sprint content...',
      20
    );
    
    // 4. Generate sprint content for each module and sprint
    const totalModules = courseData.modules.length;
    const totalSprints = courseData.modules.reduce(
      (acc: number, module: any) => acc + module.sprints.length, 0
    );
    
    let processedSprints = 0;
    let failedSprints = 0;
    let sprintErrors: { moduleIndex: number; sprintIndex: number; error: string }[] = [];
    
    // Process sprints in smaller batches to manage memory
    const BATCH_SIZE = 2;
    
    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
      const module = courseData.modules[moduleIndex];
      
      for (let sprintIndex = 0; sprintIndex < module.sprints.length; sprintIndex++) {
        const sprint = module.sprints[sprintIndex];
        
        // Update progress
        const progressPercent = 20 + Math.floor((processedSprints / totalSprints) * 70);
        await updateRequestStatus(
          supabase,
          requestId,
          'processing',
          `Generating sprint ${processedSprints + 1} of ${totalSprints}: ${sprint.title}`,
          progressPercent
        );
        
        // Generate sprint content
        try {
          const sprintPrompt = PROMPT_TEMPLATES.SPRINT_CONTENT
            .replace('{title}', sprint.title)
            .replace('{module}', module.title)
            .replace('{course}', courseData.title)
            .replace('{outline}', sprint.contentOutline.join(', '))
            .replace('{audience}', courseRequest.audience)
            .replace('{level}', courseRequest.level)
            .replace('{duration}', sprint.duration || '10');
          
          const sprintResponse = await generateContent(supabase, requestId, sprintPrompt, 0.7);
          let cleanSprintResponse = stripCodeFences(sprintResponse);
          
          try {
            // Try to parse the sprint content JSON
            let sprintContent;
            try {
              sprintContent = JSON.parse(cleanSprintResponse);
            } catch (parseError) {
              // If parsing fails, try a more aggressive JSON fix
              await logDebug(supabase, requestId, `Error parsing sprint content JSON for sprint ${moduleIndex}-${sprintIndex}`, { 
                error: parseError.message,
                originalResponse: sprintResponse.substring(0, 200) + '...'
              });
              
              // Make one last attempt with a more aggressive fix
              cleanSprintResponse = cleanSprintResponse
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure all keys are properly quoted
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
                
              try {
                sprintContent = JSON.parse(cleanSprintResponse);
                await logDebug(supabase, requestId, `Successfully fixed JSON for sprint ${moduleIndex}-${sprintIndex} with aggressive repair`);
              } catch (finalError) {
                // Create a simplified placeholder content if all parsing attempts fail
                await logDebug(supabase, requestId, `Failed to parse JSON even after aggressive fix: ${finalError.message}`);
                failedSprints++;
                sprintErrors.push({
                  moduleIndex,
                  sprintIndex,
                  error: finalError.message
                });
                
                // Create placeholder content
                sprintContent = {
                  title: sprint.title,
                  introduction: `Introduction to ${sprint.title}`,
                  content: sprint.contentOutline.map(item => ({ type: "text", value: item })),
                  summary: `Summary of ${sprint.title}`,
                  quiz: [
                    {
                      question: "Placeholder question about " + sprint.title,
                      options: ["Option A", "Option B", "Option C", "Option D"],
                      correctAnswer: 0,
                      explanation: "This is a placeholder quiz question",
                      type: "multiple_choice"
                    }
                  ],
                  nextSteps: "Continue to the next sprint"
                };
              }
            }
            
            // Store sprint content in database
            await supabase
              .from('sprint_contents')
              .insert([{
                request_id: requestId,
                module_index: moduleIndex,
                sprint_index: sprintIndex,
                content: sprintContent
              }]);
              
          } catch (storeError) {
            console.error(`Error storing sprint content for sprint ${moduleIndex}-${sprintIndex}:`, storeError);
            failedSprints++;
            sprintErrors.push({
              moduleIndex,
              sprintIndex,
              error: storeError.message
            });
          }
        } catch (error) {
          console.error(`Error generating sprint content for ${moduleIndex}-${sprintIndex}:`, error);
          failedSprints++;
          sprintErrors.push({
            moduleIndex,
            sprintIndex,
            error: error.message
          });
        }
        
        processedSprints++;
        
        // Add a small delay between sprints to prevent rate limiting
        if (processedSprints % BATCH_SIZE === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // 5. Fetch all sprint contents and create final course data
    const { data: sprintContents } = await supabase
      .from('sprint_contents')
      .select('*')
      .eq('request_id', requestId);
      
    const sprintContentMap = sprintContents.reduce((acc: any, sprint: any) => {
      acc[`${sprint.module_index}-${sprint.sprint_index}`] = sprint.content;
      return acc;
    }, {});
    
    // 6. Finalize and update with complete course data
    const finalCourseData = {
      course: courseData,
      sprints: sprintContentMap,
      generationStats: {
        totalSprints,
        processedSprints,
        failedSprints,
        sprintErrors: failedSprints > 0 ? sprintErrors : undefined
      }
    };
    
    await updateRequestStatus(
      supabase,
      requestId,
      'completed',
      'Course generation completed successfully',
      100,
      undefined,
      finalCourseData
    );
    
    return { 
      success: true, 
      data: finalCourseData 
    };
    
  } catch (error) {
    await logDebug(supabase, requestId, 'Error in course generation process', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Update status to failed
    await updateRequestStatus(
      supabase, 
      requestId, 
      'failed', 
      'Course generation failed',
      0,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during course generation'
    };
  }
}

// Helper function to generate UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Main handler function
serve(async (req: Request) => {
  const requestStartTime = Date.now();
  let requestId = uuidv4(); // Initialize with a UUID immediately
  
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

    // Validate critical environment variables first
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Check for missing environment variables
    const missingEnvVars: string[] = [];
    if (!GEMINI_API_KEY) missingEnvVars.push('GEMINI_API_KEY');
    if (!supabaseUrl) missingEnvVars.push('SUPABASE_URL');
    if (!supabaseServiceKey) missingEnvVars.push('SUPABASE_SERVICE_ROLE_KEY');
    
    if (missingEnvVars.length > 0) {
      console.error(`[ERROR] Missing environment variables: ${missingEnvVars.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing environment variables',
          details: `Missing: ${missingEnvVars.join(', ')}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify request method
    if (req.method !== 'POST') {
      console.log('[ERROR] Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body with better error handling
    let requestData;
    try {
      const bodyText = await req.text();
      console.log('[DEBUG] Request body:', bodyText);
      
      if (!bodyText) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      requestData = JSON.parse(bodyText);
      console.log('[DEBUG] Parsed request data:', JSON.stringify(requestData));
    } catch (error) {
      console.log('[ERROR] Invalid JSON body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request data
    const { courseRequest, requestId: providedRequestId } = requestData;
    
    // Use provided requestId if available, otherwise use the generated one
    if (providedRequestId) {
      requestId = providedRequestId;
      console.log(`[DEBUG] Using provided requestId: ${requestId}`);
    } else {
      console.log(`[DEBUG] Generated requestId: ${requestId}`);
    }
    
    if (!courseRequest) {
      console.log('[ERROR] Missing courseRequest in payload');
      return new Response(
        JSON.stringify({ error: 'Invalid request data: missing courseRequest' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

          // Create Supabase admin client with service role key
      console.log('[DEBUG] Creating Supabase client');
      const supabase = createClient(
        supabaseUrl || '', 
        supabaseServiceKey || '', 
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

    // Test Gemini API connectivity before proceeding
    try {
      console.log('[DEBUG] Testing Gemini API connectivity');
      const testResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: "Respond with 'API test successful' only."
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        },
        {
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (!testResponse.data?.candidates?.[0]?.content) {
        console.error('[ERROR] Gemini API test failed - unexpected response format');
        return new Response(
          JSON.stringify({ 
            error: 'Gemini API connectivity test failed', 
            details: 'The API returned an unexpected response format'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('[DEBUG] Gemini API test successful');
      
    } catch (apiTestError) {
      console.error('[ERROR] Gemini API test failed:', apiTestError);
      let errorDetails = 'Unknown error';
      
      if (apiTestError.response) {
        errorDetails = `Status ${apiTestError.response.status}: ${JSON.stringify(apiTestError.response.data)}`;
      } else if (apiTestError.message) {
        errorDetails = apiTestError.message;
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API connectivity test failed', 
          details: errorDetails
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      console.log('[DEBUG] Creating initial request record');
      // Create initial request record using service role (bypasses RLS)
      const { data: requestRecord, error: insertError } = await supabase
        .from('course_generation_requests')
        .insert([
          {
            id: requestId,
            user_id: null, // Allow NULL for anonymous users
            status: 'pending',
            status_message: 'Starting course generation...',
            progress: 0,
            request_data: courseRequest,
            content_generated: false
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('[ERROR] Failed to create request record:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create request record', details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[DEBUG] Starting course generation process');
      // Start the generation process in the background
      generateCourseContent(supabase, requestId, courseRequest)
        .catch(error => {
          console.error('[ERROR] Course generation failed:', error);
          updateRequestStatus(
            supabase,
            requestId,
            'failed',
            'Course generation failed',
            0,
            error instanceof Error ? error.message : 'Unknown error'
          );
        });

      const processingTime = Date.now() - requestStartTime;
      console.log(`[DEBUG] Request processed in ${processingTime}ms`);

      // Return immediate response
      return new Response(
        JSON.stringify({
          message: 'Course generation started',
          requestId,
          status: 'pending'
        }),
        { 
          status: 202, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      console.error('[ERROR] Failed to process request:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('[ERROR] Unhandled error in Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: requestId || 'unknown'
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