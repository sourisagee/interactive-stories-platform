import { JwtConfig } from '../types';

const jwtConfig: JwtConfig = {
  access: {
    // expiresIn: 1000 * 30, // 30 sec
    expiresIn: 1000 * 60 * 3, // 3 min
  },
  refresh: {
    expiresIn: 1000 * 60 * 60 * 24, // 24h
  },
};

export default jwtConfig;
