import { count } from '$lib/db';

export async function get({ params, query }) {
  return {
    body: 'Number:' + (await count()),
  };
}
