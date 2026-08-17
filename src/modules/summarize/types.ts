export interface SummaryConcept {
  name: string;
  description: string;
  importance: string;
}

export interface SummaryDefinition {
  term: string;
  definition: string;
}

export interface LectureSummary {
  tldr?: string;
  overview?: string;
  key_concepts?: SummaryConcept[];
  definitions?: SummaryDefinition[];
  relationships?: string;
  exam_bullets?: string[];
  memory_anchors?: string[];
  flowchart?: string;
}

export interface SummarizeResponse {
  summary: LectureSummary;
}

export interface SummarizeLecture {
  id: number | string;
  title: string;
}
