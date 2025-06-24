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
      "An optional reference image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
    if (!input.prompt && !input.image) {
      throw new Error('Either a prompt or an image must be provided.');
    }

    const systemPrompt = `You are a professional graphic designer specializing in creating stunning, high-quality background images for YouTube videos. Your goal is to create a visually appealing, non-distracting, and thematically appropriate background that enhances the main content of the video. Analyze the user's request carefully. Generate a high-resolution background image suitable for a ${input.aspectRatio} aspect ratio. The image should be beautiful and engaging but subtle enough not to overpower a presenter or on-screen text.`;

    const userPromptParts = [
      ...(input.image ? [{media: {url: input.image}}] : []),
      ...(input.prompt ? [{text: `User's detailed request: ${input.prompt}`}] : []),
    ];

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [{text: systemPrompt}, ...userPromptParts],
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
