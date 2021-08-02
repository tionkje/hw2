import type { EndpointOutput, Request } from '@sveltejs/kit';
import {
  getCompetition,
  getOldCompetition,
  createCompetition,
  deleteCompetition,
  processCompo,
} from '$lib/CompetitionDB';

export async function get({ params }: Request): Promise<EndpointOutput> {
  const { compid } = params;
  if (compid.match(/^old_/)) return { body: await getOldCompetition(params.compid) };
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
