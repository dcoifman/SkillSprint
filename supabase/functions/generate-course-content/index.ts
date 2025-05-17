import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import axios from 'https://esm.sh/axios@1.3.6';

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
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  
  // Fix common JSON formatting issues
  clean = clean.replace(/\},(\s*)\}/g, '}$1]'); // Fix array closing brackets
  clean = clean.replace(/\\"/g, '"'); // Fix escaped quotes
  
  return clean;
}

// Generate content using Gemini API
async function generateContent(prompt: string, temperature = 0.7): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
      {
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
          maxOutputTokens: 64000,
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
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating content:', error);
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
  const updates: any = {
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
  
  const { data, error } = await supabase
    .from('course_generation_requests')
    .update(updates)
    .eq('id', requestId);
    
  if (error) {
    console.error('Error updating request status:', error);
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
    // 1. Update status to processing
    await updateRequestStatus(
      supabase, 
      requestId, 
      'processing', 
      'Generating course outline...',
      5
    );
    
    // 2. Generate course outline
    const filledPrompt = PROMPT_TEMPLATES.COURSE_OUTLINE
      .replace('{topic}', courseRequest.topic)
      .replace('{audience}', courseRequest.audience)
      .replace('{level}', courseRequest.level)
      .replace('{duration}', courseRequest.duration)
      .replace('{goals}', courseRequest.goals);
    
    const outlineResponse = await generateContent(filledPrompt, 0.7);
    const cleanOutlineResponse = stripCodeFences(outlineResponse);
    
    let courseData: any;
    try {
      courseData = JSON.parse(cleanOutlineResponse);
    } catch (parseError) {
      console.error('Error parsing course outline JSON:', parseError);
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
    
    const sprintContents: Record<string, any> = {};
    let processedSprints = 0;
    
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
          
          const sprintResponse = await generateContent(sprintPrompt, 0.7);
          const cleanSprintResponse = stripCodeFences(sprintResponse);
          
          try {
            const sprintContent = JSON.parse(cleanSprintResponse);
            sprintContents[`${moduleIndex}-${sprintIndex}`] = sprintContent;
          } catch (parseError) {
            console.error(`Error parsing sprint content JSON for sprint ${moduleIndex}-${sprintIndex}:`, parseError);
            // Continue with other sprints even if one fails
          }
        } catch (error) {
          console.error(`Error generating sprint content for ${moduleIndex}-${sprintIndex}:`, error);
          // Continue with other sprints even if one fails
        }
        
        processedSprints++;
      }
    }
    
    // 5. Finalize and update with complete course data
    const finalCourseData = {
      course: courseData,
      sprints: sprintContents
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
    console.error('Error in course generation process:', error);
    
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

// Main handler function
serve(async (req: Request) => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers });
    }
    
    // Verify necessary env vars
    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Missing required environment variables'
        }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create supabase admin client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Parse request body
    const requestData: GenerationRequest = await req.json();
    const { requestId, courseRequest } = requestData;
    
    if (!requestId || !courseRequest) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data: missing requestId or courseRequest' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the request asynchronously and respond immediately
    // This allows the function to continue processing after responding to the client
    const promise = generateCourseContent(supabase, requestId, courseRequest);
    
    // Return a 202 Accepted response immediately
    return new Response(
      JSON.stringify({
        message: 'Course generation started',
        requestId
      }),
      { 
        status: 202, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Unhandled error in Edge Function:', error);
    
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