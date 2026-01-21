import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import serverConfig from './config/serverConfig';
import mainRouter from './routes/main.routes';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '4000', 10);

serverConfig(app);

app.use('/', mainRouter);

app.get(/.*/, (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, (): void => {
  console.log(`Сервер запущен на порту ${PORT} 🚀`);
});

export default app;
