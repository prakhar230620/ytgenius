import OpenAI from "openai";
import { inngest } from "./client";
import { getStudioDb } from "@/lib/studio/supabase-admin";

type VideoRequestedEvent = {
  data: {
    jobId: string;
    topic: string;
    language: "hi-IN" | "en-IN" | "en-US";
    channelContext?: string;
    targetDurationMinutes?: number;
  };
};

export const processVideoRequest = inngest.createFunction(
  {
    id: "studio-process-video-request",
    retries: 2,
    triggers: { event: "studio/video.requested" },
  },
  async ({ event, step }) => {
    const { jobId, topic, language, channelContext, targetDurationMinutes } =
      (event as VideoRequestedEvent).data;

    const script = await step.run("generate-video-script", async () => {
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.OPENAI_SCRIPT_MODEL;
      if (!apiKey || !model) {
        throw new Error("Script generation is not configured. Set OPENAI_API_KEY and OPENAI_SCRIPT_MODEL.");
      }

      const openai = new OpenAI({ apiKey });
      const response = await openai.responses.create({
        model,
        input: [
          {
            role: "system",
            content:
              "You are a professional educational YouTube scriptwriter. Write accurate, engaging narration. Never invent facts or citations. Use clear spoken language, natural transitions, a strong opening, and a concise conclusion. Return only the finished narration script; do not include camera directions or markdown tables.",
          },
          {
            role: "user",
            content: [
              `Topic: ${topic}`,
              `Language: ${language}`,
              `Target duration: ${targetDurationMinutes ?? 8} minutes`,
              channelContext ? `Channel context: ${channelContext}` : "",
              "Write a complete, narration-ready script. For Hindi, use natural Indian Hindi in Devanagari with commonly understood technical terms.",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      });

      const text = response.output_text?.trim();
      if (!text) throw new Error("The script model returned an empty response.");
      return text;
    });

    await step.run("save-script-and-pause-for-voiceover-adapter", async () => {
      const db = getStudioDb();
      const { error } = await db
        .from("studio_video_jobs")
        .update({
          script,
          status: "needs_human_review",
          progress: 15,
          last_error:
            "Script generated. Voiceover adapter is awaiting verification against the existing Vercel Connect/MessagePack API contract.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (error) throw new Error(`Could not save generated script: ${error.message}`);
    });

    return {
      jobId,
      status: "needs_human_review",
      completedStage: "scripting",
      nextStage: "voiceover",
      script,
    };
  },
);
