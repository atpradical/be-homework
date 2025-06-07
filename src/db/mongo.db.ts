import { Collection, Db, MongoClient } from 'mongodb';
import { Blog, Post } from '../features';
import { SETTINGS } from '../core/settings';

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';

export let client: MongoClient;
export let blogCollection: Collection<Blog>;
export let rideCollection: Collection<Post>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(SETTINGS.DB_NAME);

  //Инициализация коллекций
  blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
  rideCollection = db.collection<Post>(POST_COLLECTION_NAME);

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
