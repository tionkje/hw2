import type { EndpointOutput } from '@sveltejs/kit';
import { getList } from '$lib/CompetitionDB';

export async function get(): Promise<EndpointOutput> {
  return {
    body: await getList(),
  };
}
