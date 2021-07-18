import type { EndpointOutput, Request } from '@sveltejs/kit';
import { getCompetitions } from '$lib/CompetitionDB';

export async function get(): Promise<EndpointOutput> {
  const compos = await getCompetitions();
  // console.log(compos);

  return {
    body: { compos: JSON.stringify(compos) },
  };
}

export async function put({ body }: Request): Promise<EndpointOutput> {
  // body = JSON.parse(body);
  console.log(body);

  return {
    // body: { res: body },
  };
}
