import { getCompetitions } from '$lib/CompetitionDB';

export async function get() {
  const compos = await getCompetitions();
  // console.log(compos);

  return {
    body: { compos: compos },
  };
}

export async function put({ body }) {
  body = JSON.parse(body);
  console.log(body);

  return {
    body: { res: body },
  };
}
