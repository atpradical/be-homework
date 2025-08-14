import { config } from 'dotenv';

config();

export const appConfig = {
  PORT: process.env.PORT || 5003,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017', //dev url
  DB_NAME: process.env.DB_NAME || 'ed-back-blog-platform',

  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: Number(process.env.AC_TIME) || 10 * 60, // Преобразуем в число
  RT_SECRET: (process.env.RT_SECRET as string) || 'rt_secret',
  RT_TIME: Number(process.env.RT_TIME) || 20 * 60, // Преобразуем в число
  RT_COOKIE_MAX_AGE: 25, // Преобразуем в число
  BLACKLIST_TTL: 24 * 60 * 60,
  AUTH_DEVICE_SESSION_TTL: 24 * 60 * 60,
  IP_RESTRICTED_TTL: 24 * 60 * 60,

  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
};
