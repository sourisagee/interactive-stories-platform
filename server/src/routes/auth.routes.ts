import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateSignIn, validateSignUp } from '../middleware/validation/user.validation';
import type { TypedResponse } from '../types';

const authRouter = Router();

authRouter.get('/refreshTokens', (req, res) => UserController.refreshTokens(req, res as TypedResponse));
authRouter.post('/signUp', validateSignUp, (req, res) => UserController.signUp(req, res as TypedResponse));
authRouter.post('/signIn', validateSignIn, (req, res) => UserController.signIn(req, res as TypedResponse));
authRouter.delete('/signOut', (req, res) => UserController.signOut(req, res as TypedResponse));

export default authRouter;
