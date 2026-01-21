import { CookieConfig } from '../types';

const cookieConfig: CookieConfig = {
  httpOnly: true,
  maxAge: 1000 * 60 * 24, // 24h
};

export default cookieConfig;
