import bcrypt from 'bcrypt';
import { injectable } from 'inversify';

@injectable()
export class BcryptService {
  async generateHash(password: string, rounds: number = 10) {
    const salt = await bcrypt.genSalt(rounds);
    return bcrypt.hash(password, salt);
  }

  async checkPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
