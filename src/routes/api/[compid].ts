import type { EndpointOutput, Request } from '@sveltejs/kit';
import { getCompetition, deleteCompetition, processCompo } from '$lib/CompetitionDB';

export async function get({ params }: Request): Promise<EndpointOutput> {
  return { body: await getCompetition(params.compid) };
}

export async function del({ params, locals }): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  return {
    body: await deleteCompetition(params.compid),
  };
}

export async function put({ params, body, locals }: Request): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  body = JSON.parse(body);

  return {
    body: JSON.stringify(await processCompo(params.compid, body)),
  };
}
