import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';

export class User {
  // свойства класса
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };

  // вызов конструктора класса
  constructor(login: string, email: string, hash: string) {
    this.login = login;
    this.email = email;
    this.passwordHash = hash;
    this.createdAt = new Date();
    this.emailConfirmation = {
      expirationDate: add(new Date(), { minutes: 30 }),
      isConfirmed: false,
      confirmationCode: randomUUID(),
    };
  }

  static createSuperUser(login: string, email: string, hash: string): User {
    const superAdmin = new User(login, email, hash);
    superAdmin.emailConfirmation.isConfirmed = true;
    return superAdmin;
  }

  static updateUserPass(user: User, hash: string): User {
    return {
      ...user,
      passwordHash: hash,
      emailConfirmation: { ...user.emailConfirmation, isConfirmed: true },
    };
  }
}
