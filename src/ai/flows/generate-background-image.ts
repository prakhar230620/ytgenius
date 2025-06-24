// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates background images for YouTube videos and Shorts from a text prompt.
 *
 * - generateBackgroundImage - A function that handles the image generation process.
 * - GenerateBackgroundImageInput - The input type for the generateBackgroundImage function.
 * - GenerateBackgroundImageOutput - The return type for the generateBackgroundImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateBackgroundImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the background image from.'),
});
export type GenerateBackgroundImageInput = z.infer<typeof GenerateBackgroundImageInputSchema>;

const GenerateBackgroundImageOutputSchema = z.object({
  backgroundImageDataUri: z
    .string()
    .describe(
      'The generated background image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type GenerateBackgroundImageOutput = z.infer<typeof GenerateBackgroundImageOutputSchema>;

export async function generateBackgroundImage(
  input: GenerateBackgroundImageInput
): Promise<GenerateBackgroundImageOutput> {
  return generateBackgroundImageFlow(input);
}

const generateBackgroundImagePrompt = ai.definePrompt({
  name: 'generateBackgroundImagePrompt',
  input: {schema: GenerateBackgroundImageInputSchema},
  output: {schema: GenerateBackgroundImageOutputSchema},
  prompt: `Generate a background image based on the following prompt: {{{prompt}}}. The image should be suitable for use as a background in a YouTube video or Short.`, // Ensure prompt is valid handlebars
});

const generateBackgroundImageFlow = ai.defineFlow(
  {
    name: 'generateBackgroundImageFlow',
    inputSchema: GenerateBackgroundImageInputSchema,
    outputSchema: GenerateBackgroundImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No image was generated.');
    }
    
    return {
      backgroundImageDataUri: media.url,
    };
  }
);
