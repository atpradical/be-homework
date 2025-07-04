import request from 'supertest';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../../src/features/auth/api/guards/super-admin.guard';
import { testingDtosCreator, UserDto } from './testingDtosCreator';
import { USERS_PATH } from '../../../src/core';

export const createUser = async (app: any, userDto?: UserDto) => {
  const dto = userDto ?? testingDtosCreator.createUserDto({});

  const resp = await request(app)
    .post(USERS_PATH)
    .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
    .send({
      login: dto.login,
      email: dto.email,
      password: dto.pass,
    })
    .expect(201);
  return resp.body;
};

export const createUsers = async (app: any, count: number) => {
  const users = [];

  for (let i = 0; i <= count; i++) {
    const resp = await request(app)
      .post(USERS_PATH)
      .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
      .send({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        password: '12345678',
      })
      .expect(201);

    users.push(resp.body);
  }
  return users;
};
