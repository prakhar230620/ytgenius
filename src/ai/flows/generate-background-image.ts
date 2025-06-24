'use server';

/**
 * @fileOverview Generates professional background images for YouTube videos and Shorts from a text prompt and an optional reference image.
 *
 * - generateBackgroundImage - A function that handles the image generation process.
 * - GenerateBackgroundImageInput - The input type for the generateBackgroundImage function.
 * - GenerateBackgroundImageOutput - The return type for the generateBackgroundImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBackgroundImageInputSchema = z.object({
  prompt: z.string().optional().describe('A detailed text prompt for the background image.'),
  image: z
    .string()
    .optional()
    .describe(
      "An optional reference image for style or content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  referenceImages: z
    .array(z.string())
    .optional()
    .describe(
      "Optional additional reference images for style or content, as data URIs that must include a MIME type and use Base64 encoding. Expected format: ['data:<mimetype>;base64,<encoded_data>', ...]. Maximum 5 images."
    ),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).describe('The desired aspect ratio for the image.'),
});
export type GenerateBackgroundImageInput = z.infer<typeof GenerateBackgroundImageInputSchema>;

const GenerateBackgroundImageOutputSchema = z.object({
  backgroundImageDataUri: z
    .string()
    .describe(
      "The generated background image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateBackgroundImageOutput = z.infer<typeof GenerateBackgroundImageOutputSchema>;

export async function generateBackgroundImage(
  input: GenerateBackgroundImageInput
): Promise<GenerateBackgroundImageOutput> {
  return generateBackgroundImageFlow(input);
}

const generateBackgroundImageFlow = ai.defineFlow(
  {
    name: 'generateBackgroundImageFlow',
    inputSchema: GenerateBackgroundImageInputSchema,
    outputSchema: GenerateBackgroundImageOutputSchema,
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
        `You are a professional illustrator creating a scene for a YouTube video. ${allReferenceImages.length > 1 ? 'Multiple reference images are' : 'A reference image is'} provided. Use ${allReferenceImages.length > 1 ? 'them' : 'it'} to guide the style, subject, or composition of the generated image.
The final image will be used as a background, so ensure the composition is balanced and visually appealing.`
      );
      
      // Add all reference images to the prompt
      for (const refImage of allReferenceImages) {
        promptParts.push({media: {url: refImage}});
      }
    } else {
      promptParts.push(
        `You are a professional graphic designer specializing in creating stunning, high-quality background images for YouTube videos. Your goal is to create a visually appealing, non-distracting, and thematically appropriate background that enhances the main content of the video.
The generated image should be beautiful and engaging but subtle enough not to overpower a presenter or on-screen text.`
      );
    }

    if (input.prompt?.trim()) {
      promptParts.push(`User's detailed request: ${input.prompt}`);
    } else if (allReferenceImages.length > 0) {
      promptParts.push(
        `User's detailed request: A professional, high-quality scene based on the provided reference ${allReferenceImages.length > 1 ? 'images' : 'image'}, suitable for a YouTube video background.`
      );
    }

    promptParts.push(
      `Generate a high-resolution image with a ${input.aspectRatio} aspect ratio.`
    );

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptParts.map(part => typeof part === 'string' ? { text: part } : part),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Failed to generate background image.');
    }

    return {
      backgroundImageDataUri: media.url,
    };
  }
);
