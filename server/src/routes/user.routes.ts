import { Router } from 'express';
// import UserController from '../controllers/user.controller';
// import verifyAccessToken from '../middleware/verifyAccessToken';

const userRouter = Router();

// userRouter.get('/', UserController.getAllUsers);

// userRouter
//   .route('/:userId')
//   .get(UserController.getUserById)
//   .put(verifyAccessToken, UserController.updateUserById)
//   .delete(UserController.deleteUserById);

export default userRouter;
