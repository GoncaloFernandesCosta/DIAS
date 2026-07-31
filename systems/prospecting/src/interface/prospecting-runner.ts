import { ProspectParams, ProspectingJobResult } from '../domain/types';
import { ProspectingService } from '../application/prospecting-service';

export async function runProspectingJob(
  service: ProspectingService,
  params: ProspectParams,
): Promise<ProspectingJobResult> {
  return service.runJob(params);
}
