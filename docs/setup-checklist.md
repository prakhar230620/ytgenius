# Setup checklist

## Required before first live job
- [ ] Create a Supabase project and apply `supabase/migrations/202611270001_studio_video_jobs.sql`.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Vercel project.
- [ ] Add a long random `STUDIO_API_SECRET` and keep it private.
- [ ] Add `OPENAI_API_KEY` and `OPENAI_SCRIPT_MODEL`.
- [ ] Create an Inngest app and configure `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.
- [ ] Deploy the branch and sync `/api/inngest` in Inngest.
- [ ] Verify the generated script on a private test job.

## Required before voiceover
- [ ] Verify the exact Vercel Connect/MessagePack request contract for the existing Fish voiceover endpoint.
- [ ] Implement the adapter and test Hindi output, audio duration, and file integrity.
- [ ] Configure private object storage and test upload/download.

## Required before video render and YouTube
- [ ] Add Remotion composition and rendering worker.
- [ ] Add FFmpeg synchronization and technical QA.
- [ ] Add visual inspection and bounded repair loop.
- [ ] Connect YouTube OAuth for the channel owner.
- [ ] Keep uploads private until a test upload and approval flow are verified.
