import type { EndpointOutput, Request } from '@sveltejs/kit';
import { getCompetition, deleteCompetition, processCompo } from '$lib/CompetitionDB';

import Pusher from 'pusher';
import { PUSHER_KEY, PUSHER_CLUSTER } from '$lib/Env';
const { PUSHER_SECRET, PUSHER_APPID } = process.env;

export async function get({ params }: Request): Promise<EndpointOutput> {
  return { body: await getCompetition(params.compid) };
}

export async function del({ params, locals }): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  return {
    body: await deleteCompetition(params.compid),
  };
}

const pusher = new Pusher({
  appId: PUSHER_APPID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

export async function put({ params, body, locals }: Request): Promise<EndpointOutput> {
  if (!locals.loggedin) return { status: 401 };
  body = JSON.parse(body);

  const { compid } = params;

  const newCompo = await processCompo(compid, body);

  pusher.trigger(`compo_${compid}`, 'full', newCompo);

  return {
    body: newCompo,
  };
}
