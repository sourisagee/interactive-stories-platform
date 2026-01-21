import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, NextFunction } from 'express';
import formatResponse from '../utils/formatResponse';
import { JwtPayload, TypedResponse } from '../types';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

function verifyAccessToken(req: Request, res: TypedResponse, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res
        .status(403)
        .json(formatResponse(403, 'Нет заголовка Authorization', null, 'Нет токена'));
      return;
    }

    const accessToken = authHeader.split(' ')[1];

    if (!authHeader) {
      res
        .status(403)
        .json(
          formatResponse(403, 'Нет access токена', null, 'Токен не найден в заголовке'),
        );
      return;
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.SECRET_ACCESS_TOKEN as string,
    ) as JwtPayload;

    res.locals.user = decoded.user;

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    res
      .status(403)
      .json(formatResponse(403, 'Невалидный accesss token', null, errorMessage));
  }
}

export default verifyAccessToken;
