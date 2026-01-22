import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import verifyAccessToken from '../middleware/verifyAccessToken';
import type { TypedResponse } from '../types';    

const userRouter = Router();

userRouter.get('/', verifyAccessToken, (req, res) => UserController.getAll(req, res as TypedResponse));
userRouter.get('/:userId', verifyAccessToken, (req, res) => UserController.getById(req, res as TypedResponse));
userRouter.put('/:userId', verifyAccessToken, (req, res) => UserController.updateUserById(req, res as TypedResponse));
userRouter.delete('/:userId', verifyAccessToken, (req, res) => UserController.deleteUserById(req, res as TypedResponse));

export default userRouter;
