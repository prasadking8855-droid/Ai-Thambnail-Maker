
import { GoogleGenAI } from "@google/genai";
import { processImage } from "../utils";
import { GenerateThumbnailParams } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to wait for a specified time (used for retries)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateThumbnail = async ({ title, imageFile, referenceImageFile }: GenerateThumbnailParams): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Process and compress the main image to avoid payload size errors
    const processedMain = await processImage(imageFile);

    // Prepare content parts
    const parts: any[] = [
      {
        inlineData: {
          mimeType: processedMain.mimeType,
          data: processedMain.base64,
        },
      }
    ];

    let prompt = "";

    // If a reference image is provided, use STRICT Character Replacement Logic
    if (referenceImageFile) {
      // Process reference
      const processedRef = await processImage(referenceImageFile);
      
      parts.push({
        inlineData: {
          mimeType: processedRef.mimeType,
          data: processedRef.base64,
        },
      });

      // NOTE: parts[0] is Main Image (Identity), parts[1] is Reference Image (Template)
      // Gemini 1.5/2.0 logic processes images in order.

      prompt = `
      TASK: VISUAL IDENTITY SWAP (FACE & BODY REPLACEMENT)
      
      INPUTS:
      - IMAGE 1 (The first image): "THE NEW ACTOR" (Identity Source).
      - IMAGE 2 (The second image): "THE SCENE TEMPLATE" (Layout, Background, Style Reference).
      
      OBJECTIVE:
      You must regenerate IMAGE 2 (The Template), but replace the main character in it with the person from IMAGE 1 (The New Actor).
      
      STRICT CONSTRAINTS:
      1. **BACKGROUND & LAYOUT**:
         - PRESERVE the exact background, lighting, and composition of IMAGE 2.
         - Do NOT create a new background. Use the background from IMAGE 2.
      
      2. **CHARACTER INTEGRATION**:
         - The New Actor (from Image 1) must adopting the EXACT POSE, HAND GESTURES, and FACIAL EXPRESSION of the original character in Image 2.
         - If the original character is pointing, the new actor must point.
         - If the original character is screaming, the new actor must scream.
      
      3. **TEXT HANDLING (CRITICAL)**:
         ${title && title.trim().length > 0
           ? `- REPLACE the text in the image with: "${title}". Use the same font style and position as the original text.` 
           : `- **CRITICAL: PRESERVE ALL ORIGINAL TEXT.**
              - Do NOT change, remove, or blur any text found in IMAGE 2.
              - The text "overlay" must remain identical to the reference.
              - ONLY change the person.`
         }
      
      4. **NEGATIVE PROMPT**:
         - Do NOT simply output Image 2 without changes.
         - Do NOT simply place Image 1 on a white background.
         - You MUST combine them: Image 2's World + Image 1's Person.
      
      OUTPUT:
      A single, high-quality image that looks exactly like the Reference Thumbnail but starring the New Actor.
      `;
    } else {
      // Original logic for creating from scratch
      prompt = `
      Create a professional YouTube video thumbnail (16:9 aspect ratio).
      
      Inputs:
      - Image 1: The YouTuber's headshot (Main Subject).
      - Video Title: "${title}".
      
      Requirements:
      - Use the person's face from Image 1. Place them prominently.
      - The person's facial expression should match the emotional tone of the title "${title}".
      - Overlay the text "${title}" using large, bold typography. Ensure legibility.
      - Style: High contrast, vibrant colors, glowing highlights, "YouTuber" aesthetic, 4k resolution feel.
      
      - Output: A single, high-quality image.
      `;
    }

    // Add text prompt to parts
    parts.push({ text: prompt });

    // Retry Loop for API calls
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: parts,
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
            },
          },
        });

        // Parse the response to find the generated image
        if (response.candidates && response.candidates.length > 0) {
          const contentParts = response.candidates[0].content.parts;
          for (const part of contentParts) {
            if (part.inlineData && part.inlineData.data) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
        
        throw new Error("No image data found in the response.");

      } catch (err: any) {
        lastError = err;
        const msg = err.message || JSON.stringify(err);
        const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
        const isServerOverload = msg.includes('503') || msg.includes('Overloaded');

        if ((isRateLimit || isServerOverload) && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 2000;
          console.warn(`API Busy/Quota limit (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay/1000}s...`);
          await wait(delay);
          continue;
        }
        break;
      }
    }

    if (lastError) {
       const msg = lastError.message || JSON.stringify(lastError);
       if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
         throw new Error("⚠️ API Quota Exceeded. You have hit the usage limit for the Gemini Free Tier. Please wait a minute and try again.");
       }
       throw lastError;
    }
    
    throw new Error("Unknown error occurred during generation.");

  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
};

