import request from 'supertest';
import express from 'express';
import { setupApp } from '../../src/setup-app';
import { runDB, stopDb } from '../../src/db/mongo.db';
import { appConfig } from '../../src/core/config';
import { testingDtosCreator } from './utils/testingDtosCreator';
import { USERS_PATH } from '../../src/core';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../src/features/auth/api/guards/super-admin.guard';
import { userAgents } from './utils/user-agents';
import { UserViewModel } from '../../src/features/users/types';
import { container } from '../../src/composition-root';
import { JwtService } from '../../src/features/auth/adapters/jwt.service';

const jwtService = container.get<JwtService>(JwtService);

describe('Multi Devices test', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
    // Clear the database before tests
    await request(app).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    // Close the MongoDB connection after all tests
    await stopDb();
  });

  let user: UserViewModel;
  let userPass: string;
  let userDevices: Record<string, { id: string; token: string }> = {};
  let deviceList = [];
  let deviceListUpdated = [];

  it('Should create user by SuperAdmin', async () => {
    const userDto = testingDtosCreator.createUserDto({});
    userPass = userDto.pass;

    const response = await request(app)
      .post(USERS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(201);

    user = response.body;

    expect(user).toEqual({
      id: expect.any(String),
      login: userDto.login,
      email: userDto.email,
      createdAt: expect.any(String),
    });
  });

  it('Login user on 4 different devices', async () => {
    // Создаем пользователя, логиним пользователя 4 раза с разными user-agent;
    for (let i = 0; i < 4; i++) {
      const response = await request(app)
        .post('/auth/login')
        .set('User-Agent', userAgents[i])
        .send({ loginOrEmail: user.login, password: userPass })
        .expect(200);

      // Получаем accessToken и refreshToken
      const accessToken = response.body.accessToken;
      const cookies = response.headers['set-cookie'];
      // Приводим cookies к массиву, если это строка
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      const refreshToken = cookiesArray
        .find((cookie) => cookie.includes('refreshToken='))
        .split(';')[0]
        .split('=')[1];

      const accessTokenPayload = await jwtService.verifyToken(accessToken);
      const refreshTokenPayload = await jwtService.verifyRefreshToken(refreshToken);

      // userDevices = {
      //    device1: {id, token}
      //    device2: {id, token}
      //    ...
      // }
      userDevices[`device${i + 1}`] = {
        id: refreshTokenPayload.deviceId,
        token: refreshToken,
      };

      expect(response.body.accessToken).toBeDefined();
      expect(cookies).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessTokenPayload.userId).toBe(user.id);
      expect(refreshTokenPayload.userId).toBe(user.id);
    }
  });

  it('Should return device list for logged in user', async () => {
    const response = await request(app)
      .get('/security/devices')
      // .set('Set-Cookie', userDevices['device1'].cookie)
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(200);

    deviceList = response.body;
    expect(deviceList).toHaveLength(4);
  });

  it('Update RefreshToken for device 1', async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const response = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(200);

    // Достаем refreshToken из cookie
    const cookies = response.headers['set-cookie'];
    const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
    const newRefreshToken = cookiesArray
      .find((cookie) => cookie.includes('refreshToken='))
      .split(';')[0]
      .split('=')[1];

    const payloadOld = await jwtService.verifyRefreshToken(userDevices['device1'].token);
    const payloadNew = await jwtService.verifyRefreshToken(newRefreshToken);

    expect(newRefreshToken).toBeDefined();
    expect(payloadNew.userId).toEqual(payloadOld.userId);
    expect(payloadNew.deviceId).toEqual(payloadOld.deviceId);
    // Дата exp должна измениться

    expect(payloadNew.iat).not.toBe(payloadOld.iat);
    userDevices['device1'].token = newRefreshToken;
  });

  it('Get devices list using updated RefreshToken', async () => {
    //Запрашиваем список девайсов с обновленным токеном. Количество девайсов и deviceId
    // всех девайсов не должны измениться. LastActiveDate девайса 1 должна измениться;
    const response = await request(app)
      .get('/security/devices')
      // .set('Set-Cookie', userDevices['device1'].cookie)
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(200);

    deviceListUpdated = response.body;

    // Количество девайсов не должно измениться
    expect(deviceListUpdated).toHaveLength(4);

    // deviceId во всех девайсов не должны измениться
    for (let i = 0; i < deviceListUpdated.length; i++) {
      expect(deviceList[i].deviceId).toEqual(deviceListUpdated[i].deviceId);
    }

    // LastActiveDate девайса 1 должна измениться
    expect(deviceList[0].lastActiveDate).not.toBe(deviceListUpdated[0].lastActiveDate);

    // LastActiveDate остальных девайсов (2,3,4) не должны измениться
    for (let i = 1; i < deviceListUpdated.length; i++) {
      expect(deviceList[i].lastActiveDate).toEqual(deviceListUpdated[i].lastActiveDate);
    }
  });

  it('Delete device 2 and check updates in devices list', async () => {
    // Удаляем девайс 2 (передаем refreshToken девайса 1).
    await request(app)
      .delete(`/security/devices/${userDevices['device2'].id}`)
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(204);

    // Запрашиваем список девайсов.
    const response = await request(app)
      .get('/security/devices')
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(200);

    // Проверяем, что девайс 2 отсутствует в списке;
    expect(response.body).toHaveLength(3);
    expect(response.body.find((d) => d.deviceId === userDevices['device2'].id)).toBeUndefined();
  });

  it('Delete device 3 and check updates in devices list', async () => {
    // Делаем logout девайсом 3
    await request(app)
      .post('/auth/logout')
      .set('Cookie', [`refreshToken=${userDevices['device3'].token}`])
      .send()
      .expect(204);

    // Запрашиваем список девайсов (девайсом 1).
    const response = await request(app)
      .get('/security/devices')
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(200);

    // Проверяем, что девайс 3 отсутствует в списке;
    expect(response.body).toHaveLength(2);
    expect(response.body.find((d) => d.deviceId === userDevices['device3'].id)).toBeUndefined();
  });

  it('Delete remain devices, only device 1 should remain in device list', async () => {
    //Удаляем все оставшиеся девайсы (девайсом 1).
    await request(app)
      .delete(`/security/devices`)
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(204);

    //Запрашиваем список девайсов.
    const response = await request(app)
      .get('/security/devices')
      .set('Cookie', [`refreshToken=${userDevices['device1'].token}`])
      .send()
      .expect(200);

    // В списке должен содержаться только один (текущий) девайс 1;
    expect(response.body).toHaveLength(1);
    expect(response.body.find((d) => d.deviceId === userDevices['device1'].id)).toBeDefined();
  });
});
