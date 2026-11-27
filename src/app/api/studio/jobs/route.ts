import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { getStudioDb } from "@/lib/studio/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  topic: z.string().trim().min(3).max(300),
  language: z.enum(["hi-IN", "en-IN", "en-US"]).default("hi-IN"),
  channelContext: z.string().trim().max(1200).optional(),
  targetDurationMinutes: z.number().int().min(1).max(60).default(8),
});

function authorized(request: NextRequest) {
  const expected = process.env.STUDIO_API_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const db = getStudioDb();
    const { data: job, error } = await db
      .from("studio_video_jobs")
      .insert({
        topic: parsed.data.topic,
        language: parsed.data.language,
        channel_context: parsed.data.channelContext ?? null,
        target_duration_minutes: parsed.data.targetDurationMinutes,
        status: "queued",
        progress: 0,
        max_repair_attempts: 3,
      })
      .select("id, topic, language, status, created_at")
      .single();

    if (error || !job) {
      throw new Error(error?.message ?? "Could not create production job.");
    }

    try {
      await inngest.send({
        name: "studio/video.requested",
        data: {
          jobId: job.id,
          topic: parsed.data.topic,
          language: parsed.data.language,
          channelContext: parsed.data.channelContext,
          targetDurationMinutes: parsed.data.targetDurationMinutes,
        },
      });
    } catch (dispatchError) {
      await db
        .from("studio_video_jobs")
        .update({
          status: "failed",
          last_error: "Could not dispatch the durable workflow.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      throw dispatchError;
    }

    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not start video production",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
