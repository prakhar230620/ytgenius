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

const generateThumbnailPrompt = ai.definePrompt({
  name: 'generateThumbnailPrompt',
  input: {schema: GenerateThumbnailInputSchema},
  prompt: `You are a world-class YouTube thumbnail designer. Your task is to create a visually stunning, high-impact thumbnail that maximizes click-through rate (CTR).

Analyze the user's request, considering the following principles of great thumbnail design:
1.  **Clarity and Readability:** Use bold, easy-to-read fonts. Keep text minimal and impactful.
2.  **Emotional Impact:** Convey a strong emotion (e.g., surprise, curiosity, excitement) through imagery and composition.
3.  **Visual Hierarchy:** Guide the viewer's eye to the most important elements (usually a face, a key object, or text).
4.  **Brand Consistency:** If a style or reference image is provided, maintain that visual identity.
5.  **Contrast and Color:** Use vibrant, contrasting colors to make the thumbnail pop.

{{#if image}}
Use the following image as a base for your design. You can modify it, enhance it, or use it as inspiration.
{{media url=image}}
{{/if}}

{{#if prompt}}
Follow these specific instructions from the user: {{{prompt}}}
{{/if}}

Generate a compelling thumbnail with a {{aspectRatio}} aspect ratio. Ensure it's eye-catching even at small sizes.
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

    const renderedPrompt = await generateThumbnailPrompt.render(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: renderedPrompt.prompt,
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
