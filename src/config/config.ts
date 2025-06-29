import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

interface Config {
  apiKeyToken: string;
  cacheDir: string;
  nodeEnv: string;
  port: number;
}

const config: Config = {
  apiKeyToken: process.env.API_KEY_TOKEN!,
  cacheDir: process.env.CACHE_DIR || os.tmpdir(),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
};

export default config;
