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
      "An optional reference image for a character or style, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
    if (!input.prompt?.trim() && !input.image) {
      throw new Error('Either a prompt or an image must be provided.');
    }

    const promptParts: (string | {media: {url: string}})[] = [];

    promptParts.push(
      `You are a professional graphic designer specializing in creating stunning, high-quality background images for YouTube videos. Your goal is to create a visually appealing, non-distracting, and thematically appropriate background that enhances the main content of the video.

The generated image should be beautiful and engaging but subtle enough not to overpower a presenter or on-screen text.`
    );

    if (input.image) {
      promptParts.push(
        `A reference image of a character is provided. Your primary goal is **character consistency**.
You MUST use the character from this reference image as the main subject.
Replicate the character's appearance, including their face, hair, clothing, and overall style, with the highest possible fidelity.
If the user provides a prompt describing a scene or action, place this exact character into that scene.`
      );
      promptParts.push({media: {url: input.image}});
    }

    if (input.prompt?.trim()) {
      promptParts.push(`User's detailed request: ${input.prompt}`);
    } else if (input.image) {
      promptParts.push(
        `User's detailed request: A professional, high-quality background image suitable for a YouTube video. Use the provided image as a reference for character or style.`
      );
    }
    
    promptParts.push(
      `Generate a high-resolution background image with a ${input.aspectRatio} aspect ratio.`
    );

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptParts,
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
