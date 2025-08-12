import nodemailer, { SentMessageInfo } from 'nodemailer';
import { appConfig } from '../../../core/config';
import { injectable } from 'inversify';

@injectable()
export class NodemailerService {
  async sendEmail(
    email: string,
    code: string,
    template: (code: string) => string,
  ): Promise<SentMessageInfo> {
    let transporter = nodemailer.createTransport({
      service: 'Yandex',
      auth: {
        user: appConfig.EMAIL,
        pass: appConfig.EMAIL_PASS,
      },
    });

    return transporter.sendMail({
      from: '"atpradical" <atpradical@yandex.com>',
      to: email,
      subject: 'Your code is here',
      html: template(code), // html body
    });
  }
}
