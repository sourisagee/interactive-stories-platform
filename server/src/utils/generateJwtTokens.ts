import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig';
import { JwtPayload, JwtTokens } from '../types';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const generateJwtTokens = (payload: JwtPayload): JwtTokens => ({
  accessToken: jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN as string, {
    expiresIn: jwtConfig.access.expiresIn / 1000,
  }),
  refreshToken: jwt.sign(payload, process.env.SECRET_REFRESH_TOKEN as string, {
    expiresIn: jwtConfig.refresh.expiresIn / 1000,
  }),
});

export default generateJwtTokens;
