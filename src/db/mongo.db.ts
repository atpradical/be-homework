import { Collection, Db, MongoClient } from 'mongodb';
import { appConfig } from '../core/config';
import { CommentDB } from '../features/comments/types';
import { Blog } from '../features/blogs/types';
import { Post } from '../features/posts/types';
import { User } from '../features/users/domain/user.entity';
import { AuthDeviceSession } from '../features/auth-device-session/domain/auth-device-session.entity';

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const REFRESH_TOKEN_BLACKLIST_COLLECTION_NAME = 'refresh-token_blacklist';
const AUTH_DEVICE_SESSION_COLLECTION_NAME = 'auth_device_session';

export let client: MongoClient;
export let blogsCollection: Collection<Blog>;
export let postsCollection: Collection<Post>;
export let usersCollection: Collection<User>;
export let commentsCollection: Collection<CommentDB>;
export let authDeviceSessionCollection: Collection<AuthDeviceSession>;
export let tokenBlacklistCollection: Collection<{ token: string; createdAt: Date }>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(appConfig.DB_NAME);

  //Инициализация коллекций
  blogsCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
  postsCollection = db.collection<Post>(POST_COLLECTION_NAME);
  usersCollection = db.collection<User>(USERS_COLLECTION_NAME);
  commentsCollection = db.collection<CommentDB>(COMMENTS_COLLECTION_NAME);
  authDeviceSessionCollection = db.collection<AuthDeviceSession>(
    AUTH_DEVICE_SESSION_COLLECTION_NAME,
  );
  tokenBlacklistCollection = db.collection<{
    token: string;
    createdAt: Date; // для mongo TTL
  }>(REFRESH_TOKEN_BLACKLIST_COLLECTION_NAME);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log('✅ Connected to the database');
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

// для тестов
export async function stopDb(): Promise<void> {
  if (!client) {
    throw new Error(`❌ No active client`);
  }
  await client.close();
}

export async function dropDb(): Promise<void> {
  if (!client) {
    throw new Error(`❌ No active client`);
  }

  try {
    const collections = await client.db().listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      await client.db().collection(collectionName).deleteMany({});
    }
  } catch (e: unknown) {
    console.error('Error in drop db:', e);
    await client.close();
  }
}

// для  TTL
export async function setupTokenBlacklistIndexes() {
  await tokenBlacklistCollection.createIndex(
    { createdAt: 1 }, // 1 - сортировка asc
    { expireAfterSeconds: appConfig.BLACKLIST_TTL },
  );
}
