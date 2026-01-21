import { Router } from "express";
// import userRouter from './user.routes';
// import authRouter from './auth.routes';
// import taskRouter from './task.routes';
import playthroughRouter from "./playthrough.routes";

const apiRouter = Router();

// apiRouter.use('/auth', authRouter);
// apiRouter.use('/users', userRouter);
// apiRouter.use('/tasks', taskRouter);
apiRouter.use("/playthrough", playthroughRouter);

export default apiRouter;
