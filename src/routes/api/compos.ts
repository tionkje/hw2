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

// export async function del({ query, locals }): Promise<EndpointOutput> {
//   if (!locals.loggedin) return { status: 401 };
//   return {
//     body: await deleteCompetition(query.get('id')),
//   };
// }

// export async function put({ locals, body }): Promise<EndpointOutput> {
//   if (!locals.loggedin) return { status: 401 };
//   console.log(body);
//
//   return {
//     body: JSON.stringify(await processCompo(body._id, body))
//   };
// }
