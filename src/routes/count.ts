import { count } from '$lib/db';
import type { EndpointOutput } from '@sveltejs/kit';

export async function get(/*{ params, query }*/): Promise<EndpointOutput> {
  return {
    body: 'Number:' + (await count()),
  };
}
