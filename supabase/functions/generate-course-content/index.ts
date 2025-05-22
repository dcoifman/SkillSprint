// @deno-types="https://deno.land/std@0.177.0/http/server.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @deno-types="npm:@supabase/supabase-js@2.21.0"
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.21.0";
// @deno-types="npm:axios"
import axios from "npm:axios";
import JSON5 from "https://deno.land/x/json5@v1.0.1/mod.ts"; // Updated to a likely existing version
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// Declare Deno namespace
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

// Define fs interface
interface FileSystem {
  readFileSync(path: string, encoding?: string): string;
  promises: {
    readFile(path: string): Promise<string>;
  };
  existsSync(): boolean;
  statSync(): { isFile(): boolean };
}

// Create a global fs stub to replace node:fs functionality
const fs: FileSystem = {
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
declare global {
  interface Window {
    fs: FileSystem;
  }
  let fs: FileSystem;
}
const globalThis = {
  fs: fs
};

// Zod Schemas
const CourseOutlineSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  learningObjectives: z.array(z.string().min(1)),
  prerequisites: z.array(z.string().min(1)).optional(),
  modules: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    sprints: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      duration: z.string().min(1), // e.g., "5-15 minutes"
      contentOutline: z.array(z.string().min(1)),
    })),
  })),
});

const SprintContentSchema = z.object({
  title: z.string().min(1),
  introduction: z.string().min(1),
  content: z.array(z.object({
    type: z.enum(["text", "key_point", "example", "visual_tree", "activity", "reflection"]),
    value: z.string().min(1),
  })),
  quiz: z.array(z.object({
    question: z.string().min(1),
    type: z.enum(["multiple_choice", "fill_blank", "ordering"]),
    options: z.array(z.string().min(1)).optional(), // Only for multiple_choice and ordering
    correctAnswer: z.union([z.number(), z.string().min(1)]).optional(), // number for MC index, string for fill_blank
    correctOrder: z.array(z.number()).optional(), // Only for ordering
    explanation: z.string().optional(),
  })).min(1), // Ensure at least one quiz question
  summary: z.string().min(1),
  nextSteps: z.string().min(1),
});

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

interface RequestStatus {
  status: string;
  status_message?: string;
  progress?: number;
  error_message?: string;
  course_data?: unknown;
  updated_at: string;
}

// Configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Enhanced logging function (MODIFIED: only console logs, no DB update)
async function logDebug(supabase: SupabaseClient, requestId: string, message: string, data?: unknown) {
  console.log(`[DEBUG] RequestID ${requestId}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  // Database update was removed from logDebug to reduce DB load.
}

// Helper function to check for cancellation
async function checkIfCancelled(supabase: SupabaseClient, requestId: string): Promise<boolean> {
  await logDebug(supabase, requestId, "Checking for cancellation status..."); // Console only
  const { data, error } = await supabase
    .from('course_generation_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (error) {
    // Log the error but don't stop the process for this, assume not cancelled if status check fails.
    console.error(`[WARNING] RequestID ${requestId}: Error checking cancellation status:`, error.message);
    await logDebug(supabase, requestId, "Error checking cancellation status, assuming not cancelled.", { error: error.message }); // Console only
    return false; 
  }
  
  if (data?.status === 'cancelled') {
    console.log(`[INFO] RequestID ${requestId}: Cancellation detected by status check.`);
    await logDebug(supabase, requestId, "Cancellation detected by status check."); // Console only
    return true;
  }
  await logDebug(supabase, requestId, "No cancellation detected.", { status: data?.status }); // Console only
  return false;
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

// Helper to strip code fences and parse JSON (now returns a parsed object or throws)
function parseAIResponse(response: string, requestIdForLog: string): any {
  let textToParse = response.trim();
  
  // Remove code fences
  if (textToParse.startsWith('```json')) {
    textToParse = textToParse.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (textToParse.startsWith('```')) {
    textToParse = textToParse.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    // Attempt parsing with JSON5 first (more tolerant)
    return JSON5.parse(textToParse);
  } catch (json5Error) {
    console.log(`[DEBUG] RequestID ${requestIdForLog}: JSON5 parsing failed: ${json5Error.message}. Attempting fallback parsing...`);
    
    // Fallback to existing aggressive fixes and standard JSON.parse
    let fixedText = textToParse;
    // Fix line breaks inside strings (more targeted)
    fixedText = fixedText.replace(/"[^"\\]*(\\.[^"\\]*)*"/g, (match) => match.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
    // Fix missing commas between properties: "prop1": "value1" "prop2": "value2" -> "prop1": "value1", "prop2": "value2"
    fixedText = fixedText.replace(/\"\s*\n\s*\"/g, '",\n"');
    // Fix missing commas between array items: } { -> }, {
    fixedText = fixedText.replace(/}\s*\n?\s*{/g, '}, {');
     // Fix missing commas in arrays ] [ -> ], [
    fixedText = fixedText.replace(/]\s*\n?\s*\[/g, '], [');
    // Fix trailing commas before closing brackets/braces ,] -> ] or ,} -> }
    fixedText = fixedText.replace(/,(\s*[\]}])/g, '$1');
    // Attempt to fix unescaped quotes within strings (basic attempt)
    // This is tricky and might need refinement.
    // Example: "value": "string with "quote" inside"
    // fixedText = fixedText.replace(/: *"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, group1) => {
    //   return ': "' + group1.replace(/(?<!\\)"/g, '\\"') + '"';
    // });
    
    try {
      const parsedWithFallback = JSON.parse(fixedText);
      console.log(`[DEBUG] RequestID ${requestIdForLog}: Successfully parsed with fallback string manipulations.`);
      return parsedWithFallback;
    } catch (fallbackParseError) {
      console.log(`[DEBUG] RequestID ${requestIdForLog}: Fallback JSON parsing also failed: ${fallbackParseError.message}. Applying aggressive fixes...`);
      // Last resort - very aggressive fixes (potentially unsafe)
      let aggressiveFixedText = textToParse; // Start from original text for aggressive fixes
      aggressiveFixedText = aggressiveFixedText.replace(/(\w+):/g, '"$1":'); // Ensure property names are quoted
      aggressiveFixedText = aggressiveFixedText.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas more aggressively
      
      try {
        const parsedWithAggressiveFallback = JSON.parse(aggressiveFixedText);
        console.log(`[DEBUG] RequestID ${requestIdForLog}: Successfully parsed with AGGRESSIVE fallback string manipulations.`);
        return parsedWithAggressiveFallback;
      } catch (aggressiveFallbackError) {
         console.error(`[ERROR] RequestID ${requestIdForLog}: All JSON parsing attempts failed. Original text (first 300 chars): ${response.substring(0,300)}`, aggressiveFallbackError);
         throw new Error(`Failed to parse JSON response after multiple attempts: ${aggressiveFallbackError.message}`);
      }
    }
  }
}

// Generate content using Gemini API
async function generateContent(supabase: SupabaseClient, requestId: string, prompt: string, temperature = 0.7): Promise<string> {
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
  supabase: SupabaseClient, 
  requestId: string, 
  status: string, 
  statusMessage?: string, 
  progress?: number,
  errorMessage?: string,
  courseData?: any
) {
  const updates: RequestStatus = {
    status,
    updated_at: new Date().toISOString()
  };
  
  if (statusMessage) updates.status_message = statusMessage;
  if (progress !== undefined) updates.progress = progress;
  if (errorMessage) updates.error_message = errorMessage;
  if (courseData) {
    updates.course_data = courseData;
  }
  
  // logDebug was removed from here previously.
  console.log(`[INFO] RequestID ${requestId}: Updating request status with:`, { status, statusMessage, progress, errorMessage });
  
  const { data, error } = await supabase
    .from('course_generation_requests')
    .update(updates)
    .eq('id', requestId);
    
  if (error) {
    console.error(`[CRITICAL] RequestID ${requestId}: Error updating request status in DB:`, error);
  }
  
  return { data, error };
}

// Main generation logic for course content
async function generateCourseContent(
  supabase: SupabaseClient,
  requestId: string,
  courseRequest: CourseRequest
): Promise<any> {
  try {
    await logDebug(supabase, requestId, 'Starting course generation', { courseRequest });
    
    // === CANCELLATION CHECK 1: Before starting anything significant ===
    if (await checkIfCancelled(supabase, requestId)) {
      await logDebug(supabase, requestId, 'Cancellation detected before outline generation.');
      // No need to update status again if it's already 'cancelled'. 
      // The cancellation function should set the status_message.
      return { success: false, error: 'Course generation cancelled by user.' };
    }

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
    
    let parsedOutline: any;
    try {
      parsedOutline = parseAIResponse(outlineResponse, requestId); // Use new parsing function
      await logDebug(supabase, requestId, 'Successfully parsed course outline candidate JSON', {
        title: parsedOutline.title
      });
    } catch (parseError) {
      await logDebug(supabase, requestId, 'Critical Error: Failed to parse course outline JSON after all fallbacks', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        rawResponsePreview: outlineResponse.substring(0, 300) + "..."
      });
      await updateRequestStatus(
        supabase,
        requestId,
        'failed',
        'Failed to parse course outline',
        0,
        `Invalid JSON response from AI model: ${parseError.message}`
      );
      return { error: 'Failed to parse course outline' };
    }

    // Validate parsed outline with Zod
    const outlineValidationResult = CourseOutlineSchema.safeParse(parsedOutline);
    if (!outlineValidationResult.success) {
      await logDebug(supabase, requestId, 'Critical Error: Course outline JSON failed schema validation', {
        errors: outlineValidationResult.error.flatten(),
        parsedOutlinePreview: JSON.stringify(parsedOutline).substring(0, 300) + "..."
      });
      await updateRequestStatus(
        supabase,
        requestId,
        'failed',
        'Course outline structure is invalid',
        0,
        `Invalid structure in AI response for course outline: ${outlineValidationResult.error.message}`
      );
      return { error: 'Course outline structure is invalid' };
    }
    
    const courseData = outlineValidationResult.data;
    await logDebug(supabase, requestId, 'Successfully validated course outline structure', {
        modules: courseData.modules?.length,
        title: courseData.title
    });

    // === CANCELLATION CHECK 2: After outline, before sprint generation ===
    if (await checkIfCancelled(supabase, requestId)) {
      await logDebug(supabase, requestId, 'Cancellation detected after outline generation.');
      await updateRequestStatus(supabase, requestId, 'cancelled', 'Processing halted: User cancelled after outline generation.');
      return { success: false, error: 'Course generation cancelled by user.' };
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
    const sprintErrors: string[] = [];
    
    // Process sprints in smaller batches to manage memory
    const BATCH_SIZE = 2; // Max 2 concurrent LLM calls

    // Create a flat list of all sprints to be generated
    const allSprintsToGenerate: any[] = [];
    courseData.modules.forEach((module: any, moduleIndex: number) => {
      module.sprints.forEach((sprint: any, sprintIndex: number) => {
        allSprintsToGenerate.push({
          module,
          sprint,
          moduleIndex,
          sprintIndex,
          courseTitle: courseData.title,
        });
      });
    });

    for (let i = 0; i < allSprintsToGenerate.length; i += BATCH_SIZE) {
      // === CANCELLATION CHECK 3: Before each sprint batch ===
      if (await checkIfCancelled(supabase, requestId)) {
        await logDebug(supabase, requestId, `Cancellation detected before sprint batch ${i / BATCH_SIZE + 1}.`);
        await updateRequestStatus(supabase, requestId, 'cancelled', `Processing halted: User cancelled before sprint batch ${i / BATCH_SIZE + 1}.`);
        return { success: false, error: 'Course generation cancelled by user during sprint processing.' };
      }

      const batch = allSprintsToGenerate.slice(i, i + BATCH_SIZE);
      
      const progressPercent = 20 + Math.floor(((processedSprints + failedSprints) / totalSprints) * 70);
      await updateRequestStatus(
        supabase,
        requestId,
        'processing',
        `Generating sprints ${processedSprints + failedSprints + 1} through ${Math.min(processedSprints + failedSprints + batch.length, totalSprints)} of ${totalSprints}...`,
        progressPercent
      );

      const sprintPromises = batch.map(async (sprintDetails) => {
        const { module, sprint, moduleIndex, sprintIndex, courseTitle } = sprintDetails;
        try {
          const sprintPrompt = PROMPT_TEMPLATES.SPRINT_CONTENT
            .replace('{title}', sprint.title)
            .replace('{module}', module.title)
            .replace('{course}', courseTitle)
            .replace('{outline}', sprint.contentOutline.join(', '))
            .replace('{audience}', courseRequest.audience)
            .replace('{level}', courseRequest.level)
            .replace('{duration}', sprint.duration || '10');

          const sprintResponse = await generateContent(supabase, requestId, sprintPrompt, 0.7);
          let parsedSprintJson: any;
          let sprintContent: any;

          try {
            parsedSprintJson = parseAIResponse(sprintResponse, requestId); // Use new parsing function
            
            const sprintValidationResult = SprintContentSchema.safeParse(parsedSprintJson);
            if (!sprintValidationResult.success) {
              await logDebug(supabase, requestId, `Sprint content JSON failed schema validation for sprint ${moduleIndex}-${sprintIndex}`, {
                errors: sprintValidationResult.error.flatten(),
                parsedSprintJsonPreview: JSON.stringify(parsedSprintJson).substring(0, 200) + "..."
              });
              // This error will be caught by the outer catch, leading to placeholder
              throw new Error(`Sprint content structure is invalid for "${sprint.title}": ${sprintValidationResult.error.message}`);
            }
            sprintContent = sprintValidationResult.data;
            await logDebug(supabase, requestId, `Successfully parsed and validated sprint content for ${sprint.title}`);

          } catch (error) { // Catches errors from parseAIResponse or Zod validation
             await logDebug(supabase, requestId, `Error processing sprint content for ${sprint.title}, falling back to placeholder.`, {
                originalResponsePreview: sprintResponse.substring(0, 200) + '...',
                error: error.message
             });
            // Create placeholder content
            sprintContent = {
              title: sprint.title,
              introduction: `Introduction to ${sprint.title}. (Content generation error: ${error.message})`,
              content: sprint.contentOutline.map((item: string) => ({ type: "text", value: item })),
              summary: `Summary of ${sprint.title}.`,
              quiz: [
                {
                  question: "Placeholder question about " + sprint.title,
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: 0,
                  explanation: "This is a placeholder quiz question due to a content generation error.",
                  type: "multiple_choice"
                }
              ],
              nextSteps: "Continue to the next sprint or review previous content."
            };
            // This error will be caught by the *outermost* catch for this sprintPromise,
            // ensuring it's counted as a 'failedSprint' correctly.
            // We re-throw so it's handled by the Promise.allSettled logic properly.
            throw new Error(`Failed to generate/validate sprint content for "${sprint.title}": ${error.message}`);
          }
          
          await supabase
            .from('sprint_contents')
            .insert([{
              request_id: requestId,
              module_index: moduleIndex,
              sprint_index: sprintIndex,
              content: sprintContent
            }]);
          return { status: 'fulfilled', value: { moduleIndex, sprintIndex } };
        } catch (error) {
          console.error(`Error processing sprint ${moduleIndex}-${sprintIndex} (${sprint.title}):`, error);
          // Ensure placeholder content is created even if generation/storage fails
           const placeholderContent = {
              title: sprint.title,
              introduction: `Introduction to ${sprint.title}`,
              content: sprint.contentOutline.map((item: string) => ({ type: "text", value: item })),
              summary: `Summary of ${sprint.title}`,
              quiz: [
                {
                  question: "Placeholder question about " + sprint.title,
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: 0,
                  explanation: "This is a placeholder quiz question due to generation error.",
                  type: "multiple_choice"
                }
              ],
              nextSteps: "Continue to the next sprint"
            };
           try {
             await supabase
                .from('sprint_contents')
                .insert([{
                  request_id: requestId,
                  module_index: moduleIndex,
                  sprint_index: sprintIndex,
                  content: placeholderContent,
                  generation_error: error.message 
                }]);
           } catch (dbError) {
             console.error(`Error storing placeholder content for sprint ${moduleIndex}-${sprintIndex}:`, dbError);
           }
          return { status: 'rejected', reason: error.message, moduleIndex, sprintIndex, sprintTitle: sprint.title };
        }
      });

      const results = await Promise.allSettled(sprintPromises);

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.status !== 'rejected') { // Check inner status for explicit rejections
          processedSprints++;
        } else {
          failedSprints++;
          const reason = result.status === 'rejected' ? result.reason : (result.value as any).reason;
          const sprintTitle = result.status === 'rejected' ? (result.reason as any).sprintTitle : (result.value as any).sprintTitle;
          sprintErrors.push(`Sprint "${sprintTitle || 'Unknown'}" failed: ${reason}`);
          logDebug(supabase, requestId, `Sprint generation failed for "${sprintTitle || 'Unknown'}"`, { error: reason });
        }
      });
      
      // Add delay after each batch
      if (i + BATCH_SIZE < allSprintsToGenerate.length) { // Check if it's not the last batch
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
      }
    }
    
    // === CANCELLATION CHECK 4: After all sprint batches complete, before final data assembly ===
    if (await checkIfCancelled(supabase, requestId)) {
      await logDebug(supabase, requestId, 'Cancellation detected before final data assembly.');
      await updateRequestStatus(supabase, requestId, 'cancelled', 'Processing halted: User cancelled before final data assembly.');
      return { success: false, error: 'Course generation cancelled by user.' };
    }

    // 5. Fetch all sprint contents (including placeholders) and create final course data
    const { data: sprintContentsData, error: fetchError } = await supabase
      .from('sprint_contents')
      .select('*')
      .eq('request_id', requestId)
      .order('module_index', { ascending: true })
      .order('sprint_index', { ascending: true });

    if (fetchError) {
      await logDebug(supabase, requestId, 'Error fetching sprint contents', { error: fetchError });
      // Potentially update status to failed if this is critical
      throw new Error(`Failed to fetch sprint contents: ${fetchError.message}`);
    }
      
    const sprintContentMap = (sprintContentsData || []).reduce((acc: any, sprint: any) => {
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
    
    // Before setting to 'failed', check if it was 'cancelled' by another process.
    // This avoids race conditions where cancellation happens during this error handling.
    const { data: currentStatusData, error: statusCheckError } = await supabase
        .from('course_generation_requests')
        .select('status')
        .eq('id', requestId)
        .single();

    if (statusCheckError) {
        await logDebug(supabase, requestId, 'Failed to re-check status before setting to failed in error handler.', { error: statusCheckError.message });
    }

    if (currentStatusData?.status !== 'cancelled') {
      await updateRequestStatus(
        supabase, 
        requestId, 
        'failed', 
        'Course generation failed',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } else {
       // If it was cancelled, just preserve that status and perhaps log the original error
       await logDebug(supabase, requestId, 'Course generation process encountered an error, but request was already cancelled.', {
         originalError: error instanceof Error ? error.message : 'Unknown error'
       });
    }
    
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during course generation'
    };
  }
}

// Fix UUID function with proper operator precedence
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
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