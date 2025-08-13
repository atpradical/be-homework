import mongoose from 'mongoose';

//todo: переделать на класс
export const BLOG_COLLECTION_NAME = 'blogs';
export const POST_COLLECTION_NAME = 'posts';
export const USERS_COLLECTION_NAME = 'users';
export const COMMENTS_COLLECTION_NAME = 'comments';
export const AUTH_DEVICE_SESSION_COLLECTION_NAME = 'auth_device_session';
export const IP_RESTRICTION_COLLECTION_NAME = 'ip_restriction';

// Подключения к бд
export async function runDB(url: string, name?: string): Promise<void> {
  const BDUrl = name ? `${url}/${name}` : url;

  try {
    await mongoose.connect(BDUrl);
    console.log('✅ Connected to the database');
  } catch (e) {
    await mongoose.disconnect();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

// для тестов
export async function stopDb(): Promise<void> {
  try {
    await mongoose.disconnect();
  } catch (e) {
    throw new Error(`❌ No active client`);
  }
}
