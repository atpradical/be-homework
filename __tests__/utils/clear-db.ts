import request from 'supertest';
import { Express } from 'express';
import { HttpStatus, TESTING_PATH } from '../../src/core';

export async function clearDb(app: Express) {
  await request(app)
    .delete(`${TESTING_PATH}/all-data`)
    .expect(HttpStatus.NoContent);
  return;
}
