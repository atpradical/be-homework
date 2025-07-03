import { config } from 'dotenv';

config();

export const appConfig = {
  PORT: process.env.PORT || 5003,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017', //dev url
  DB_NAME: process.env.DB_NAME || 'ed-back-blog-platform',
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: Number(process.env.AC_TIME) || 300, // Преобразуем в число
  RT_SECRET: (process.env.RT_SECRET as string) || 'rt_secret',
};
