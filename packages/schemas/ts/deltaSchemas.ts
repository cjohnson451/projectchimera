import { z } from 'zod'

export const EvidenceItem = z.object({
  evidence_url: z.string().url(),
  quote: z.string(),
  timestamp: z.string(),
  source_type: z.enum(["edgar", "news", "price", "other"]),
})

export const DeltaCard = z.object({
  id: z.string(),
  ticker: z.string(),
  category: z.enum(["filing", "guidance", "insider", "price", "news"]),
  summary: z.string(),
  why_it_matters: z.string(),
  metric: z.string().optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  change: z.string().optional(),
  evidence: z.array(EvidenceItem).default([]),
  detected_at: z.string(),
})

export const Catalyst = z.object({
  id: z.string(),
  ticker: z.string(),
  title: z.string(),
  date: z.string(),
  expected_direction: z.enum(["up", "down", "unclear"]),
  confidence: z.enum(["low", "medium", "high"]),
  postmortem: z.string().optional(),
})

export const MemoDelta = z.object({
  id: z.string(),
  ticker: z.string(),
  as_of: z.string(),
  recommendation: z.enum(["buy", "hold", "sell"]),
  position_size_pct: z.number(),
  confidence_pct: z.number(),
  bull_points: z.array(z.string()),
  bear_points: z.array(z.string()),
  risks: z.array(z.string()),
  deltas: z.array(DeltaCard),
  catalysts: z.array(Catalyst),
})

export const SourceLog = z.object({
  id: z.string(),
  url: z.string().url(),
  source_type: z.enum(["edgar", "news", "price", "other"]),
  fetched_at: z.string(),
  content_hash: z.string(),
})

export type EvidenceItemT = z.infer<typeof EvidenceItem>
export type DeltaCardT = z.infer<typeof DeltaCard>
export type CatalystT = z.infer<typeof Catalyst>
export type MemoDeltaT = z.infer<typeof MemoDelta>
export type SourceLogT = z.infer<typeof SourceLog>


