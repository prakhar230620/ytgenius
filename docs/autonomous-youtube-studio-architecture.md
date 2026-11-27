# Autonomous YouTube Studio — Architecture

## Goal
Turn a topic or brief into a finished educational YouTube video: research/script → Hindi narration → scene plan → animated render → audio/video synchronization → technical and visual QA → targeted repair → thumbnail and metadata → YouTube upload.

## Non-negotiable publishing safety
- Publishing is disabled until the channel owner completes Google OAuth and explicitly enables publishing.
- Default upload privacy is `private`; public publishing requires a deliberate per-video approval setting.
- Never log OAuth tokens, API keys, signed media URLs, or raw audio.
- A QA failure blocks thumbnail/publishing stages. Retry limits prevent infinite render loops.

## Pipeline states
`queued → scripting → voiceover → storyboard → rendering → synchronizing → qa → repairing → qa → thumbnail → metadata → awaiting_publish_approval → uploading → published`
Terminal states: `failed`, `cancelled`, `needs_human_review`.

## Stage responsibilities
1. **Script** — create a source-grounded Hindi script, pronunciation notes, narration paragraphs, and estimated runtime.
2. **Voiceover** — call the existing Vercel Voiceover Studio through a dedicated adapter. The adapter must preserve the original audio bytes and return duration plus timing/alignment data where available.
3. **Storyboard** — split narration into timestamped scenes. Each scene has narration text, visual intent, assets, motion instructions, and expected duration.
4. **Render** — render deterministic scene compositions at 1920×1080, 30 fps (configurable), with a shared timeline. Keep narration as the master clock.
5. **Synchronize** — align scene boundaries to measured voiceover duration; use word/phrase alignment when available. Avoid changing speech speed beyond configured bounds.
6. **QA** — technical scan of every frame plus sampled/keyframe visual inspection. Check black/frozen frames, flashes, text overflow, aspect ratio, audio clipping/silence, and scene/narration mismatch.
7. **Repair** — regenerate only failed scenes or audio segments, then render a new immutable version. Re-run the full QA gate. Limit automatic repairs; unresolved issues go to human review.
8. **Thumbnail/metadata** — create a clean, legible 16:9 thumbnail and draft title, description, chapters, tags, and captions.
9. **Publish** — upload with YouTube Data API only after OAuth and approval. Persist YouTube video ID and final status.

## Runtime design
- Next.js dashboard/API on Vercel.
- Durable event-driven orchestration (Inngest or Vercel Workflows) for retries, sleep, checkpoints, and resumable stages.
- Supabase Postgres for job state, stage attempts, QA findings, OAuth connection metadata, and audit trail.
- Object storage (Cloudflare R2 or S3) for source audio, scene assets, render versions, QA contact sheets, and thumbnails.
- Remotion for React-based scene composition; FFmpeg for audio muxing, loudness checks, frame extraction, and technical validation.
- Vision model for semantic review of selected frames/contact sheets; OpenCV for deterministic visual signals.

## Current repository reuse
The existing YTGenius app already contains Genkit image-generation flows for background images and thumbnails. Its current project/asset persistence is browser localStorage, so it is not yet suitable as the durable job database. Preserve those existing tools and migrate/bridge them only after the server-side persistence layer is configured.

The deployed `voiceover-studio` project exposes a `/api/fish` route implemented with Vercel Connect and MessagePack streaming. Do not assume it accepts ordinary JSON. Build and verify a server-side adapter against its actual request/response contract before enabling automated voice generation.

## Required secrets/configuration
See `.env.example`. Secrets must be entered in Vercel project environment settings, never committed to Git.

## Rollout plan
- Phase 1: job schema, durable orchestration, dashboard and health/config checks.
- Phase 2: voiceover adapter and a single end-to-end private test render.
- Phase 3: Remotion rendering, FFmpeg synchronization and automated QA/repair loop.
- Phase 4: thumbnail/metadata and private YouTube upload.
- Phase 5: channel-owner approval flow and optional scheduled/public publishing.

## Acceptance criteria
- A job resumes from the last completed stage after worker interruption.
- Audio duration is measured from the actual generated file; scene timings are derived from that clock.
- Every rendered version has an immutable ID and associated QA report.
- A failed QA gate cannot proceed to thumbnail or upload.
- Repair attempts are bounded and each repaired render is re-inspected.
- YouTube publishing cannot occur without a valid OAuth connection and explicit publish approval.
