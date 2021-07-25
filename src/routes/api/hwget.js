import { stringify } from 'querystring';

export async function get({ query }) {
  var res = await fetch(`https://hoogwerpers.be/export.php?${query}`);
  if (!res.ok) return { status: 500 };
  return { body: await res.text() };
}
