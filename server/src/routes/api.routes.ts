import { Router } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import storyRouter from "./story.routes";
import nodeRouter from "./node.routes";
import playthroughRouter from "./playthrough.routes";
import choiceRouter from "./choice.routes";
import statsRouter from "./stats.routes";
import aiRouter from "./ai.routes";
import profileRouter from "./profile.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/stories", storyRouter);
apiRouter.use("/nodes", nodeRouter);
apiRouter.use("/playthroughs", playthroughRouter);
apiRouter.use("/choices", choiceRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/profile", profileRouter);

export default apiRouter;
