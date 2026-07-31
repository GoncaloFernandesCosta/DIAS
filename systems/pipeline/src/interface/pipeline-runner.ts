import { PipelineRunParams, PipelineRunSummary } from '../domain/types';
import { CaseWorkflow } from '../application/case-workflow';

export async function runPipeline(
  workflow: CaseWorkflow,
  params: PipelineRunParams,
): Promise<PipelineRunSummary> {
  return workflow.run(params);
}