export const editThumbnail = async (maskedImageBase64: string, instruction: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Improved System Prompt for Editing with Strict Preservation
    const prompt = `
      IMAGE EDITING TASK:
      Input: An image with a semi-transparent RED mask indicating the area to change.
      User Goal: "${instruction}"
      
      STRICT RULES:
      1. INPAINTING: Only generate pixels within the red masked area.
      2. PRESERVATION: The pixels outside the red mask must remain exactly the same. Do not alter text, faces, or objects outside the red zone.
      3. CONSISTENCY: The new generated content must seamlessly blend with the preserved parts (lighting, resolution, style).
      4. CLEANUP: The final image must NOT have any red overlay.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: maskedImageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      const contentParts = response.candidates[0].content.parts;
      for (const part of contentParts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Error editing thumbnail:", error);
    const msg = error.message || JSON.stringify(error);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("⚠️ API Quota Exceeded. Please wait a minute and try again.");
    }
    throw error;
  }
};

export const generatePrompts = async (imageFile: File): Promise<{ short: string; detailed: string }> => {
  try {
    const ai = getAIClient();
    const processedImage = await processImage(imageFile);

    const prompt = `
      Analyze this YouTube thumbnail image. 
      The user wants to use this image as a blueprint to create a new one using an AI image generator. They will upload their own photo to replace the main character.

      Provide a response in JSON format with two keys:

      1. "short": A concise, punchy summary of instructions. Use this exact style: 
         "Left side: [describe elements]. Right side: [describe elements]. Top text: '[Text from Image]' ([color]). Bottom: [describe elements]. Style: [keywords]. Action: Replace person with my photo."

      2. "detailed": A highly specific, narrative prompt. Structure it EXACTLY like this:
         "Create a high-quality YouTube thumbnail in [vibrant/modern/specific] style.
         In the center, place a real photo of me (user will upload/provide their own photo). Make sure I look [describe expression/lighting]. I should be wearing [describe clothing/colors from the reference image], just like the reference thumbnail style. Add a [glow/effect] around me to make me stand out.
         
         On the left side, [describe background elements, objects, or colors on the left].
         
         On the right side, [describe background elements, objects, or colors on the right].
         
         Add large, bold text:
         “[Text found in image]” [describe placement and color].
         
         At the bottom, [describe elements].
         
         Use high saturation, sharp contrast, professional YouTube thumbnail lighting, vibrant colors, and make the overall design energetic and attention-grabbing."
      
      Ensure the output is valid JSON. Do not include markdown formatting.
    `;

    // Retry Loop for Prompts
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: processedImage.mimeType,
                  data: processedImage.base64,
                }
              },
              { text: prompt }
            ]
          },
          config: {
            responseMimeType: 'application/json',
          }
        });

        let text = response.text;
        if (!text) throw new Error("No response from AI");

        if (text.includes("```json")) {
          text = text.replace(/```json/g, "").replace(/```/g, "");
        } else if (text.includes("```")) {
          text = text.replace(/```/g, "");
        }

        const result = JSON.parse(text);
        return {
          short: result.short || "Could not generate short prompt.",
          detailed: result.detailed || "Could not generate detailed prompt."
        };

      } catch (err: any) {
        lastError = err;
        const msg = err.message || JSON.stringify(err);
        const isRateLimit = msg.includes('429') || msg.includes('quota');
        
        if (isRateLimit && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`API Busy (Prompts). Retrying in ${delay}ms...`);
          await wait(delay);
          continue;
        }
        break;
      }
    }

    if (lastError) {
       const msg = lastError.message || JSON.stringify(lastError);
       if (msg.includes('429') || msg.includes('quota')) {
         throw new Error("⚠️ API Quota Exceeded. Please try again later.");
       }
       throw new Error("Failed to parse AI response. Please try again with a clearer image.");
    }

    throw new Error("Unknown error during prompt generation.");

  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
};
