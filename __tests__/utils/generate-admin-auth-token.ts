import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../src/features/auth/api/guards/super-admin.guard';

/*
 * Генерирует <Basiс base64_токен> из admin:qwerty
 */
export function generateBasicAuthToken() {
  const credentials = `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`;
  const token = Buffer.from(credentials).toString('base64');
  return `Basic ${token}`;
}
