import dotenv from 'dotenv';
import express, { Express } from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import removeHttpHeader from '../middleware/removeHttpHeader';

const LOGS_DIR: string = path.join(__dirname, '..', 'logs');
const CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:5173';

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

const accessLogStream = fs.createWriteStream(
  path.join(LOGS_DIR, `access_${new Date().toLocaleDateString('ru-RU')}.log`),
  { flags: 'a' },
);

const corsOptions: cors.CorsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};

const serverConfig = (app: Express): void => {
  app.use(cors(corsOptions));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(express.static(path.join(__dirname, '../public')));

  app.use(morgan('combined', { stream: accessLogStream }));

  app.use(removeHttpHeader);

  app.use(cookieParser());
};

export default serverConfig;
