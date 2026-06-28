/**
 * API base URL.
 * Dev: localhost server. Prod: live Render URL.
 *
 * import.meta.env.DEV === true when running `npm run dev`,
 * false in production builds.
 */
export const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : 'https://codered-api.onrender.com/api';
