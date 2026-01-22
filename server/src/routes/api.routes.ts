import { Router } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import storyRouter from "./story.routes";
import nodeRouter from "./node.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/stories", storyRouter);
apiRouter.use("/nodes", nodeRouter);

export default apiRouter;
