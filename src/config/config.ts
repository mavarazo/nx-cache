import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

interface Config {
  apiKeyReadToken?: string;
  apiKeyWriteToken: string;
  cacheDir: string;
  logLevel: string;
  nodeEnv: string;
  port: number;
}

const config: Config = {
  apiKeyReadToken: process.env.API_KEY_READ_TOKEN,
  apiKeyWriteToken: process.env.API_KEY_WRITE_TOKEN!,
  cacheDir: process.env.CACHE_DIR || os.tmpdir(),
  logLevel:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
};

export default config;
