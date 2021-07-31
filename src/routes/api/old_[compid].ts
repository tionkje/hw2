import { getOldCompetition } from '$lib/CompetitionDB';

export async function get({ params }: Request): Promise<EndpointOutput> {
  return {
    body: await getOldCompetition(params.compid),
  };
}
