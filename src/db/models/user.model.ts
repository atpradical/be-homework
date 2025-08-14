import mongoose, { HydratedDocument, model, Model } from 'mongoose';
import { User } from '../../features/users/domain/user.entity';
import { USERS_COLLECTION_NAME } from '../mongo.db';

export const userSchema = new mongoose.Schema<User>(
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

type UserModel = Model<User>;
export type UserDocument = HydratedDocument<User>;
export const UserModel = model<User, UserModel>(USERS_COLLECTION_NAME, userSchema);
