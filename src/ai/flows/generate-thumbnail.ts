'use server';

/**
 * @fileOverview Generates YouTube thumbnails from a text prompt or a user-provided image.
 *
 * - generateThumbnail - A function that handles the thumbnail generation process.
 * - GenerateThumbnailInput - The input type for the generateThumbnail function.
 * - GenerateThumbnailOutput - The return type for the generateThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThumbnailInputSchema = z.object({
  prompt: z.string().optional().describe('A text prompt to generate the thumbnail.'),
  image: z
    .string()
    .optional()
    .describe(
      "A user-provided image for style or content reference, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  referenceImages: z
    .array(z.string())
    .optional()
    .describe(
      "Optional additional reference images for style or content, as data URIs that must include a MIME type and use Base64 encoding. Expected format: ['data:<mimetype>;base64,<encoded_data>', ...]. Maximum 5 images."
    ),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).describe('The desired aspect ratio for the image.'),
});
export type GenerateThumbnailInput = z.infer<typeof GenerateThumbnailInputSchema>;

const GenerateThumbnailOutputSchema = z.object({
  thumbnail: z
    .string()
    .describe(
      'The generated thumbnail as a data URI that includes a MIME type and uses Base64 encoding.'
    ),
});
export type GenerateThumbnailOutput = z.infer<typeof GenerateThumbnailOutputSchema>;

export async function generateThumbnail(input: GenerateThumbnailInput): Promise<GenerateThumbnailOutput> {
  return generateThumbnailFlow(input);
}

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    // Validate that at least one input is provided.
    if (!input.prompt?.trim() && !input.image && (!input.referenceImages || input.referenceImages.length === 0)) {
      throw new Error('Either a prompt or at least one reference image must be provided.');
    }
    
    // Limit the number of reference images to 5
    const referenceImages = input.referenceImages || [];
    if (referenceImages.length > 5) {
      throw new Error('Maximum 5 reference images are allowed.');
    }

    const promptParts: (string | {media: {url: string}})[] = [];

    promptParts.push(
      `You are a world-class YouTube thumbnail designer. Your task is to create a visually stunning, high-impact thumbnail that maximizes click-through rate (CTR).

Analyze the user's request, considering the following principles of great thumbnail design:
1.  **Clarity and Readability:** Use bold, easy-to-read fonts. Keep text minimal and impactful.
2.  **Emotional Impact:** Convey a strong emotion (e.g., surprise, curiosity, excitement) through imagery and composition.
3.  **Visual Hierarchy:** Guide the viewer's eye to the most important elements (usually a face, a key object, or text).
4.  **Brand Consistency:** If a style or reference image is provided, maintain that visual identity.
5.  **Contrast and Color:** Use vibrant, contrasting colors to make the thumbnail pop.`
    );

    // Combine primary image and reference images
    const allReferenceImages = [];
    if (input.image) {
      allReferenceImages.push(input.image);
    }
    if (input.referenceImages && input.referenceImages.length > 0) {
      allReferenceImages.push(...input.referenceImages);
    }

    if (allReferenceImages.length > 0) {
      promptParts.push(
        `**Style Reference:**
${allReferenceImages.length > 1 ? 'Multiple reference images are' : 'A reference image is'} provided. Use ${allReferenceImages.length > 1 ? 'these images' : 'this image'} as inspiration for the style, color palette, and subject matter of the thumbnail. If ${allReferenceImages.length > 1 ? 'they show' : 'it shows'} a person, try to maintain a similar look. The goal is to create a compelling, high-CTR thumbnail based on the user's prompt and the provided visual ${allReferenceImages.length > 1 ? 'references' : 'reference'}.`
      );
      
      // Add all reference images to the prompt
      for (const refImage of allReferenceImages) {
        promptParts.push({media: {url: refImage}});
      }
    }

    if (input.prompt?.trim()) {
      promptParts.push(`User's specific instructions for the scene: ${input.prompt}`);
    } else if (allReferenceImages.length > 0) {
      promptParts.push(
        `User's specific instructions for the scene: Create a stunning, eye-catching thumbnail based on the provided reference ${allReferenceImages.length > 1 ? 'images' : 'image'}.`
      );
    }

    promptParts.push(
      `Generate a compelling thumbnail with a ${input.aspectRatio} aspect ratio. Ensure it's eye-catching even at small sizes.`
    );

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptParts.map(part => typeof part === 'string' ? { text: part } : part),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Failed to generate thumbnail.');
    }

    return {thumbnail: media.url};
  }
);
