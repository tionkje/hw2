import type { EndpointOutput, Request } from '@sveltejs/kit';
import { getList, getCompetition } from '$lib/CompetitionDB';

export async function get({ params }: Request): Promise<EndpointOutput> {
  return {
    body: await getCompetition(params.compid),
  };
}

export async function put({ body }: Request): Promise<EndpointOutput> {
  // body = JSON.parse(body);
  // console.log(body);

  return {
    // body: { res: body },
  };
}
