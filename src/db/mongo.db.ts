import { Collection, Db, MongoClient } from 'mongodb';
import { appConfig } from '../core/config';
import { IpRestricted } from '../features/ip-restriction/domain/ip-restricted.entity';
import mongoose from 'mongoose';

//todo: переделать на класс
export const BLOG_COLLECTION_NAME = 'blogs';
export const POST_COLLECTION_NAME = 'posts';
export const USERS_COLLECTION_NAME = 'users';
export const COMMENTS_COLLECTION_NAME = 'comments';
export const AUTH_DEVICE_SESSION_COLLECTION_NAME = 'auth_device_session';
export const IP_RESTRICTION_COLLECTION_NAME = 'ip_restriction';

export let client: MongoClient;
export let ipRestrictedCollection: Collection<IpRestricted>;

// Подключения к бд
export async function runDB(url: string, name?: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(appConfig.DB_NAME);

  //Инициализация коллекций
  ipRestrictedCollection = db.collection<IpRestricted>(IP_RESTRICTION_COLLECTION_NAME);

  const BDUrl = name ? `${url}/${name}` : url;

  try {
    await mongoose.connect(BDUrl);
    await client.connect();
    await db.command({ ping: 1 });
    console.log('✅ Connected to the database');
  } catch (e) {
    await client.close();
    await mongoose.disconnect();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

// для тестов
export async function stopDb(): Promise<void> {
  if (!client) {
    throw new Error(`❌ No active client`);
  }
  await mongoose.disconnect();
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
export async function setupDBIndexes() {
  await ipRestrictedCollection.createIndex(
    { createdAt: 1 }, // 1 - сортировка asc
    { expireAfterSeconds: appConfig.IP_RESTRICTED_TTL },
  );
}
