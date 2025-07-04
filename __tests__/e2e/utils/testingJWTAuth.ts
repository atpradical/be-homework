import request from 'supertest';
import { AUTH_PATH } from '../../../src/core';
import { MeViewModel } from '../../../src/features/users/types';

export const testingJWTAuth = {
  async login(app: any, login: string, password: string): Promise<{ accessToken: string }> {
    const response = await request(app)
      .post(AUTH_PATH + '/login')
      .send({ loginOrEmail: login, password: password })
      .expect(200);

    return response.body;
  },

  async me(app: any, token: string): Promise<MeViewModel> {
    const response = await request(app)
      .get(AUTH_PATH + '/me')
      .auth(token, { type: 'bearer' })
      .expect(200);
    return response.body;
  },
};
