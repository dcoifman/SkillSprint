/**
 * Gemini API client for Supabase Edge Function
 * Adapted from the frontend client to work in Deno environment
 */

/**
 * Generate content using Gemini API
 * @param prompt The prompt to send to Gemini
 * @param temperature Temperature parameter (0.0-1.0)
 * @returns Generated content as string
 */
export async function generateContent(
  prompt: string,
  temperature: number = 0.7
): Promise<string | null> {
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    const modelName = "gemini-2.5-flash-preview-04-17"; // Using the latest model

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 12000,
            topP: 0.95,
            topK: 64,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (
      !data.candidates || 
      !data.candidates[0] || 
      !data.candidates[0].content || 
      !data.candidates[0].content.parts || 
      !data.candidates[0].content.parts[0] || 
      !data.candidates[0].content.parts[0].text
    ) {
      console.error("Unexpected Gemini API response format:", data);
      throw new Error("Unexpected Gemini API response format");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return null;
  }
}

/**
 * Strip code fences from a response (if present)
 * @param response The response string that might contain code fences
 * @returns Clean response without code fences
 */
export function stripCodeFences(response: string): string {
  if (!response) return '';
  
  // Check if the response is wrapped in ```json and ``` markers
  const jsonMatch = response.match(/```json\n([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }
  
  // Check if the response is wrapped in just ``` markers
  const codeMatch = response.match(/```\n?([\s\S]*?)```/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }
  
  return response;
} 