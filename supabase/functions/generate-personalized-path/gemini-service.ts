import { generateContent } from "./gemini-client.ts";

export interface KnowledgeArea {
  id: string;
  name: string;
  description?: string;
  proficiency_score: number;
}

export interface SprintContent {
  title: string;
  introduction: string;
  content: Array<{
    type: string;
    value: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

/**
 * Generate personalized sprint content based on a knowledge area and user's proficiency
 */
export async function generatePersonalizedSprint(
  knowledgeArea: KnowledgeArea,
  difficulty: number = 3 // 1-5 scale
): Promise<SprintContent | null> {
  try {
    const prompt = `
Generate a personalized learning sprint to help a student improve their understanding of ${knowledgeArea.name}.

Additional context:
- Student's current proficiency level: ${Math.round(knowledgeArea.proficiency_score * 100)}%
- Target difficulty level: ${difficulty} (on a scale of 1-5)
- Knowledge area description: ${knowledgeArea.description || knowledgeArea.name}

The sprint should be designed to strengthen understanding and fill knowledge gaps. Create content that is:
- Focused specifically on ${knowledgeArea.name}
- Targeted at the appropriate difficulty level
- Contains clear explanations, examples, and visual representations
- Includes interactive elements and reflection prompts
- Ends with appropriately challenging quiz questions

Format the response as a JSON object with the following structure:
{
  "title": "Sprint title focused on the knowledge area",
  "introduction": "A brief engaging introduction that explains the importance of this knowledge area",
  "content": [
    {
      "type": "text",
      "value": "Educational content segment explaining a key concept"
    },
    {
      "type": "key_point",
      "value": "A critical concept to understand highlighted as a key point"
    },
    {
      "type": "example",
      "value": "A practical example demonstrating application"
    },
    {
      "type": "visual_tree",
      "value": "Description of a visual concept hierarchy or relationship using -> to indicate connections"
    },
    {
      "type": "activity",
      "value": "An interactive activity to reinforce learning"
    },
    {
      "type": "reflection",
      "value": "A question prompting the user to reflect on their understanding"
    }
  ],
  "quiz": [
    {
      "question": "A question testing understanding of the knowledge area",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this answer is correct and others are incorrect"
    },
    {
      "question": "Another question focusing on application of knowledge",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "Explanation of the correct answer"
    },
    {
      "question": "A more challenging question that requires deeper understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "Explanation of the correct answer"
    }
  ]
}

Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.
`;

    const response = await generateContent(prompt, 0.7);
    if (!response) return null;

    try {
      // Parse response as JSON
      const parsedContent = JSON.parse(response);
      return parsedContent as SprintContent;
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      return null;
    }
  } catch (error) {
    console.error("Error generating personalized sprint:", error);
    return null;
  }
}

/**
 * Generate a quiz focused on a specific knowledge area
 */
export async function generateQuizQuestions(
  knowledgeArea: KnowledgeArea,
  difficulty: number = 3, // 1-5 scale
  count: number = 5
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}> | null> {
  try {
    const prompt = `
Generate ${count} quiz questions to test a student's understanding of ${knowledgeArea.name}.

Additional context:
- Student's current proficiency level: ${Math.round(knowledgeArea.proficiency_score * 100)}%
- Target difficulty level: ${difficulty} (on a scale of 1-5)
- Knowledge area description: ${knowledgeArea.description || knowledgeArea.name}

The questions should:
- Focus specifically on testing understanding of ${knowledgeArea.name} concepts
- Match the appropriate difficulty level (${difficulty}/5)
- Include application questions, not just recall
- Have clear, unambiguous correct answers
- Include plausible distractors as incorrect options
- Provide educational explanations for the correct answers

Format the response as a JSON array with the following structure:
[
  {
    "question": "The question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why Option A is correct and the others are wrong"
  },
  {
    "question": "Another question text?", 
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2,
    "explanation": "Explanation of why Option C is correct"
  }
]

Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.
`;

    const response = await generateContent(prompt, 0.7);
    if (!response) return null;

    try {
      // Parse response as JSON
      const parsedQuestions = JSON.parse(response);
      return parsedQuestions;
    } catch (e) {
      console.error("Error parsing Gemini quiz response:", e);
      return null;
    }
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return null;
  }
}

/**
 * Generate learning objectives for a personalized learning path
 */
export async function generateLearningObjectives(
  weakAreas: KnowledgeArea[],
  strongAreas: KnowledgeArea[]
): Promise<string[] | null> {
  try {
    const weakAreasText = weakAreas.map(area => `- ${area.name} (current proficiency: ${Math.round(area.proficiency_score * 100)}%)`).join("\n");
    const strongAreasText = strongAreas.map(area => `- ${area.name} (current proficiency: ${Math.round(area.proficiency_score * 100)}%)`).join("\n");

    const prompt = `
Generate 5-7 specific learning objectives for a personalized learning path based on the student's strengths and areas for improvement.

Student's weak areas:
${weakAreasText}

Student's strong areas:
${strongAreasText}

Generate learning objectives that:
1. Primarily focus on improving the weak areas
2. Build upon existing strengths where relevant
3. Use strong action verbs (identify, analyze, evaluate, etc.)
4. Are specific, measurable, and achievable
5. Focus on practical applications and deeper understanding

Format the response as a JSON array of strings, each containing one learning objective.
Example:
[
  "Analyze the components of the nervous system to understand their interrelationships and functional significance.",
  "Differentiate between various types of muscle tissue and explain their roles in body movement and function."
]

Output ONLY valid JSON. Do not include markdown, code fences, or any explanation.
`;

    const response = await generateContent(prompt, 0.7);
    if (!response) return null;

    try {
      // Parse response as JSON
      const parsedObjectives = JSON.parse(response);
      return parsedObjectives;
    } catch (e) {
      console.error("Error parsing Gemini learning objectives response:", e);
      return null;
    }
  } catch (error) {
    console.error("Error generating learning objectives:", error);
    return null;
  }
} 