import cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
import type { Handle } from '@sveltejs/kit';
import jwt from 'jwt-simple';

import dotenv from 'dotenv';
dotenv.config();

const { LOGIN_SECRET } = process.env;
if (!LOGIN_SECRET) throw new Error(`Failed loading LOGIN_SECRET`);

export const handle: Handle = async ({ request, resolve }) => {
  const cookies = cookie.parse(request.headers.cookie || '');
  // TODO: remove userid cookie
  request.locals.userid = cookies.userid || uuid();

  if (cookies.auth_token) {
    const token = jwt.decode(cookies.auth_token, LOGIN_SECRET);
    if (token) request.locals.loggedin = { i_put_something_here: true };
  }

  // TODO https://github.com/sveltejs/kit/issues/1046
  if (request.query.has('_method')) {
    request.method = request.query.get('_method').toUpperCase();
  }

  const response = await resolve(request);

  if (!cookies.userid) {
    // if this is the first time the user has visited this app,
    // set a cookie so that we recognise them when they return
    response.headers['set-cookie'] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
  }

  return response;
};

export function getSession(request) {
  // only include properties needed client-side —
  // exclude anything else attached to the user
  // like access tokens etc
  return {
    loggedin: request.locals.loggedin,
  };
}
