import { Request, Response, NextFunction } from 'express';

const removeHttpHeader = (_req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  next();
};

export default removeHttpHeader;
