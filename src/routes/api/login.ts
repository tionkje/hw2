import cookie from 'cookie';
import jwt from 'jwt-simple';
const { ADMIN_LOGIN, ADMIN_PASSWORD, LOGIN_SECRET } = process.env;

export async function get({ query }) {
  if (query.get('login') !== ADMIN_LOGIN || query.get('password') !== ADMIN_PASSWORD) return { status: 401 };

  const payload = Math.random();

  return {
    body: ADMIN_LOGIN,
    headers: {
      'set-cookie': [cookie.serialize('auth_token', jwt.encode(payload, LOGIN_SECRET), { path: '/', httpOnly: true })],
    },
  };
}
