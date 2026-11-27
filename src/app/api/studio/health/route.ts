import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    objectStorageConfigured: Boolean(
      process.env.OBJECT_STORAGE_ENDPOINT &&
        process.env.OBJECT_STORAGE_ACCESS_KEY_ID &&
        process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY &&
        process.env.OBJECT_STORAGE_BUCKET,
    ),
    voiceoverConfigured: Boolean(process.env.VOICEOVER_API_URL),
    youtubeConfigured: Boolean(
      process.env.YOUTUBE_CLIENT_ID &&
        process.env.YOUTUBE_CLIENT_SECRET &&
        process.env.YOUTUBE_REDIRECT_URI,
    ),
  };

  const configuredCount = Object.values(checks).filter(Boolean).length;

  return NextResponse.json({
    service: "autonomous-youtube-studio",
    status: configuredCount === Object.keys(checks).length ? "configured" : "setup_required",
    checks,
    note: "Only configuration presence is reported. Secret values are never returned.",
  });
}
