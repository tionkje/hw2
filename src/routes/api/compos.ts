import type { EndpointOutput } from '@sveltejs/kit';
import { getList, createCompetition, deleteCompetition, processCompo } from '$lib/CompetitionDB';

export async function get(): Promise<EndpointOutput> {
  return {
    body: await getList(),
  };
}

export async function post({ locals }): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  return {
    body: await createCompetition(),
  };
}
