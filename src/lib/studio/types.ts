export const PIPELINE_STAGES = [
  "queued",
  "scripting",
  "voiceover",
  "storyboard",
  "rendering",
  "synchronizing",
  "qa",
  "repairing",
  "thumbnail",
  "metadata",
  "awaiting_publish_approval",
  "uploading",
  "published",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export type JobStatus = PipelineStage | "failed" | "cancelled" | "needs_human_review";

export type QualitySeverity = "info" | "warning" | "error" | "critical";

export interface QualityFinding {
  id: string;
  code: string;
  severity: QualitySeverity;
  message: string;
  startMs?: number;
  endMs?: number;
  frameNumber?: number;
  sceneId?: string;
  repairHint?: string;
}

export interface ScenePlan {
  id: string;
  narration: string;
  visualPrompt: string;
  startMs: number;
  endMs: number;
  assets: string[];
  motionNotes: string;
}

export interface RenderVersion {
  id: string;
  objectKey: string;
  createdAt: string;
  durationMs: number;
  width: number;
  height: number;
  fps: number;
  basedOnVersionId?: string;
}

export interface ProductionJob {
  id: string;
  topic: string;
  language: "hi-IN" | "en-IN" | "en-US";
  status: JobStatus;
  progress: number;
  attempt: number;
  maxRepairAttempts: number;
  script?: string;
  voiceoverObjectKey?: string;
  voiceoverDurationMs?: number;
  scenes?: ScenePlan[];
  renderVersions: RenderVersion[];
  findings: QualityFinding[];
  thumbnailObjectKey?: string;
  youtubeVideoId?: string;
  createdAt: string;
  updatedAt: string;
}
