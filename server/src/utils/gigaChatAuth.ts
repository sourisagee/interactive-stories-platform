import axios, { type AxiosInstance } from "axios";
import path from "path";
import crypto from "crypto";
import https from "https";
import dotenv from "dotenv";
import type { GigaChatAuthData, GigaChatAuthPayload } from "../types/ai";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const { AI_AUTH_KEY, AI_AUTH_URL } = process.env;

axios.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const payload: GigaChatAuthPayload = {
  scope: "GIGACHAT_API_PERS",
};

const axiosInstance: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    RqUID: crypto.randomUUID(),
    Authorization: `Basic ${AI_AUTH_KEY}`,
  },
});

async function oAuth(): Promise<GigaChatAuthData> {
  if (!AI_AUTH_URL) {
    throw new Error("AI_AUTH_URL is not defined");
  }

  const { data } = await axiosInstance.post<GigaChatAuthData>(AI_AUTH_URL, payload);
  return data;
}

export default oAuth;