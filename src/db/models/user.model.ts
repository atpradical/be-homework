import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { USERS_COLLECTION_NAME } from '../mongo.db';
import { add } from 'date-fns/add';
import { randomUUID } from 'crypto';
import { UserCreateDto } from '../../features/users/domain/dto';

export const userSchema = new mongoose.Schema<User, UserModel, UserMethods>(
  {
    login: {
      type: String,
      required: true,
      minLength: [1, 'Login is required'],
      maxLength: [100, 'Too long Login'],
    },
    email: {
      type: String,
      required: true,
      minLength: [5, 'Email is required'],
      maxLength: [100, 'Too long Email'],
    },
    passwordHash: {
      type: String,
      required: true,
      minLength: [1, 'PasswordHash is required'],
      maxLength: [250, 'Too long PasswordHash'],
    },

    emailConfirmation: {
      confirmationCode: {
        type: String,
        required: true,
      },

      expirationDate: {
        type: Date,
      },

      isConfirmed: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

const userMethods = {
  /* Обновляет passwordHash и emailConfirmation пользователя */
  updateUserPass(newPasswordHash: string) {
    (this as UserDocument).passwordHash = newPasswordHash;
    (this as UserDocument).emailConfirmation.isConfirmed = true;

    (this as UserDocument).markModified('emailConfirmation');
  },

  /* Генерирует новый код и дату истечения */
  generateNewConfirmationCode() {
    (this as UserDocument).emailConfirmation.confirmationCode = randomUUID();
    (this as UserDocument).emailConfirmation.expirationDate = add(new Date(), { days: 1 });
    (this as UserDocument).emailConfirmation.isConfirmed = false;

    (this as UserDocument).markModified('emailConfirmation');
  },

  /* Подтверждает пользователя */
  confirmUser(code: string) {
    if ((this as UserDocument).canBeConfirmed(code)) {
      (this as UserDocument).emailConfirmation.isConfirmed = true;
    }

    (this as UserDocument).markModified('emailConfirmation');
  },

  /* Проверяет возмозжность подтверждения пользователя */
  canBeConfirmed(code: string) {
    if (
      // Если коррректный код
      code === (this as UserDocument).emailConfirmation.confirmationCode &&
      // Если еще не был подтвержден
      !(this as UserDocument).emailConfirmation.isConfirmed &&
      // Если код еще не протух
      (this as UserDocument).emailConfirmation.expirationDate < new Date()
    ) {
      (this as UserDocument).emailConfirmation.isConfirmed = true;
      (this as UserDocument).markModified('emailConfirmation');
      return true;
    }

    return false;
  },
};

const userStatics = {
  createUser(dto: UserCreateDto) {
    const user = new UserModel();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.emailConfirmation = {
      expirationDate: add(new Date(), { minutes: 30 }),
      isConfirmed: false,
      confirmationCode: randomUUID(),
    };

    return user;
  },

  createSuperUser(dto: UserCreateDto) {
    const user = new UserModel();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.emailConfirmation = {
      expirationDate: add(new Date(), { minutes: 30 }),
      isConfirmed: true,
      confirmationCode: randomUUID(),
    };

    return user;
  },
};

userSchema.methods = userMethods;
userSchema.statics = userStatics;

export type User = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
};

type UserMethods = typeof userMethods;
type UserStatics = typeof userStatics;

type UserModel = Model<User, {}, UserMethods> & UserStatics;
export type UserDocument = HydratedDocument<User, UserMethods>;
export const UserModel = model<User, UserModel>(USERS_COLLECTION_NAME, userSchema);
