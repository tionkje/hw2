import cookie from 'cookie';

export async function get() {
  return {
    body: 'OK',
    headers: {
      'set-cookie': [
        cookie.serialize('auth_token', '', {
          path: '/',
          httpOnly: true,
          expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
        }),
      ],
    },
  };
}
