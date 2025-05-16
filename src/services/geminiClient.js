import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL_NAME = process.env.REACT_APP_MODEL_NAME || 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

// Rate limiting helper to stay within free tier (10 requests per minute)
const queue = [];
const MAX_REQUESTS_PER_MINUTE = 10;
let requestsThisMinute = 0;
let resetTimer = null;

const resetRequestCount = () => {
  requestsThisMinute = 0;
  processQueue();
  resetTimer = setTimeout(resetRequestCount, 60000);
};

const processQueue = () => {
  while (queue.length > 0 && requestsThisMinute < MAX_REQUESTS_PER_MINUTE) {
    const { promiseResolve, promiseReject, requestFn } = queue.shift();
    requestsThisMinute++;
    
    requestFn()
      .then(promiseResolve)
      .catch(promiseReject);
  }
};

// Initialize timer
resetTimer = setTimeout(resetRequestCount, 60000);

/**
 * Generate content using Gemini API with rate limiting
 */
export const generateContent = async (prompt, temperature = 0.7) => {
  const requestFn = () => axios.post(
    `${API_URL}?key=${GEMINI_API_KEY}`,
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
        maxOutputTokens: 2048,
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

  // If we haven't hit rate limit, process immediately, otherwise queue
  if (requestsThisMinute < MAX_REQUESTS_PER_MINUTE) {
    requestsThisMinute++;
    try {
      const response = await requestFn();
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  } else {
    // Queue the request
    return new Promise((resolve, reject) => {
      queue.push({
        promiseResolve: resolve,
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
    }
  ],
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this answer is correct"
    }
  ],
  "summary": "A concise summary of what was learned in this sprint (2-3 sentences)",
  "nextSteps": "Suggestion for what to learn next"
}

Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.`,

  IMPROVE_CONTENT: `Review and improve the following course content to make it more engaging, clear, and educational:

{content}

Consider the following criteria:
- Clarity of explanation
- Engagement level
- Educational value
- Appropriate complexity for {level} level students
- Use of examples and analogies

Provide an improved version maintaining the same overall structure.
Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.`
};

// Helper to strip code fences from Gemini responses
export function stripCodeFences(response) {
  let clean = response.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return clean;
}

export default {
  generateContent,
  PROMPT_TEMPLATES,
  stripCodeFences
}; 