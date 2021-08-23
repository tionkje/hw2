import type { EndpointOutput, Request } from '@sveltejs/kit';
import { getCompetition, deleteCompetition, processCompo } from '$lib/CompetitionDB';

import Ably from 'ably';
import { ABLY_CHANNEL } from '$lib/Env';
const { ABLY_API_KEY } = process.env;
const ably = new Ably.Realtime(ABLY_API_KEY);

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

  console.log('NEW thrower:', newCompo.throwers[newCompo.meters[0].throwOrder[0]].name);

  const channel = ably.channels.get(ABLY_CHANNEL);
  channel.publish(`compo_${compid}`, newCompo);

  return {
    body: newCompo,
  };
}
