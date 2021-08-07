import { getCacheEntries, storeCacheEntries } from '$lib/db.ts';
import mongodb from 'mongodb';

const cacheTime = 1000 * 60 * 60 * 24;

async function updateThrowerCacheEntries(ids) {
  if (ids.length == 0) return [];
  const throwers = await Promise.all(
    ids.map(async (hwId) => {
      var res = await fetch(`https://hoogwerpers.be/export.php?action=thrower&id=${hwId}`);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    })
  );
  storeCacheEntries(
    'hwthrowers',
    throwers.map(([t]) => ({ _id: t.id, thrower: t, ts: Date.now() }))
  );
  return throwers;
}

export async function get({ query }) {
  if (query.get('action') == 'allThrowers') {
    const list = JSON.parse(query.get('list'));
    const cache = await getCacheEntries(
      'hwthrowers',
      list.map((x) => x + '')
    );
    const throwers = cache.map((x) => x.thrower);
    const missing = list.filter((id) => !throwers.find((c) => c.id == id));

    throwers.push(...(await updateThrowerCacheEntries(missing)));
    updateThrowerCacheEntries(cache.filter((c) => !c.ts || c.ts + cacheTime < Date.now()).map((x) => x._id));
    return { body: throwers };
  }
  var res = await fetch(`https://hoogwerpers.be/export.php?${query}`);
  if (!res.ok) return { status: 500 };
  return { body: await res.text() };
}
