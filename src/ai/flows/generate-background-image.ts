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

const generateBackgroundImagePrompt = ai.definePrompt({
  name: 'generateBackgroundImagePrompt',
  input: { schema: GenerateBackgroundImageInputSchema },
  prompt: `You are a professional graphic designer specializing in creating stunning, high-quality background images for YouTube videos. Your goal is to create a visually appealing, non-distracting, and thematically appropriate background that enhances the main content of the video.

The generated image should be beautiful and engaging but subtle enough not to overpower a presenter or on-screen text.

{{#if image}}
A reference image is provided. **If the user's prompt describes a scene or action, place the character from this reference image into that scene.** You MUST maintain the character's appearance, including their face, hair, and clothing style, with high fidelity. The goal is character consistency across multiple images. Use this character as the subject for the background image.
{{media url=image}}
{{/if}}

{{#if prompt}}
User's detailed request: {{{prompt}}}
{{/if}}

Generate a high-resolution background image with a {{aspectRatio}} aspect ratio.`,
});

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

    // The model requires a text prompt, even if only an image is provided.
    // If we have an image but no text prompt, create a default one.
    if (input.image && !input.prompt?.trim()) {
      input.prompt = "A professional, high-quality background image suitable for a YouTube video. Use the provided image as a reference for character or style.";
    }

    const renderedPrompt = await generateBackgroundImagePrompt.render(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: renderedPrompt.prompt,
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
