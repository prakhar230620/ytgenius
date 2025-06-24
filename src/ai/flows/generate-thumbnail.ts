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
      "A user-provided image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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

const generateThumbnailPrompt = ai.definePrompt({
  name: 'generateThumbnailPrompt',
  input: {schema: GenerateThumbnailInputSchema},
  output: {schema: GenerateThumbnailOutputSchema},
  prompt: `You are an AI assistant that generates YouTube thumbnails based on a text prompt or a user-provided image.

  {{#if image}}
  Use the following image as a base for generating the thumbnail: {{media url=image}}
  {{/if}}

  {{#if prompt}}
  Generate a thumbnail based on the following prompt: {{{prompt}}}
  {{/if}}

  Ensure the generated thumbnail is visually appealing and relevant to the prompt or image.

  Return the thumbnail as a data URI.
  `,
});

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    if (!input.prompt && !input.image) {
      throw new Error('Either a prompt or an image must be provided.');
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        ...(input.image ? [{media: {url: input.image}}] : []),
        ...(input.prompt ? [{text: input.prompt}] : []),
      ],
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
