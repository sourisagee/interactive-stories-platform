import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, NextFunction } from 'express';
import formatResponse from '../utils/formatResponse';
import { JwtPayload, TypedResponse } from '../types';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

function verifyRefreshToken(req: Request, res: TypedResponse, next: NextFunction): void {
  try {
    const { refreshToken } = req.cookies as { refreshToken?: string };

    if (!refreshToken) {
      res
        .status(401)
        .json(formatResponse(401, 'Нет refresh token', null, 'Нет токена в cookies'));
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.SECRET_REFRESH_TOKEN as string,
    ) as JwtPayload;

    res.locals.user = decoded.user;

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res
      .status(401)
      .clearCookie('refreshToken')
      .json(formatResponse(401, 'Невалидный refresh token', null, errorMessage));
  }
}

export default verifyRefreshToken;
