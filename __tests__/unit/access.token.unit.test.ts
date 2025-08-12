import { ResultStatus } from '../../src/core/result/resultCode';
import { container } from '../../src/composition-root';
import { AuthService } from '../../src/features/auth/domain/auth.service';
import { JwtService } from '../../src/features/auth/adapters/jwt.service';

const authService = container.get<AuthService>(AuthService);

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
    jest.spyOn(JwtService.prototype, 'verifyToken').mockResolvedValue(null);

    const result = await authService.checkAccessToken('Bearer gbfbfbbhf');

    expect(result.status).toBe(ResultStatus.Unauthorized);
  });

  it('should verify access token', async () => {
    // jwtService.verifyToken = jest
    //   .fn()
    //   .mockImplementation(async (token: string) => ({ userId: '1' }));
    jest.spyOn(JwtService.prototype, 'verifyToken').mockResolvedValue({ userId: '1' });

    const result = await authService.checkAccessToken('Bearer gbfbfbbhf');

    expect(result.status).toBe(ResultStatus.Success);
  });
});
