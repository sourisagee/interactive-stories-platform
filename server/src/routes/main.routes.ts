import { Router } from 'express';
import apiRouter from './api.routes';

const mainRouter = Router();

mainRouter.use('/api', apiRouter);

export default mainRouter;
