export const DEFAULT_PIPELINE_STAGE_DEFINITIONS = [
  { key: 'newLead', color: '#3b82f6', position: 0 },
  { key: 'qualified', color: '#eab308', position: 1 },
  { key: 'proposalSent', color: '#f97316', position: 2 },
  { key: 'negotiation', color: '#8b5cf6', position: 3 },
  { key: 'won', color: '#22c55e', position: 4 },
] as const;

type DefaultStageKey =
  (typeof DEFAULT_PIPELINE_STAGE_DEFINITIONS)[number]['key'];

export interface DefaultPipelineLabels {
  pipelineName: string;
  stages: Record<DefaultStageKey, string>;
}

export function buildDefaultPipelineSeed(labels: DefaultPipelineLabels) {
  return {
    name: labels.pipelineName,
    stages: DEFAULT_PIPELINE_STAGE_DEFINITIONS.map(
      ({ key, color, position }) => ({
        name: labels.stages[key],
        color,
        position,
      })
    ),
  };
}
