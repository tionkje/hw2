import type { EndpointOutput, Request } from '@sveltejs/kit';
import { getCompetition, deleteCompetition, processCompo } from '$lib/CompetitionDB';

import Ably from 'ably';
import { ABLY_CHANNEL } from '$lib/Env';
const { ABLY_API_KEY } = process.env;

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

  const { compid } = params;

  const newCompo = await processCompo(compid, body);

  const ably = new Ably.Realtime(ABLY_API_KEY);
  const channel = ably.channels.get(ABLY_CHANNEL);
  channel.publish(`compo_${newCompo._id}`, newCompo);

  return {
    body: newCompo,
  };
}
