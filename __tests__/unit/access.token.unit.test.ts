import { ResultStatus } from '../../src/core/result/resultCode';
import { authService, jwtService } from '../../src/core/composition-root';

describe('UNIT', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not verify noBearer auth', async () => {
    const result = await authService.checkAccessToken('Basic gbfbfbbhf');

    expect(result.status).toBe(ResultStatus.Unauthorized);
  });

  it('should not verify in jwtService', async () => {
    // jwtService.verifyToken = jest.fn().mockImplementation(async (token: string) => null);
    jest.spyOn(jwtService, 'verifyToken').mockResolvedValue(null);

    const result = await authService.checkAccessToken('Bearer gbfbfbbhf');

    expect(result.status).toBe(ResultStatus.Unauthorized);
  });

  it('should verify access token', async () => {
    // jwtService.verifyToken = jest
    //   .fn()
    //   .mockImplementation(async (token: string) => ({ userId: '1' }));
    jest.spyOn(jwtService, 'verifyToken').mockResolvedValue({ userId: '1' });

    const result = await authService.checkAccessToken('Bearer gbfbfbbhf');

    expect(result.status).toBe(ResultStatus.Success);
  });
});
