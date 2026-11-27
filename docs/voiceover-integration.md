# Voiceover Studio Integration Contract

## Existing deployed endpoint
The inspected Vercel deployment for `voiceover-studio` contains `src/api/fish.mjs`, configured with a 300-second function duration and a Mumbai region. The route imports `getToken` from `@vercel/connect` and MessagePack encoding. This indicates a streaming/Connect protocol rather than a conventional JSON endpoint.

## Integration rules
- Do not call the endpoint from the browser; use a server-side adapter.
- Do not guess the MessagePack payload schema or authentication headers.
- Obtain the exact request contract from the deployed client/UI source or a controlled test request.
- Preserve binary response chunks; write the completed audio to object storage.
- Verify returned MIME type, sample rate, channels, duration, and non-zero audio energy.
- Keep generated audio private until the video passes QA.

## Adapter interface
Input:
- `text`: final approved Hindi narration.
- `voiceId`: configured voice profile identifier.
- `language`: `hi-IN`.
- optional speaking style and pronunciation dictionary.

Output:
- `audioObjectKey`: private object-storage key.
- `durationMs`: measured from the resulting audio.
- `mimeType`, `sampleRate`, `channels`.
- optional word/phrase alignment data.
- `providerRequestId` for diagnostics (never a secret).

## Current status
The route file is deployed and ready, but its complete request/response protocol has not yet been verified. Automated production calls remain disabled until a valid test request confirms the protocol.
