import { testSeeder } from './test.seeder';
import { ResultStatus } from '../../src/core/result/resultCode';
import { client, dropDb, runDB, stopDb } from '../../src/db/mongo.db';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { authService, nodemailerService } from '../../src/core/composition-root';

describe('AUTH-INTEGRATION', () => {
  beforeAll(async () => {
    let mongoServer = await MongoMemoryServer.create();
    const url = mongoServer.getUri();
    await runDB(url);
  }, 20000);

  beforeEach(async () => {
    if (client) {
      await dropDb();
    }
  });

  afterAll(async () => {
    await dropDb();
    await stopDb();
  });

  describe('User Registration', () => {
    //nodemailerService.sendEmail = emailServiceMock.sendEmail;

    nodemailerService.sendEmail = jest
      .fn()
      .mockImplementation((email: string, code: string, template: (code: string) => string) =>
        Promise.resolve(true),
      );

    it('should register user with correct data', async () => {
      const { login, password, email } = testSeeder.createUserDto();

      const result = await authService.registerUser({ login, password, email });

      expect(result.status).toBe(ResultStatus.Success);
      expect(nodemailerService.sendEmail).toBeCalled();
      expect(nodemailerService.sendEmail).toBeCalledTimes(1);
    });

    it('should not register user twice', async () => {
      const { login, password, email } = testSeeder.createUserDto();
      await testSeeder.insertUser({ login, password, email });

      const result = await authService.registerUser({ login, password, email });

      expect(result.status).toBe(ResultStatus.BadRequest);
      //collection.countDoc().toBe(1)
    });
  });

  describe('Confirm email', () => {
    it('should not confirm email if user does not exist', async () => {
      const result = await authService.confirmEmail({ code: 'bnfgndflkgmk' });

      expect(result.status).toBe(ResultStatus.BadRequest);
    });

    it('should not confirm email which is confirmed', async () => {
      const code = 'test';

      const { login, password, email } = testSeeder.createUserDto();

      await testSeeder.insertUser({
        login,
        password,
        email,
        code,
        isConfirmed: true,
      });

      const result = await authService.confirmEmail({ code });

      expect(result.status).toBe(ResultStatus.BadRequest);
    });

    it('should not confirm email with expired code', async () => {
      const code = 'test';

      const { login, password, email } = testSeeder.createUserDto();

      await testSeeder.insertUser({
        login,
        password,
        email,
        code,
        expirationDate: new Date(),
      });

      const result = await authService.confirmEmail({ code });

      expect(result.status).toBe(ResultStatus.BadRequest);
      //check status in DB
    });

    it('confirm user', async () => {
      const code = '123e4567-e89b-12d3-a456-426614174000';

      const { login, password, email } = testSeeder.createUserDto();
      await testSeeder.insertUser({ login, password, email, code });

      const result = await authService.confirmEmail({ code });

      expect(result.status).toBe(ResultStatus.Success);
    });
  });
});
