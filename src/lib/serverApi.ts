const callQueue = {};

let timeoutId;

export const API = new Proxy(
  {},
  {
    get(obj, func) {
      if (obj[func]) return obj[func];
      return (compid, ...args) => {
        return new Promise((resolve, reject) => {
          if (!callQueue[compid]) callQueue[compid] = [];
          callQueue[compid].push({ cb: (err, res) => (err ? reject(err) : resolve(res)), data: { func, args } });
          clearTimeout(timeoutId);
          timeoutId = setTimeout(processCallQueue, 100);
        });
      };
    },
  }
);

async function processCallQueue() {
  await Promise.all(
    Object.keys(callQueue).map(async (compid) => {
      const queue = callQueue[compid];
      delete callQueue[compid];

      const data = queue.map(({ data }) => data);
      const res = await fetch(`/api/${compid}`, { method: 'PUT', body: JSON.stringify(data) });
      if (!res.ok) return queue.forEach((x) => x.cb(res.statusText));
      const result = await res.json();
      queue.forEach((x) => x.cb(null, result));
    })
  );
}
