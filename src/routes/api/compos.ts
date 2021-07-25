import type { EndpointOutput } from '@sveltejs/kit';
import { getList, createCompetition, deleteCompetition } from '$lib/CompetitionDB';

export async function get(): Promise<EndpointOutput> {
  return {
    body: await getList(),
  };
}

export async function put({ locals }): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  return {
    body: await createCompetition(),
  };
}

export async function del({ query, locals }): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  return {
    body: await deleteCompetition(query.get('id')),
  };
}
