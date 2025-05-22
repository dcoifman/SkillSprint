import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Model configurations
const MODELS = {
  FLASH_25: {
    name: 'gemini-2.5-flash-preview-04-17',
    rpm: 10,
    tpm: 250000
  },
  FLASH_20: {
    name: 'gemini-2.0-flash',
    rpm: 15,
    tpm: 1000000
  }
};

// Rate limiting state
const rateLimit = {
  FLASH_25: {
    requestsThisMinute: 0,
    tokensThisMinute: 0,
    queue: [],
    resetTimer: null
  },
  FLASH_20: {
    requestsThisMinute: 0,
    tokensThisMinute: 0,
    queue: [],
    resetTimer: null
  }
};

// Reset rate limit counters for a model
const resetRateLimits = (modelKey) => {
  rateLimit[modelKey].requestsThisMinute = 0;
  rateLimit[modelKey].tokensThisMinute = 0;
  processQueue(modelKey);
  rateLimit[modelKey].resetTimer = setTimeout(() => resetRateLimits(modelKey), 60000);
};

// Initialize timers
Object.keys(MODELS).forEach(modelKey => {
  rateLimit[modelKey].resetTimer = setTimeout(() => resetRateLimits(modelKey), 60000);
});

// Process queue for a model
const processQueue = (modelKey) => {
  const model = MODELS[modelKey];
  const limits = rateLimit[modelKey];
  
  while (
    limits.queue.length > 0 && 
    limits.requestsThisMinute < model.rpm &&
    limits.tokensThisMinute < model.tpm
  ) {
    const { promiseResolve, promiseReject, requestFn } = limits.queue.shift();
    limits.requestsThisMinute++;
    
    requestFn()
      .then(promiseResolve)
      .catch(promiseReject);
  }
};

// Estimate token count (rough approximation)
const estimateTokens = (text) => Math.ceil(text.length / 4);

/**
 * Generate content using Gemini API with automatic model selection and fallback
 */
export const generateContent = async (prompt, temperature = 0.7) => {
  // Try Gemini 2.5 Flash first
  try {
    return await generateWithModel('FLASH_25', prompt, temperature);
  } catch (error) {
    console.log('Falling back to Gemini 2.0 Flash due to:', error.message);
    return await generateWithModel('FLASH_20', prompt, temperature);
  }
};

const generateWithModel = async (modelKey, prompt, temperature) => {
  const model = MODELS[modelKey];
  const limits = rateLimit[modelKey];
  const estimatedTokens = estimateTokens(prompt);
  
  const requestFn = () => axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${GEMINI_API_KEY}`,
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

  // Check rate limits
  if (
    limits.requestsThisMinute < model.rpm &&
    limits.tokensThisMinute + estimatedTokens < model.tpm
  ) {
    limits.requestsThisMinute++;
    limits.tokensThisMinute += estimatedTokens;
    
    try {
      const response = await requestFn();
      const text = response.data.candidates[0].content.parts[0].text;
      console.log(`${model.name} Response:`, text);
      return text;
    } catch (error) {
      console.error(`Error generating content with ${model.name}:`, error);
      throw error;
    }
  } else {
    // If primary model (2.5) hits rate limit, throw error to trigger fallback
    if (modelKey === 'FLASH_25') {
      throw new Error('Rate limit reached for Gemini 2.5 Flash');
    }
    
    // Queue the request for secondary model
    return new Promise((resolve, reject) => {
      limits.queue.push({
        promiseResolve: (response) => {
          console.log(`${model.name} Response (from queue):`, response);
          resolve(response);
        },
        promiseReject: reject,
        requestFn
      });
    });
  }
};

// Optimized prompt templates for course creation
export const PROMPT_TEMPLATES = {
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

  GENERATE_OBJECTIVES: `Based on the course topic "{topic}" aimed at {audience} with skill level {level}, generate 5-8 specific learning objectives that are clear, measurable, and achievable.

Format the response as a JSON array with the following structure:
[
  "After completing this course, students will be able to [specific measurable outcome]",
  "Students will demonstrate the ability to [specific measurable outcome]",
  "Learners will successfully [specific measurable outcome]"
]

Ensure objectives use strong action verbs (apply, analyze, evaluate, create, etc.) and focus on practical, real-world applications where appropriate.
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
Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.`,

  IMPROVE_CONTENT: `Review and improve the following course content to make it more engaging, clear, and educational:

{content}

Consider the following criteria:
- Clarity of explanation
- Engagement level
- Educational value
- Appropriate complexity for {level} level students
- Use of examples, analogies and visual representations
- Variety of teaching methods (text, visuals, activities, case studies)
- Different assessment types beyond multiple choice

Provide an improved version maintaining the same overall structure.
Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.`
};

// Helper function to strip code fences from Gemini responses
export function stripCodeFences(response) {
  let clean = response.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  
  // Fix common JSON formatting issues
  clean = clean.replace(/\},(\s*)\}/g, '}$1]'); // Fix array closing brackets
  clean = clean.replace(/\\"/g, '"'); // Fix escaped quotes
  
  // Validate JSON structure
  try {
    JSON.parse(clean);
  } catch (e) {
    console.warn('JSON validation failed:', e.message);
  }
  
  return clean;
}

// Function to generate practice problems
const generatePracticeProblems = async (sprintTitle, sprintContent) => {
  const prompt = `Generate 3-5 practice problems based on the following sprint content:\n\nSprint Title: ${sprintTitle}\n\nSprint Content:\n${sprintContent}\n\nProvide the problems in a clear, numbered list format.`;

  try {
    const response = await generateContent(prompt);
    return response;
  } catch (error) {
    console.error('Error in generatePracticeProblems:', error);
    throw error;
  }
};

// Function to generate learning summary
const generateLearningSummary = async (pathTitle, completedSprintTitles) => {
  const prompt = `Generate a personalized learning summary for the course "${pathTitle}" based on the following completed sprints:\n\n${completedSprintTitles.map(title => `- ${title}`).join('\n')}\n\nHighlight the key concepts covered in these sprints and provide a brief overall summary of the user's progress in the course. The summary should be encouraging and informative.`;

  try {
    const response = await generateContent(prompt);
    return response;
  } catch (error) {
    console.error('Error in generateLearningSummary:', error);
    throw error;
  }
};

// Create a named object for export
const geminiClient = {
  generateContent,
  PROMPT_TEMPLATES,
  stripCodeFences,
  generatePracticeProblems, // Reference the standalone function
  generateLearningSummary, // Reference the standalone function
};

// Export the named object and specific functions
export {
  generateContent,
  PROMPT_TEMPLATES,
  stripCodeFences,
  generatePracticeProblems, // Export the standalone function
  generateLearningSummary,  // Export the standalone function
  geminiClient as default, 
}; 