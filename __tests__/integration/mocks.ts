import { NodemailerService } from '../../src/features/auth/adapters/nodemailer.service';

export const emailServiceMock: typeof NodemailerService = {
  async sendEmail(
    email: string,
    code: string,
    template: (code: string) => string,
  ): Promise<boolean> {
    return true;
  },
};
